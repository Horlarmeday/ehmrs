import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Joi.ObjectSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: false });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  req.body = value;
  next();
};

export const validateCreateDialysisVisit = validate(
  Joi.object({
    patient_id: Joi.number().required(),
    dialysis_type: Joi.string()
      .valid('Hemodialysis', 'Peritoneal Dialysis', 'CRRT')
      .required(),
    visit_date: Joi.date().required(),
    time_slot: Joi.string().required(),
    duration: Joi.number()
      .min(30)
      .max(480)
      .required(),
    doctor_id: Joi.number().required(),
    nurse_id: Joi.number().optional(),
    notes: Joi.string()
      .allow('')
      .optional(),
  })
);

export const validateUpdateDialysisVisit = validate(
  Joi.object({
    dialysis_type: Joi.string().optional(),
    visit_date: Joi.date().optional(),
    time_slot: Joi.string().optional(),
    duration: Joi.number()
      .min(30)
      .max(480)
      .optional(),
    doctor_id: Joi.number().optional(),
    nurse_id: Joi.number().optional(),
    status: Joi.string()
      .valid('Scheduled', 'In Progress', 'Completed', 'Cancelled')
      .optional(),
    notes: Joi.string()
      .allow('')
      .optional(),
    bed_number: Joi.string()
      .allow('')
      .optional(),
    blood_flow_rate: Joi.number()
      .allow('')
      .optional(),
    planned_duration_minutes: Joi.number()
      .allow('')
      .optional(),
    clinical_notes: Joi.string()
      .allow('')
      .optional(),
    machine_number: Joi.string()
      .allow('')
      .optional(),
  })
);

export const validateStartTreatment = validate(
  Joi.object({
    started_by: Joi.number().required(),
    treatment_data: Joi.object({
      actual_start_date: Joi.string().optional(),
      actual_end_date: Joi.string().optional(),
      current_duration: Joi.number()
        .min(0)
        .optional(),
      treatment_status: Joi.string()
        .optional()
        .allow(''),
      blood_flow_rate: Joi.string()
        .allow('')
        .optional(),
    }).required(),
  })
);

export const validateCompleteTreatment = validate(
  Joi.object({
    completed_by: Joi.number().required(),
    treatment_data: Joi.object({
      actual_end_date: Joi.date().optional(),
      treatment_status: Joi.string()
        .allow('')
        .optional(),
      current_duration: Joi.number()
        .min(0)
        .optional(),
    }).required(),
  })
);

export const validateCancelVisit = validate(
  Joi.object({
    cancelled_by: Joi.number().required(),
    cancellation_reason: Joi.string()
      .min(3)
      .required(),
  })
);
