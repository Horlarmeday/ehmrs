import Joi from 'joi';
import { DefaultType } from '../../database/models/default';

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
    type: Joi.string()
      .valid('Primary', 'Secondary')
      .required(),
  });
  return schema.validate(service);
}

export function validateCreateDefault(req) {
  const schema = Joi.object({
    type: Joi.string()
      .valid(
        DefaultType.OPERATION_ITEMS,
        DefaultType.INJECTION_ITEMS,
        DefaultType.ANC_ROUTINE_DRUGS,
        DefaultType.ANC_ROUTINE_TESTS,
        DefaultType.ADMISSION_ITEMS,
        DefaultType.WATER_INJECTIONS,
        DefaultType.CIRCUMCISION_ROUTINE_DRUGS,
        DefaultType.HSG_ADDITIONAL_ITEMS
      )
      .required(),
    data: Joi.any().required(),
  });
  return schema.validate(req);
}

export function validateDeleteDefaultData(req) {
  const schema = Joi.object({
    id: Joi.number().required(),
    dataId: Joi.string().required(),
  });
  return schema.validate(req);
}
