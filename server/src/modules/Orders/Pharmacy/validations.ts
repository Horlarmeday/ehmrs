import Joi from 'joi';
import { DrugType } from '../../../database/models/pharmacyStore';
import { DrugGroup } from '../../../database/models/prescribedDrug';

export function validateDrugPrescription(drug: any) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    quantity_prescribed: Joi.number().required(),
    quantity_to_dispense: Joi.number().required(),
    route_id: Joi.number().required(),
    frequency: Joi.string().required(),
    dosage_form_id: Joi.number().required(),
    dosage_form_name: Joi.string().required(),
    strength_id: Joi.number().required(),
    inventory_id: Joi.number().required(),
    prescribed_strength: Joi.string()
      .allow('')
      .optional(),
    duration: Joi.string().required(),
    duration_unit: Joi.string().required(),
    notes: Joi.string()
      .optional()
      .allow(''),
    drug_group: Joi.string()
      .optional()
      .allow(''),
    total_price: Joi.number().required(),
    drug_id: Joi.number().required(),
    drug_type: Joi.string().valid(DrugType.CASH, DrugType.NHIS),
    source: Joi.string().valid('Antenatal', 'Consultation'),
    ante_natal_id: Joi.number()
      .optional()
      .allow(''),
  });

  return schema.validate(drug);
}
