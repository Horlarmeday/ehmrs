import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const commonPricingFields = {
  hmo_id: Joi.number().required(),
  hmo_price: Joi.number().required(),
  patient_percentage: Joi.number()
    .min(0)
    .max(100)
    .required(),
  hmo_percentage: Joi.number()
    .min(0)
    .max(100)
    .required(),
  effective_from: Joi.date().required(),
  effective_to: Joi.date().required(),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .default('Active'),
  notes: Joi.string()
    .allow('')
    .optional(),
};

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

export const validateCreateDrugPricing = validate(
  Joi.object({
    drug_id: Joi.number().required(),
    ...commonPricingFields,
  })
);

export const validateCreateTestPricing = validate(
  Joi.object({
    test_id: Joi.number().required(),
    ...commonPricingFields,
  })
);

export const validateCreateServicePricing = validate(
  Joi.object({
    service_id: Joi.number().required(),
    ...commonPricingFields,
  })
);

export const validateCreateInvestigationPricing = validate(
  Joi.object({
    investigation_id: Joi.number().required(),
    ...commonPricingFields,
  })
);

export const validateBulkCreatePricing = validate(
  Joi.object({
    insurance_id: Joi.number().required(),
    effective_from: Joi.date().required(),
    effective_to: Joi.date().required(),
    status: Joi.string()
      .valid('Active', 'Inactive')
      .required(),
    notes: Joi.string()
      .allow('')
      .optional(),
    items: Joi.array()
      .items(
        Joi.object({
          drug_id: Joi.number().optional(),
          test_id: Joi.number().optional(),
          service_id: Joi.number().optional(),
          investigation_id: Joi.number().optional(),
          hmo_price: Joi.number().required(),
          patient_percentage: Joi.number()
            .min(0)
            .max(100)
            .required(),
          hmo_percentage: Joi.number()
            .min(0)
            .max(100)
            .required(),
          notes: Joi.string()
            .allow('')
            .optional(),
        }).xor('drug_id', 'test_id', 'service_id', 'investigation_id')
      )
      .min(1)
      .required(),
  })
);

export const validateCSVUpload = validate(
  Joi.object({
    csvData: Joi.array()
      .items(
        Joi.object({
          item_code: Joi.string().required(),
          item_type: Joi.string()
            .valid('DRUG', 'TEST', 'SERVICE', 'INVESTIGATION')
            .required(),
          insurance_name: Joi.string().required(),
          hmo_price: Joi.number().required(),
          patient_percentage: Joi.number()
            .min(0)
            .max(100)
            .required(),
          hmo_percentage: Joi.number()
            .min(0)
            .max(100)
            .required(),
          effective_from: Joi.string().required(),
          effective_to: Joi.string().required(),
          notes: Joi.string()
            .allow('')
            .optional(),
        })
      )
      .min(1)
      .required(),
  })
);

export const validateCalculateDrugPricing = validate(
  Joi.object({
    drug_id: Joi.number().required(),
    insurance_id: Joi.number().required(),
    quantity: Joi.number()
      .min(1)
      .optional(),
  })
);

export const validateCalculateTestPricing = validate(
  Joi.object({
    test_id: Joi.number().required(),
    insurance_id: Joi.number().required(),
  })
);

export const validateCalculateServicePricing = validate(
  Joi.object({
    service_id: Joi.number().required(),
    insurance_id: Joi.number().required(),
  })
);

export const validateCalculateInvestigationPricing = validate(
  Joi.object({
    investigation_id: Joi.number().required(),
    insurance_id: Joi.number().required(),
  })
);
