import Joi from 'joi';

export function validateTestSample(sample) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(sample);
}

export function validateTest(test) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    result_form: Joi.string().required(),
    nhis_price: Joi.number()
      .optional()
      .allow(''),
    phis_price: Joi.number()
      .optional()
      .allow(''),
    retainership_price: Joi.number()
      .optional()
      .allow(''),
    sample_id: Joi.number().required(),
    result_unit: Joi.string().required(),
    valid_range: Joi.string().required(),
  });
  return schema.validate(test);
}

export function validateUpdateTestPrescription(number) {
  const schema = Joi.object({
    accession_number: Joi.string().required(),
    staff_id: Joi.number().required(),
    id: Joi.string().required(),
  });

  return schema.validate(number);
}

export function validateNhisTest(test) {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    sample_id: Joi.number().required(),
    code: Joi.string().required(),
    type: Joi.string().required(),
  });
  return schema.validate(test);
}

export function validateTestTariff(test) {
  const schema = Joi.object({
    test_id: Joi.number().required(),
    prices: Joi.array()
      .items(
        Joi.object({
          insurance_id: Joi.number().required(),
          hmo_id: Joi.number().required(),
          price: Joi.string().required(),
        })
      )
      .required(),
  });
  return schema.validate(test);
}

export function validateAddTestResult(result) {
  const schema = Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          prescribed_test_id: Joi.number().required(),
          test_prescription_id: Joi.number().required(),
          patient_id: Joi.number().required(),
          disabledReferral: Joi.boolean().required(),
          name: Joi.string().required(),
          status: Joi.string()
            .optional()
            .allow(''),
          result: Joi.string()
            .optional()
            .allow(''),
          valid_range: Joi.string()
            .optional()
            .allow(''),
          institute_referred: Joi.string()
            .optional()
            .allow(''),
          referral_reason: Joi.string()
            .optional()
            .allow(''),
          comments: Joi.string()
            .optional()
            .allow(''),
        })
      )
      .required(),
  });

  return schema.validate(result);
}

export function validateTestResults(result) {
  const schema = Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          prescribed_test_id: Joi.number().required(),
          test_prescription_id: Joi.number().required(),
          name: Joi.string().required(),
          patient_id: Joi.number().required(),
          status: Joi.string()
            .valid('Accepted', 'Rejected', 'Pending')
            .required(),
          result: Joi.string().required(),
          is_abnormal: Joi.boolean().required(),
          comments: Joi.string()
            .optional()
            .allow(''),
        })
      )
      .required(),
    result_notes: Joi.string()
      .optional()
      .allow(''),
  });

  return schema.validate(result);
}

export function validateApproveTestResults(result) {
  const schema = Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          prescribed_test_id: Joi.number().required(),
          test_prescription_id: Joi.number().required(),
          name: Joi.string().required(),
          patient_id: Joi.number().required(),
          test_status: Joi.boolean().required(),
          status: Joi.string()
            .valid('Accepted', 'Rejected', 'Pending')
            .required(),
          result: Joi.string().required(),
          is_abnormal: Joi.boolean().required(),
          comments: Joi.string()
            .optional()
            .allow(''),
        })
      )
      .required(),
  });

  return schema.validate(result);
}
