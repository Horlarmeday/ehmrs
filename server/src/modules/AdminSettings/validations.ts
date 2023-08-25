import Joi from 'joi';

export function validateDepartment(department) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(department);
}

export function validateUnit(unit) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(unit);
}

export function validateWard(ward) {
  const schema = Joi.object({
    name: Joi.string().required(),
    service_id: Joi.number().required(),
    occupant_type: Joi.string().required(),
  });
  return schema.validate(ward);
}

export function validateBed(bed) {
  const schema = Joi.object({
    code: Joi.string().required(),
    bed_type: Joi.string().required(),
    ward_id: Joi.number().required(),
  });
  return schema.validate(bed);
}

export function validateService(service) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
  });
  return schema.validate(service);
}
