# 🔑 Essential Modules and Features

## 1. Chart of Accounts
- **Predefined + Configurable Accounts**: Assets, Liabilities, Income, Expenses, Equity.
- **Examples**: Cash, Accounts Receivable, Drug Sales Revenue, Test Fees, Discounts Given.

---

## 2. Ledger System
- **General Ledger (GL)**, Sub-Ledgers (AR, AP, etc.).
- Each transaction should create journal entries.
- Ability to track trial balances, account balances, and audit logs.

---

## 3. Billing Engine
- **Line-item-based billing**: Drugs, tests, consultations, procedures.
- Price configuration by department/service.
- Tax support (GST/VAT), discounts (manual or rule-based).
- Bundle pricing (e.g., health packages).

---

## 4. Invoice Management
- Unique, sequential invoice numbers.
- Status: Draft, Issued, Paid, Cancelled, Refunded.
- Support for partial payments and payment terms.

---

## 5. Payment Integration
- Cash, Card, Insurance, Wallets, Bank Transfer.
- Record payment source and instrument number.
- Optionally integrate POS, online payment gateways.

---

## 6. Insurance & Third-Party Billing
- Pre-authorization support.
- Co-pay and coverage rules.
- Claim tracking and settlement.

---

## 7. Receipts & Refunds
- Receipt generation with serial tracking.
- Support for full/partial refunds, credit notes.
- Audit trail for who initiated refunds and why.

---

## 8. Wallet System (Optional)
- For prepayments or hospital credits.
- Can be linked with patient or corporate accounts.
- Manage top-ups, deductions, expirations.

---

## 9. Financial Reports
- Daily Collection Summary.
- Income by department/service.
- Outstanding Receivables and Payables.
- Trial Balance, Profit & Loss, Balance Sheet.
- Reconciliation reports (cash vs bank).

---

## 10. Audit & Compliance
- Immutable transaction logs.
- User-level access and approval workflows.
- Export to standard formats (XLS, CSV, PDF).
- Integration with tax systems (e.g., e-invoicing, e-filing if jurisdiction supports).

---

## 🔐 Security & Control
- **Role-Based Access Control (RBAC)**: Restrict access by roles (cashier, accountant, admin).
- Action Logging: Log edits, deletions, approvals.
- Soft Deletes + Versioning: Avoid hard deletions of financial data.

---

## 🔄 Integrations and Interfaces
- **Inventory Module** → For drugs/items dispensed.
- **Clinical Module** → For test and procedure billing.
- **Patient Portal** → For invoice download and online payments.
- **External Accounting Software (optional)** → QuickBooks, Tally, SAP.