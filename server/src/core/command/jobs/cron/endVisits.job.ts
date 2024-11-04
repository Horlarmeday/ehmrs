import { logger, taggedMessaged } from '../../../helpers/logger';
import { Visit } from '../../../../database/models';
import { dateQuery, todayQuery } from '../../../helpers/helper';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { processTasksExecution } from '../../../helpers/tasksProcessor';
import { Op } from 'sequelize';

const visitHandler = async (visit: Visit) => {
  const message = taggedMessaged('visitHandler');
  await Visit.update(
    { status: VisitStatus.ENDED, date_visit_ended: Date.now() },
    { where: { id: visit.id } }
  );
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

  const visits = [
    ...antenatalVisits,
    ...todayUntakenVisits,
    ...fiveDaysAgoVisits,
    ...immunizationVisits,
  ];

  try {
    if (visits?.length) {
      await processTasksExecution({
        tasks: visits,
        message,
        concurrency: 10,
        handler: visitHandler,
      });
      return;
    }
    logger.notice(message(`No visits to end`));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
