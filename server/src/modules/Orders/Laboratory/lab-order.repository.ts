/* eslint-disable camelcase */
import {
  PrescribedTest,
  Staff,
  Test,
  TestResult,
  Patient,
  ClinicalBill,
} from '../../../database/models';
import sequelize, { WhereOptions } from 'sequelize';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { ERROR_UPDATING_TEST } from './messages/response-messages';
import { VisitBillingHelper } from '../../Accounting/visitBilling.helper';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, requester, price, patient_id, visit_id, ante_natal_id } = data;

  const prescribedTest = await PrescribedTest.create({
    test_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    ante_natal_id,
  });

  const test = await Test.findByPk(test_id);

  // 🆕 NEW: Auto-create bill for this prescription
  try {
    // Get patient and insurance for billing calculation
    const [patient, patientInsurance] = await Promise.all([
      Patient.findByPk(patient_id),
      getPatientInsuranceQuery({
        patient_id,
        is_default: true,
      }),
    ]);

    if (patient) {
      // Add this prescription to the visit bill
      await VisitBillingHelper.addPrescribedTestToBill(
        visit_id,
        prescribedTest,
        requester,
        patient,
        test,
        patientInsurance
      );
    }
  } catch (billingError) {
    // Log billing error but don't fail the prescription
    console.error('Billing creation failed for test:', billingError);
    // You might want to add proper logging here
  }

  return prescribedTest;
}

/**
 * prescribe multiple tests for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function orderBulkTest(data) {
  const tests = await PrescribedTest.bulkCreate(data);

  // 🆕 NEW: Auto-create bills for each prescribed test
  try {
    for (const test of tests) {
      // Get patient and insurance for billing calculation
      const [patient, patientInsurance] = await Promise.all([
        Patient.findByPk(test.patient_id),
        getPatientInsuranceQuery({
          patient_id: test.patient_id,
          is_default: true,
        }),
      ]);
      const originalTest = await Test.findByPk(test.test_id);
      if (patient) {
        // Add this prescription to the visit bill
        await VisitBillingHelper.addPrescribedTestToBill(
          test.visit_id,
          test,
          test.requester,
          patient,
          originalTest,
          patientInsurance
        );
      }
    }
  } catch (billingError) {
    // Log billing error but don't fail the prescription
    console.error('Billing creation failed for tests:', billingError);
    // You might want to add proper logging here
  }

  const testIds = tests.map(({ id }) => id);
  return getPrescriptionTests({ id: testIds });
}

export const updatePrescribedTest = async (data: Partial<PrescribedTest>) => {
  try {
    await PrescribedTest.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_TEST);
  }
  return getOnePrescribedTest({ id: data.id });
};

/**
 * get prescribed tests
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedTests = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedTest.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Test,
        attributes: ['name', 'type'],
      },
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'nhis_test_processor',
        attributes: staffAttributes,
      },
    ],
  });
};

export const getPrescriptionTests = async (query: sequelize.WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Test, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: TestResult, as: 'result', attributes: ['result', 'status'] },
    ],
  });
};

export const getOnePrescribedTest = async (query: WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findOne({
    where: { ...query },
    include: [
      { model: Test, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_test_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * delete prescribed test
 * @param testId
 */
export const deletePrescribedTest = async (testId: number) => {
  // Get the test before deletion to get visit_id
  const test = await PrescribedTest.findByPk(testId);
  if (!test) return 0;

  // Find the bill for this visit
  const bill = await ClinicalBill.findOne({
    where: { visit_id: test.visit_id },
  });

  // Delete the prescription
  const deletedCount = await PrescribedTest.destroy({ where: { id: testId } });

  if (deletedCount > 0 && bill) {
    // Clean up billing
    try {
      await VisitBillingHelper.removePrescribedTestFromBill(testId, bill.id);
    } catch (billingError) {
      console.error('Failed to remove prescribed test from billing:', billingError);
    }
  }

  return deletedCount;
};
