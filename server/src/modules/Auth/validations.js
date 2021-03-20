import Joi from 'joi';

export function validateLogin(user) {
  const schema = Joi.object({
    password: Joi.string()
      .min(6)
      .max(255)
      .required(),
    username: Joi.string().required(),
  });
  return schema.validate(user);
}

export function validateForgotPassword(req) {
  const schema = Joi.object({
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
  });
  return schema.validate(req);
}
