import Joi from 'joi';
import { RequestStatus } from '../../database/models/request';

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
        })
      )
      .required(),
  });
  return schema.validate(request);
}
