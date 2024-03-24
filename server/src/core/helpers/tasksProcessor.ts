import { PromisePool } from '@supercharge/promise-pool';
import { logger, Message } from './logger';

type ProcessTasksExecutionType<T> = {
  tasks: T[];
  concurrency: number;
  message: Message;
  handler: (task: T) => Promise<void>;
};

export const processTasksExecution = async <T>({
  tasks,
  concurrency,
  message,
  handler,
}: ProcessTasksExecutionType<T>) => {
  const { errors } = await PromisePool.for(tasks)
    .withConcurrency(concurrency)
    .handleError((error, item) => {
      const itemId = typeof item === 'object' && 'id' in item ? `${item.id}|` : '';
      logger.error(message(`[PoolExecutionError|${error.message}]`), {
        itemId,
        error: error,
      });
    })
    .onTaskStarted((_item, pool) => {
      if (pool.processedCount() % concurrency === 0) {
        logger.info(
          message(`Task started; 
        Active tasks: ${pool.activeTasksCount()}, 
        Task progress: ${pool.processedPercentage()}%`)
        );
      }
    })
    .onTaskFinished((_item, pool) => {
      if (pool.processedCount() % concurrency === 0) {
        logger.info(
          message(`Task Finishing; 
          Finished tasks: ${pool.processedCount()}, 
          Task progress: ${pool.processedPercentage()}%, Pending tasks: ${tasks.length -
            pool.processedCount()}`)
        );
      }
    })
    .process(handler);

  return { errors };
};
