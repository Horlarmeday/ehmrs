import Joi from 'joi';

// Schema for form field validation
const fieldSchema = Joi.object({
  id: Joi.string().required(),
  label: Joi.string().required(),
  type: Joi.string()
    .required()
    .valid('text', 'number', 'date', 'select', 'radio', 'checkbox', 'textarea'),
  unit: Joi.string()
    .optional()
    .allow(''),
  placeholder: Joi.string()
    .optional()
    .allow(''),
  size: Joi.string()
    .optional()
    .valid('small', 'medium', 'large'),
  validation: Joi.object({
    required: Joi.boolean().optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string()
      .optional()
      .allow(''),
    decimalPlaces: Joi.number().optional(),
  }).optional(),
  referenceRanges: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        min: Joi.number().optional(),
        max: Joi.number().optional(),
        display: Joi.string().required(),
      })
    )
    .optional(),
  abnormalDetection: Joi.object({
    enabled: Joi.boolean().required(),
    ageDependent: Joi.boolean().optional(),
    sexDependent: Joi.boolean().optional(),
  }).optional(),
  options: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        label: Joi.string().required(),
      })
    )
    .optional(),
}).unknown(true); // Allow additional properties for custom field types

// Schema for form section validation
const sectionSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string()
    .optional()
    .allow(''),
  type: Joi.string()
    .optional()
    .valid('table', 'list', 'header', 'conditional'),
  conditionalLogic: Joi.object({
    showIf: Joi.string().required(),
  }).optional(),
  fields: Joi.array()
    .items(fieldSchema)
    .required()
    .min(1),
  fieldType: Joi.string().optional(),
  antibiotics: Joi.array()
    .items(Joi.string())
    .optional(),
}).unknown(true);

// Schema for JSON form schema validation
const formSchemaValidation = Joi.object({
  formId: Joi.string().required(),
  formName: Joi.string().required(),
  formType: Joi.string()
    .required()
    .valid('table', 'list', 'grouped', 'custom'),
  version: Joi.string().required(),
  sections: Joi.array()
    .items(sectionSchema)
    .required()
    .min(1),
  pdfConfig: Joi.object({
    layout: Joi.string()
      .required()
      .valid('table', 'multiColumnTable', 'list', 'grouped'),
    columns: Joi.array()
      .items(
        Joi.object({
          key: Joi.string().required(),
          header: Joi.string().required(),
          align: Joi.string()
            .required()
            .valid('left', 'right', 'center'),
          width: Joi.string().optional(),
        })
      )
      .optional(),
    showUnit: Joi.boolean().optional(),
    highlightAbnormal: Joi.boolean().optional(),
  }).optional(),
}).unknown(true);

/**
 * Validate create form template request
 */
export function validateCreateFormTemplate(data: any) {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .min(3)
      .max(255),
    code: Joi.string()
      .required()
      .min(3)
      .max(100)
      .regex(/^[A-Za-z0-9_]+$/),
    description: Joi.string()
      .optional()
      .allow('')
      .max(1000),
    category: Joi.string()
      .optional()
      .allow('')
      .max(100),
    schema_json: formSchemaValidation.required(),
    pdf_config: Joi.object().optional(),
    version: Joi.string()
      .optional()
      .default('1.0'),
    is_active: Joi.boolean()
      .optional()
      .default(true),
  });

  return schema.validate(data);
}

/**
 * Validate update form template request
 */
export function validateUpdateFormTemplate(data: any) {
  const schema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string()
      .optional()
      .min(3)
      .max(255),
    code: Joi.string()
      .required()
      .min(3)
      .max(100)
      .regex(/^[A-Za-z0-9_]+$/),
    description: Joi.string()
      .optional()
      .allow('')
      .max(1000),
    category: Joi.string()
      .optional()
      .allow('')
      .max(100),
    schema_json: formSchemaValidation.optional(),
    pdf_config: Joi.object().optional(),
    version: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

/**
 * Validate create template version request
 */
export function validateCreateTemplateVersion(data: any) {
  const schema = Joi.object({
    template_id: Joi.number().required(),
    version: Joi.string().required(),
    schema_json: formSchemaValidation.required(),
    pdf_config: Joi.object().optional(),
    change_notes: Joi.string()
      .optional()
      .allow('')
      .max(1000),
  });

  return schema.validate(data);
}

/**
 * Validate clone template request
 */
export function validateCloneTemplate(data: any) {
  const schema = Joi.object({
    id: Joi.number().required(),
    newName: Joi.string()
      .required()
      .min(3)
      .max(255),
    newCode: Joi.string()
      .required()
      .min(3)
      .max(100)
      .regex(/^[A-Za-z0-9_]+$/),
  });

  return schema.validate(data);
}
