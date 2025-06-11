import { AccountDto } from './dto/account.dto';
import { getVisitById } from '../Visit/visit.repository';
import {
  createPaymentHistory,
  getPatientPaymentHistory,
  createChartOfAccount,
  updateChartOfAccount,
  getChartOfAccounts,
  createJournalEntry,
  getJournalEntries,
  getAccountBalance,
  getTrialBalance,
  createCostCenter,
  updateCostCenter,
  getCostCenters,
  generateFinancialStatement,
  generateTrendAnalysis,
  generateCustomReport,
  exportReport,
  getPaymentHistoryDataForPrint,
} from './account.repository';
import { PaymentHistoryPrintProps } from './types';
import { ServiceName } from '../../database/models/paymentHistory';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';

export class AccountService {
  /** create payment history
   *
   * @static
   * @returns {json} json object with payment history data
   * @param body
   * @memberOf AccountService
   */
  static async createPaymentHistory(body: AccountDto) {
    const visit = await getVisitById(body.visit_id);
    return createPaymentHistory({ ...body, patient_id: visit.patient_id });
  }

  /** get a patient payment history
   *
   * @static
   * @returns {json} json object with payment history data
   * @param body
   * @memberOf AccountService
   */
  static async getPaymentHistory(body) {
    const { patient_id, currentPage, pageLimit } = body;
    if (Object.values(body).length) {
      return getPatientPaymentHistory({ patient_id, currentPage, pageLimit });
    }
    return getPatientPaymentHistory({ patient_id });
  }

  static async getPaymentHistoryForPrint(
    visitId: number,
    paymentHistoryPrintProps: PaymentHistoryPrintProps
  ) {
    const { serviceName } = paymentHistoryPrintProps;
    const payments = await getPaymentHistoryDataForPrint(serviceName, visitId);
    if (!payments?.length) {
      throw new BadException(
        'Error',
        StatusCodes.BAD_REQUEST,
        `Cannot find any payment made for ${serviceName}`
      );
    }
    return payments;
  }

  /** Create a new chart of account
   * @static
   * @returns {json} json object with chart of account data
   */
  static async createChartOfAccount(data: any) {
    return await createChartOfAccount(data);
  }

  /** Update an existing chart of account
   * @static
   * @returns {json} json object with updated chart of account data
   */
  static async updateChartOfAccount(data: any) {
    return await updateChartOfAccount(data);
  }

  /** Get all chart of accounts
   * @static
   * @returns {json} json object with chart of accounts data
   */
  static async getChartOfAccounts(query: any) {
    return await getChartOfAccounts(query);
  }

  /** Create a new journal entry
   * @static
   * @returns {json} json object with journal entry data
   */
  static async createJournalEntry(data: any) {
    return await createJournalEntry(data);
  }

  /** Get journal entries
   * @static
   * @returns {json} json object with journal entries data
   */
  static async getJournalEntries(query: any) {
    return await getJournalEntries(query);
  }

  /** Get account balance
   * @static
   * @returns {json} json object with account balance data
   */
  static async getAccountBalance(accountId: number) {
    return await getAccountBalance(accountId);
  }

  /** Get trial balance
   * @static
   * @returns {json} json object with trial balance data
   */
  static async getTrialBalance() {
    return await getTrialBalance();
  }

  /** Create a new cost center
   * @static
   * @returns {json} json object with cost center data
   */
  static async createCostCenter(data: any) {
    return await createCostCenter(data);
  }

  /** Update an existing cost center
   * @static
   * @returns {json} json object with updated cost center data
   */
  static async updateCostCenter(data: any) {
    return await updateCostCenter(data);
  }

  /** Get all cost centers
   * @static
   * @returns {json} json object with cost centers data
   */
  static async getCostCenters(query: any) {
    return await getCostCenters(query);
  }

  /** Generate financial statement
   * @static
   * @returns {json} json object with financial statement data
   */
  static async generateFinancialStatement(data: any) {
    return await generateFinancialStatement(data);
  }

  /** Generate trend analysis
   * @static
   * @returns {json} json object with trend analysis data
   */
  static async generateTrendAnalysis(data: any) {
    const result = await generateTrendAnalysis(data);
    if (data.format) {
      return await exportReport(result, data.format);
    }
    return result;
  }

  /** Generate custom report
   * @static
   * @returns {json} json object with custom report data
   */
  static async generateCustomReport(data: any) {
    const result = await generateCustomReport(data);
    if (data.format) {
      return await exportReport(result, data.format);
    }
    return result;
  }

  /**
   * Streams a POS-style PDF receipt to the browser.
   * @param serviceName
   * @param visitId
   * @param res Express response object
   */
  static async generateReceiptPDF(serviceName: ServiceName, visitId: number, res: Response) {
    // Fetch payment data
    const payments = await getPaymentHistoryDataForPrint(serviceName, visitId);
    const payment = payments[0];
    const patient = payment?.patient;
  }
}
