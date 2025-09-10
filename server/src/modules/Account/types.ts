import { AccountType, EntryType, StatementType, TrendInterval, ExportFormat } from './enums';
import { ServiceName } from '../../database/models/paymentHistory';

export interface ChartOfAccount {
  id?: number;
  code: string;
  name: string;
  type: AccountType;
  parent_id?: number;
  description?: string;
  is_active?: boolean;
  balance?: number;
}

export interface JournalEntry {
  id?: number;
  transaction_date: Date;
  reference: string;
  description: string;
  visit_id?: number;
  patient_id?: number;
  department_id?: number;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id?: number;
  journal_entry_id?: number;
  account_id: number;
  debit?: number;
  credit?: number;
  cost_center_id?: number;
  description?: string;
  account?: ChartOfAccount;
}

export interface CostCenter {
  id?: number;
  code: string;
  name: string;
  department_id: number;
  description?: string;
  is_active?: boolean;
  department?: {
    id: number;
    name: string;
  };
}

export interface FinancialStatement {
  start_date: string;
  end_date: string;
  type: StatementType;
  format?: ExportFormat;
}

export interface TrendAnalysis {
  start_date: string;
  end_date: string;
  interval: TrendInterval;
  metrics?: string[];
  department_id?: number;
  format?: ExportFormat;
}

export interface CustomReport {
  start_date: string;
  end_date: string;
  metrics: string[];
  dimensions?: string[];
  filters?: string[];
  format?: ExportFormat;
}

export interface CostCenterReport {
  start_date: string;
  end_date: string;
  department_id?: number;
}

export interface PaginateOptions {
  page: number;
  paginate: number;
  where?: any;
  include?: any[];
}

export interface PaginateResult<T> {
  docs: T[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface PaymentHistoryPrintProps {
  serviceName: ServiceName;
}
