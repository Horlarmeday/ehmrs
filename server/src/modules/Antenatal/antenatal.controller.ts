import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { AntenatalService } from './antenatal.service';
import {
  validateCreateAntenatal,
  validateCreateAntenatalTriage,
  validateCreateClinicalNote,
  validateCreateDeliveryInfo,
  validateCreateObservation,
  validatePostnatalInfo,
  validateUpdateAntenatalAccount,
} from './validations';

export class AntenatalController {
  static async createAntenatalAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateAntenatal(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const drug = await AntenatalService.createAntenatalAccount({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getAntenatalPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await AntenatalService.getAntenatalPatients(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: patients,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getOneAntenatalAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await AntenatalService.getOneAntenatalAccount(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: account,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async updateAntenatalAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateUpdateAntenatalAccount(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const antenatal = await AntenatalService.updateAntenatalAccount(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: antenatal,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getPreviousPregnancies(req: Request, res: Response, next: NextFunction) {
    try {
      const pregnancies = await AntenatalService.getPreviousPregnancies(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: pregnancies,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createAntenatalTriage(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateAntenatalTriage(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const triage = await AntenatalService.createAntenatalTriage(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: triage,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getAntenatalTriages(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await AntenatalService.getAntenatalTriages(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: patients,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createClinicalNote(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateClinicalNote(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const clinicalNote = await AntenatalService.createClinicalNote(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: clinicalNote,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getClinicalNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await AntenatalService.getClinicalNotes(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: patients,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async updateClinicalNote(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const clinicalNote = await AntenatalService.updateClinicalNote(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: clinicalNote,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createObservation(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateObservation(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const data = await AntenatalService.createObservation({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async updateObservation(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const observation = await AntenatalService.updateObservation(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: observation,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getObservations(req: Request, res: Response, next: NextFunction) {
    try {
      const observations = await AntenatalService.getObservations(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: observations,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getVisitsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AntenatalService.getVisitsSummary({
        ...req.query,
        antenatalId: req.params.id,
      });
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: summary,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createDeliveryInfo(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateDeliveryInfo(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const delivery = await AntenatalService.createDeliveryInfo(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: delivery,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getDeliveryInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveries = await AntenatalService.getDeliveryInfo(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: deliveries,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createPostNatal(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validatePostnatalInfo(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const postNatal = await AntenatalService.createPostnatal(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: postNatal,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getPostnatalInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveries = await AntenatalService.getPostnatal(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: deliveries,
      });
    } catch (e) {
      return next(e);
    }
  }
}
