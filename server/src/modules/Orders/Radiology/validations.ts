import Joi from 'joi';

export function validateBulkInvestigationTest(investigations) {
  const schema = Joi.object({
    investigations: Joi.array()
      .items(
        Joi.object({
          investigation_id: Joi.number().required(),
          investigation_type: Joi.string().required(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean().required(),
        })
      )
      .required(),
  });

  return schema.validate(investigations);
}
