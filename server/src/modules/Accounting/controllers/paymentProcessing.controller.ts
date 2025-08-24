import { Request, Response, NextFunction } from 'express';
import { PaymentProcessingService } from '../services/paymentProcessing.service';
import Joi from 'joi';
import {
  processPaymentSchema,
  paymentOptionsQuerySchema,
  paymentStatusParamsSchema,
  paymentReceiptParamsSchema
} from '../validations';
import { BadException } from '../../../common/util/api-error';
import { log } from 'console';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Payment Processing Controller
 * 
 * Handles HTTP requests for payment processing operations
 * Follows thin controller pattern - delegates all business logic to service layer
 */
export class PaymentProcessingController {
  // Validation helper method
  private static validateRequest(data: unknown, schema: Joi.Schema) {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new BadException('Validation Error', 400, error.details[0].message);
    }
    return value;
  }

  /**
   * Process payment for selected bill items
   */
  static async processPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = PaymentProcessingController.validateRequest(req.body, processPaymentSchema);
      const staffId = req.user.sub;

      // Delegate to service layer
      const result = await PaymentProcessingService.processPayment(
        validatedBody,
        staffId
      );

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment processing options (available payment methods, etc.)
   */
  static async getPaymentOptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(req.query);
      // Validate query parameters
      const validatedQuery = PaymentProcessingController.validateRequest(req.query, paymentOptionsQuerySchema);

      // Delegate to service layer
      const paymentOptions = await PaymentProcessingService.getPaymentOptions(
        validatedQuery.billId,
        validatedQuery.patientId
      );

      res.status(200).json({
        success: true,
        message: 'Payment options retrieved successfully',
        data: paymentOptions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment processing status
   */
  static async getPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate path parameters
      const validatedParams = PaymentProcessingController.validateRequest(req.params, paymentStatusParamsSchema);

      // Delegate to service layer
      const paymentStatus = await PaymentProcessingService.getPaymentStatus(
        validatedParams.paymentId
      );

      res.status(200).json({
        success: true,
        message: 'Payment status retrieved successfully',
        data: paymentStatus,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment receipt
   */
  static async getPaymentReceipt(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate path parameters
      const validatedParams = PaymentProcessingController.validateRequest(req.params, paymentReceiptParamsSchema);

      // Delegate to service layer
      const receiptData = await PaymentProcessingService.getPaymentReceipt(
        validatedParams.paymentId
      );

      res.status(200).json({
        success: true,
        message: 'Payment receipt retrieved successfully',
        data: receiptData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate payment data before processing
   */
  static async validatePaymentData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body using the same schema as processPayment
      const validatedBody = PaymentProcessingController.validateRequest(req.body, processPaymentSchema);

      res.status(200).json({
        success: true,
        message: 'Payment data validation passed',
        data: {
          is_valid: true,
          validation_errors: [],
          validated_data: validatedBody,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
