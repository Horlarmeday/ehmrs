import { Response } from 'express';
import { StatusCodes } from '../../../core/helpers/helper';
import { SUCCESS, ERROR } from '../../../core/constants';

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationInfo;
  httpCode: number;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  httpCode: number;
}

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(
  res: Response,
  data: T,
  message: string,
  httpCode: number = StatusCodes.OK,
  pagination?: PaginationInfo
): Response<StandardResponse<T>> => {
  const response: StandardResponse<T> = {
    success: true,
    message,
    data,
    httpCode,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(httpCode).json(response);
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
  res: Response,
  message: string,
  httpCode: number = StatusCodes.BAD_REQUEST,
  errors?: Record<string, string[]>
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message,
    httpCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(httpCode).json(response);
};

/**
 * Create a paginated response
 */
export const createPaginatedResponse = <T>(
  res: Response,
  data: T[],
  totalCount: number,
  currentPage: number,
  pageLimit: number,
  message: string,
  httpCode: number = StatusCodes.OK
): Response<StandardResponse<T[]>> => {
  const totalPages = Math.ceil(totalCount / pageLimit);

  const pagination: PaginationInfo = {
    current_page: currentPage,
    total_pages: totalPages,
    total_items: totalCount,
    items_per_page: pageLimit,
  };

  return createSuccessResponse(res, data, message, httpCode, pagination);
};

/**
 * Create a response for single item operations
 */
export const createItemResponse = <T>(
  res: Response,
  data: T,
  message: string,
  httpCode: number = StatusCodes.OK
): Response<StandardResponse<T>> => {
  return createSuccessResponse(res, data, message, httpCode);
};

/**
 * Create a response for creation operations
 */
export const createCreatedResponse = <T>(
  res: Response,
  data: T,
  message: string
): Response<StandardResponse<T>> => {
  return createSuccessResponse(res, data, message, StatusCodes.CREATED);
};

/**
 * Create a response for deletion operations
 */
export const createDeletedResponse = (
  res: Response,
  message: string
): Response<StandardResponse<null>> => {
  return createSuccessResponse(res, null, message, StatusCodes.OK);
};

/**
 * Create a response for validation errors
 */
export const createValidationErrorResponse = (
  res: Response,
  message: string,
  errors: Record<string, string[]>
): Response<ErrorResponse> => {
  return createErrorResponse(res, message, StatusCodes.BAD_REQUEST, errors);
};

/**
 * Create a response for not found errors
 */
export const createNotFoundResponse = (res: Response, message: string): Response<ErrorResponse> => {
  return createErrorResponse(res, message, StatusCodes.NOT_FOUND);
};

/**
 * Create a response for server errors
 */
export const createServerErrorResponse = (
  res: Response,
  message: string
): Response<ErrorResponse> => {
  return createErrorResponse(res, message, StatusCodes.SERVER_ERROR);
};
