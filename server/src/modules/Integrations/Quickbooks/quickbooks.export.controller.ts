import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from '../../../core/helpers/helper';
import { successResponse } from '../../../common/responses/success-responses';
import { BadException } from '../../../common/util/api-error';
import { validateDetailedExportPayload, validateSummaryExportPayload } from './validations';
import { QuickbooksExportService } from './quickbooks.export.service';

export class QuickbooksExportController {
  static async exportSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateSummaryExportPayload(req.body);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const result = await QuickbooksExportService.exportSummary(req.user.sub, value);

      return successResponse({
        res,
        data: result.data,
        message: result.message,
        httpCode: StatusCodes.OK,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async exportDetailed(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateDetailedExportPayload(req.body);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const result = await QuickbooksExportService.exportDetailed(req.user.sub, value);

      return successResponse({
        res,
        data: result.data,
        message: result.message,
        httpCode: StatusCodes.OK,
      });
    } catch (err) {
      return next(err);
    }
  }
}

