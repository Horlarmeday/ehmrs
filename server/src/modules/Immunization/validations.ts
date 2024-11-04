import Joi from 'joi';

export function validateCreateImmunization(req: any) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    mother_name: Joi.string().required(),
    father_name: Joi.string().required(),
    place_of_birth: Joi.string().required(),
    at_birth: Joi.object({
      medications: Joi.array()
        .items(Joi.string())
        .required(),
      weight: Joi.string().required(),
      createdAt: Joi.date().required(),
      staff: Joi.any().required(),
    }),
    other_children: Joi.array().items(
      Joi.object({
        sex: Joi.string()
          .allow('')
          .optional(),
        year: Joi.number()
          .allow('')
          .optional(),
        state_of_health: Joi.string()
          .allow('')
          .optional(),
      })
    ),
    is_wt_less_than_2_5kg: Joi.boolean(),
    is_baby_twin: Joi.boolean(),
    is_baby_bottle_fed: Joi.boolean(),
    does_family_need_support: Joi.boolean(),
    are_siblings_under_weight: Joi.boolean(),
    need_extra_care: Joi.boolean(),
    reason_for_extra_care: Joi.string()
      .allow('')
      .optional(),
    service_id: Joi.alternatives()
      .try(Joi.number(), Joi.array().items(Joi.number()))
      .required(),
  });
  return schema.validate(req);
}
