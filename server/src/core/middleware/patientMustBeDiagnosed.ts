import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from '../helpers/helper';
import { getVisitById } from '../../modules/Visit/visit.repository';
import { getOneDiagnosis } from '../../modules/Consultation/consultation.repository';
import { errorResponse } from '../../common/responses/error-responses';

export default async function(req: Request & { user: any }, res: Response, next: NextFunction) {
  try {
    const currentUser = req.user;
    if (currentUser.department !== 'Medical Practitioners') {
      return next();
    }

    const visit_id = req.params.id;
    if (!visit_id) {
      return errorResponse({
        res,
        message: 'Visit id is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    const visit = await getVisitById(+visit_id);
    if (!visit) {
      return errorResponse({
        res,
        message: 'Visit not found',
        httpCode: StatusCodes.NOT_FOUND,
      });
    }

    const diagnosis = await getOneDiagnosis({ visit_id: visit.id });
    if (!diagnosis) {
      return errorResponse({
        res,
        message: 'You need to select a diagnosis for a patient before you can move on',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }
    next();
  } catch (e) {
    return errorResponse({
      res,
      message: 'An error occurred',
      httpCode: StatusCodes.BAD_REQUEST,
    });
  }
}
