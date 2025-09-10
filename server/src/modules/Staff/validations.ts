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
    photo: Joi.string()
      .optional()
      .allow(''),
    date_of_birth: Joi.date().required(),
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
    username: Joi.string()
      .min(3)
      .required(),
    // date_of_first_appointment: Joi.date().required(),
    // date_of_commencement: Joi.date().required(),
    // dolp: Joi.date().required(),
    // qualification: Joi.string().required(),
    // present_rank: Joi.string().required(),
    // chs_cms: Joi.string().required(),
    // step: Joi.number()
    //   .integer()
    //   .required(),
    // dd_for_retirement: Joi.date().required(),
    // nin: Joi.string()
    //   .length(11)
    //   .pattern(/^\d+$/)
    //   .required()
    //   .messages({
    //     'string.length': 'NIN must be exactly 11 digits',
    //     'string.pattern.base': 'NIN must contain only numbers',
    //   }),
  });
  return schema.validate(user);
}
