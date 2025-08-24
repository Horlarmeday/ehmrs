import { Transaction, Op } from 'sequelize';
import { PatientDeposit } from '../../../database/models/patientDeposit';
import { DepositTransaction } from '../../../database/models/depositTransaction';
import { DepositJournalEntry } from '../../../database/models/depositJournalEntry';
import { DepositAuditLog } from '../../../database/models/depositAuditLog';
import { BadException } from '../../../common/util/api-error';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  patientId?: number;
  depositType?: string;
  status?: string;
  bankAccountId?: number;
  minAmount?: number;
  maxAmount?: number;
  includeInactive?: boolean;
}

export interface DepositSummaryReport {
  totalDeposits: number;
  totalInitialAmount: number;
  totalCurrentBalance: number;
  totalRefundableAmount: number;
  totalUsed: number;
  totalRefunded: number;
  activeDeposits: number;
  usedDeposits: number;
  refundedDeposits: number;
  averageDepositAmount: number;
  averageUtilizationRate: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface DepositActivityReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  transactions: Array<{
    id: number;
    deposit_id: number;
    reference_number: string;
    patient_name: string;
    transaction_type: string;
    amount: number;
    previous_balance: number;
    new_balance: number;
    description: string;
    created_at: Date;
    created_by: string;
  }>;
  summary: {
    totalTransactions: number;
    totalAmount: number;
    byType: Record<string, { count: number; amount: number }>;
    byDate: Record<string, { count: number; amount: number }>;
  };
}

export interface PatientDepositReport {
  patient: {
    id: number;
    firstname: string;
    lastname: string;
    patient_number: string;
  };
  deposits: Array<{
    id: number;
    reference_number: string;
    amount: number;
    current_balance: number;
    refundable_amount: number;
    status: string;
    deposit_type: string;
    deposit_date: Date;
    last_activity_date: Date;
  }>;
  summary: {
    totalDeposits: number;
    totalInitialAmount: number;
    totalCurrentBalance: number;
    totalRefundableAmount: number;
    totalUsed: number;
    totalRefunded: number;
    averageDepositAmount: number;
    utilizationRate: number;
  };
}

export interface ReconciliationReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalDepositsChecked: number;
    reconciledDeposits: number;
    discrepancyCount: number;
    totalDiscrepancyAmount: number;
    reconciliationStatus: string;
  };
  details: Array<{
    depositId: number;
    referenceNumber: string;
    patientName: string;
    recordedBalance: number;
    calculatedBalance: number;
    discrepancy: number;
    isReconciled: boolean;
    issues: string[];
  }>;
}

export interface ExpiryReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  expiringDeposits: Array<{
    id: number;
    reference_number: string;
    patient_name: string;
    amount: number;
    current_balance: number;
    daysUntilExpiry: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  summary: {
    totalExpiring: number;
    totalAmount: number;
    byRiskLevel: Record<string, { count: number; amount: number }>;
    recommendations: string[];
  };
}

export class DepositReportingService {
  /**
   * Generate comprehensive deposit summary report
   */
  static async generateDepositSummaryReport(
    filters: ReportFilters = {}
  ): Promise<DepositSummaryReport> {
    try {
      const whereClause: any = {};

      // Apply filters
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdAt[Op.lte] = filters.endDate;
      }

      if (filters.depositType) {
        whereClause.deposit_type = filters.depositType;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.bankAccountId) {
        whereClause.bank_account_id = filters.bankAccountId;
      }

      if (filters.minAmount || filters.maxAmount) {
        whereClause.amount = {};
        if (filters.minAmount) whereClause.amount[Op.gte] = filters.minAmount;
        if (filters.maxAmount) whereClause.amount[Op.lte] = filters.maxAmount;
      }

      if (!filters.includeInactive) {
        whereClause.status = { [Op.ne]: 'EXPIRED' };
      }

      const deposits = await PatientDeposit.findAll({
        where: whereClause,
        include: ['patient']
      });

      // Calculate summary statistics
      const totalDeposits = deposits.length;
      const totalInitialAmount = deposits.reduce((sum, d) => sum + (d.initial_amount || 0), 0);
      const totalCurrentBalance = deposits.reduce((sum, d) => sum + (d.current_balance || 0), 0);
      const totalRefundableAmount = deposits.reduce((sum, d) => sum + (d.refundable_amount || 0), 0);
      const totalUsed = totalInitialAmount - totalCurrentBalance;
      const totalRefunded = totalInitialAmount - totalRefundableAmount;

      const activeDeposits = deposits.filter(d => d.status === 'ACTIVE').length;
      const usedDeposits = deposits.filter(d => d.status === 'USED').length;
      const refundedDeposits = deposits.filter(d => d.status === 'REFUNDED').length;

      const averageDepositAmount = totalDeposits > 0 ? totalInitialAmount / totalDeposits : 0;
      const averageUtilizationRate = totalInitialAmount > 0 ? (totalUsed / totalInitialAmount) * 100 : 0;

      return {
        totalDeposits,
        totalInitialAmount,
        totalCurrentBalance,
        totalRefundableAmount,
        totalUsed,
        totalRefunded,
        activeDeposits,
        usedDeposits,
        refundedDeposits,
        averageDepositAmount,
        averageUtilizationRate,
        period: {
          startDate: filters.startDate || new Date(0),
          endDate: filters.endDate || new Date()
        }
      };
    } catch (error) {
      throw new BadException('Failed to generate deposit summary report', 500, error.message);
    }
  }

  /**
   * Generate deposit activity report for a specific period
   */
  static async generateDepositActivityReport(
    filters: ReportFilters = {}
  ): Promise<DepositActivityReport> {
    try {
      const whereClause: any = {};

      // Apply filters
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdAt[Op.lte] = filters.endDate;
      }

      if (filters.patientId) {
        whereClause.deposit_id = {
          [Op.in]: await this.getDepositIdsForPatient(filters.patientId)
        };
      }

      const transactions = await DepositTransaction.findAll({
        where: whereClause,
        include: [
          {
            model: PatientDeposit,
            as: 'deposit',
            include: ['patient']
          },
          {
            model: require('../../../database/models/staff').Staff,
            as: 'createdByStaff'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Format transactions
      const formattedTransactions = transactions.map(t => ({
        id: t.id,
        deposit_id: t.deposit_id,
        reference_number: t.reference_number,
        patient_name: `${t.deposit?.patient?.firstname || ''} ${t.deposit?.patient?.lastname || ''}`.trim(),
        transaction_type: t.transaction_type,
        amount: t.amount,
        previous_balance: t.previous_balance,
        new_balance: t.new_balance,
        description: t.description,
        created_at: t.createdAt,
        created_by: `${t.createdByStaff?.firstname || ''} ${t.createdByStaff?.lastname || ''}`.trim()
      }));

      // Calculate summary
      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      const byType: Record<string, { count: number; amount: number }> = {};
      const byDate: Record<string, { count: number; amount: number }> = {};

      transactions.forEach(t => {
        // Group by transaction type
        const type = t.transaction_type;
        if (!byType[type]) {
          byType[type] = { count: 0, amount: 0 };
        }
        byType[type].count++;
        byType[type].amount += t.amount || 0;

        // Group by date
        const date = t.createdAt.toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { count: 0, amount: 0 };
        }
        byDate[date].count++;
        byDate[date].amount += t.amount || 0;
      });

      return {
        period: {
          startDate: filters.startDate || new Date(0),
          endDate: filters.endDate || new Date()
        },
        transactions: formattedTransactions,
        summary: {
          totalTransactions,
          totalAmount,
          byType,
          byDate
        }
      };
    } catch (error) {
      throw new BadException('Failed to generate deposit activity report', 500, error.message);
    }
  }

  /**
   * Generate individual patient deposit report
   */
  static async generatePatientDepositReport(
    patientId: number,
    filters: ReportFilters = {}
  ): Promise<PatientDepositReport> {
    try {
      const whereClause: any = { patient_id: patientId };

      // Apply filters
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdAt[Op.lte] = filters.endDate;
      }

      if (filters.depositType) {
        whereClause.deposit_type = filters.depositType;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const deposits = await PatientDeposit.findAll({
        where: whereClause,
        include: ['patient']
      });

      if (deposits.length === 0) {
        throw new BadException('No deposits found for this patient', 404);
      }

      const patient = deposits[0].patient;
      if (!patient) {
        throw new BadException('Patient information not found', 404);
      }

      // Format deposits
      const formattedDeposits = deposits.map(d => ({
        id: d.id,
        reference_number: d.reference_number,
        amount: d.amount,
        current_balance: d.current_balance,
        refundable_amount: d.refundable_amount,
        status: d.status,
        deposit_type: d.deposit_type,
        deposit_date: d.deposit_date,
        last_activity_date: d.last_activity_date
      }));

      // Calculate summary
      const totalDeposits = deposits.length;
      const totalInitialAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
      const totalCurrentBalance = deposits.reduce((sum, d) => sum + (d.current_balance || 0), 0);
      const totalRefundableAmount = deposits.reduce((sum, d) => sum + (d.refundable_amount || 0), 0);
      const totalUsed = totalInitialAmount - totalCurrentBalance;
      const totalRefunded = totalInitialAmount - totalRefundableAmount;
      const averageDepositAmount = totalDeposits > 0 ? totalInitialAmount / totalDeposits : 0;
      const utilizationRate = totalInitialAmount > 0 ? (totalUsed / totalInitialAmount) * 100 : 0;

      return {
        patient: {
          id: patient.id,
          firstname: patient.firstname,
          lastname: patient.lastname,
          patient_number: patient.hospital_id || patient.id?.toString() || ''
        },
        deposits: formattedDeposits,
        summary: {
          totalDeposits,
          totalInitialAmount,
          totalCurrentBalance,
          totalRefundableAmount,
          totalUsed,
          totalRefunded,
          averageDepositAmount,
          utilizationRate
        }
      };
    } catch (error) {
      throw new BadException('Failed to generate patient deposit report', 500, error.message);
    }
  }

  /**
   * Generate reconciliation report
   */
  static async generateReconciliationReport(
    filters: ReportFilters = {}
  ): Promise<ReconciliationReport> {
    try {
      // This will use the existing reconciliation service
      const reconciliationService = require('./patientDeposit.service').PatientDepositService;
      const reconciliation = await reconciliationService.reconcileDepositBalances();

      // Filter results by date if specified
      let filteredResults = reconciliation.results;
      if (filters.startDate || filters.endDate) {
        filteredResults = reconciliation.results.filter(result => {
          const lastTransactionDate = result.lastTransactionDate;
          if (!lastTransactionDate) return false;

          if (filters.startDate && lastTransactionDate < filters.startDate) return false;
          if (filters.endDate && lastTransactionDate > filters.endDate) return false;
          return true;
        });
      }

      // Calculate filtered summary
      const summary = {
        totalDepositsChecked: filteredResults.length,
        reconciledDeposits: filteredResults.filter(r => r.isReconciled).length,
        discrepancyCount: filteredResults.filter(r => !r.isReconciled).length,
        totalDiscrepancyAmount: filteredResults.reduce((sum, r) => sum + r.balanceDiscrepancy, 0),
        reconciliationStatus: reconciliation.reconciliationStatus
      };

      // Format details
      const details = filteredResults.map(r => ({
        depositId: r.depositId,
        referenceNumber: r.referenceNumber,
        patientName: r.patientName,
        recordedBalance: r.recordedBalance,
        calculatedBalance: r.calculatedBalance,
        discrepancy: r.balanceDiscrepancy,
        isReconciled: r.isReconciled,
        issues: r.reconciliationIssues || []
      }));

      return {
        period: {
          startDate: filters.startDate || new Date(0),
          endDate: filters.endDate || new Date()
        },
        summary,
        details
      };
    } catch (error) {
      throw new BadException('Failed to generate reconciliation report', 500, error.message);
    }
  }

  /**
   * Generate expiry report for deposits expiring soon
   */
  static async generateExpiryReport(
    filters: ReportFilters = {}
  ): Promise<ExpiryReport> {
    try {
      const whereClause: any = {
        status: 'ACTIVE',
        current_balance: { [Op.gt]: 0 }
      };

      // Apply filters
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdAt[Op.lte] = filters.endDate;
      }

      const deposits = await PatientDeposit.findAll({
        where: whereClause,
        include: ['patient']
      });

      const now = new Date();
      const expiringDeposits = deposits
        .map(d => {
          // Calculate days until expiry (assuming 1 year from creation)
          const expiryDate = new Date(d.createdAt);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Determine risk level
          let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
          if (daysUntilExpiry <= 30) riskLevel = 'HIGH';
          else if (daysUntilExpiry <= 90) riskLevel = 'MEDIUM';

          return {
            id: d.id,
            reference_number: d.reference_number,
            patient_name: `${d.patient?.firstname || ''} ${d.patient?.lastname || ''}`.trim(),
            amount: d.amount,
            current_balance: d.current_balance,
            daysUntilExpiry,
            risk_level: riskLevel
          };
        })
        .filter(d => d.daysUntilExpiry <= 365) // Only deposits expiring within a year
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

      // Calculate summary
      const totalExpiring = expiringDeposits.length;
      const totalAmount = expiringDeposits.reduce((sum, d) => sum + d.amount, 0);

      const byRiskLevel: Record<string, { count: number; amount: number }> = {
        LOW: { count: 0, amount: 0 },
        MEDIUM: { count: 0, amount: 0 },
        HIGH: { count: 0, amount: 0 }
      };

      expiringDeposits.forEach(d => {
        byRiskLevel[d.risk_level].count++;
        byRiskLevel[d.risk_level].amount += d.amount;
      });

      // Generate recommendations
      const recommendations: string[] = [];
      if (byRiskLevel.HIGH.count > 0) {
        recommendations.push(`Immediate action required: ${byRiskLevel.HIGH.count} deposits expiring within 30 days`);
      }
      if (byRiskLevel.MEDIUM.count > 0) {
        recommendations.push(`Plan ahead: ${byRiskLevel.MEDIUM.count} deposits expiring within 90 days`);
      }
      if (byRiskLevel.LOW.count > 0) {
        recommendations.push(`Monitor: ${byRiskLevel.LOW.count} deposits expiring within a year`);
      }

      return {
        period: {
          startDate: filters.startDate || new Date(0),
          endDate: filters.endDate || new Date()
        },
        expiringDeposits,
        summary: {
          totalExpiring,
          totalAmount,
          byRiskLevel,
          recommendations
        }
      };
    } catch (error) {
      throw new BadException('Failed to generate expiry report', 500, error.message);
    }
  }

  /**
   * Helper method to get deposit IDs for a specific patient
   */
  private static async getDepositIdsForPatient(patientId: number): Promise<number[]> {
    const deposits = await PatientDeposit.findAll({
      where: { patient_id: patientId },
      attributes: ['id']
    });
    return deposits.map(d => d.id);
  }

  /**
   * Export report to CSV format
   */
  static async exportReportToCSV(
    reportData: any,
    reportType: string
  ): Promise<string> {
    try {
      let csvContent = '';
      let headers: string[] = [];
      let rows: any[] = [];

      switch (reportType) {
        case 'summary':
          headers = ['Metric', 'Value'];
          rows = [
            ['Total Deposits', reportData.totalDeposits],
            ['Total Initial Amount', reportData.totalInitialAmount],
            ['Total Current Balance', reportData.totalCurrentBalance],
            ['Total Used', reportData.totalUsed],
            ['Total Refunded', reportData.totalRefunded],
            ['Active Deposits', reportData.activeDeposits],
            ['Used Deposits', reportData.usedDeposits],
            ['Refunded Deposits', reportData.refundedDeposits],
            ['Average Deposit Amount', reportData.averageDepositAmount],
            ['Average Utilization Rate', `${reportData.averageUtilizationRate}%`]
          ];
          break;

        case 'activity':
          if (reportData.transactions && reportData.transactions.length > 0) {
            headers = Object.keys(reportData.transactions[0]);
            rows = reportData.transactions.map(t => Object.values(t));
          }
          break;

        case 'patient':
          if (reportData.deposits && reportData.deposits.length > 0) {
            headers = Object.keys(reportData.deposits[0]);
            rows = reportData.deposits.map(d => Object.values(d));
          }
          break;

        case 'reconciliation':
          if (reportData.details && reportData.details.length > 0) {
            headers = Object.keys(reportData.details[0]);
            rows = reportData.details.map(d => Object.values(d));
          }
          break;

        case 'expiry':
          if (reportData.expiringDeposits && reportData.expiringDeposits.length > 0) {
            headers = Object.keys(reportData.expiringDeposits[0]);
            rows = reportData.expiringDeposits.map(d => Object.values(d));
          }
          break;

        default:
          throw new BadException('Unsupported report type for CSV export', 400);
      }

      // Generate CSV content
      csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map((cell: any) => `"${cell}"`).join(',') + '\n';
      });

      return csvContent;
    } catch (error) {
      throw new BadException('Failed to export report to CSV', 500, error.message);
    }
  }
}
