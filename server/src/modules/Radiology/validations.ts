import Joi from 'joi';

export function validateImaging(imaging) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(imaging);
}

export function validateInvestigation(investigation) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    nhis_price: Joi.number()
      .optional()
      .allow(''),
    phis_price: Joi.number()
      .optional()
      .allow(''),
    retainership_price: Joi.number()
      .optional()
      .allow(''),
    imaging_id: Joi.number().required(),
    type: Joi.string()
      .valid('Primary', 'Secondary')
      .required(),
    description: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(investigation);
}

export function validateInvestigationTariff(investigation) {
  const schema = Joi.object({
    investigation_id: Joi.number().required(),
    prices: Joi.array()
      .items(
        Joi.object({
          insurance_id: Joi.number().required(),
          hmo_id: Joi.number().required(),
          price: Joi.string().required(),
        })
      )
      .required(),
  });
  return schema.validate(investigation);
}

export function validateAddInvestigationResults(result) {
  const schema = Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          prescribed_investigation_id: Joi.number().required(),
          investigation_prescription_id: Joi.number().required(),
          name: Joi.string().required(),
          patient_id: Joi.number().required(),
          status: Joi.string()
            .valid('Accepted', 'Rejected', 'Pending')
            .required(),
          result: Joi.string()
            .optional()
            .allow(''),
        })
      )
      .required(),
  });

  return schema.validate(result);
}

export function validateResultApproval(result) {
  const schema = Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          prescribed_investigation_id: Joi.number().required(),
          investigation_prescription_id: Joi.number().required(),
          result: Joi.string().required(),
          name: Joi.string()
            .optional()
            .allow(''),
        })
      )
      .required(),
  });

  return schema.validate(result);
}
