import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    req.body = value;
    next();
  };

export const validateCreateOrder = validate(
  Joi.object({
    vendor_id: Joi.number().required(),
    expected_delivery_date: Joi.date().required(),
    notes: Joi.string().allow('').optional(),
    items: Joi.array()
      .items(
        Joi.object({
          item_id: Joi.number().required(),
          item_type: Joi.string().valid('PHARMACY', 'LABORATORY').required(),
          quantity: Joi.number().min(1).required(),
          unit_price: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
  })
);

export const validateUpdateOrder = validate(
  Joi.object({
    status: Joi.string().valid('Draft', 'Sent', 'Received', 'Approved', 'Cancelled').optional(),
    notes: Joi.string().allow('').optional(),
  })
);

export const validateApproveOrder = validate(
  Joi.object({
    approved_by: Joi.number().required(),
    approval_notes: Joi.string().allow('').optional(),
  })
);

export const validateSendOrder = validate(
  Joi.object({
    sent_by: Joi.number().required(),
    sent_date: Joi.date().required(),
    expected_delivery_date: Joi.date().required(),
  })
);

export const validateReceiveOrderItems = validate(
  Joi.object({
    received_by: Joi.number().required(),
    received_date: Joi.date().required(),
    received_items: Joi.array()
      .items(
        Joi.object({
          order_item_id: Joi.number().required(),
          quantity_received: Joi.number().min(0).required(),
          unit_price: Joi.number().min(0).optional(),
          batch: Joi.string().allow('').optional(),
          expiration: Joi.date().allow(null).optional(),
        })
      )
      .min(1)
      .required(),
  })
);

export const validateCancelOrder = validate(
  Joi.object({
    cancelled_by: Joi.number().required(),
    cancellation_reason: Joi.string().min(3).required(),
  })
);


