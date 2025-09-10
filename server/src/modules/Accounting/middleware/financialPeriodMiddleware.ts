import { Request, Response, NextFunction } from 'express';
import { FinancialPeriodValidationService } from '../services/financialPeriodValidation.service';
import { BadException } from '../../../common/util/api-error';
import { logger } from '../../../core/helpers/logger';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Middleware to enforce financial period restrictions on all financial transactions
 * This ensures that transactions can only occur in OPEN financial periods
 */
export const enforceFinancialPeriodRestrictions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip validation for non-financial endpoints
    if (!isFinancialEndpoint(req.path, req.method)) {
      return next();
    }

    // Get transaction date from request body or use current date
    let transactionDate: Date;

    // Check for actual fields that exist in the DTOs
    if (req.body.start_date) {
      transactionDate = new Date(req.body.start_date);
    } else if (req.body.end_date) {
      transactionDate = new Date(req.body.end_date);
    } else if (req.body.closing_date) {
      transactionDate = new Date(req.body.closing_date);
    } else if (req.body.due_date) {
      transactionDate = new Date(req.body.due_date);
    } else if (req.body.processed_at) {
      transactionDate = new Date(req.body.processed_at);
    } else {
      // Use current date if no date field found
      transactionDate = new Date();
    }

    // Validate transaction period
    const validation = await FinancialPeriodValidationService.validateTransactionPeriod(
      transactionDate
    );

    if (!validation.valid) {
      throw new BadException(
        'Financial Period Restriction',
        403,
        `Transaction blocked: ${validation.message}. ${validation.errors?.join(', ')}`
      );
    }

    // Add period information to request for downstream use
    (req as any).financialPeriod = validation.period;

    next();
  } catch (error) {
    if (error instanceof BadException) {
      next(error);
    } else {
      next(
        new BadException(
          'Financial Period Validation Error',
          500,
          `Failed to validate financial period: ${error.message}`
        )
      );
    }
  }
};

/**
 * Middleware to check if a specific financial period is accessible for operations
 */
export const validateFinancialPeriodAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const periodId = parseInt(req.params.periodId || req.params.id);

    if (!periodId || isNaN(periodId)) {
      return next();
    }

    // Validate period access based on operation type
    const operation = getOperationType(req.method);
    const validation = await FinancialPeriodValidationService.validatePeriodForOperation(
      periodId,
      operation
    );

    if (!validation.valid) {
      throw new BadException(
        'Financial Period Access Denied',
        403,
        `Access denied: ${validation.message}. ${validation.errors?.join(', ')}`
      );
    }

    // Add validated period to request
    (req as any).validatedPeriod = validation.period;

    next();
  } catch (error) {
    if (error instanceof BadException) {
      next(error);
    } else {
      next(
        new BadException(
          'Financial Period Access Validation Error',
          500,
          `Failed to validate financial period access: ${error.message}`
        )
      );
    }
  }
};

/**
 * Middleware to ensure financial periods are properly configured before allowing operations
 */
export const ensureFinancialPeriodsConfigured = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if there's at least one active financial period
    const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();

    if (!currentPeriod) {
      throw new BadException(
        'Financial Periods Not Configured',
        503,
        'No active financial period found. Please configure financial periods before processing transactions.'
      );
    }

    // Add current period to request
    (req as any).currentFinancialPeriod = currentPeriod;

    next();
  } catch (error) {
    if (error instanceof BadException) {
      next(error);
    } else {
      next(
        new BadException(
          'Financial Period Configuration Check Failed',
          500,
          `Failed to check financial period configuration: ${error.message}`
        )
      );
    }
  }
};

/**
 * Helper function to determine if an endpoint is financial-related
 */
function isFinancialEndpoint(path: string, method: string): boolean {
  const financialPaths = [
    '/accounting',
    '/payments',
    '/bills',
    '/deposits',
    '/journal-entries',
    '/transactions',
    '/financial-reports',
  ];

  const financialMethods = ['POST', 'PUT', 'PATCH'];

  // Check if path contains financial endpoints
  const isFinancialPath = financialPaths.some(fp => path.includes(fp));

  // Check if method modifies financial data
  const isFinancialMethod = financialMethods.includes(method.toUpperCase());

  return isFinancialPath && isFinancialMethod;
}

/**
 * Helper function to determine operation type from HTTP method
 */
function getOperationType(method: string): 'create' | 'read' | 'update' | 'delete' | 'transaction' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'read';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'transaction';
  }
}

/**
 * Middleware to log financial period violations for audit purposes
 */
export const logFinancialPeriodViolations = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Log any period violations for audit trail
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode === 403 && data && typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.message && parsedData.message.includes('Financial Period')) {
          logger.info(
            `[FINANCIAL PERIOD VIOLATION] ${req.method} ${req.path} - User: ${req.user.sub} - ${parsedData.message}`
          );
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return originalSend.call(this, data);
  };

  next();
};
