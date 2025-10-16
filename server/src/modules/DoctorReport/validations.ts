import Joi from 'joi';

/**
 * Validate create doctor report data
 * @param report - report data
 * @returns validation result
 */
export function validateCreateDoctorReport(report: {
  visit_id: number;
  patient_id: number;
  report_content: string;
}) {
  const schema = Joi.object({
    visit_id: Joi.number()
      .required()
      .messages({
        'number.base': 'Visit ID must be a number',
        'any.required': 'Visit ID is required',
      }),
    patient_id: Joi.number()
      .required()
      .messages({
        'number.base': 'Patient ID must be a number',
        'any.required': 'Patient ID is required',
      }),
    report_content: Joi.string()
      .required()
      .min(10)
      .messages({
        'string.base': 'Report content must be a string',
        'string.empty': 'Report content cannot be empty',
        'string.min': 'Report content must be at least 10 characters long',
        'any.required': 'Report content is required',
      }),
  });

  return schema.validate(report);
}

/**
 * Validate update doctor report data
 * @param report - report update data
 * @returns validation result
 */
export function validateUpdateDoctorReport(report: { report_content: string }) {
  const schema = Joi.object({
    report_content: Joi.string()
      .required()
      .min(10)
      .messages({
        'string.base': 'Report content must be a string',
        'string.empty': 'Report content cannot be empty',
        'string.min': 'Report content must be at least 10 characters long',
        'any.required': 'Report content is required',
      }),
  });

  return schema.validate(report);
}
