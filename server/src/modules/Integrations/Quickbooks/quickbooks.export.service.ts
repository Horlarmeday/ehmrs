import dayjs from 'dayjs';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { AccountingService } from '../../Accounting/accounting.service';
import { PaymentMethod, PaymentStatus } from '../../Accounting/enums';
import { findActiveConnection, updateLastSyncedAt } from './quickbooks.repository';
import { QuickbooksService } from './quickbooks.service';

type SummaryAccountMappings = {
  revenueAccountId: string;
  offsetAccountId: string;
  pendingAccountId?: string;
  depositsAccountId?: string;
};

interface SummaryExportRequest {
  memo?: string;
  txnDate?: string;
  accountMappings: SummaryAccountMappings;
}

type DetailedDebitMappings = {
  default: string;
} & Partial<Record<PaymentMethod, string>>;

interface DetailedExportRequest {
  filters: {
    start?: string;
    end?: string;
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
    currentPage: number;
    pageLimit: number;
    search?: string;
  };
  memoPrefix: string;
  accountMappings: {
    creditAccountId: string;
    debitAccounts: DetailedDebitMappings;
  };
}

interface JournalEntryLineProps {
  amount: number;
  accountId: string;
  postingType: 'Debit' | 'Credit';
  description?: string;
}

type JournalEntryPayload = {
  DocNumber: string;
  TxnDate: string;
  PrivateNote?: string;
  Line: Array<{
    Amount: number;
    Description?: string;
    DetailType: 'JournalEntryLineDetail';
    JournalEntryLineDetail: {
      PostingType: 'Debit' | 'Credit';
      AccountRef: {
        value: string;
      };
    };
  }>;
};

const MAX_BATCH_SIZE = 25;

function toAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return Number(value || 0);
}

function normalizeDate(input?: string | Date | null): string {
  if (!input) return dayjs().format('YYYY-MM-DD');
  return dayjs(input).format('YYYY-MM-DD');
}

function buildJournalEntryLine({
  amount,
  accountId,
  postingType,
  description,
}: JournalEntryLineProps) {
  return {
    Amount: amount,
    Description: description,
    DetailType: 'JournalEntryLineDetail' as const,
    JournalEntryLineDetail: {
      PostingType: postingType,
      AccountRef: {
        value: accountId,
      },
    },
  };
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function buildDocNumber(prefix: string, seed: string): string {
  const sanitized = seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${prefix}-${sanitized}`.slice(0, 30);
}

function resolveDebitAccount(
  method: PaymentMethod,
  mappings: DetailedDebitMappings
): string {
  return mappings[method] || mappings.default;
}

export class QuickbooksExportService {
  static async exportSummary(userId: number, payload: SummaryExportRequest) {
    const { accountMappings, memo, txnDate } = payload;

    const summary = await AccountingService.getAccountingSummary();
    const totalRevenue = toAmount(summary.totalRevenue);

    if (totalRevenue <= 0) {
      throw new BadException(
        'QUICKBOOKS_NO_DATA',
        StatusCodes.BAD_REQUEST,
        'There is no revenue data available to export'
      );
    }

    const journalEntry: JournalEntryPayload = {
      DocNumber: buildDocNumber('EHMRS-SUM', dayjs().format('YYYYMMDDHHmmss')),
      TxnDate: normalizeDate(txnDate),
      PrivateNote: memo || `EHMRS summary export for ${dayjs().format('MMMM YYYY')}`,
      Line: [
        buildJournalEntryLine({
          amount: totalRevenue,
          accountId: accountMappings.offsetAccountId,
          postingType: 'Debit',
          description: 'Offset account',
        }),
        buildJournalEntryLine({
          amount: totalRevenue,
          accountId: accountMappings.revenueAccountId,
          postingType: 'Credit',
          description: 'Recognized revenue',
        }),
      ],
    };

    if (accountMappings.pendingAccountId) {
      const pendingAmount = toAmount(summary.pendingPayments);
      if (pendingAmount > 0) {
        journalEntry.Line.push(
          buildJournalEntryLine({
            amount: pendingAmount,
            accountId: accountMappings.pendingAccountId,
            postingType: 'Credit',
            description: 'Pending payments',
          })
        );

        journalEntry.Line.push(
          buildJournalEntryLine({
            amount: pendingAmount,
            accountId: accountMappings.offsetAccountId,
            postingType: 'Debit',
            description: 'Pending payments offset',
          })
        );
      }
    }

    if (accountMappings.depositsAccountId) {
      const depositAmount = toAmount(summary.totalDeposits);
      if (depositAmount > 0) {
        journalEntry.Line.push(
          buildJournalEntryLine({
            amount: depositAmount,
            accountId: accountMappings.depositsAccountId,
            postingType: 'Credit',
            description: 'Patient deposits liability',
          })
        );

        journalEntry.Line.push(
          buildJournalEntryLine({
            amount: depositAmount,
            accountId: accountMappings.offsetAccountId,
            postingType: 'Debit',
            description: 'Patient deposits offset',
          })
        );
      }
    }

    await QuickbooksService.executeApiRequest({
      method: 'post',
      path: 'journalentry',
      data: journalEntry,
    });

    const connection = await findActiveConnection();
    if (connection) {
      await updateLastSyncedAt(connection.id, new Date(), userId);
    }

    return {
      message: 'QuickBooks summary export completed',
      data: {
        summary: {
          totalRevenue,
          pendingPayments: toAmount(summary.pendingPayments),
          totalDeposits: toAmount(summary.totalDeposits),
        },
        journalEntry,
      },
    };
  }

  static async exportDetailed(userId: number, request: DetailedExportRequest) {
    const { filters, memoPrefix, accountMappings } = request;

    const paymentFilters: any = {
      page: filters.currentPage,
      limit: filters.pageLimit,
    };

    if (filters.paymentMethod) {
      paymentFilters.payment_method = filters.paymentMethod;
    }
    if (filters.status) {
      paymentFilters.status = filters.status;
    }
    if (filters.start) {
      paymentFilters.start_date = new Date(filters.start);
    }
    if (filters.end) {
      paymentFilters.end_date = new Date(filters.end);
    }
    if (filters.search) {
      paymentFilters.search = filters.search;
    }

    const paymentsResult = await AccountingService.getClinicalPayments(paymentFilters);
    const payments = paymentsResult?.docs ?? [];

    if (!payments.length) {
      throw new BadException(
        'QUICKBOOKS_NO_DATA',
        StatusCodes.BAD_REQUEST,
        'No clinical payments matched the provided filters'
      );
    }

    const batchPayloads: JournalEntryPayload[] = payments.map(payment => {
      const amount = toAmount(payment.amount);
      const debitAccountId = resolveDebitAccount(payment.payment_method, accountMappings.debitAccounts);
      const creditAccountId = accountMappings.creditAccountId;
      const txnDate = normalizeDate(payment.processed_at ?? payment.createdAt);
      const patientName =
        payment.patient?.fullname ||
        `${payment.patient?.firstname || ''} ${payment.patient?.lastname || ''}`.trim();

      const description = [
        patientName || 'Patient payment',
        payment.payment_method,
        payment.payment_reference,
      ]
        .filter(Boolean)
        .join(' • ');

      return {
        DocNumber: buildDocNumber('EHMRS-PAY', payment.payment_reference || `${payment.id}`),
        TxnDate: txnDate,
        PrivateNote: `${memoPrefix} - ${description}`,
        Line: [
          buildJournalEntryLine({
            amount,
            accountId: debitAccountId,
            postingType: 'Debit',
            description,
          }),
          buildJournalEntryLine({
            amount,
            accountId: creditAccountId,
            postingType: 'Credit',
            description,
          }),
        ],
      };
    });

    const batches = chunkArray(batchPayloads, MAX_BATCH_SIZE);
    const batchResponses: any[] = [];

    for (let i = 0; i < batches.length; i += 1) {
      const batch = batches[i];
      const batchRequest = {
        BatchItemRequest: batch.map((entry, index) => ({
          bId: `${i + 1}-${index + 1}`,
          operation: 'create',
          JournalEntry: entry,
        })),
      };

      const response = await QuickbooksService.executeApiRequest<any>({
        method: 'post',
        path: 'batch',
        data: batchRequest,
      });

      batchResponses.push(response);
    }

    const connection = await findActiveConnection();
    if (connection) {
      await updateLastSyncedAt(connection.id, new Date(), userId);
    }

    const successes: any[] = [];
    const failures: any[] = [];

    batchResponses.forEach(batchResponse => {
      const items = batchResponse?.BatchItemResponse || [];
      items.forEach(item => {
        if (item?.Fault) {
          failures.push({
            id: item.bId,
            errors: item.Fault,
          });
        } else {
          successes.push({
            id: item.bId,
            entity: item?.JournalEntry?.DocNumber || item?.JournalEntry?.Id,
          });
        }
      });
    });

    return {
      message: 'QuickBooks detailed export completed',
      data: {
        totalPayments: payments.length,
        batches: batchResponses.length,
        successes,
        failures,
      },
    };
  }
}

