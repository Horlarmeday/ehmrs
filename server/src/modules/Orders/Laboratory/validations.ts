import Joi from 'joi';

export function validateBulkLabTest(tests) {
  const schema = Joi.object({
    tests: Joi.array()
      .items(
        Joi.object({
          test_id: Joi.number().required(),
          test_type: Joi.string().required(),
          sample_id: Joi.number().required(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean().required(),
          ante_natal_id: Joi.number()
            .optional()
            .allow(''),
          source: Joi.string()
            .valid('Antenatal', 'Consultation')
            .required(),
        })
      )
      .required(),
  });

  return schema.validate(tests);
}
