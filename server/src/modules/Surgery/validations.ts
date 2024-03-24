import Joi from 'joi';

export function validateSurgery(surgery) {
  const schema = Joi.object({
    service_id: Joi.number().required(),
    visit_id: Joi.number().required(),
    notes: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(surgery);
}

export function validateOperationNote(note) {
  const schema = Joi.object({
    surgeon_id: Joi.number().required(),
    time_in: Joi.date().required(),
    time_out: Joi.date().required(),
    anaesthetist_id: Joi.number()
      .optional()
      .allow(''),
    scrub_nurse_id: Joi.number()
      .optional()
      .allow(''),
    post_operation_order: Joi.string()
      .optional()
      .allow(''),
    findings: Joi.string()
      .optional()
      .allow(''),
    indications: Joi.string()
      .optional()
      .allow(''),
    surgery: Joi.string()
      .optional()
      .allow(''),
    anaesthesia: Joi.string()
      .optional()
      .allow(''),
    procedure: Joi.string()
      .optional()
      .allow(''),
    assistance: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().required(),
          name: Joi.string().required(),
        })
      )
      .optional()
      .allow(''),
  });
  return schema.validate(note);
}
