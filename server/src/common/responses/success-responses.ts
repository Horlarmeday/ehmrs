import { SUCCESS } from '../../core/constants';

export type SuccessResponse<T = any> = {
  status: 'success';
  message: string;
  data: T;
};

export const successResponse = ({ res, httpCode, data, message }): SuccessResponse => {
  return res.status(httpCode).json({
    status: SUCCESS,
    message,
    data,
  });
};
