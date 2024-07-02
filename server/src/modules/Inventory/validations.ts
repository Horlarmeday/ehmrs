import Joi from 'joi';
import { AcceptedDrugType } from '../../database/models/inventory';

export const validateCreateInventory = inventory => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string()
      .optional()
      .allow(''),
    refill_level: Joi.string()
      .optional()
      .allow(null),
    accepted_drug_type: Joi.string().valid(
      AcceptedDrugType.NHIS,
      AcceptedDrugType.BOTH,
      AcceptedDrugType.CASH,
      AcceptedDrugType.PRIVATE
    ),
  });
  return schema.validate(inventory);
};

export const validateRequestDrugsToStore = inventory => {
  const schema = Joi.array().items(
    Joi.object({
      reason_for_return: Joi.string().required(),
      quantity: Joi.number().required(),
      inventory_item_id: Joi.number().required(),
    })
  );
  return schema.validate(inventory);
};

export const validateUpdateReturnRequest = inventory => {
  const schema = Joi.array().items(
    Joi.object({
      id: Joi.number().required(),
      status: Joi.string().required(),
      quantity: Joi.number().required(),
      inventory_item_id: Joi.number().required(),
    })
  );
  return schema.validate(inventory);
};
