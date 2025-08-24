import { Router } from 'express';
import { AccountingController } from './accounting.controller';
import verify from '../../core/middleware/verify';
import { authorize } from '../../core/middleware/authorize';

const router = Router();

// Apply authentication middleware to all routes
router.use(verify);

// Patient Deposits Routes
router.post('/deposits', AccountingController.createPatientDeposit);

router.get('/deposits/:id', AccountingController.getPatientDepositById);

router.get('/deposits', AccountingController.getPatientDeposits);

router.put('/deposits/:id', AccountingController.updatePatientDeposit);

router.get('/deposits/summary', AccountingController.getPatientDepositSummary);

// Enhanced Deposit Operations with Full Accounting Integration
router.post('/deposits/:id/use', AccountingController.usePatientDeposit);
router.post('/deposits/:id/refund', AccountingController.refundPatientDeposit);
router.post('/deposits/:id/adjust', AccountingController.adjustPatientDeposit);
router.post('/deposits/:id/expire', AccountingController.handlePatientDepositExpiry);

// Enhanced Deposit Usage Analytics and History
router.get('/deposits/:id/usage-history', AccountingController.getDepositUsageHistory);
router.get('/deposits/patient/:patientId/usage-summary', AccountingController.getPatientDepositUsageSummary);

// Enhanced Deposit Refund Analytics and History
router.get('/deposits/:id/refund-history', AccountingController.getDepositRefundHistory);
router.get('/deposits/patient/:patientId/refund-summary', AccountingController.getPatientRefundSummary);

// Deposit Management & Status Tracking
router.get('/deposits/:id/status', AccountingController.getDepositStatus);
router.get('/deposits/analytics', AccountingController.getDepositAnalytics);
router.get('/deposits/reconcile', AccountingController.reconcileDepositBalances);

// Comprehensive Audit Trail & Compliance
router.get('/deposits/:id/audit-trail', AccountingController.getDepositAuditTrail);
router.get('/deposits/audit-summary', AccountingController.getAuditSummary);

// Enhanced Reconciliation & Reporting
router.get('/deposits/reconciliation-report', AccountingController.generateReconciliationReport);

// ===== DEPOSIT REPORTING ROUTES =====
router.get('/reports/deposits/summary', AccountingController.generateDepositSummaryReport);
router.get('/reports/deposits/activity', AccountingController.generateDepositActivityReport);
router.get('/reports/deposits/patient/:patientId', AccountingController.generatePatientDepositReport);
router.get('/reports/deposits/expiry', AccountingController.generateExpiryReport);

// ===== POS TERMINAL SETTLEMENT ROUTES =====
router.post('/pos-terminals/:id/settle', AccountingController.settlePOSTerminalDeposits);

// Clinical Bills Routes
router.post('/bills', AccountingController.createClinicalBill);

router.get('/bills', AccountingController.getClinicalBills);

router.get('/bills/:id', AccountingController.getClinicalBillById);
router.get('/bills/:id/with-items', AccountingController.getClinicalBillWithItems);

router.put('/bills/:id', AccountingController.updateClinicalBill);

router.get('/bills/summary', AccountingController.getBillingSummary);

// Clinical Payments Routes
router.post('/payments', AccountingController.createClinicalPayment);

router.get('/payments/:id', AccountingController.getClinicalPaymentById);

router.get('/payments', AccountingController.getClinicalPayments);

// 🆕 NEW: Payment cancellation route
router.post('/bills/:id/cancel-payment', AccountingController.cancelPayment);

// Update payment route removed - not implemented in controller

router.get('/payments/summary', AccountingController.getPaymentSummary);

// Billing Points Routes
router.get('/billing-points', AccountingController.getBillingPoints);

router.get('/billing-points/:id', AccountingController.getBillingPointById);

// Dashboard and Summary Routes
router.get('/summary', AccountingController.getAccountingSummary);

router.get('/reports/financial', AccountingController.getFinancialReports);

// Deposit Usage Routes
router.post('/deposits/use', AccountingController.useDeposit);

router.get('/deposits/:id/usage', AccountingController.getDepositUsageHistory);

// ===== DEPOSIT USAGE HISTORY =====
router.get('/deposits/:id/usage-history', AccountingController.getDepositUsageHistory);

// ===== NEW DEPOSIT METHODS =====
router.get('/deposits/patient/:patientId', AccountingController.getPatientDepositByPatientId);
router.get('/deposits/patient/:patientId/balance', AccountingController.getPatientDepositBalance);
router.get('/deposits/patient/:patientId/history', AccountingController.getPatientDepositHistory);
router.get('/deposits/patient/:patientId/balance-summary', AccountingController.getPatientDepositBalanceSummary);

// Patient Deposit Chart of Accounts Routes
router.post('/deposits/ensure-accounts', AccountingController.ensurePatientDepositAccounts);
router.get('/deposits/validate-accounts', AccountingController.validatePatientDepositAccounts);
router.get('/deposits/account/:accountCode', AccountingController.getPatientDepositAccount);



// ===== BILLING POINTS =====
router.get('/billing-points', AccountingController.fetchBillingPoints);

// ===== CLINICAL BILL SEARCH =====
router.get('/bills/number/:billNumber', AccountingController.getClinicalBillByNumber);
router.get('/bills/patient/:patientId', AccountingController.getPatientClinicalBills);

// =============================================================================
// PHASE 1: CORE FINANCIAL FOUNDATION ROUTES
// =============================================================================

// Chart of Accounts
router.get('/chart-of-accounts', AccountingController.getChartOfAccounts);
router.get('/chart-of-accounts/:id', AccountingController.getChartOfAccountById);
router.post('/chart-of-accounts', AccountingController.createChartOfAccount);
router.put('/chart-of-accounts/:id', AccountingController.updateChartOfAccount);
router.delete('/chart-of-accounts/:id', AccountingController.deleteChartOfAccount);

// Chart of Accounts Conflict Resolution
router.post('/chart-of-accounts/validate', AccountingController.validateChartOfAccount);
router.post('/chart-of-accounts/:id/conflict-suggestions', AccountingController.getAccountConflictSuggestions);
router.post('/chart-of-accounts/conflict-suggestions', AccountingController.getAccountConflictSuggestions);

// Chart of Accounts Validation
router.get('/chart-of-accounts/validation/all', AccountingController.validateAllChartOfAccounts);
router.get('/chart-of-accounts/validation/quick', AccountingController.quickValidationCheck);
router.get('/chart-of-accounts/validation/statistics', AccountingController.getValidationStatistics);
router.get('/chart-of-accounts/validation/type/:type', AccountingController.validateAccountType);

// Journal Entries
router.get('/journal-entries', AccountingController.getJournalEntries);
router.get('/journal-entries/:id', AccountingController.getJournalEntryById);
router.post('/journal-entries', AccountingController.createJournalEntry);
router.put('/journal-entries/:id', AccountingController.updateJournalEntry);
router.delete('/journal-entries/:id', AccountingController.deleteJournalEntry);

// Cost Centers
router.get('/cost-centers', AccountingController.getCostCenters);
router.get('/cost-centers/:id', AccountingController.getCostCenterById);
router.post('/cost-centers', AccountingController.createCostCenter);
router.put('/cost-centers/:id', AccountingController.updateCostCenter);
router.delete('/cost-centers/:id', AccountingController.deleteCostCenter);

// Financial Periods
router.get('/financial-periods', AccountingController.getFinancialPeriods);
router.get('/financial-periods/:id', AccountingController.getFinancialPeriodById);
router.post('/financial-periods', AccountingController.createFinancialPeriod);
router.put('/financial-periods/:id', AccountingController.updateFinancialPeriod);
router.delete('/financial-periods/:id', AccountingController.deleteFinancialPeriod);
router.post('/financial-periods/:id/open', AccountingController.openFinancialPeriod);
router.post('/financial-periods/:id/close', AccountingController.closeFinancialPeriod);

// HMO Claims
router.get('/hmo-claims', AccountingController.getHMOClaims);
router.get('/hmo-claims/:id', AccountingController.getHMOClaimById);
router.post('/hmo-claims', AccountingController.createHMOClaim);
router.put('/hmo-claims/:id', AccountingController.updateHMOClaim);
router.delete('/hmo-claims/:id', AccountingController.deleteHMOClaim);
router.post('/hmo-claims/:id/approve', AccountingController.approveHMOClaim);
router.post('/hmo-claims/:id/reject', AccountingController.rejectHMOClaim);
router.post('/hmo-claims/:id/payment', AccountingController.processHMOClaimPayment);

// Trial Balance
router.get('/trial-balance', AccountingController.getTrialBalance);

// ===== BANK ACCOUNT ROUTES =====
router.get('/bank-accounts', AccountingController.getBankAccounts);
router.get('/bank-accounts/active', AccountingController.getActiveBankAccounts);
router.get('/bank-accounts/:id', AccountingController.getBankAccountById);
router.post('/bank-accounts', AccountingController.createBankAccount);
router.put('/bank-accounts/:id', AccountingController.updateBankAccount);
router.delete('/bank-accounts/:id', AccountingController.deleteBankAccount);
router.post('/bank-accounts/:id/balance', AccountingController.updateBankAccountBalance);
router.post('/bank-accounts/:id/toggle-status', AccountingController.toggleBankAccountStatus);

// ===== POS TERMINAL ROUTES =====
router.get('/pos-terminals', AccountingController.getPOSTerminals);
router.get('/pos-terminals/active', AccountingController.getActivePOSTerminals);
router.get('/pos-terminals/:id', AccountingController.getPOSTerminalById);
router.post('/pos-terminals', AccountingController.createPOSTerminal);
router.put('/pos-terminals/:id', AccountingController.updatePOSTerminal);
router.delete('/pos-terminals/:id', AccountingController.deletePOSTerminal);
router.post('/pos-terminals/:id/toggle-status', AccountingController.togglePOSTerminalStatus);
router.get('/pos-terminals/bank-account/:bankAccountId', AccountingController.getPOSTerminalsByBankAccount);
router.post('/pos-terminals/:id/last-used', AccountingController.updatePOSTerminalLastUsed);

// ===== PAYMENT PROCESSING ROUTES =====
import paymentProcessingRoutes from './routes/paymentProcessing.routes';
router.use('/payments', paymentProcessingRoutes);

export default router;
