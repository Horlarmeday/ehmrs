import { Transaction } from 'sequelize';
import {
  ClinicalBill,
  ClinicalBillItem,
  ClinicalPayment,
  ClinicalPaymentItem,
  CashTransaction,
  POSTerminalTransaction,
  BankTransfer,
  PatientDeposit,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  CashRegister,
  BankAccount,
} from '../../../database/models';
import {
  BillItemTypeEnum,
  BillItemPaymentStatus,
  BillingStatus,
  JournalEntryStatus,
  PaymentMethod,
  PaymentStatus,
} from '../enums';
import { BadException } from '../../../common/util/api-error';
import { PaymentItemStatus } from '../../../database/models/clinicalPaymentItem';
import { PatientDepositService } from './patientDeposit.service';
import { logger } from '../../../core/helpers/logger';

const CASH_ACCOUNT_CODE = '1004';
const POS_RECEIVABLE_ACCOUNT_CODE = '1003';
const BANK_TRANSFER_RECEIVABLE_ACCOUNT_CODE = '1102';
const SERVICE_REVENUE_ACCOUNT_CODE = '4001';

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}

export interface PaymentAllocationContext {
  paymentItem: ClinicalPaymentItem;
  payment: ClinicalPayment & {
    cashTransaction?: CashTransaction & { register?: CashRegister };
    posTerminalTransaction?: POSTerminalTransaction;
    bankTransfer?: BankTransfer;
    deposit?: PatientDeposit;
  };
  amountPaid: number;
  paymentItemStatus: PaymentItemStatus;
}

export interface BillItemPaymentSummary {
  billItem: ClinicalBillItem;
  bill: ClinicalBill | null;
  paymentAllocations: PaymentAllocationContext[];
}

export class PaymentReversalService {
  static async getBillItemPaymentSummary(
    itemType: BillItemTypeEnum,
    itemId: number,
    transaction?: Transaction
  ): Promise<BillItemPaymentSummary | null> {
    const billItem = await ClinicalBillItem.findOne({
      where: {
        item_type: itemType,
        item_id: itemId,
      },
      include: [{ model: ClinicalBill, as: 'bill' }],
      transaction,
    });

    if (!billItem) {
      return null;
    }

    const bill = billItem.bill || (await ClinicalBill.findByPk(billItem.bill_id, { transaction }));
    if (!bill) {
      throw new BadException('Bill Not Found', 404, 'Unable to locate bill for the prescribed item');
    }

    const paymentAllocations = await this.getPaymentAllocationsForBillItem(billItem.id, transaction);

    return {
      billItem,
      bill,
      paymentAllocations,
    };
  }

  static async getBillItemPaymentSummaryForTest(
    prescribedTestId: number,
    transaction?: Transaction
  ): Promise<BillItemPaymentSummary | null> {
    return this.getBillItemPaymentSummary(BillItemTypeEnum.TEST, prescribedTestId, transaction);
  }

  static async getPaymentAllocationsForBillItem(
    billItemId: number,
    transaction?: Transaction
  ): Promise<PaymentAllocationContext[]> {
    const paymentItems = await ClinicalPaymentItem.findAll({
      where: { bill_item_id: billItemId },
      include: [
        {
          model: ClinicalPayment,
          as: 'payment',
          include: [
            { model: CashTransaction, as: 'cashTransaction', include: [{ model: CashRegister, as: 'register' }] },
            { model: POSTerminalTransaction, as: 'posTerminalTransaction' },
            { model: BankTransfer, as: 'bankTransfer' },
            { model: PatientDeposit, as: 'deposit' },
          ],
        },
      ],
      transaction,
    });

    return paymentItems.map(paymentItem => {
      const payment = paymentItem.payment as PaymentAllocationContext['payment'];
      if (!payment) {
        throw new BadException(
          'Payment Lookup Failed',
          500,
          'Unable to load payment associated with bill item allocation'
        );
      }

      return {
        paymentItem,
        payment,
        amountPaid: toNumber(paymentItem.amount_paid),
        paymentItemStatus: paymentItem.payment_status,
      };
    });
  }

  static async reverseAllocationsForSummary(
    summary: BillItemPaymentSummary,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    for (const allocation of summary.paymentAllocations) {
      await this.reversePaymentAllocation(allocation, staffId, transaction);
    }
  }

  static async reconcileBillStatus(billId: number, transaction: Transaction): Promise<void> {
    const bill = await ClinicalBill.findByPk(billId, { transaction });
    if (!bill) {
      return;
    }

    const billItems = await ClinicalBillItem.findAll({ where: { bill_id: billId }, transaction });

    if (billItems.length === 0) {
      await bill.update(
        {
          total_amount: 0,
          discount_amount: 0,
          outstanding_amount: 0,
          payment_status: PaymentStatus.CANCELLED,
          status: BillingStatus.CANCELLED,
          paid_at: null,
        },
        { transaction }
      );
      return;
    }

    const billItemIds = billItems.map(item => item.id);
    const totalPaidRaw = billItemIds.length
      ? await ClinicalPaymentItem.sum('amount_paid', { where: { bill_item_id: billItemIds }, transaction })
      : 0;
    const totalPaid = toNumber(totalPaidRaw);
    const totalAmount = toNumber(bill.total_amount);
    const outstandingAmount = Math.max(0, totalAmount - totalPaid);

    const hasPending = billItems.some(item => item.payment_status === BillItemPaymentStatus.PENDING);
    const hasCleared = billItems.some(item => item.payment_status === BillItemPaymentStatus.CLEARED);
    const hasPaid = billItems.some(item => item.payment_status === BillItemPaymentStatus.PAID);

    let paymentStatus: PaymentStatus;
    if (hasPending && !hasPaid && !hasCleared) {
      paymentStatus = PaymentStatus.PENDING;
    } else if (!hasPending && hasCleared && !hasPaid) {
      paymentStatus = PaymentStatus.CLEARED;
    } else if (!hasPending && hasPaid && !hasCleared) {
      paymentStatus = PaymentStatus.PAID;
    } else if (!hasPending && hasPaid && hasCleared) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else if (!hasPending && !hasPaid && !hasCleared) {
      paymentStatus = PaymentStatus.PENDING;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    const billingStatus =
      paymentStatus === PaymentStatus.PENDING ? BillingStatus.PENDING : BillingStatus.APPROVED;

    await bill.update(
      {
        outstanding_amount: outstandingAmount,
        payment_status: paymentStatus,
        status: billingStatus,
        paid_at: paymentStatus === PaymentStatus.PAID ? new Date() : null,
      },
      { transaction }
    );
  }

  private static async reversePaymentAllocation(
    allocation: PaymentAllocationContext,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    const { paymentItem, payment, amountPaid } = allocation;
    const refundAmount = amountPaid;

    if (refundAmount <= 0) {
      return;
    }

    const paymentMethod = payment.payment_method as PaymentMethod;
    const originalPaymentAmount = toNumber(payment.amount);

    await paymentItem.destroy({ transaction });

    const remainingTotalRaw = await ClinicalPaymentItem.sum('amount_paid', {
      where: { payment_id: payment.id },
      transaction,
    });
    const remainingTotal = toNumber(remainingTotalRaw);

    switch (paymentMethod) {
      case PaymentMethod.CASH:
        await this.reverseCashComponent(payment, refundAmount, staffId, transaction);
        break;
      case PaymentMethod.CARD:
        await this.reverseCardComponent(payment, refundAmount, staffId, transaction);
        break;
      case PaymentMethod.BANK_TRANSFER:
        await this.reverseBankTransferComponent(payment, refundAmount, staffId, transaction);
        break;
      case PaymentMethod.DEPOSIT:
        await this.reverseDepositComponent(payment, refundAmount, staffId, transaction);
        break;
      case PaymentMethod.INSURANCE:
      case PaymentMethod.WAIVER:
      case PaymentMethod.MOBILE_MONEY:
      case PaymentMethod.OTHER:
        break;
      default:
        break;
    }

    const newStatus = remainingTotal > 0 ? PaymentStatus.PAID : PaymentStatus.CANCELLED;
    await payment.update(
      {
        amount: remainingTotal,
        status: newStatus,
      },
      { transaction }
    );

    payment.amount = remainingTotal;
    payment.status = newStatus;

    logger.info('Reversed payment allocation for bill item', {
      paymentId: payment.id,
      paymentReference: payment.payment_reference,
      refundAmount,
      remainingAmount: remainingTotal,
      billItemId: paymentItem.bill_item_id,
      method: paymentMethod,
    });

    if (remainingTotal < -0.01) {
      throw new BadException(
        'Invalid Payment State',
        400,
        'Reversal amount exceeds recorded payment'
      );
    }

    if (refundAmount > 0 && originalPaymentAmount !== remainingTotal) {
      const notes = payment.notes || '';
      const reversalNote = `Reversed ${refundAmount.toFixed(2)} for item deletion on ${new Date().toISOString()}`;
      await payment.update({ notes: `${notes}\n${reversalNote}`.trim() }, { transaction });
    }
  }

  private static async reverseCashComponent(
    payment: PaymentAllocationContext['payment'],
    refundAmount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    const cashTransaction = payment.cashTransaction;
    if (!cashTransaction) {
      return;
    }

    const register = cashTransaction.register || (await CashRegister.findByPk(cashTransaction.register_id, { transaction }));

    const updatedAmount = Math.max(0, toNumber(cashTransaction.amount) - refundAmount);
    const updatedNewBalance = Math.max(0, toNumber(cashTransaction.new_balance) - refundAmount);

    await cashTransaction.update(
      {
        amount: updatedAmount,
        new_balance: updatedNewBalance,
        status: updatedAmount === 0 ? 'REVERSED' : cashTransaction.status,
        description: `${cashTransaction.description || ''}\nRefunded ${refundAmount.toFixed(2)} for item deletion`.trim(),
      },
      { transaction }
    );

    if (register) {
      await register.update(
        {
          current_balance: Math.max(0, toNumber(register.current_balance) - refundAmount),
          total_cash_received: Math.max(0, toNumber(register.total_cash_received) - refundAmount),
          total_payments_processed: Math.max(0, toNumber(register.total_payments_processed) - refundAmount),
        },
        { transaction }
      );
    }

    await this.createCashReversalJournalEntry(payment, refundAmount, staffId, transaction);
  }

  private static async reverseCardComponent(
    payment: PaymentAllocationContext['payment'],
    refundAmount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    const posTransaction = payment.posTerminalTransaction;
    if (posTransaction) {
      const updatedAmount = Math.max(0, toNumber(posTransaction.transaction_amount) - refundAmount);
      const updatedSettledAmount = Math.max(0, toNumber(posTransaction.settled_amount) - refundAmount);
      await posTransaction.update(
        {
          transaction_amount: updatedAmount,
          settled_amount: updatedSettledAmount,
          transaction_status: updatedAmount === 0 ? 'REFUNDED' : posTransaction.transaction_status,
        },
        { transaction }
      );
    }

    await this.createCardReversalJournalEntry(payment, refundAmount, staffId, transaction);
  }

  private static async reverseBankTransferComponent(
    payment: PaymentAllocationContext['payment'],
    refundAmount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    const bankTransfer = payment.bankTransfer;
    if (bankTransfer) {
      const updatedAmount = Math.max(0, toNumber(bankTransfer.original_amount) - refundAmount);
      await bankTransfer.update({ amount: updatedAmount }, { transaction });

      const bankAccountId = payment.bank_account_id || bankTransfer.bank_account_id;
      if (bankAccountId) {
        const bankAccount = await BankAccount.findByPk(bankAccountId, { transaction });
        if (bankAccount) {
          await bankAccount.update(
            {
              current_balance: Math.max(0, toNumber(bankAccount.current_balance) - refundAmount),
            },
            { transaction }
          );
        }
      }
    }

    await this.createBankReversalJournalEntry(payment, refundAmount, staffId, transaction);
  }

  private static async reverseDepositComponent(
    payment: PaymentAllocationContext['payment'],
    refundAmount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    if (!payment.deposit_id) {
      return;
    }

    await PatientDepositService.adjustDeposit(
      {
        deposit_id: payment.deposit_id,
        amount: refundAmount,
        adjustment_type: 'add',
        reason: `Deposit restoration for item deletion (payment ${payment.payment_reference})`,
        adjusted_by: staffId,
      },
      transaction
    );

    logger.info('Restored funds to patient deposit', {
      paymentId: payment.id,
      depositId: payment.deposit_id,
      refundAmount,
    });

    const updatedDepositUsage = Math.max(0, toNumber(payment.deposit_usage) - refundAmount);
    await payment.update({ deposit_usage: updatedDepositUsage }, { transaction });
  }

  private static async createCashReversalJournalEntry(
    payment: ClinicalPayment,
    amount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    if (amount <= 0) return;

    const [cashAccount, revenueAccount] = await Promise.all([
      ChartOfAccount.findOne({ where: { code: CASH_ACCOUNT_CODE }, transaction }),
      ChartOfAccount.findOne({ where: { code: SERVICE_REVENUE_ACCOUNT_CODE }, transaction }),
    ]);

    if (!cashAccount || !revenueAccount) {
      throw new BadException(
        'Chart Of Account Missing',
        500,
        'Unable to locate cash or revenue account for reversal entry'
      );
    }

    const journalEntry = await JournalEntry.create(
      {
        transaction_date: new Date(),
        reference: `${payment.payment_reference}-CASH-REV-${Date.now()}`,
        description: `Partial cash refund for lab test deletion (payment ${payment.payment_reference})`,
        patient_id: payment.patient_id,
        bill_id: payment.bill_id,
        visit_id: payment.visit_id,
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
      },
      { transaction }
    );

    await JournalEntryLine.bulkCreate(
      [
        {
          journal_entry_id: journalEntry.id,
          account_id: revenueAccount.id,
          debit: amount,
          credit: 0,
          description: 'Revenue reversal for lab test deletion',
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: cashAccount.id,
          debit: 0,
          credit: amount,
          description: 'Cash refund for lab test deletion',
        },
      ],
      { transaction }
    );
  }

  private static async createCardReversalJournalEntry(
    payment: ClinicalPayment,
    amount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    if (amount <= 0) return;

    const [posAccount, revenueAccount] = await Promise.all([
      ChartOfAccount.findOne({ where: { code: POS_RECEIVABLE_ACCOUNT_CODE }, transaction }),
      ChartOfAccount.findOne({ where: { code: SERVICE_REVENUE_ACCOUNT_CODE }, transaction }),
    ]);

    if (!posAccount || !revenueAccount) {
      throw new BadException(
        'Chart Of Account Missing',
        500,
        'Unable to locate POS receivable or revenue account for reversal entry'
      );
    }

    const journalEntry = await JournalEntry.create(
      {
        transaction_date: new Date(),
        reference: `${payment.payment_reference}-CARD-REV-${Date.now()}`,
        description: `Partial card refund for lab test deletion (payment ${payment.payment_reference})`,
        patient_id: payment.patient_id,
        bill_id: payment.bill_id,
        visit_id: payment.visit_id,
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
      },
      { transaction }
    );

    await JournalEntryLine.bulkCreate(
      [
        {
          journal_entry_id: journalEntry.id,
          account_id: revenueAccount.id,
          debit: amount,
          credit: 0,
          description: 'Revenue reversal for lab test deletion',
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: posAccount.id,
          debit: 0,
          credit: amount,
          description: 'Card receivable adjustment for lab test deletion',
        },
      ],
      { transaction }
    );
  }

  private static async createBankReversalJournalEntry(
    payment: ClinicalPayment,
    amount: number,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    if (amount <= 0) return;

    const [receivableAccount, revenueAccount] = await Promise.all([
      ChartOfAccount.findOne({ where: { code: BANK_TRANSFER_RECEIVABLE_ACCOUNT_CODE }, transaction }),
      ChartOfAccount.findOne({ where: { code: SERVICE_REVENUE_ACCOUNT_CODE }, transaction }),
    ]);

    if (!receivableAccount || !revenueAccount) {
        throw new BadException(
          'Chart Of Account Missing',
          500,
          'Unable to locate bank receivable or revenue account for reversal entry'
        );
    }

    const journalEntry = await JournalEntry.create(
      {
        transaction_date: new Date(),
        reference: `${payment.payment_reference}-BANK-REV-${Date.now()}`,
        description: `Partial bank transfer refund for lab test deletion (payment ${payment.payment_reference})`,
        patient_id: payment.patient_id,
        bill_id: payment.bill_id,
        visit_id: payment.visit_id,
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
      },
      { transaction }
    );

    await JournalEntryLine.bulkCreate(
      [
        {
          journal_entry_id: journalEntry.id,
          account_id: revenueAccount.id,
          debit: amount,
          credit: 0,
          description: 'Revenue reversal for lab test deletion',
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: receivableAccount.id,
          debit: 0,
          credit: amount,
          description: 'Bank receivable adjustment for lab test deletion',
        },
      ],
      { transaction }
    );
  }
}
