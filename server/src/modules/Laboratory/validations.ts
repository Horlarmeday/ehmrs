import Joi from 'joi';

export function validateTestSample(sample) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(sample);
}

export function validateTest(test) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    sample_id: Joi.number().required(),
  });
  return schema.validate(test);
}

export function validateNhisTest(test) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    sample_id: Joi.number().required(),
    code: Joi.string().required(),
    type: Joi.string().required(),
  });
  return schema.validate(test);
}

export function validateTestTariff(test) {
  const schema = Joi.object({
    test_id: Joi.number().required(),
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
  return schema.validate(test);
}
