import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Joi.ObjectSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: false });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  req.body = value;
  next();
};

export const validateCreateAudit = validate(
  Joi.object({
    store_type: Joi.string()
      .valid('PHARMACY', 'LABORATORY')
      .required(),
    initiated_by: Joi.number().required(),
    inventory_ids: Joi.array()
      .items(Joi.number())
      .min(1)
      .required(),
    notes: Joi.string()
      .allow('')
      .optional(),
  })
);

export const validateUpdateAudit = validate(
  Joi.object({
    notes: Joi.string()
      .allow('')
      .optional(),
    status: Joi.string()
      .valid('Draft', 'In Progress', 'Completed', 'Approved', 'Cancelled')
      .optional(),
  })
);

export const validateStartAudit = validate(
  Joi.object({
    started_by: Joi.number().required(),
  })
);

export const validateCompleteAudit = validate(
  Joi.object({
    completed_by: Joi.number().required(),
    completion_notes: Joi.string()
      .allow('')
      .optional(),
  })
);

export const validateApproveAudit = validate(
  Joi.object({
    approved_by: Joi.number().required(),
    approval_notes: Joi.string()
      .allow('')
      .optional(),
  })
);
