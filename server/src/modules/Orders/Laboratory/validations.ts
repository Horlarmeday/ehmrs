import Joi from 'joi';

export function validateBulkLabTest(tests) {
  const schema = Joi.object({
    tests: Joi.array()
      .items(
        Joi.object({
          test_id: Joi.number().required(),
          test_type: Joi.string().required(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean().required(),
        })
      )
      .required(),
  });

  return schema.validate(tests);
}
