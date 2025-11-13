import { Op, Sequelize, Transaction } from 'sequelize';
import sequelizeConnection from '../../../database/config/data-source';
import {
  PatientDeposit,
  DepositTransaction,
  DepositJournalEntry,
  ClinicalPayment,
} from '../../../database/models';
import { DepositStatus } from '../enums';
import { DepositAuditService } from './depositAudit.service';

export type ConsolidationStatus = 'SKIPPED' | 'CONSOLIDATED' | 'DRY_RUN';

export interface ConsolidationResult {
  patientId: number;
  mergedDepositId?: number;
  mergedDepositReference?: string;
  consolidatedDepositIds: number[];
  transferredBalance: number;
  transferredInitialAmount: number;
  transferredTotalAmount: number;
  transferredRefundableAmount: number;
  status: ConsolidationStatus;
  message?: string;
}

export interface ConsolidationOptions {
  patientId?: number;
  consolidatedBy: number;
  dryRun?: boolean;
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number.parseFloat(value as any);
  return Number.isFinite(parsed) ? parsed : 0;
};

export class PatientDepositConsolidationService {
  static async findPatientsWithDuplicateActiveDeposits(
    transaction?: Transaction
  ): Promise<number[]> {
    const results = await PatientDeposit.findAll({
      attributes: ['patient_id'],
      where: {
        status: DepositStatus.ACTIVE,
      },
      group: ['patient_id'],
      having: Sequelize.literal('COUNT(*) > 1'),
      transaction,
      raw: true,
    });



    return results
      .map(row => Number(row.patient_id))
      .filter(id => Number.isFinite(id) && id > 0);
  }

  static async consolidateAllActiveDeposits(
    options: ConsolidationOptions
  ): Promise<ConsolidationResult[]> {
    const hasValidPatientId =
      typeof options.patientId === 'number' && Number.isFinite(options.patientId) && options.patientId > 0;

    const rawTargets = hasValidPatientId
      ? [options.patientId as number]
      : await this.findPatientsWithDuplicateActiveDeposits();

    const targets = rawTargets.filter(id => typeof id === 'number' && Number.isFinite(id) && id > 0);

    if (targets.length === 0) {
      return [];
    }

    const results: ConsolidationResult[] = [];

    for (const patientId of targets) {
      const transaction = await sequelizeConnection.transaction();
      let result: ConsolidationResult | null = null;

      try {
        result = await this.consolidatePatientActiveDeposits(patientId, options.consolidatedBy, {
          transaction,
          dryRun: options.dryRun ?? false,
        });

        if (options.dryRun) {
          await transaction.rollback();
        } else {
          await transaction.commit();
        }
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  private static async consolidatePatientActiveDeposits(
    patientId: number,
    consolidatedBy: number,
    options: { transaction?: Transaction; dryRun?: boolean } = {}
  ): Promise<ConsolidationResult> {
    if (typeof patientId !== 'number' || !Number.isFinite(patientId) || patientId <= 0) {
      return {
        patientId: Number.isFinite(patientId) ? patientId : 0,
        consolidatedDepositIds: [],
        transferredBalance: 0,
        transferredInitialAmount: 0,
        transferredTotalAmount: 0,
        transferredRefundableAmount: 0,
        status: 'SKIPPED',
        message: 'Invalid patient identifier supplied for consolidation',
      };
    }

    const deposits = await PatientDeposit.findAll({
      where: {
        patient_id: patientId,
        status: DepositStatus.ACTIVE,
      },
      order: [
        ['current_balance', 'DESC'],
        ['last_activity_date', 'DESC'],
        ['id', 'DESC'],
      ],
      transaction: options.transaction,
      lock: options.transaction ? options.transaction.LOCK.UPDATE : undefined,
    });

    if (deposits.length <= 1) {
      return {
        patientId,
        consolidatedDepositIds: [],
        transferredBalance: 0,
        transferredInitialAmount: 0,
        transferredTotalAmount: 0,
        transferredRefundableAmount: 0,
        status: 'SKIPPED',
        message: 'No duplicate active deposits found',
      };
    }

    const primaryDeposit = deposits[0];
    const secondaryDeposits = deposits.slice(1);

    const totals = secondaryDeposits.reduce(
      (acc, deposit) => {
        acc.balance += toNumber(deposit.current_balance);
        acc.initial += toNumber(deposit.initial_amount);
        acc.total += toNumber(deposit.amount);
        acc.refundable += toNumber(deposit.refundable_amount);
        return acc;
      },
      { balance: 0, initial: 0, total: 0, refundable: 0 }
    );

    if (options.dryRun) {
      return {
        patientId,
        mergedDepositId: primaryDeposit.id,
        mergedDepositReference: primaryDeposit.reference_number,
        consolidatedDepositIds: secondaryDeposits.map(deposit => deposit.id),
        transferredBalance: totals.balance,
        transferredInitialAmount: totals.initial,
        transferredTotalAmount: totals.total,
        transferredRefundableAmount: totals.refundable,
        status: 'DRY_RUN',
        message: `Would consolidate ${secondaryDeposits.length} deposits into deposit ${primaryDeposit.reference_number}`,
      };
    }

    for (const duplicateDeposit of secondaryDeposits) {
      await DepositTransaction.update(
        { deposit_id: primaryDeposit.id },
        {
          where: { deposit_id: duplicateDeposit.id },
          transaction: options.transaction,
        }
      );

      await DepositJournalEntry.update(
        { deposit_id: primaryDeposit.id },
        {
          where: { deposit_id: duplicateDeposit.id },
          transaction: options.transaction,
        }
      );

      await ClinicalPayment.update(
        { deposit_id: primaryDeposit.id },
        {
          where: { deposit_id: duplicateDeposit.id },
          transaction: options.transaction,
        }
      );

      await DepositAuditService.logSystemMaintenance(
        duplicateDeposit.id,
        'DEPOSIT_CONSOLIDATION',
        `Deposit consolidated into ${primaryDeposit.reference_number}`,
        {
          consolidated_into: primaryDeposit.id,
          consolidated_reference: primaryDeposit.reference_number,
        },
        options.transaction
      );

      await duplicateDeposit.update(
        {
          amount: 0,
          initial_amount: 0,
          current_balance: 0,
          refundable_amount: 0,
          status: DepositStatus.USED,
          description: duplicateDeposit.description
            ? `${duplicateDeposit.description} | Consolidated into deposit ${primaryDeposit.reference_number}`
            : `Consolidated into deposit ${primaryDeposit.reference_number}`,
          last_activity_date: new Date(),
          updated_by: consolidatedBy,
        },
        {
          transaction: options.transaction,
          hooks: true,
        }
      );
    }

    await primaryDeposit.update(
      {
        amount: toNumber(primaryDeposit.amount) + totals.total,
        initial_amount: toNumber(primaryDeposit.initial_amount) + totals.initial,
        current_balance: toNumber(primaryDeposit.current_balance) + totals.balance,
        refundable_amount: toNumber(primaryDeposit.refundable_amount) + totals.refundable,
        last_activity_date: new Date(),
        updated_by: consolidatedBy,
      },
      {
        transaction: options.transaction,
        hooks: true,
      }
    );

    await DepositAuditService.logSystemMaintenance(
      primaryDeposit.id,
      'DEPOSIT_CONSOLIDATION',
      `Consolidated ${secondaryDeposits.length} deposits`,
      {
        consolidated_deposit_ids: secondaryDeposits.map(deposit => deposit.id),
        transferred_balance: totals.balance,
        transferred_initial_amount: totals.initial,
        transferred_total_amount: totals.total,
        transferred_refundable_amount: totals.refundable,
      },
      options.transaction
    );

    return {
      patientId,
      mergedDepositId: primaryDeposit.id,
      mergedDepositReference: primaryDeposit.reference_number,
      consolidatedDepositIds: secondaryDeposits.map(deposit => deposit.id),
      transferredBalance: totals.balance,
      transferredInitialAmount: totals.initial,
      transferredTotalAmount: totals.total,
      transferredRefundableAmount: totals.refundable,
      status: 'CONSOLIDATED',
      message: `Consolidated ${secondaryDeposits.length} deposits into deposit ${primaryDeposit.reference_number}`,
    };
  }

  static async generateVerificationReport(transaction?: Transaction): Promise<{
    duplicatePatients: number[];
    duplicateCount: number;
    activeDepositCount: number;
    uniqueActivePatientCount: number;
    totalCurrentBalance: number;
    totalInitialAmount: number;
    totalAmount: number;
    totalRefundableAmount: number;
    isConstraintSatisfied: boolean;
  }> {
    const duplicatePatients = await this.findPatientsWithDuplicateActiveDeposits(transaction);

    type ActiveAggregate = {
      active_count: number;
      total_current_balance: number;
      total_initial_amount: number;
      total_amount: number;
      total_refundable_amount: number;
    };

    const aggregateRows = (await PatientDeposit.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'active_count'],
        [Sequelize.fn('SUM', Sequelize.col('current_balance')), 'total_current_balance'],
        [Sequelize.fn('SUM', Sequelize.col('initial_amount')), 'total_initial_amount'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount'],
        [Sequelize.fn('SUM', Sequelize.col('refundable_amount')), 'total_refundable_amount'],
      ],
      where: {
        status: DepositStatus.ACTIVE,
      },
      raw: true,
      transaction,
    })) as unknown as ActiveAggregate[];

    const activeAggregate = aggregateRows[0];

    const aggregateValues: ActiveAggregate =
      activeAggregate ?? {
        active_count: 0,
        total_current_balance: 0,
        total_initial_amount: 0,
        total_amount: 0,
        total_refundable_amount: 0,
      };

    const uniqueActivePatientCount = await PatientDeposit.count({
      where: {
        status: DepositStatus.ACTIVE,
      },
      distinct: true,
      col: 'patient_id',
      transaction,
    });

    return {
      duplicatePatients,
      duplicateCount: duplicatePatients.length,
      activeDepositCount: toNumber(aggregateValues.active_count),
      uniqueActivePatientCount,
      totalCurrentBalance: toNumber(aggregateValues.total_current_balance),
      totalInitialAmount: toNumber(aggregateValues.total_initial_amount),
      totalAmount: toNumber(aggregateValues.total_amount),
      totalRefundableAmount: toNumber(aggregateValues.total_refundable_amount),
      isConstraintSatisfied: duplicatePatients.length === 0,
    };
  }
}

