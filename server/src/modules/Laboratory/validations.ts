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
