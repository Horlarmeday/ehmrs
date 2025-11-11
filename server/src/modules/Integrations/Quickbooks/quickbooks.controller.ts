import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from '../../../core/helpers/helper';
import { QuickbooksService } from './quickbooks.service';
import {
  validateAuthorizeQuery,
  validateCallbackQuery,
  validateDisconnectPayload,
  validateCredentialPayload,
} from './validations';
import { successResponse } from '../../../common/responses/success-responses';
import { SUCCESS } from '../../../core/constants';
import { BadException } from '../../../common/util/api-error';

function safeJsonToBase64(data: unknown): string {
  return Buffer.from(JSON.stringify(data), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');
}

export class QuickbooksController {
  static async getAuthorizationUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateAuthorizeQuery(req.query);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const result = await QuickbooksService.getAuthorizationUrl(req.user.sub);

      return successResponse({
        res,
        data: result,
        message: SUCCESS,
        httpCode: StatusCodes.OK,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateCallbackQuery(req.query);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const status = await QuickbooksService.handleCallback({
        code: value.code,
        realmId: value.realmId,
        state: value.state,
      });

      const encoded = safeJsonToBase64(status);
      res.status(StatusCodes.OK).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>QuickBooks Connected</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f5f7fa; }
              .card { background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1); text-align: center; max-width: 420px; }
              h1 { margin-bottom: 16px; color: #1f2937; font-size: 24px; }
              p { margin: 0 0 24px; color: #4b5563; }
              button { padding: 10px 24px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
              button:hover { background-color: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>QuickBooks Connection Successful</h1>
              <p>You can close this window now.</p>
              <button onclick="window.close()">Close</button>
            </div>
            <script>
              (function() {
                var payload = '${encoded}';
                if (window.opener) {
                  try {
                    window.opener.postMessage({ type: 'quickbooks:connected', payload: payload }, '*');
                  } catch (err) {
                    console.error('Failed to notify opener:', err);
                  }
                }
              })();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      return next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await QuickbooksService.getStatus();
      return successResponse({
        res,
        data: status,
        message: SUCCESS,
        httpCode: StatusCodes.OK,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateDisconnectPayload(req.body);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const status = await QuickbooksService.disconnect(req.user.sub, value.revokeOnQuickbooks);

      return successResponse({
        res,
        data: status,
        message: 'QuickBooks connection disconnected successfully',
        httpCode: StatusCodes.OK,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await QuickbooksService.getCredentialSummary();
      return successResponse({
        res,
        data: summary,
        message: SUCCESS,
        httpCode: StatusCodes.OK,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateCredentialPayload(req.body);
      if (error) {
        throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, error.message);
      }

      const summary = await QuickbooksService.updateCredentials(value, req.user.sub);

      return successResponse({
        res,
        data: summary,
        message: 'QuickBooks credentials updated successfully',
        httpCode: StatusCodes.OK,
      });
    } catch (error) {
      return next(error);
    }
  }
}

