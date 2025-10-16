import {
  ClinicalBill,
  ClinicalBillItem,
  Patient,
  Visit,
  Staff,
  PatientInsurance,
  Test,
  Investigation,
  Service,
  Drug,
} from '../../database/models';
import {
  PrescribedDrug,
  PrescribedTest,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedAdditionalItem,
} from '../../database/models';
import { AccountingService } from './accounting.service';
import { HMOPricingService } from '../HMOPricing/hmoPricing.service';
import { BadException } from '../../common/util/api-error';
import dayjs from 'dayjs';
import { BillingStatus } from '../../database/models/prescribedDrug';
import {
  BillingMode,
  BillItemPaymentStatus,
  BillItemTypeEnum,
  PaymentCollectionMethod,
  PaymentStatus,
} from './enums';
import { FinancialPeriodValidationService } from './services/financialPeriodValidation.service';

/**
 * Visit-Based Billing Helper
 *
 * This helper creates ONE ClinicalBill per visit and adds each prescription as a ClinicalBillItem.
 * It maintains the correct parent-child relationship: ClinicalBill → ClinicalBillItem.
 */
export class VisitBillingHelper {
  /**
   * Get or create a bill for a specific visit
   */
  static async getOrCreateBillForVisit(
    visitId: number,
    patientId: number,
    staffId: number,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBill> {
    try {
      // Check if bill already exists for this visit
      let bill = await ClinicalBill.findOne({
        where: { visit_id: visitId },
      });

      if (!bill) {
        // Create new bill for this visit
        const billingRequest = {
          patient_id: patientId,
          visit_id: visitId,
          items: [], // Start with empty items
          billing_mode: (patientInsurance
            ? BillingMode.INSURANCE
            : BillingMode.CASH) as BillingMode,
          payment_collection_method: PaymentCollectionMethod.POINT_OF_SERVICE,
          payment_collection_point: 'main-cashier',
          patient_co_pay_amount: 0,
          hmo_billed_amount: 0,
          due_date: dayjs()
            .add(30, 'day')
            .toDate(), // 30 days from now
          created_by: staffId,
          hmo_id: patientInsurance?.hmo_id,
          patient_insurance_id: patientInsurance?.id,
        };

        const { bill: clinicalBill } = await AccountingService.createClinicalBill(billingRequest);
        bill = clinicalBill;
      }

      return bill;
    } catch (error) {
      console.error(error);
      throw new BadException(
        `Failed to get or create bill for visit: ${error.message}`,
        500,
        error.message
      );
    }
  }

  /**
   * Add prescribed drug to visit bill
   */
  static async addPrescribedDrugToBill(
    visitId: number,
    prescribedDrug: PrescribedDrug,
    staffId: number,
    patient: Patient,
    drug: Drug,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBillItem> {
    try {
      // Get or create bill for this visit
      const bill = await VisitBillingHelper.getOrCreateBillForVisit(
        visitId,
        patient.id,
        staffId,
        patientInsurance
      );

      // Calculate pricing
      const pricing = await VisitBillingHelper.calculateDrugPricing(
        prescribedDrug,
        patient,
        patientInsurance
      );

      // Create bill item
      const billItem = await ClinicalBillItem.create({
        bill_id: bill.id,
        item_type: BillItemTypeEnum.DRUG,
        item_id: prescribedDrug.id,
        quantity: prescribedDrug.quantity_to_dispense,
        unit_price: pricing.unitPrice,
        total_price: pricing.totalPrice,
        discount_percentage: 0,
        notes: `Prescribed drug: ${drug?.name || 'Unknown drug'}`,
        created_by: staffId,
        final_price: pricing.totalPrice,
        item_name: drug?.name || 'Unknown drug',
        item_code: drug?.code || 'Unknown code',
      });

      // Update the prescribed drug with billing information
      await prescribedDrug.update({
        billing_mode: patientInsurance ? 'INSURANCE' : 'CASH',
        patient_co_pay_amount: pricing.patientCoPay,
        hmo_billed_amount: pricing.hmoBilled,
        billing_status: BillingStatus.BILLED,
      });

      // Update bill totals
      await VisitBillingHelper.updateBillTotals(bill.id);

      return billItem;
    } catch (error) {
      console.error(error);
      throw new BadException(
        `Failed to add prescribed drug to bill: ${error.message}`,
        500,
        error.message
      );
    }
  }

  /**
   * Add prescribed test to visit bill
   */
  static async addPrescribedTestToBill(
    visitId: number,
    prescribedTest: PrescribedTest,
    staffId: number,
    patient: Patient,
    test: Test,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBillItem> {
    try {
      // Get or create bill for this visit
      const bill = await VisitBillingHelper.getOrCreateBillForVisit(
        visitId,
        patient.id,
        staffId,
        patientInsurance
      );

      // Calculate pricing
      const pricing = await VisitBillingHelper.calculateTestPricing(
        prescribedTest,
        patient,
        patientInsurance
      );

      // Create bill item
      const billItem = await ClinicalBillItem.create({
        bill_id: bill.id,
        item_type: BillItemTypeEnum.TEST,
        item_id: prescribedTest.id,
        quantity: 1,
        unit_price: pricing.unitPrice,
        total_price: pricing.totalPrice,
        final_price: pricing.totalPrice,
        discount_percentage: 0,
        notes: `Prescribed test: ${test?.name || 'Unknown test'}`,
        created_by: staffId,
        item_name: test?.name || 'Unknown test',
        item_code: test?.code || 'Unknown code',
      });

      // Update the prescribed test with billing information
      await prescribedTest.update({
        billing_mode: patientInsurance ? 'INSURANCE' : 'CASH',
        patient_co_pay_amount: pricing.patientCoPay,
        hmo_billed_amount: pricing.hmoBilled,
        billing_status: BillingStatus.BILLED,
      });

      // Update bill totals
      await VisitBillingHelper.updateBillTotals(bill.id);

      return billItem;
    } catch (error) {
      throw new BadException(
        `Failed to add prescribed test to bill: ${error.message}`,
        500,
        error.message
      );
    }
  }

  /**
   * Add prescribed investigation to visit bill
   */
  static async addPrescribedInvestigationToBill(
    visitId: number,
    prescribedInvestigation: PrescribedInvestigation,
    staffId: number,
    patient: Patient,
    investigation: Investigation,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBillItem> {
    try {
      // Get or create bill for this visit
      const bill = await VisitBillingHelper.getOrCreateBillForVisit(
        visitId,
        patient.id,
        staffId,
        patientInsurance
      );

      // Calculate pricing
      const pricing = await VisitBillingHelper.calculateInvestigationPricing(
        prescribedInvestigation,
        patient,
        patientInsurance
      );

      // Create bill item
      const billItem = await ClinicalBillItem.create({
        bill_id: bill.id,
        item_type: BillItemTypeEnum.INVESTIGATION,
        item_id: prescribedInvestigation.id,
        quantity: 1,
        unit_price: pricing.unitPrice,
        total_price: pricing.totalPrice,
        final_price: pricing.totalPrice,
        discount_percentage: 0,
        notes: `Prescribed investigation: ${investigation?.name || 'Unknown investigation'}`,
        created_by: staffId,
        item_name: investigation?.name || 'Unknown investigation',
        item_code: investigation?.name?.toLowerCase() || 'Unknown code',
      });

      // Update the prescribed investigation with billing information
      await prescribedInvestigation.update({
        billing_mode: patientInsurance ? 'INSURANCE' : 'CASH',
        patient_co_pay_amount: pricing.patientCoPay,
        hmo_billed_amount: pricing.hmoBilled,
        billing_status: BillingStatus.BILLED,
      });

      // Update bill totals
      await VisitBillingHelper.updateBillTotals(bill.id);

      return billItem;
    } catch (error) {
      throw new BadException(
        `Failed to add prescribed investigation to bill: ${error.message}`,
        500,
        error.message
      );
    }
  }

  /**
   * Add prescribed service to visit bill
   */
  static async addPrescribedServiceToBill(
    visitId: number,
    prescribedService: PrescribedService,
    staffId: number,
    patient: Patient,
    service: Service,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBillItem> {
    try {
      // Get or create bill for this visit
      const bill = await VisitBillingHelper.getOrCreateBillForVisit(
        visitId,
        patient.id,
        staffId,
        patientInsurance
      );

      // Calculate pricing
      const pricing = await VisitBillingHelper.calculateServicePricing(
        prescribedService,
        patient,
        patientInsurance
      );

      // Create bill item
      const billItem = await ClinicalBillItem.create({
        bill_id: bill.id,
        item_type: BillItemTypeEnum.SERVICE,
        item_id: prescribedService.id,
        quantity: 1,
        unit_price: pricing.unitPrice,
        total_price: pricing.totalPrice,
        discount_percentage: 0,
        notes: `Prescribed service: ${service?.name || 'Unknown service'}`,
        created_by: staffId,
        final_price: pricing.totalPrice,
        item_name: service?.name || 'Unknown service',
        item_code: service?.code || 'Unknown code',
      });

      // Update the prescribed service with billing information
      await prescribedService.update({
        billing_mode: patientInsurance ? 'INSURANCE' : 'CASH',
        patient_co_pay_amount: pricing.patientCoPay,
        hmo_billed_amount: pricing.hmoBilled,
        billing_status: BillingStatus.BILLED,
      });

      // Update bill totals
      await VisitBillingHelper.updateBillTotals(bill.id);

      return billItem;
    } catch (error) {
      console.error(error);
      const err = error as Error;
      throw new BadException(
        `Failed to add prescribed service to bill: ${error.message}`,
        500,
        err.message
      );
    }
  }

  /**
   * Add prescribed additional item to visit bill
   */
  static async addPrescribedAdditionalItemToBill(
    visitId: number,
    prescribedAdditionalItem: PrescribedAdditionalItem,
    staffId: number,
    patient: Patient,
    additionalItem: Drug,
    patientInsurance?: PatientInsurance
  ): Promise<ClinicalBillItem> {
    try {
      // Get or create bill for this visit
      const bill = await VisitBillingHelper.getOrCreateBillForVisit(
        visitId,
        patient.id,
        staffId,
        patientInsurance
      );

      // Calculate pricing
      const pricing = await VisitBillingHelper.calculateAdditionalItemPricing(
        prescribedAdditionalItem,
        patient,
        patientInsurance
      );

      // Create bill item
      const billItem = await ClinicalBillItem.create({
        bill_id: bill.id,
        item_type: BillItemTypeEnum.ADDITIONAL_ITEM,
        item_id: prescribedAdditionalItem.id,
        quantity: prescribedAdditionalItem.quantity_to_dispense,
        unit_price: pricing.unitPrice,
        total_price: pricing.totalPrice,
        discount_percentage: 0,
        notes: `Additional item: ${additionalItem?.name || 'Unknown item'}`,
        created_by: staffId,
        final_price: pricing.totalPrice,
        item_name: additionalItem?.name || 'Unknown item',
        item_code: additionalItem?.code || 'Unknown code',
      });

      // Update the prescribed additional item with billing information
      await prescribedAdditionalItem.update({
        billing_mode: patientInsurance ? 'INSURANCE' : 'CASH',
        patient_co_pay_amount: pricing.patientCoPay,
        hmo_billed_amount: pricing.hmoBilled,
        billing_status: BillingStatus.BILLED,
      });

      // Update bill totals
      await VisitBillingHelper.updateBillTotals(bill.id);

      return billItem;
    } catch (error) {
      throw new BadException(
        `Failed to add prescribed additional item to bill: ${error.message}`,
        500
      );
    }
  }

  /**
   * Update bill totals based on all bill items
   */
  private static async updateBillTotals(billId: number): Promise<void> {
    try {
      const billItems = await ClinicalBillItem.findAll({
        where: { bill_id: billId },
      });

      const totalAmount = billItems.reduce(
        (sum, item) => sum + parseFloat(item.total_price.toString()),
        0
      );
      const totalDiscount = billItems.reduce((sum, item) => {
        const discount = (parseFloat(item.total_price.toString()) * item.discount_percentage) / 100;
        return sum + discount;
      }, 0);
      const finalAmount = totalAmount - totalDiscount;

      const allItemsPending = billItems.every(
        item => item.payment_status === BillItemPaymentStatus.PENDING
      );

      // Update bill totals
      await ClinicalBill.update(
        {
          total_amount: totalAmount,
          total_discount: totalDiscount,
          final_amount: finalAmount,
          payment_status: allItemsPending ? PaymentStatus.PENDING : PaymentStatus.PARTIAL,
        },
        {
          where: { id: billId },
        }
      );
    } catch (error) {
      console.error('Failed to update bill totals:', error);
      throw error;
    }
  }

  /**
   * Calculate drug pricing using HMO pricing or regular pricing
   */
  private static async calculateDrugPricing(
    prescribedDrug: PrescribedDrug,
    patient: Patient,
    patientInsurance?: PatientInsurance
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    patientCoPay: number;
    hmoBilled: number;
  }> {
    try {
      if (patientInsurance) {
        // Use HMO pricing - assuming HMOPricingService has static methods
        const hmoPricing = await HMOPricingService.calculateDrugPricing(
          prescribedDrug.drug_id,
          patientInsurance.insurance_id,
          prescribedDrug.quantity_to_dispense
        );

        if (!hmoPricing) {
          const unitPrice = prescribedDrug.total_price || 0;
          const totalPrice = unitPrice * (prescribedDrug.quantity_to_dispense || 1);

          return {
            unitPrice,
            totalPrice,
            patientCoPay: totalPrice, // Full amount for cash patients
            hmoBilled: 0,
          };
        }

        return {
          unitPrice: hmoPricing?.hmo_price,
          totalPrice: hmoPricing?.total_amount,
          patientCoPay: hmoPricing?.patient_amount,
          hmoBilled: hmoPricing?.hmo_amount,
        };
      } else {
        // Use regular pricing (cash patient)
        const unitPrice = prescribedDrug.total_price || 0;
        const totalPrice = unitPrice * (prescribedDrug.quantity_to_dispense || 1);

        return {
          unitPrice,
          totalPrice,
          patientCoPay: totalPrice, // Full amount for cash patients
          hmoBilled: 0,
        };
      }
    } catch (error) {
      // Fallback to regular pricing if HMO pricing fails
      const unitPrice = prescribedDrug.original_total_price || 0;
      const totalPrice = unitPrice * (prescribedDrug.quantity_to_dispense || 1);

      return {
        unitPrice,
        totalPrice,
        patientCoPay: totalPrice,
        hmoBilled: 0,
      };
    }
  }

  /**
   * Calculate test pricing using HMO pricing or regular pricing
   */
  private static async calculateTestPricing(
    prescribedTest: PrescribedTest,
    patient: Patient,
    patientInsurance?: PatientInsurance
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    patientCoPay: number;
    hmoBilled: number;
  }> {
    try {
      if (patientInsurance) {
        // Use HMO pricing - assuming HMOPricingService has static methods
        const hmoPricing = await HMOPricingService.calculateTestPricing(
          prescribedTest.test_id,
          patientInsurance.insurance_id
        );

        if (!hmoPricing) {
          const unitPrice = prescribedTest.price || 0;
          const totalPrice = unitPrice;

          return {
            unitPrice,
            totalPrice,
            patientCoPay: totalPrice,
            hmoBilled: 0,
          };
        }

        return {
          unitPrice: hmoPricing.hmo_price,
          totalPrice: hmoPricing.total_amount,
          patientCoPay: hmoPricing.patient_amount,
          hmoBilled: hmoPricing.hmo_amount,
        };
      } else {
        // Use regular pricing (cash patient)
        const unitPrice = prescribedTest?.price || 0;
        const totalPrice = unitPrice;

        return {
          unitPrice,
          totalPrice,
          patientCoPay: totalPrice,
          hmoBilled: 0,
        };
      }
    } catch (error) {
      // Fallback to regular pricing if HMO pricing fails
      const unitPrice = prescribedTest?.price || 0;
      const totalPrice = unitPrice;

      return {
        unitPrice,
        totalPrice,
        patientCoPay: totalPrice,
        hmoBilled: 0,
      };
    }
  }

  /**
   * Calculate investigation pricing using HMO pricing or regular pricing
   */
  private static async calculateInvestigationPricing(
    prescribedInvestigation: PrescribedInvestigation,
    patient: Patient,
    patientInsurance?: PatientInsurance
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    patientCoPay: number;
    hmoBilled: number;
  }> {
    try {
      if (patientInsurance) {
        // Use HMO pricing - assuming HMOPricingService has static methods
        const hmoPricing = await HMOPricingService.calculateInvestigationPricing(
          prescribedInvestigation.investigation_id,
          patientInsurance.insurance_id
        );

        if (!hmoPricing) {
          const unitPrice = prescribedInvestigation.price || 0;
          const totalPrice = unitPrice;

          return {
            unitPrice,
            totalPrice,
            patientCoPay: totalPrice,
            hmoBilled: 0,
          };
        }

        return {
          unitPrice: hmoPricing.hmo_price,
          totalPrice: hmoPricing.total_amount,
          patientCoPay: hmoPricing.patient_amount,
          hmoBilled: hmoPricing.hmo_amount,
        };
      } else {
        // Use regular pricing (cash patient)
        const unitPrice = prescribedInvestigation.price || 0;
        const totalPrice = unitPrice;

        return {
          unitPrice,
          totalPrice,
          patientCoPay: totalPrice,
          hmoBilled: 0,
        };
      }
    } catch (error) {
      // Fallback to regular pricing if HMO pricing fails
      const unitPrice = prescribedInvestigation.price || 0;
      const totalPrice = unitPrice;

      return {
        unitPrice,
        totalPrice,
        patientCoPay: totalPrice,
        hmoBilled: 0,
      };
    }
  }

  /**
   * Calculate service pricing using HMO pricing or regular pricing
   */
  private static async calculateServicePricing(
    prescribedService: PrescribedService,
    patient: Patient,
    patientInsurance?: PatientInsurance
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    patientCoPay: number;
    hmoBilled: number;
  }> {
    try {
      if (patientInsurance) {
        // Use HMO pricing - assuming HMOPricingService has static methods
        const hmoPricing = await HMOPricingService.calculateServicePricing(
          prescribedService.service_id,
          patientInsurance.insurance_id
        );

        if (!hmoPricing) {
          const unitPrice = prescribedService?.price || 0;
          const totalPrice = unitPrice;

          return {
            unitPrice,
            totalPrice,
            patientCoPay: totalPrice,
            hmoBilled: 0,
          };
        }

        return {
          unitPrice: hmoPricing.hmo_price,
          totalPrice: hmoPricing.total_amount,
          patientCoPay: hmoPricing.patient_amount,
          hmoBilled: hmoPricing.hmo_amount,
        };
      } else {
        // Use regular pricing (cash patient)
        const unitPrice = prescribedService?.price || 0;
        const totalPrice = unitPrice;

        return {
          unitPrice,
          totalPrice,
          patientCoPay: totalPrice,
          hmoBilled: 0,
        };
      }
    } catch (error) {
      // Fallback to regular pricing if HMO pricing fails
      const unitPrice = prescribedService?.price || 0;
      const totalPrice = unitPrice;

      return {
        unitPrice,
        totalPrice,
        patientCoPay: totalPrice,
        hmoBilled: 0,
      };
    }
  }

  /**
   * Calculate additional item pricing using HMO pricing or regular pricing
   */
  private static async calculateAdditionalItemPricing(
    prescribedAdditionalItem: PrescribedAdditionalItem,
    patient: Patient,
    patientInsurance?: PatientInsurance
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    patientCoPay: number;
    hmoBilled: number;
  }> {
    try {
      if (patientInsurance) {
        // For additional items, we might not have HMO pricing, so use regular pricing
        // but mark as insurance billing mode
        const unitPrice = prescribedAdditionalItem.total_price || 0;
        const totalPrice = unitPrice * (prescribedAdditionalItem.quantity_to_dispense || 1);

        // For insurance, typically patient pays a small co-pay
        const patientCoPay = totalPrice * 0.1; // 10% co-pay
        const hmoBilled = totalPrice - patientCoPay;

        return {
          unitPrice,
          totalPrice,
          patientCoPay,
          hmoBilled,
        };
      } else {
        // Use regular pricing (cash patient)
        const unitPrice = prescribedAdditionalItem.total_price || 0;
        const totalPrice = unitPrice * (prescribedAdditionalItem.quantity_to_dispense || 1);

        return {
          unitPrice,
          totalPrice,
          patientCoPay: totalPrice,
          hmoBilled: 0,
        };
      }
    } catch (error) {
      // Fallback to regular pricing
      const unitPrice = prescribedAdditionalItem.total_price || 0;
      const totalPrice = unitPrice * (prescribedAdditionalItem.quantity_to_dispense || 1);

      return {
        unitPrice,
        totalPrice,
        patientCoPay: totalPrice,
        hmoBilled: 0,
      };
    }
  }

  /**
   * Remove prescribed drug from visit bill
   */
  static async removePrescribedDrugFromBill(
    prescribedDrugId: number,
    billId: number
  ): Promise<void> {
    try {
      const deletedCount = await ClinicalBillItem.destroy({
        where: {
          bill_id: billId,
          item_type: BillItemTypeEnum.DRUG,
          item_id: prescribedDrugId,
        },
      });

      if (deletedCount > 0) {
        await VisitBillingHelper.updateBillTotals(billId);
      }
    } catch (error) {
      throw new BadException(`Failed to remove prescribed drug from bill: ${error.message}`, 500);
    }
  }

  /**
   * Remove prescribed additional item from visit bill
   */
  static async removePrescribedAdditionalItemFromBill(
    prescribedItemId: number,
    billId: number
  ): Promise<void> {
    try {
      const deletedCount = await ClinicalBillItem.destroy({
        where: {
          bill_id: billId,
          item_type: BillItemTypeEnum.ADDITIONAL_ITEM,
          item_id: prescribedItemId,
        },
      });

      if (deletedCount > 0) {
        await VisitBillingHelper.updateBillTotals(billId);
      }
    } catch (error) {
      throw new BadException(`Failed to remove additional item from bill: ${error.message}`, 500);
    }
  }

  /**
   * Remove prescribed test from visit bill
   */
  static async removePrescribedTestFromBill(
    prescribedTestId: number,
    billId: number
  ): Promise<void> {
    try {
      const deletedCount = await ClinicalBillItem.destroy({
        where: {
          bill_id: billId,
          item_type: BillItemTypeEnum.TEST,
          item_id: prescribedTestId,
        },
      });

      if (deletedCount > 0) {
        await VisitBillingHelper.updateBillTotals(billId);
      }
    } catch (error) {
      throw new BadException(`Failed to remove prescribed test from bill: ${error.message}`, 500);
    }
  }

  /**
   * Remove prescribed investigation from visit bill
   */
  static async removePrescribedInvestigationFromBill(
    prescribedInvestigationId: number,
    billId: number
  ): Promise<void> {
    try {
      const deletedCount = await ClinicalBillItem.destroy({
        where: {
          bill_id: billId,
          item_type: BillItemTypeEnum.INVESTIGATION,
          item_id: prescribedInvestigationId,
        },
      });

      if (deletedCount > 0) {
        await VisitBillingHelper.updateBillTotals(billId);
      }
    } catch (error) {
      throw new BadException(
        `Failed to remove prescribed investigation from bill: ${error.message}`,
        500
      );
    }
  }

  /**
   * Remove prescribed service from visit bill
   */
  static async removePrescribedServiceFromBill(
    prescribedServiceId: number,
    billId: number
  ): Promise<void> {
    try {
      const deletedCount = await ClinicalBillItem.destroy({
        where: {
          bill_id: billId,
          item_type: BillItemTypeEnum.SERVICE,
          item_id: prescribedServiceId,
        },
      });

      if (deletedCount > 0) {
        await VisitBillingHelper.updateBillTotals(billId);
      }
    } catch (error) {
      throw new BadException(
        `Failed to remove prescribed service from bill: ${error.message}`,
        500
      );
    }
  }
}
