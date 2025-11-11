import Joi from 'joi';
import { PaymentMethod, PaymentStatus } from '../../Accounting/enums';

export function validateAuthorizeQuery(query: unknown) {
  const schema = Joi.object({
    returnTo: Joi.string().uri().optional(),
  });

  return schema.validate(query);
}

export function validateCallbackQuery(query: unknown) {
  const schema = Joi.object({
    code: Joi.string().required(),
    state: Joi.string().required(),
    realmId: Joi.string().required(),
  }).options({ allowUnknown: true });

  return schema.validate(query);
}

export function validateDisconnectPayload(body: unknown) {
  const schema = Joi.object({
    revokeOnQuickbooks: Joi.boolean().default(true),
  });

  return schema.validate(body);
}

export function validateSummaryExportPayload(body: unknown) {
  const schema = Joi.object({
    memo: Joi.string().max(500).optional(),
    txnDate: Joi.date().iso().optional(),
    accountMappings: Joi.object({
      revenueAccountId: Joi.string().required(),
      offsetAccountId: Joi.string().required(),
      pendingAccountId: Joi.string().optional(),
      depositsAccountId: Joi.string().optional(),
    }).required(),
  });

  return schema.validate(body);
}

export function validateDetailedExportPayload(body: unknown) {
  const schema = Joi.object({
    filters: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date()
        .iso()
        .min(Joi.ref('start'))
        .optional(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .optional(),
      status: Joi.string()
        .valid(...Object.values(PaymentStatus))
        .optional(),
      currentPage: Joi.number().integer().min(1).default(1),
      pageLimit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().optional(),
    }).default({
      currentPage: 1,
      pageLimit: 20,
    }),
    memoPrefix: Joi.string().max(200).default('EHMRS Payment'),
    accountMappings: Joi.object({
      creditAccountId: Joi.string().required(),
      debitAccounts: Joi.object({
        default: Joi.string().required(),
        CASH: Joi.string().optional(),
        CARD: Joi.string().optional(),
        BANK_TRANSFER: Joi.string().optional(),
        MOBILE_MONEY: Joi.string().optional(),
        INSURANCE: Joi.string().optional(),
        DEPOSIT: Joi.string().optional(),
      }).required(),
    }).required(),
  });

  return schema.validate(body);
}

export function validateCredentialPayload(body: unknown) {
  const schema = Joi.object({
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required(),
    redirectUri: Joi.string().uri().required(),
    environment: Joi.string().valid('SANDBOX', 'PRODUCTION').default('SANDBOX'),
  });

  return schema.validate(body);
}

