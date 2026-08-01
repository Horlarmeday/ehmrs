import { logger, taggedMessaged } from '../../../helpers/logger';
import { Visit } from '../../../../database/models';
import { dateQuery, todayQuery } from '../../../helpers/helper';
import { VisitCategory, VisitStatus } from '../../../../database/enums';
import dayjs from 'dayjs';
import { processTasksExecution } from '../../../helpers/tasksProcessor';
import { Op } from 'sequelize';
import { sequelizeConnection } from '../../../../database/config/data-source';
import { endVisitAndEmitOutboxEvents } from '../../../../modules/Outbox/visit-close-emission';

export const visitHandler = async (visit: Visit) => {
  const message = taggedMessaged('visitHandler');
  const occurredAt = new Date();
  await sequelizeConnection.transaction(async transaction => {
    await endVisitAndEmitOutboxEvents(visit, occurredAt, transaction);
  });
  logger.notice(message(`Ended visit for patient ${visit.patient_id}`));
};

export const endVisits = async () => {
  const message = taggedMessaged('EndVisits');
  const sevenDaysAgo = dayjs()
    .subtract(5, 'days')
    .toDate();

  const [
    todayUntakenVisits,
    antenatalVisits,
    fiveDaysAgoVisits,
    immunizationVisits,
  ] = await Promise.all([
    Visit.findAll({
      where: { ...todayQuery('createdAt'), status: VisitStatus.ONGOING, is_taken: false },
    }),
    Visit.findAll({
      where: { category: VisitCategory.ANC, status: VisitStatus.ONGOING },
    }),
    Visit.findAll({
      where: {
        ...dateQuery('createdAt', sevenDaysAgo),
        status: VisitStatus.ONGOING,
        category: {
          [Op.notIn]: [VisitCategory.IPD, VisitCategory.EMERGENCY],
        },
      },
    }),
    Visit.findAll({
      where: { category: VisitCategory.IMMUNIZATION, status: VisitStatus.ONGOING },
    }),
  ]);

  const visits = Array.from(
    new Map(
      [
        ...antenatalVisits,
        ...todayUntakenVisits,
        ...fiveDaysAgoVisits,
        ...immunizationVisits,
      ].map(visit => [visit.id, visit])
    ).values()
  );

  try {
    if (visits?.length) {
      const { errors } = await processTasksExecution({
        tasks: visits,
        message,
        concurrency: 10,
        handler: async task => {
          try {
            await visitHandler(task);
          } catch (error) {
            logger.error(message(`Failed to end visit ${task.id}`), {
              visitId: task.id,
              error,
            });
            throw error;
          }
        },
      });
      if (errors.length > 0) {
        logger.error(message(`${errors.length} visit(s) failed to end`), {
          errors: errors.map(error => error.message),
        });
      }
      return;
    }
    logger.notice(message(`No visits to end`));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
