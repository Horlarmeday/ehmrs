import { Router } from 'express';
import { AccountController } from './account.controller';
import verify from '../../core/middleware/verify';

const router = Router();

// Chart of Accounts routes
router.post('/chart-of-accounts', verify, AccountController.createChartOfAccount);
router.put('/chart-of-accounts/:id', verify, AccountController.updateChartOfAccount);
router.get('/chart-of-accounts', verify, AccountController.getChartOfAccounts);

// Journal Entry routes
router.post('/journal-entries', verify, AccountController.createJournalEntry);
router.get('/journal-entries', verify, AccountController.getJournalEntries);

// Account Balance routes
router.get('/accounts/:id/balance', verify, AccountController.getAccountBalance);
router.get('/trial-balance', verify, AccountController.getTrialBalance);

// Cost Center routes
router.post('/cost-centers', verify, AccountController.createCostCenter);
router.put('/cost-centers/:id', verify, AccountController.updateCostCenter);
router.get('/cost-centers', verify, AccountController.getCostCenters);

// Financial Statement routes
router.post('/financial-statements', verify, AccountController.generateFinancialStatement);

// Existing payment history routes
router.post('/payments/create/:id', verify, AccountController.createPaymentHistory);
router.get('/payment-history/:id', verify, AccountController.getPatientPaymentHistory);

// Trend Analysis routes
router.post('/trend-analysis', verify, AccountController.generateTrendAnalysis);

// Custom Report routes
router.post('/custom-reports', verify, AccountController.generateCustomReport);
router.post('/download-receipt/:visitId', verify, AccountController.downloadPaymentReceipt);

export default router;
