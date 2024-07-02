import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from '../helpers/helper';
import { getVisitById } from '../../modules/Visit/visit.repository';
import { getOneDiagnosis } from '../../modules/Consultation/consultation.repository';

export default async function(req: Request & { user: any }, res: Response, next: NextFunction) {
  const visit_id = req.params.id;
  if (!visit_id) return res.status(StatusCodes.BAD_REQUEST).json('Visit id is required');

  const visit = await getVisitById(+visit_id);
  if (!visit) return res.status(StatusCodes.NOT_FOUND).json('Visit not found');

  const diagnosis = await getOneDiagnosis({ visit_id: visit.id });
  if (!diagnosis)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json('You need to select a diagnosis for a patient before you can move on');

  next();
}
