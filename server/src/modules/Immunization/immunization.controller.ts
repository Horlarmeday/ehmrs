import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { validateCreateImmunization } from './validations';
import { ImmunizationService } from './immunization.service';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from './messages/immunization.messages';
import { AntenatalService } from '../Antenatal/antenatal.service';

export class ImmunizationController {
  static async createImmunizationAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateImmunization(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const immunization = await ImmunizationService.createImmunizationAccount({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: immunization,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getOneImmunizationAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const immunization = await ImmunizationService.getOneImmunizationAccount(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: immunization,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async updateImmunizationAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const emptyBody = isEmpty(req.body);
    if (emptyBody)
      return errorResponse({
        res,
        message: EMPTY_BODY,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const immunization = await ImmunizationService.updateImmunization(+req.params.id, req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: immunization,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getImmunizationPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const immunizations = await ImmunizationService.getImmunizationPatients(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: immunizations,
      });
    } catch (e) {
      return next(e);
    }
  }
}
