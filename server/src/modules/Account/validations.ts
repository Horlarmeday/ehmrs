import Joi from 'joi';

export function validatePaymentHistory(payment) {
  const schema = Joi.object({
    mode_of_payment: Joi.string().required(),
    type: Joi.string().required(),
    totalAmount: Joi.number().required(),
    selectedItems: Joi.array()
      .items(Joi.number())
      .required(),
  });
  return schema.validate(payment);
}
