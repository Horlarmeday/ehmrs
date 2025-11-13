/* eslint-disable camelcase,no-param-reassign */
import {
  deletePrescribedTest,
  getPrescribedTests,
  getPrescriptionTests,
  orderBulkTest,
  prescribeTest,
  updatePrescribedTest,
} from './lab-order.repository';
import { PrescribedTestBody } from './interface/prescribed-test.body';
import { PrescribedService, PrescribedTest, Test } from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import {
  createTestPrescription,
  getLastTestPrescription,
  getTestPrice,
} from '../../Laboratory/laboratory.repository';
import { isToday, StatusCodes } from '../../../core/helpers/helper';
import { TestStatus } from '../../../database/models/testPrescription';
import { getVisitById } from '../../Visit/visit.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PrescriptionType } from '../../../database/models/prescribedTest';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { BadException } from '../../../common/util/api-error';
import {
  CANNOT_DELETE_TEST,
  UNSUPPORTED_TEST_REVERSAL_PAYMENT,
} from './messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import { TestType } from '../../../database/models/test';
import { getPrescriptionServices } from '../Service/service-order.repository';
import { PaymentReversalService } from '../../Accounting/services/paymentReversal.service';
import { PaymentMethod } from '../../Accounting/enums';
import sequelizeConnection from '../../../database/config/data-source';
import { IJwtPayload } from '../../../core/middleware/verify';

export class LabOrderService {
  /**
   * prescribe a test for patient
   *
   * @static
   * @returns {json} json object with prescribed test data
   * @param body
   * @memberOf LabOrderService
   */
  static async prescribeTestService(body) {
    const { patient_id, test_id, visit_id } = body;

    // Check for existing pending test
    const existingTest = await PrescribedTest.findOne({
      where: {
        test_id,
        visit_id,
        payment_status: PaymentStatus.PENDING,
      },
    });

    if (existingTest) {
      const test = await Test.findByPk(test_id);
      throw new BadException(
        'Duplicate Test',
        StatusCodes.BAD_REQUEST,
        `Test "${test?.name}" has already been prescribed for this visit with pending payment`
      );
    }

    const prescription = await this.getTestPrescription(patient_id, body);
    return prescribeTest({ ...body, test_prescription_id: prescription.id });
  }

  /**
   * prescribe bulk test for patient
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @param body
   * @memberOf LabOrderService
   */
  static async orderBulkTestService(body: PrescribedTestBody): Promise<PrescribedTest[]> {
    const { tests, staff_id, visit_id } = body;
    const visit = await getVisitById(visit_id);
    const [patient, prescription, insurance] = await Promise.all([
      PatientService.getPatientById(visit.patient_id),
      this.getTestPrescription(visit.patient_id, body),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
    ]);

    // Check for duplicate tests with pending payment
    const existingTests = await PrescribedTest.findAll({
      where: {
        visit_id,
        payment_status: PaymentStatus.PENDING,
      },
      attributes: ['test_id'],
    });

    const existingTestIds = existingTests.map(t => t.test_id);

    // Filter out duplicates
    const duplicateTestIds = tests
      .filter(test => existingTestIds.includes(test.test_id))
      .map(t => t.test_id);

    if (duplicateTestIds.length > 0) {
      // Get test names for error message
      const duplicateTests = await Test.findAll({
        where: { id: duplicateTestIds },
        attributes: ['name'],
      });

      const testNames = duplicateTests.map(t => t.name).join(', ');

      throw new BadException(
        'Duplicate Tests',
        StatusCodes.BAD_REQUEST,
        `The following tests already have pending payment for this visit: ${testNames}`
      );
    }

    const bulkTests = await Promise.all(
      tests.map(async test => ({
        ...test,
        price: (await getTestPrice(patient, test)) || test.price,
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
        test_prescription_id: prescription.id,
        ...(test.test_type === PrescriptionType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
        patient_insurance_id: insurance?.id,
        test_group:
          patient?.has_insurance && test.test_type !== PrescriptionType.CASH
            ? TestType.SECONDARY
            : null,
      }))
    );
    return orderBulkTest(bulkTests);
  }

  /**
   * get prescribed tests
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @param body
   * @memberOf LabOrderService
   */
  static async getPrescribedTests(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.values(body).length) {
      return getPrescribedTests({ currentPage, pageLimit, filter });
    }

    return getPrescribedTests({});
  }

  /**
   * update prescribed test
   *
   * @static
   * @returns {Promise<PrescribedTest>} json object with prescribed test data
   * @param body
   * @param staffId
   * @memberOf LabOrderService
   */
  static async updatePrescribedTest(
    body: Partial<PrescribedTest>,
    staffId: number
  ): Promise<PrescribedTest> {
    return updatePrescribedTest({ ...body, test_changed_by: staffId });
  }

  /**
   * delete prescribed test
   *
   * @static
   * @returns {json} json object with prescribed test data
   * @param body
   * @param staff
   * @memberOf LabOrderService
   */
  static async deletePrescribedTest(body, staff: IJwtPayload) {
    const isAdmin = staff.role === 'Super Admin';
    const transaction = await sequelizeConnection.transaction();

    try {
      const test = await PrescribedTest.findByPk(body.testId, { transaction });
      if (!test) {
        throw new BadException(
          'Test Not Found',
          StatusCodes.NOT_FOUND,
          'Prescribed test does not exist'
        );
      }

      const paymentSummary = await PaymentReversalService.getBillItemPaymentSummaryForTest(
        body.testId,
        transaction
      );
      const billId = paymentSummary?.bill?.id;
      const hasPayments = Boolean(paymentSummary && paymentSummary.paymentAllocations.length > 0);

      if (hasPayments && paymentSummary) {
        if (!isAdmin)
          throw new BadException(
            'Error',
            StatusCodes.BAD_REQUEST,
            'This item has been paid for, contact admin for help'
          );
        const unsupportedAllocation = paymentSummary.paymentAllocations.find(allocation => {
          const method = allocation.payment.payment_method;
          return method === PaymentMethod.INSURANCE || method === PaymentMethod.OTHER;
        });

        if (unsupportedAllocation) {
          throw new BadException(
            'Unsupported Payment Method',
            StatusCodes.BAD_REQUEST,
            UNSUPPORTED_TEST_REVERSAL_PAYMENT
          );
        }

        await PaymentReversalService.reverseAllocationsForSummary(
          paymentSummary,
          staff.sub,
          transaction
        );
      } else if (test.payment_status === PaymentStatus.CLEARED) {
        throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_TEST);
      }

      const deletedCount = await deletePrescribedTest(body.testId, transaction);

      if (billId) {
        await PaymentReversalService.reconcileBillStatus(billId, transaction);
      }

      await transaction.commit();
      return deletedCount;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * get the test prescription
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @memberOf LabOrderService
   * @param patient_id
   * @param data
   */
  private static async getTestPrescription(patient_id: number, data: PrescribedTestBody) {
    const lastPrescription = await getLastTestPrescription(patient_id);

    if (lastPrescription && !isToday(lastPrescription?.date_requested))
      return createTestPrescription(this.testPrescriptionData(data, patient_id));

    // if today and sample has not been collected - pick the id and use it in the test samples and prescribed test
    if (lastPrescription?.status === TestStatus.PENDING) return lastPrescription;

    // if today and sample has been collected - create new one
    if (lastPrescription?.status === TestStatus.SAMPLE_COLLECTED)
      return createTestPrescription(this.testPrescriptionData(data, patient_id));

    return createTestPrescription(this.testPrescriptionData(data, patient_id));
  }

  /**
   * update bulk prescribed tests
   *
   * @static
   * @returns {Promise<PrescribedService>} json object with prescribed test data
   * @param body
   * @memberOf LabOrderService
   */
  static async updateBulkPrescribedTest(body: Partial<PrescribedTest>[]) {
    return await Promise.all(body.map(async data => await updatePrescribedTest(data)));
  }

  /**
   * get prescribed tests
   *
   * @static
   * @returns {json} json object with prescribed drugs data
   * @memberOf LabOrderService
   * @param visitId
   */
  static async getTestsPrescribed(visitId: number) {
    return getPrescriptionTests({ visit_id: visitId });
  }

  private static testPrescriptionData(body: PrescribedTestBody, patient_id: number) {
    return {
      source: body.tests?.[0]?.source || 'Consultation',
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_requested: Date.now(),
      ...(body.tests?.[0]?.ante_natal_id && { ante_natal_id: body.tests?.[0]?.ante_natal_id }),
    };
  }
}
