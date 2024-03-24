import Joi from 'joi';

export function validateBulkInvestigationTest(investigations) {
  const schema = Joi.object({
    investigations: Joi.array()
      .items(
        Joi.object({
          investigation_id: Joi.number().required(),
          imaging_id: Joi.number().required(),
          investigation_type: Joi.string().required(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean().required(),
          source: Joi.string()
            .valid('Antenatal', 'Consultation')
            .required(),
          ante_natal_id: Joi.number()
            .optional()
            .allow(''),
        })
      )
      .required(),
  });

  return schema.validate(investigations);
}

export function validateDeleteInvestigation(req) {
  const schema = Joi.object({
    investigationId: Joi.number().required(),
  });

  return schema.validate(req);
}
