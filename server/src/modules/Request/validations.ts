import Joi from 'joi';
import { RequestStatus } from '../../database/enums';

export function validateCreateRequests(request: any) {
  const schema = Joi.object({
    requests: Joi.array()
      .items(
        Joi.object({
          inventory_id: Joi.number().required(),
          item_id: Joi.number().required(),
          quantity: Joi.number().required(),
        })
      )
      .required(),
  });
  return schema.validate(request);
}

export function validateUpdateRequestsStatus(request: any) {
  const schema = Joi.object({
    requests: Joi.array()
      .items(
        Joi.object({
          status: Joi.string()
            .valid(RequestStatus.GRANTED, RequestStatus.DECLINED)
            .required(),
          id: Joi.number().required(),
          pharmacy_store_id: Joi.number().when('status', {
            is: RequestStatus.GRANTED,
            then: Joi.required(),
            otherwise: Joi.forbidden(),
          }),
        })
      )
      .required(),
  });
  return schema.validate(request);
}
