import Joi from 'joi';
import { DrugType } from '../../../database/models/pharmacyStore';
import { DrugForm } from '../../../database/models/drug';

export function validateOrderAdditionalItems(item: any) {
  const schema = Joi.array()
    .items(
      Joi.object({
        quantity_to_dispense: Joi.number().required(),
        inventory_id: Joi.number().required(),
        drug_id: Joi.number().required(),
        price: Joi.number().required(),
        unit_id: Joi.number().required(),
        name: Joi.string(),
        quantity_remaining: Joi.number()
          .allow('')
          .optional(),
        drug_form: Joi.string()
          .valid(DrugForm.DRUG, DrugForm.CONSUMABLE)
          .required(),
        drug_type: Joi.string().valid(
          DrugType.CASH,
          DrugType.NHIS,
          DrugType.PRIVATE,
          DrugType.RETAINERSHIP
        ),
        source: Joi.string().valid('Antenatal', 'Consultation', 'Theater'),
        ante_natal_id: Joi.number()
          .allow('')
          .optional(),
        surgery_id: Joi.number()
          .allow('')
          .optional(),
      })
    )
    .required();

  return schema.validate(item);
}

export function validateDrugPrescription(drug: any) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    quantity_prescribed: Joi.number().required(),
    quantity_to_dispense: Joi.number()
      .min(1)
      .positive()
      .required(),
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
    drug_type: Joi.string().valid(
      DrugType.CASH,
      DrugType.NHIS,
      DrugType.PRIVATE,
      DrugType.RETAINERSHIP
    ),
    source: Joi.string().valid('Antenatal', 'Consultation', 'Immunization', 'Theater'),
    ante_natal_id: Joi.number()
      .optional()
      .allow(''),
    immunization_id: Joi.number()
      .optional()
      .allow(''),
    surgery_id: Joi.number()
      .optional()
      .allow(''),
  });

  return schema.validate(drug);
}

export function validateBulkDrugsPrescription(drug: any) {
  const schema = Joi.array()
    .items(
      Joi.object({
        start_date: Joi.string().required(),
        drug_name: Joi.string()
          .optional()
          .allow(''),
        quantity_prescribed: Joi.number()
          .min(1)
          .positive()
          .required(),
        quantity_to_dispense: Joi.number()
          .min(1)
          .positive()
          .required(),
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
        total_price: Joi.number()
          .allow('')
          .optional(),
        drug_id: Joi.number().required(),
        drug_type: Joi.string().valid(
          DrugType.CASH,
          DrugType.NHIS,
          DrugType.PRIVATE,
          DrugType.RETAINERSHIP
        ),
        source: Joi.string().valid('Antenatal', 'Consultation', 'Immunization', 'Theater'),
        ante_natal_id: Joi.number()
          .optional()
          .allow(''),
        immunization_id: Joi.number()
          .optional()
          .allow(''),
        surgery_id: Joi.number()
          .optional()
          .allow(''),
      })
    )
    .required();

  return schema.validate(drug);
}

export function validateCreateTreatmentData(item: any) {
  const schema = Joi.array()
    .items(
      Joi.object({
        drug_id: Joi.number().required(),
        dosage_administered: Joi.string().required(),
        remarks: Joi.string().required(),
        source: Joi.string()
          .valid('Admission', 'Consultation')
          .required(),
      })
    )
    .required();

  return schema.validate(item);
}

export function validateDeleteDrug(req: any) {
  const schema = Joi.object({
    drugId: Joi.number().required(),
  }).required();

  return schema.validate(req);
}

export function validateDeleteAdditionalItem(req: any) {
  const schema = Joi.object({
    itemId: Joi.number().required(),
  }).required();

  return schema.validate(req);
}

export function validateAdditionalCreateTreatment(item: any) {
  const schema = Joi.array()
    .items(
      Joi.object({
        drug: Joi.string().required(),
        quantity: Joi.number().required(),
        dosage_administered: Joi.string()
          .optional()
          .allow(''),
        remarks: Joi.string()
          .optional()
          .allow(''),
        source: Joi.string()
          .valid('Admission', 'Consultation')
          .required(),
      })
    )
    .required();

  return schema.validate(item);
}
