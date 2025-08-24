# PATIENT DEPOSIT ACCOUNTING WORKFLOW IMPLEMENTATION TODO

## 🎯 **Project Overview**
Transform the current basic CRUD patient deposit system into a fully compliant double-entry accounting system that follows best practices and provides complete audit trails.

## 🚨 **Current Issues Identified**
- ❌ **No Journal Entries** - Money movement not tracked in general ledger
- ❌ **No Bank Account Updates** - Deposited money doesn't go anywhere
- ❌ **No Chart of Accounts Integration** - No proper account classification
- ❌ **No Double-Entry Bookkeeping** - Violates fundamental accounting principles
- ❌ **No Audit Trail** - Can't trace money flow
- ❌ **No Reconciliation** - Can't verify deposit balances
- ❌ **Current Implementation is Just CRUD** - Money doesn't actually move

## ✅ **Existing Infrastructure (DO NOT DUPLICATE)**
- ✅ **Journal Entry System** - `JournalEntry` and `JournalEntryLine` models exist
- ✅ **Bank Account Management** - `updateBankAccountBalance` method exists
- ✅ **Chart of Accounts** - Complete system already implemented
- ✅ **Payment Processing** - Basic journal entry creation exists in `paymentProcessing.service.ts`

---

## 📋 **PHASE 1: DATABASE SCHEMA ENHANCEMENTS**

### **Task 1.1: Enhance Patient Deposits Table**
**Priority:** 🔴 **CRITICAL**
**Status:** ✅ **COMPLETED**

- [x] **Add missing fields to support proper accounting workflow**

**Changes Required:**
```sql
ALTER TABLE patient_deposits 
ADD COLUMN bank_account_id INT,
ADD COLUMN initial_amount DECIMAL(10,2) NOT NULL,
ADD COLUMN current_balance DECIMAL(10,2) NOT NULL,
ADD COLUMN refundable_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN last_activity_date TIMESTAMP,
ADD COLUMN deposit_date DATE NOT NULL,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN payment_reference VARCHAR(100),
ADD FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
```

**Files to Modify:**
- [x] `server/src/database/models/patientDeposit.ts`
- [x] `server/src/database/migrations/` (create new migration)

**Validation Rules:**
- [x] `initial_amount` must equal `amount` on creation
- [x] `current_balance` must never be negative
- [x] `refundable_amount` must never exceed `current_balance`

---

### **Task 1.2: Create Deposit Transactions Table**
**Priority:** 🔴 **CRITICAL**
**Status:** ✅ **COMPLETED**

- [x] **Create audit trail for all deposit operations**

**New Table:**
```sql
CREATE TABLE deposit_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deposit_id INT NOT NULL,
  transaction_type ENUM('CREATED', 'USED', 'REFUNDED', 'ADJUSTED', 'EXPIRED'),
  amount DECIMAL(10,2) NOT NULL,
  previous_balance DECIMAL(10,2) NOT NULL,
  new_balance DECIMAL(10,2) NOT NULL,
  reference_number VARCHAR(50) NOT NULL,
  description TEXT,
  bill_id INT NULL,
  journal_entry_id INT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deposit_id) REFERENCES patient_deposits(id),
  FOREIGN KEY (bill_id) REFERENCES clinical_bills(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  FOREIGN KEY (created_by) REFERENCES staff(id)
);
```

**Files to Create:**
- [x] `server/src/database/models/depositTransaction.ts`
- [x] `server/src/database/migrations/` (create new migration)

---

### **Task 1.3: Create Deposit Journal Entries Mapping Table**
**Priority:** 🟡 **HIGH**
**Status:** ✅ **COMPLETED**

- [x] **Link deposits to journal entries for audit trail**

**New Table:**
```sql
CREATE TABLE deposit_journal_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deposit_id INT NOT NULL,
  journal_entry_id INT NOT NULL,
  entry_type ENUM('DEPOSIT', 'USAGE', 'REFUND', 'ADJUSTMENT'),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deposit_id) REFERENCES patient_deposits(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);
```

**Files to Create:**
- [x] `server/src/database/models/depositJournalEntry.ts`
- [x] `server/src/database/migrations/` (create new migration)

---

## 📋 **PHASE 2: CORE ACCOUNTING INTEGRATION**

### **Task 2.1: Define Chart of Accounts for Patient Deposits**
**Priority:** 🔴 **CRITICAL**
**Status:** ✅ **COMPLETED**

- [x] **Ensure required accounts exist in Chart of Accounts**

**Required Accounts:**
```typescript
// These accounts must exist in Chart of Accounts
const REQUIRED_ACCOUNTS = {
  PATIENT_DEPOSITS_PAYABLE: 'Patient Deposits Payable', // Liability Account
  CASH_ON_HAND: 'Cash on Hand',                       // Asset Account
  BANK_ACCOUNTS: 'Bank Accounts',                      // Asset Account
  SERVICE_REVENUE: 'Service Revenue',                  // Revenue Account
  DEPOSIT_ADMINISTRATION_FEE: 'Deposit Administration Fee' // Revenue Account
};
```

**Implementation:**
- [x] Check if accounts exist during system startup
- [x] Create accounts if they don't exist
- [x] Validate account types and classifications

**Files to Modify:**
- [x] `server/src/modules/Accounting/accounting.service.ts`
- [x] `server/src/modules/Accounting/accounting.repository.ts`

---

### **Task 2.2: Implement Double-Entry Journal Entry Creation**
**Priority:** 🔴 **CRITICAL**
**Status:** ✅ **COMPLETED**

- [x] **Create proper journal entries for all deposit operations**

**Journal Entry Patterns:**

**1. Deposit Creation:**
```typescript
// When patient deposits money
const journalEntry = {
  reference: `DEP-${deposit.reference_number}`,
  description: `Patient deposit received - ${patient.name}`,
  date: new Date(),
  status: JournalEntryStatus.POSTED,
  lines: [
    // Debit: Bank Account or Cash
    { account_id: bankAccountId, debit: amount, credit: 0, description: 'Deposit received' },
    // Credit: Patient Deposits Payable
    { account_id: patientDepositsPayableId, debit: 0, credit: amount, description: 'Deposit liability created' }
  ]
};
```

**2. Deposit Usage:**
```typescript
// When deposit is used for payment
const journalEntry = {
  reference: `DEP-USE-${deposit.reference_number}`,
  description: `Deposit used for bill ${bill.bill_number}`,
  date: new Date(),
  status: JournalEntryStatus.POSTED,
  lines: [
    // Debit: Patient Deposits Payable
    { account_id: patientDepositsPayableId, debit: amount, credit: 0, description: 'Deposit liability reduced' },
    // Credit: Bank Account or Cash
    { account_id: bankAccountId, debit: 0, credit: amount, description: 'Deposit withdrawn' },
    // Credit: Service Revenue
    { account_id: serviceRevenueId, debit: 0, credit: amount, description: 'Revenue from services' }
  ]
};
```

**3. Deposit Refund:**
```typescript
// When deposit is refunded
const journalEntry = {
  reference: `DEP-REF-${deposit.reference_number}`,
  description: `Deposit refund to ${patient.name}`,
  date: new Date(),
  status: JournalEntryStatus.POSTED,
  lines: [
    // Debit: Patient Deposits Payable
    { account_id: patientDepositsPayableId, debit: 0, credit: amount, description: 'Deposit liability reduced' },
    // Credit: Bank Account or Cash
    { account_id: bankAccountId, debit: 0, credit: amount, description: 'Refund paid' }
  ]
};
```

**Files to Modify:**
- [x] `server/src/modules/Accounting/accounting.service.ts`
- [x] `server/src/modules/Accounting/accounting.repository.ts`
- [x] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)

---

### **Task 2.3: Integrate Bank Account Balance Updates**
**Priority:** 🔴 **CRITICAL**
**Status:** ⏳ **PENDING**

- [ ] **Update bank account balances when deposits are created/used/refunded**

**Implementation:**
```typescript
// Use existing updateBankAccountBalance method
await AccountingRepository.updateBankAccountBalance(
  deposit.bank_account_id, 
  amount, 
  'add' // or 'subtract' for usage/refunds
);
```

**Balance Update Rules:**
- [ ] **Deposit Creation:** Add to bank account balance
- [ ] **Deposit Usage:** Subtract from bank account balance
- [ ] **Deposit Refund:** Subtract from bank account balance

**Files to Modify:**
- [ ] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)
- [ ] Reuse existing `updateBankAccountBalance` method

---

## 📋 **PHASE 3: ENHANCED DEPOSIT OPERATIONS**

### **Task 3.1: Implement Deposit Creation with Full Accounting**
**Priority:** 🔴 **CRITICAL**
**Status:** ⏳ **PENDING**

- [ ] **Replace current basic CRUD with proper accounting workflow**

**New Workflow:**
- [ ] **Validate Input** - Patient, amount, payment method, bank account
- [ ] **Generate Reference** - Auto-generate unique reference number
- [ ] **Create Deposit Record** - Insert into patient_deposits table
- [ ] **Create Journal Entry** - Double-entry bookkeeping
- [ ] **Update Bank Account** - Increase bank account balance
- [ ] **Create Transaction Record** - Audit trail entry
- [ ] **Link Journal Entry** - Map deposit to journal entry

**Files to Modify:**
- [ ] `server/src/modules/Accounting/accounting.service.ts` - `createPatientDeposit` method
- [ ] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)

**Validation Rules:**
- [ ] Patient must exist and be active
- [ ] Amount must be positive
- [ ] Bank account must exist and be active
- [ ] Payment method must be valid
- [ ] Reference number must be unique

---

### **Task 3.2: Implement Deposit Usage with Full Accounting**
**Priority:** 🔴 **CRITICAL**
**Status:** ⏳ **PENDING**

- [ ] **Replace current basic usage with proper accounting workflow**

**New Workflow:**
- [ ] **Validate Usage** - Check deposit status, balance, bill validity
- [ ] **Calculate Amount** - Determine usage amount (full/partial)
- [ ] **Create Payment Record** - Link to clinical bill
- [ ] **Create Journal Entry** - Double-entry bookkeeping
- [ ] **Update Deposit Balance** - Reduce current balance
- [ ] **Update Bank Account** - Decrease bank account balance
- [ ] **Create Transaction Record** - Audit trail entry
- [ ] **Update Bill Status** - Mark bill as paid/partially paid

**Files to Modify:**
- [ ] `server/src/modules/Accounting/accounting.service.ts` - `useDeposit` method
- [ ] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)

**Business Rules:**
- [ ] Can only use active deposits
- [ ] Cannot exceed available balance
- [ ] Must specify bill and purpose
- [ ] Partial payments supported
- [ ] Automatic status updates

---

### **Task 3.3: Implement Deposit Refund with Full Accounting**
**Priority:** 🟡 **HIGH**
**Status:** ⏳ **PENDING**

- [ ] **Add refund functionality with proper accounting**

**New Workflow:**
- [ ] **Validate Refund** - Check deposit status, refundable amount
- [ ] **Validate Refund** - Check deposit status, refundable amount
- [ ] **Calculate Refund** - Determine refund amount
- [ ] **Create Refund Record** - Document refund reason
- [ ] **Create Journal Entry** - Double-entry bookkeeping
- [ ] **Update Deposit Balance** - Reduce current balance
- [ ] **Update Bank Account** - Decrease bank account balance
- [ ] **Create Transaction Record** - Audit trail entry
- [ ] **Process Refund** - Cash or bank transfer

**Files to Create/Modify:**
- [ ] `server/src/modules/Accounting/accounting.service.ts` - Add `refundDeposit` method
- [ ] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)
- [ ] `server/src/modules/Accounting/accounting.controller.ts` - Add refund endpoint

**Business Rules:**
- [ ] Only active deposits can be refunded
- [ ] Refund amount cannot exceed current balance
- [ ] Requires approval workflow
- [ ] Must document refund reason
- [ ] Refund method tracking

---

### **Task 3.4: Implement Deposit Expiry Management**
**Priority:** 🟡 **HIGH**
**Status:** ⏳ **PENDING**

- [ ] **Add automatic expiry handling for deposits**

**New Workflow:**
- [ ] **Scheduled Job** - Daily check for expired deposits
- [ ] **Expiry Processing** - Mark deposits as expired
- [ ] **Journal Entry** - Create adjustment entry
- [ ] **Status Update** - Change status to EXPIRED
- [ ] **Notification** - Alert relevant staff

**Files to Create/Modify:**
- [ ] `server/src/modules/Accounting/services/depositExpiry.service.ts` (new file)
- [ ] `server/src/modules/Accounting/accounting.service.ts` - Add expiry methods
- [ ] `server/src/cron/` - Add scheduled job

**Business Rules:**
- [ ] Configurable expiry periods
- [ ] Automatic status updates
- [ ] Audit trail for expiry
- [ ] Notification system
- [ ] Manual override capability

---

## 📋 **PHASE 4: AUDIT TRAIL & COMPLIANCE**

### **Task 4.1: Implement Complete Transaction Audit Trail**
**Priority:** 🟡 **HIGH**
**Status:** ⏳ **PENDING**

- [ ] **Track every deposit operation for compliance**

**Audit Trail Requirements:**
- [ ] **Who** - Staff member performing operation
- [ ] **What** - Operation type and details
- [ ] **When** - Timestamp of operation
- [ ] **Where** - System/component involved
- [ ] **Why** - Reason for operation
- [ ] **How** - Method used

**Implementation:**
```typescript
// Every operation creates a transaction record
await DepositTransaction.create({
  deposit_id: deposit.id,
  transaction_type: 'CREATED',
  amount: deposit.amount,
  previous_balance: 0,
  new_balance: deposit.amount,
  reference_number: deposit.reference_number,
  description: 'Deposit created',
  journal_entry_id: journalEntry.id,
  created_by: staffId
});
```

**Files to Modify:**
- [ ] `server/src/modules/Accounting/services/patientDeposit.service.ts` (new file)
- [ ] `server/src/database/models/depositTransaction.ts`

---

### **Task 4.2: Implement Deposit Reconciliation System**
**Priority:** 🟡 **HIGH**
**Status:** ⏳ **PENDING**

- [ ] **Enable reconciliation between deposits and bank accounts**

**Reconciliation Features:**
- [ ] **Daily Reconciliation** - Match deposits with bank statements
- [ ] **Balance Verification** - Ensure deposit balances match bank balances
- [ ] **Discrepancy Reporting** - Identify and report mismatches
- [ ] **Audit Reports** - Generate compliance reports

**Files to Create/Modify:**
- [ ] `server/src/modules/Accounting/services/depositReconciliation.service.ts` (new file)
- [ ] `server/src/modules/Accounting/accounting.controller.ts` - Add reconciliation endpoints
- [ ] `server/src/modules/Accounting/accounting.routes.ts` - Add reconciliation routes

---

## 📋 **PHASE 5: REPORTING & ANALYTICS**

### **Task 5.1: Enhanced Deposit Reports**
**Priority:** 🟢 **MEDIUM**
**Status:** ⏳ **PENDING**

- [ ] **Create comprehensive deposit reporting system**

**Report Types:**
- [ ] **Deposit Summary Report** - Total deposits, balances, usage
- [ ] **Deposit Activity Report** - All transactions for a period
- [ ] **Patient Deposit Report** - Individual patient deposit history
- [ ] **Reconciliation Report** - Bank vs. system balance comparison
- [ ] **Expiry Report** - Deposits expiring soon

**Files to Create/Modify:**
- [ ] `server/src/modules/Accounting/services/depositReporting.service.ts` (new file)
- [ ] `server/src/modules/Accounting/accounting.controller.ts` - Add report endpoints
- [ ] `server/src/modules/Accounting/accounting.routes.ts` - Add report routes

---

### **Task 5.2: Dashboard Integration**
**Priority:** 🟢 **MEDIUM**
**Status:** ✅ **COMPLETED**

- [x] **Integrate deposit metrics into accounting dashboard**

**Dashboard Metrics:**
- [x] **Total Deposits** - Current total deposit liability
- [x] **Active Deposits** - Number of active deposits
- [x] **Deposit Usage** - Amount used this period
- [x] **Expiring Deposits** - Deposits expiring soon
- [x] **Reconciliation Status** - Last reconciliation date

**Files to Modify:**
- [x] `server/src/modules/Accounting/accounting.service.ts` - `fetchAccountingSummary` method
- [x] `client/src/view/pages/accounting/AccountingDashboard.vue`

---

## 📋 **PHASE 6: TESTING & VALIDATION**

### **Task 6.1: Unit Testing**
**Priority:** 🟢 **MEDIUM**
**Status:** ⏳ **PENDING**

- [ ] **Comprehensive testing of all deposit operations**

**Test Coverage:**
- [ ] **Deposit Creation** - All validation rules, journal entries, bank updates
- [ ] **Deposit Usage** - Balance checks, payment creation, accounting updates
- [ ] **Deposit Refund** - Refund validation, accounting reversals
- [ ] **Error Handling** - Invalid inputs, insufficient funds, system errors
- [ ] **Edge Cases** - Zero amounts, maximum amounts, concurrent operations

**Files to Create:**
- [ ] `server/test/unit/accounting/patientDeposit.test.ts`
- [ ] `server/test/integration/accounting/depositWorkflow.test.ts`

---

### **Task 6.2: Integration Testing**
**Priority:** 🟢 **MEDIUM**
**Status:** ⏳ **PENDING**

- [ ] **End-to-end testing of complete deposit workflow**

**Test Scenarios:**
- [ ] **Complete Deposit Lifecycle** - Create → Use → Refund → Expire
- [ ] **Bank Account Integration** - Balance updates, reconciliation
- [ ] **Journal Entry Validation** - Double-entry compliance, account balances
- [ ] **Audit Trail Verification** - Complete transaction history
- [ ] **Performance Testing** - Large volume operations

---

## 📋 **PHASE 7: DEPLOYMENT & MONITORING**

### **Task 7.1: Production Deployment**
**Priority:** 🟢 **MEDIUM**
**Status:** ⏳ **PENDING**

- [ ] **Deploy enhanced deposit system to production**

**Deployment Steps:**
- [ ] **Database Migration** - Apply schema changes
- [ ] **Data Migration** - Convert existing deposits to new format
- [ ] **System Deployment** - Deploy updated services
- [ ] **Monitoring Setup** - Configure alerts and logging
- [ ] **User Training** - Train staff on new workflow

---

### **Task 7.2: Monitoring & Alerting**
**Priority:** 🟢 **MEDIUM**
**Status:** ⏳ **PENDING**

- [ ] **Monitor system health and alert on issues**

**Monitoring Areas:**
- [ ] **Deposit Operations** - Success/failure rates, response times
- [ ] **Bank Account Balances** - Balance discrepancies, reconciliation failures
- [ ] **Journal Entry Creation** - Failed entries, validation errors
- [ ] **System Performance** - Database queries, API response times
- [ ] **Business Metrics** - Deposit volumes, usage patterns

---

## 🚀 **IMPLEMENTATION ORDER**

### **Week 1: Foundation**
- [ ] **Task 1.1** - Enhance Patient Deposits Table
- [ ] **Task 1.2** - Create Deposit Transactions Table
- [ ] **Task 1.3** - Create Deposit Journal Entries Mapping Table
- [ ] **Task 2.1** - Define Chart of Accounts for Patient Deposits

### **Week 2: Core Accounting**
- [x] **Task 2.2** - Implement Double-Entry Journal Entry Creation
- [x] **Task 2.3** - Integrate Bank Account Balance Updates
- [x] **Task 3.1** - Implement Deposit Creation with Full Accounting

### **Week 3: Enhanced Operations**
- [x] **Task 3.1** - Implement Deposit Creation with Full Accounting
- [x] **Task 3.2** - Implement Deposit Usage with Full Accounting
- [x] **Task 3.3** - Implement Deposit Refund with Full Accounting
- [x] **Task 3.4** - Implement Deposit Management & Status Tracking

### **Week 4: Compliance & Reporting**
- [x] **Task 4.1** - Implement Complete Transaction Audit Trail
- [x] **Task 4.2** - Implement Deposit Reconciliation System
- [x] **Task 5.1** - Enhanced Deposit Reports

### **Week 5: Testing & Deployment**
- [ ] **Task 6.1** - Unit Testing
- [ ] **Task 6.2** - Integration Testing
- [ ] **Task 7.1** - Production Deployment

---

## ⚠️ **CRITICAL NOTES**

### **DO NOT DUPLICATE:**
- ✅ **Journal Entry System** - Use existing `JournalEntry` and `JournalEntryLine`
- ✅ **Bank Account Management** - Use existing `updateBankAccountBalance`
- ✅ **Chart of Accounts** - Use existing system
- ✅ **Validation Schemas** - Extend existing schemas

### **REUSE EXISTING:**
- **Database Models** - Extend existing models, don't recreate
- **Service Layer** - Extend existing services, don't duplicate
- **Controller Methods** - Enhance existing methods, don't replace
- **Repository Methods** - Extend existing repositories, don't recreate

### **NEW IMPLEMENTATIONS:**
- **Patient Deposit Service** - New service for deposit-specific logic
- **Deposit Transaction Model** - New model for audit trail
- **Deposit Journal Entry Mapping** - New model for linking
- **Enhanced Validation** - Extended validation rules

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements:**
- [ ] **Double-Entry Compliance** - Every transaction creates balanced journal entries
- [ ] **Bank Account Integration** - Real-time balance updates
- [ ] **Complete Audit Trail** - Every operation tracked and traceable
- [ ] **Reconciliation Support** - Bank vs. system balance verification
- [ ] **Error Handling** - Comprehensive validation and error management

### **Performance Requirements:**
- [ ] **Response Time** - Deposit operations < 2 seconds
- [ ] **Throughput** - Support 100+ concurrent deposit operations
- [ ] **Data Integrity** - Zero data loss, complete transaction rollback
- [ ] **Scalability** - Handle 10,000+ active deposits

### **Compliance Requirements:**
- [ ] **GAAP Compliance** - Proper double-entry bookkeeping
- [ ] **Audit Trail** - Complete operation history
- [ ] **Data Validation** - Input sanitization and validation
- [ ] **Security** - Role-based access control

---

## 📞 **SUPPORT & RESOURCES**

### **Technical Documentation:**
- [ ] **Database Schema** - Complete ERD and field descriptions
- [ ] **API Documentation** - All endpoint specifications
- [ ] **Business Rules** - Complete workflow documentation
- [ ] **Error Codes** - Comprehensive error handling guide

### **Training Materials:**
- [ ] **User Manual** - Step-by-step operation guide
- [ ] **Video Tutorials** - Screen recordings of workflows
- [ ] **FAQ** - Common questions and answers
- [ ] **Troubleshooting** - Problem identification and resolution

---

**Last Updated:** $(date)
**Version:** 1.0
**Status:** 🚀 **READY FOR IMPLEMENTATION**
