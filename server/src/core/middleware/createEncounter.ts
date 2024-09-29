import { Encounter } from '../../database/models';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { errorResponse } from '../../common/responses/error-responses';
import { getVisitById } from '../../modules/Visit/visit.repository';
import dayjs from 'dayjs';

export const createEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { sub, department } = req.user;
  const visit = await getVisitById(+id);
  const HOURS_DIFF = 4;
  const allowedDepartments = ['Medical Practitioners', 'Administrator'];

  if (!allowedDepartments.includes(department)) {
    return next();
  }

  try {
    await Encounter.findOrCreate({
      where: {
        staff_id: sub,
        visit_id: id,
        patient_id: visit.patient_id,
        time_of_encounter: {
          [Op.gt]: dayjs()
            .subtract(HOURS_DIFF, 'hours')
            .toDate(),
        },
      },
      defaults: {
        time_of_encounter: Date.now(),
      },
    });
    next();
  } catch (error) {
    return errorResponse({ res, message: 'Failed to create or find encounter', httpCode: 500 });
  }
};
