# Fix Accounting Summary Method - Task Plan

## Problem Analysis
The current `getAccountingSummary` method has critical issues:
1. Uses paginated methods (`getClinicalBills`, `getClinicalPayments`, `getPatientDeposits`) without proper parameters
2. Only fetches first page of results (default pagination)
3. Performs inefficient in-memory filtering and calculations
4. Date manipulation is verbose and error-prone
5. Fetches entire records when only aggregations are needed

## Requirements
- Maintain exact same response structure
- Use dayjs for date manipulation
- Optimize with database-level aggregations
- Ensure accurate calculations across all records
- Professional, maintainable code

## Implementation Plan

### Task 1: Install and Configure dayjs
- [ ] Check if dayjs is already installed
- [ ] Install dayjs if needed
- [ ] Import dayjs in accounting.service.ts

### Task 2: Create Repository Aggregation Methods
- [ ] Create `getFinancialSummaryStats` method in repository for bill statistics
- [ ] Create `getPaymentSummaryStats` method in repository for payment statistics
- [ ] Create `getDepositSummaryStats` method in repository for deposit statistics
- [ ] Create methods for period-based calculations (current period, previous period)
- [ ] Create methods for status breakdowns

### Task 3: Rewrite getAccountingSummary Method
- [ ] Replace paginated calls with aggregation methods
- [ ] Use dayjs for all date calculations
- [ ] Implement parallel queries using Promise.all
- [ ] Calculate period metrics efficiently
- [ ] Calculate status breakdowns
- [ ] Fetch recent activity with proper limits
- [ ] Maintain exact same response structure

### Task 4: Testing
- [ ] Test with empty database
- [ ] Test with sample data
- [ ] Verify all calculations are accurate
- [ ] Confirm response structure matches original
- [ ] Test date range calculations
- [ ] Verify performance improvements

### Task 5: Cleanup and Documentation
- [ ] Add JSDoc comments
- [ ] Remove old inefficient code
- [ ] Document the aggregation approach

## Acceptance Criteria
- ✅ All records included in calculations (not just first page)
- ✅ Database-level aggregations (no in-memory filtering)
- ✅ dayjs used for all date operations
- ✅ Response structure identical to original
- ✅ Significantly improved performance
- ✅ Accurate financial calculations
- ✅ Professional code quality

## Technical Decisions
- Use Sequelize aggregation functions (COUNT, SUM)
- Use WHERE clauses for date filtering at DB level
- Parallel query execution for independent calculations
- dayjs for clean, reliable date manipulation