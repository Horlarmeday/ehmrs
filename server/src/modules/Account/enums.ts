export enum StatementType {
  BALANCE_SHEET = 'BALANCE_SHEET',
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  CASH_FLOW = 'CASH_FLOW',
  COST_CENTER = 'COST_CENTER',
}

export enum TrendInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}
