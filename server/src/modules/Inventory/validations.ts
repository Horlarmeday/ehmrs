import Joi from 'joi';
import { AcceptedDrugType } from '../../database/models/inventory';

export const validateCreateInventory = inventory => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().optional().allow(''),
    refill_level: Joi.string()
      .optional()
      .allow(null),
    accepted_drug_type: Joi.string().valid(
      AcceptedDrugType.COVERED,
      AcceptedDrugType.BOTH,
      AcceptedDrugType.CASH
    ),
  });
  return schema.validate(inventory);
};
