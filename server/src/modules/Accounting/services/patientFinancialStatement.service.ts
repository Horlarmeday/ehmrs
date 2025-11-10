import { Op, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import {
  ClinicalBill,
  ClinicalBillItem,
  ClinicalPayment,
  Patient,
  PatientDeposit,
  DepositTransaction,
  Staff,
  Visit,
} from '../../../database/models';
import { BadException } from '../../../common/util/api-error';
import { patientAttributes, StatusCodes } from '../../../core/helpers/helper';

export interface FinancialStatementOptions {
  patientId: number;
  startDate?: Date;
  endDate?: Date;
  includeDeposits?: boolean;
  includeDetails?: boolean;
}

export interface BillWithPayments {
  bill: ClinicalBill;
  items: ClinicalBillItem[];
  payments: ClinicalPayment[];
}

export interface FinancialStatementData {
  patient: Patient;
  period: {
    startDate: Date;
    endDate: Date;
  };
  bills: BillWithPayments[];
  deposits: PatientDeposit[];
  depositHistory: DepositTransaction[];
  summary: {
    totalBills: number;
    totalBillsAmount: number;
    totalPayments: number;
    totalPaymentsAmount: number;
    totalDeposits: number;
    totalDepositsAmount: number;
    outstandingBalance: number;
  };
}

export class PatientFinancialStatementService {
  /**
   * Get patient financial statement data
   */
  static async getPatientFinancialStatement(
    options: FinancialStatementOptions
  ): Promise<FinancialStatementData> {
    const {
      patientId,
      startDate,
      endDate,
      includeDeposits = false,
      includeDetails = false,
    } = options;

    // Set default date range (last 3 months) if not provided
    const defaultEndDate = dayjs()
      .endOf('day')
      .toDate();
    const defaultStartDate = dayjs()
      .subtract(3, 'months')
      .startOf('day')
      .toDate();

    const periodStartDate = startDate || defaultStartDate;
    const periodEndDate = endDate || defaultEndDate;

    // Validate date range
    if (dayjs(periodStartDate).isAfter(dayjs(periodEndDate))) {
      throw new BadException(
        'INVALID_DATE_RANGE',
        StatusCodes.BAD_REQUEST,
        'Start date must be before end date'
      );
    }

    // Check date range is not more than 1 year
    const daysDiff = dayjs(periodEndDate).diff(dayjs(periodStartDate), 'days');
    if (daysDiff > 365) {
      throw new BadException(
        'DATE_RANGE_TOO_LARGE',
        StatusCodes.BAD_REQUEST,
        'Date range cannot exceed 1 year'
      );
    }

    // Fetch patient details
    const patient = await Patient.findByPk(patientId, {
      attributes: patientAttributes,
    });

    if (!patient) {
      throw new BadException(
        'PATIENT_NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Patient with ID ${patientId} not found`
      );
    }

    // Build date filter
    const dateFilter: WhereOptions = {
      createdAt: {
        [Op.between]: [periodStartDate, periodEndDate],
      },
    };

    // Fetch bills with items and payments
    const bills = await ClinicalBill.findAll({
      where: {
        patient_id: patientId,
        ...dateFilter,
      },
      include: [
        {
          model: ClinicalBillItem,
          as: 'billItems',
          required: false,
        },
        {
          model: Visit,
          as: 'visit',
          attributes: ['id', 'visit_date'],
          required: false,
        },
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: ['id', 'firstname', 'lastname'],
          required: false,
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Fetch all payments for these bills
    const billIds = bills.map(bill => bill.id);
    const payments = await ClinicalPayment.findAll({
      where: {
        bill_id: {
          [Op.in]: billIds,
        },
      },
      include: [
        {
          model: Staff,
          as: 'processedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
          required: false,
        },
      ],
      order: [['processed_at', 'ASC']],
    });

    // Group bills with their payments
    const billsWithPayments: BillWithPayments[] = bills.map(bill => ({
      bill,
      items: bill.billItems || [],
      payments: payments.filter(payment => payment.bill_id === bill.id),
    }));

    // Fetch deposits if requested
    let deposits: PatientDeposit[] = [];
    let depositHistory: DepositTransaction[] = [];

    if (includeDeposits) {
      deposits = await PatientDeposit.findAll({
        where: {
          patient_id: patientId,
          deposit_date: {
            [Op.between]: [periodStartDate, periodEndDate],
          },
        },
        include: [
          {
            model: Staff,
            as: 'createdByStaff',
            attributes: ['id', 'firstname', 'lastname'],
            required: false,
          },
        ],
        order: [['deposit_date', 'ASC']],
      });

      // Get deposit transaction history for the period
      const depositIds = deposits.map(d => d.id);
      if (depositIds.length > 0) {
        depositHistory = await DepositTransaction.findAll({
          where: {
            deposit_id: {
              [Op.in]: depositIds,
            },
            createdAt: {
              [Op.between]: [periodStartDate, periodEndDate],
            },
          },
          order: [['createdAt', 'ASC']],
        });
      }
    }

    // Calculate summary statistics
    const totalBills = bills.length;
    const totalBillsAmount = bills.reduce(
      (sum, bill) => sum + (parseFloat(bill.final_amount as any) || 0),
      0
    );

    const allPayments = payments;
    const totalPayments = allPayments.length;
    const totalPaymentsAmount = allPayments.reduce(
      (sum, payment) => sum + (parseFloat(payment.amount as any) || 0),
      0
    );

    const totalDeposits = deposits.length;
    const totalDepositsAmount = deposits.reduce(
      (sum, deposit) => sum + (parseFloat(deposit.amount as any) || 0),
      0
    );

    const outstandingBalance = totalBillsAmount - totalPaymentsAmount;

    return {
      patient,
      period: {
        startDate: periodStartDate,
        endDate: periodEndDate,
      },
      bills: billsWithPayments,
      deposits,
      depositHistory,
      summary: {
        totalBills,
        totalBillsAmount,
        totalPayments,
        totalPaymentsAmount,
        totalDeposits,
        totalDepositsAmount,
        outstandingBalance,
      },
    };
  }

  /**
   * Format statement data for CSV/Excel export
   */
  static formatStatementForExport(data: FinancialStatementData, includeDetails: boolean): any[] {
    const exportData: any[] = [];
    const { patient, period, bills, deposits, summary } = data;

    const patientName = `${patient.firstname || ''} ${patient.lastname || ''}`.trim();
    const hospitalId = patient.hospital_id || 'N/A';

    // If including details, flatten bills with items
    if (includeDetails) {
      bills.forEach(billGroup => {
        const bill = billGroup.bill;
        const items = billGroup.items;
        const billPayments = billGroup.payments;

        if (items && items.length > 0) {
          // Add each bill item as a separate row
          items.forEach(item => {
            exportData.push({
              Type: 'Bill Item',
              'Bill Number': bill.bill_number,
              'Bill Date': dayjs(bill.createdAt).format('YYYY-MM-DD'),
              'Patient Name': patientName,
              'Hospital ID': hospitalId,
              'Item Name': item.item_name,
              'Item Type': item.item_type,
              Quantity: item.quantity,
              'Unit Price': item.unit_price,
              'Item Total': item.total_price,
              'Bill Total': bill.final_amount,
              'Payment Status': bill.payment_status,
              Notes: bill.notes || '',
            });
          });
        } else {
          // Bill without items
          exportData.push({
            Type: 'Bill',
            'Bill Number': bill.bill_number,
            'Bill Date': dayjs(bill.createdAt).format('YYYY-MM-DD'),
            'Patient Name': patientName,
            'Hospital ID': hospitalId,
            'Item Name': 'N/A',
            'Item Type': 'N/A',
            Quantity: 0,
            'Unit Price': 0,
            'Item Total': 0,
            'Bill Total': bill.final_amount,
            'Payment Status': bill.payment_status,
            Notes: bill.notes || '',
          });
        }

        // Add payments for this bill
        billPayments.forEach(payment => {
          exportData.push({
            Type: 'Payment',
            'Bill Number': bill.bill_number,
            'Bill Date': dayjs(bill.createdAt).format('YYYY-MM-DD'),
            'Patient Name': patientName,
            'Hospital ID': hospitalId,
            'Payment Reference': payment.payment_reference,
            'Payment Date': dayjs(payment.processed_at).format('YYYY-MM-DD'),
            'Payment Amount': payment.amount,
            'Payment Method': payment.payment_method,
            'Payment Status': payment.status || 'COMPLETED',
          });
        });
      });
    } else {
      // Summary format without item details
      bills.forEach(billGroup => {
        const bill = billGroup.bill;
        const billPayments = billGroup.payments;
        const totalPaid = billPayments.reduce(
          (sum, p) => sum + (parseFloat(p.amount as any) || 0),
          0
        );

        exportData.push({
          Type: 'Bill',
          'Bill Number': bill.bill_number,
          'Bill Date': dayjs(bill.createdAt).format('YYYY-MM-DD'),
          'Patient Name': patientName,
          'Hospital ID': hospitalId,
          'Bill Amount': bill.final_amount,
          'Total Paid': totalPaid,
          Outstanding: parseFloat(bill.final_amount as any) - totalPaid,
          'Payment Status': bill.payment_status,
          Notes: bill.notes || '',
        });

        // Add payments
        billPayments.forEach(payment => {
          exportData.push({
            Type: 'Payment',
            'Bill Number': bill.bill_number,
            'Payment Reference': payment.payment_reference,
            'Payment Date': dayjs(payment.processed_at).format('YYYY-MM-DD'),
            'Patient Name': patientName,
            'Hospital ID': hospitalId,
            'Payment Amount': payment.amount,
            'Payment Method': payment.payment_method,
            'Payment Status': payment.status || 'COMPLETED',
          });
        });
      });
    }

    // Add deposits if included
    if (deposits && deposits.length > 0) {
      deposits.forEach(deposit => {
        exportData.push({
          Type: 'Deposit',
          'Patient Name': patientName,
          'Hospital ID': hospitalId,
          'Deposit Reference': deposit.reference_number,
          'Deposit Date': dayjs(deposit.deposit_date).format('YYYY-MM-DD'),
          'Deposit Amount': deposit.amount,
          'Current Balance': deposit.current_balance,
          'Deposit Status': deposit.status,
          Description: deposit.description || '',
        });
      });
    }

    return exportData;
  }

  /**
   * Calculate statement summary
   */
  static calculateStatementSummary(bills: BillWithPayments[], deposits: PatientDeposit[]): any {
    const totalBills = bills.length;
    const totalBillsAmount = bills.reduce(
      (sum, billGroup) => sum + (parseFloat(billGroup.bill.final_amount as any) || 0),
      0
    );

    const allPayments = bills.flatMap(billGroup => billGroup.payments);
    const totalPayments = allPayments.length;
    const totalPaymentsAmount = allPayments.reduce(
      (sum, payment) => sum + (parseFloat(payment.amount as any) || 0),
      0
    );

    const totalDeposits = deposits.length;
    const totalDepositsAmount = deposits.reduce(
      (sum, deposit) => sum + (parseFloat(deposit.amount as any) || 0),
      0
    );

    const outstandingBalance = totalBillsAmount - totalPaymentsAmount;

    return {
      totalBills,
      totalBillsAmount,
      totalPayments,
      totalPaymentsAmount,
      totalDeposits,
      totalDepositsAmount,
      outstandingBalance,
    };
  }
}
