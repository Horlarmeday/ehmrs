import Joi from 'joi';
import { DrugType } from '../../../database/models/pharmacyStore';

export function validateDrugPrescription(drug) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    quantity_prescribed: Joi.number().required(),
    quantity_to_dispense: Joi.number().required(),
    route_id: Joi.number().required(),
    frequency: Joi.string().required(),
    dosage_form_id: Joi.number().required(),
    strength_id: Joi.number().required(),
    prescribed_strength: Joi.string()
      .allow('')
      .optional(),
    duration: Joi.string().required(),
    duration_unit: Joi.string().required(),
    notes: Joi.string()
      .optional()
      .allow(''),
    total_price: Joi.number().required(),
    drug_id: Joi.number().required(),
    drug_type: Joi.string().valid(DrugType.CASH, DrugType.NHIS),
  });

  return schema.validate(drug);
}
