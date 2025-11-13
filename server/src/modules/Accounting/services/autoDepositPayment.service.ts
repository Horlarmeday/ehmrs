import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import { ClinicalBill, ClinicalBillItem } from '../../../database/models';
import { PaymentMethod, PaymentType, BillItemPaymentStatus } from '../enums';
import { logger } from '../../../core/helpers/logger';
import { PaymentProcessingService } from './paymentProcessing.service';
import { PatientDepositService } from './patientDeposit.service';

/**
 * Auto Deposit Payment Service
 *
 * This service handles automatic patient deposit deduction when prescription items are billed.
 * After bill items are created and totals updated, it checks for available patient deposit
 * and automatically creates a payment (full or partial) using the deposit balance.
 */
export class AutoDepositPaymentService {
  /**
   * Attempt automatic deposit payment for a bill
   *
   * This is the main entry point for auto deposit payment logic.
   * It checks if auto-payment should be attempted and processes the payment if conditions are met.
   *
   * @param billId - The clinical bill ID
   * @param patientId - The patient ID
   * @param staffId - The staff ID who is processing the prescription
   * @param transaction - Optional transaction for atomicity
   */
  static async attemptAutoDepositPayment(
    billId: number,
    patientId: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Retrieve bill with current payment status
      const bill = await ClinicalBill.findByPk(billId, {
        include: [
          {
            model: ClinicalBillItem,
            as: 'billItems',
          },
        ],
        transaction,
      });

      if (!bill) {
        logger.warn(`Bill ${billId} not found for auto-deposit payment attempt`);
        return;
      }

      // Check if auto-deposit payment should be attempted
      const shouldAttempt = await this.shouldAttemptAutoPayment(bill);
      if (!shouldAttempt) {
        logger.info(`Auto-deposit payment skipped for bill ${billId}`, {
          reason: bill.auto_deposit_attempted
            ? 'Already attempted'
            : 'No unpaid amount or conditions not met',
          billId,
          patientId,
        });
        return;
      }

      // Get patient's active deposit balance
      const patientDeposit = await PatientDepositService.findActiveDepositForPatient(patientId, {
        transaction,
      });

      // If no active deposit, mark as attempted and exit
      if (!patientDeposit || patientDeposit.current_balance <= 0) {
        logger.info(`No active deposit found for patient ${patientId}, marking bill as attempted`, {
          billId,
          patientId,
        });

        await bill.update(
          {
            auto_deposit_attempted: true,
          },
          { transaction }
        );
        return;
      }

      // Calculate unpaid bill amount
      const unpaidAmount = this.calculateUnpaidAmount(bill);
      if (unpaidAmount <= 0) {
        logger.info(`Bill ${billId} has no unpaid amount, skipping auto-deposit payment`, {
          billId,
          patientId,
          finalAmount: bill.final_amount,
        });
        return;
      }

      // Calculate how much to pay from deposit (full or partial)
      const paymentAmount = this.calculateAutoPaymentAmount(
        patientDeposit.current_balance,
        unpaidAmount
      );

      if (paymentAmount <= 0) {
        logger.warn(`Calculated payment amount is zero or negative for bill ${billId}`, {
          billId,
          patientId,
          depositBalance: patientDeposit.current_balance,
          unpaidAmount,
        });
        return;
      }

      logger.info(`Attempting auto-deposit payment for bill ${billId}`, {
        billId,
        patientId,
        depositBalance: patientDeposit.current_balance,
        unpaidAmount,
        paymentAmount,
        isPartial: paymentAmount < unpaidAmount,
      });

      // Get all unpaid bill items for payment
      const unpaidItems = bill.billItems.filter(
        item => item.payment_status === BillItemPaymentStatus.PENDING
      );

      if (unpaidItems.length === 0) {
        logger.warn(`No unpaid items found for bill ${billId}`, {
          billId,
          patientId,
        });
        return;
      }

      // Generate auto-deposit payment reference
      const paymentReference = `AUTO-DEP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Determine payment type (FULL or PARTIAL)
      const paymentType =
        paymentAmount >= unpaidAmount ? PaymentType.FULL : PaymentType.PARTIAL;

      // Process the deposit payment through PaymentProcessingService
      await PaymentProcessingService.processPayment(
        {
          bill_id: billId,
          patient_id: patientId,
          selected_items: unpaidItems.map(item => item.id),
          amount: paymentAmount,
          payment_method: PaymentMethod.DEPOSIT,
          payment_type: paymentType,
          payment_date: new Date(),
          notes: `Automatic deposit payment - ${paymentType === PaymentType.FULL ? 'Full' : 'Partial'} payment from patient deposit`,
          payment_reference: paymentReference,
          deposit_usage: paymentAmount,
          visit_id: bill.visit_id,
        },
        staffId,
        'STAFF'
      );

      // Mark bill as auto-deposit attempted
      await bill.update(
        {
          auto_deposit_attempted: true,
        },
        { transaction }
      );

      logger.info(`Auto-deposit payment successful for bill ${billId}`, {
        billId,
        patientId,
        paymentAmount,
        paymentType,
        paymentReference,
        remainingDeposit: patientDeposit.current_balance - paymentAmount,
        remainingBillAmount: unpaidAmount - paymentAmount,
      });
    } catch (error) {
      console.error(error);
      // Log error but don't fail the billing process
      logger.error(`Auto-deposit payment failed for bill ${billId}:`, {
        billId,
        patientId,
        error: error.message,
        stack: error.stack,
      });

      // Mark as attempted even if failed to prevent retry loops
      try {
        await ClinicalBill.update(
          {
            auto_deposit_attempted: true,
          },
          {
            where: { id: billId },
            transaction,
          }
        );
      } catch (updateError) {
        console.error(updateError);
        logger.error(`Failed to mark bill ${billId} as auto-deposit attempted:`, {
          billId,
          error: updateError.message,
        });
      }

      // Don't throw - auto-deposit failure should not break the prescription workflow
    }
  }

  /**
   * Check if auto-payment should be attempted for this bill
   *
   * Conditions:
   * - auto_deposit_attempted must be false (to avoid duplicates)
   * - Bill must have unpaid amount > 0
   *
   * @param bill - The clinical bill
   * @returns true if auto-payment should be attempted
   */
  private static async shouldAttemptAutoPayment(bill: ClinicalBill): Promise<boolean> {
    // Don't attempt if already attempted
    if (bill.auto_deposit_attempted) {
      return false;
    }

    // Don't attempt if no unpaid amount
    const unpaidAmount = this.calculateUnpaidAmount(bill);
    if (unpaidAmount <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Calculate unpaid bill amount
   *
   * @param bill - The clinical bill
   * @returns unpaid amount
   */
  private static calculateUnpaidAmount(bill: ClinicalBill): number {
    const finalAmount = parseFloat(bill.final_amount?.toString() || '0');

    // Calculate total amount of PENDING items (unpaid items)
    const unpaidItemsTotal = bill.billItems?.reduce((sum, item) => {
      if (item.payment_status === BillItemPaymentStatus.PENDING) {
        const itemFinalPrice = parseFloat(item.final_price?.toString() || '0');
        return sum + itemFinalPrice;
      }
      return sum;
    }, 0) || 0;

    // Return the unpaid items total (already represents unpaid amount)
    return Math.max(0, unpaidItemsTotal); // Ensure non-negative
  }

  /**
   * Calculate how much to pay from deposit (full or partial)
   *
   * Returns the minimum of deposit balance and unpaid amount.
   * This ensures we don't try to pay more than available or more than needed.
   *
   * @param depositBalance - Available deposit balance
   * @param billBalance - Unpaid bill amount
   * @returns payment amount
   */
  private static calculateAutoPaymentAmount(
    depositBalance: number,
    billBalance: number
  ): number {
    const balance = parseFloat(depositBalance?.toString() || '0');
    const unpaid = parseFloat(billBalance?.toString() || '0');

    // Pay the minimum of deposit balance and unpaid amount
    const paymentAmount = Math.min(balance, unpaid);

    // Ensure non-negative and round to 2 decimal places
    return Math.max(0, Math.round(paymentAmount * 100) / 100);
  }
}

