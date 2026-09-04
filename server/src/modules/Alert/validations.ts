import Joi from 'joi';
import { AlertSeverity } from '../../database/enums';

export function validateAlert(alert: Joi.ObjectSchema) {
  const schema = Joi.object({
    alert: Joi.string().required(),
    severity: Joi.string()
      .valid(...Object.values(AlertSeverity))
      .required(),
    visit_id: Joi.number(),
    patient_id: Joi.number(),
  }).xor('visit_id', 'patient_id');
  return schema.validate(alert);
}
