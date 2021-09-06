import Joi from 'joi';

export function validateStaff(user) {
  const schema = Joi.object({
    firstname: Joi.string()
      .min(3)
      .required(),
    lastname: Joi.string()
      .min(3)
      .required(),
    middlename: Joi.string()
      .min(3)
      .optional()
      .allow(''),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .max(255)
      .required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    department: Joi.string().required(),
    role: Joi.string().required(),
    sub_role: Joi.string()
      .optional()
      .allow(''),
    photo: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
    username: Joi.string()
      .min(3)
      .required(),
  });
  return schema.validate(user);
}
