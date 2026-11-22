import { Op } from 'sequelize';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { maxOutboxAttempts } from '../Outbox/drainer';

/** Outbox depth as Accounting reads it (#109, PRD §10.8). */
export interface OutboxDepthResponse {
  readonly waiting: number;
  readonly exhausted: number;
  readonly oldest_unsent_at: string | null;
  readonly max_attempts: number;
  readonly read_at: string;
}

export async function outboxDepth(now: Date = new Date()): Promise<OutboxDepthResponse> {
  const maxAttempts = maxOutboxAttempts();
  const waitingWhere = { sent_at: null, attempts: { [Op.lt]: maxAttempts } };

  const [waiting, exhausted, oldest] = await Promise.all([
    OutboxEvent.count({ where: waitingWhere }),
    OutboxEvent.count({ where: { sent_at: null, attempts: { [Op.gte]: maxAttempts } } }),
    OutboxEvent.findOne({
      where: waitingWhere,
      attributes: ['createdAt'],
      order: [
        ['createdAt', 'ASC'],
        ['id', 'ASC'],
      ],
    }),
  ]);

  const oldestAt: unknown = oldest === null ? null : oldest.get('createdAt');
  return {
    waiting,
    exhausted,
    oldest_unsent_at: oldestAt instanceof Date ? oldestAt.toISOString() : null,
    max_attempts: maxAttempts,
    read_at: now.toISOString(),
  };
}
