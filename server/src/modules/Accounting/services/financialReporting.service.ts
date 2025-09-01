import { Transaction, Op, Sequelize } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import { 
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  ClinicalBill,
  ClinicalPayment,
  PatientDeposit,
  FinancialPeriod,
  CostCenter,
  Department
} from '../../../database/models';
import { 
  AccountType,
  JournalEntryStatus
} from '../enums';
import { logger } from '../../../core/helpers/logger';

// ===== FINANCIAL REPORTING INTERFACES =====

export interface FinancialReportFilters {
  start_date?: string;
  end_date?: string;
  department?: string;
  cost_center?: string;
  account_type?: string;
  include_zero_balances?: boolean;
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
}

export interface ProfitLossStatement {
  period: {
    start_date: Date;
    end_date: Date;
  };
  revenue: {
    total: number;
    breakdown: Array<{
      account_name: string;
      account_code: string;
      amount: number;
      percentage: number;
    }>;
  };
  expenses: {
    total: number;
    breakdown: Array<{
      account_name: string;
      account_code: string;
      amount: number;
      percentage: number;
    }>;
  };
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  summary: {
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    gross_margin: number;
    net_margin: number;
  };
}

export interface BalanceSheet {
  as_of_date: Date;
  assets: {
    current: Array<{
      account_name: string;
      account_code: string;
      balance: number;
      percentage: number;
    }>;
    non_current: Array<{
      account_name: string;
      account_code: string;
      balance: number;
      percentage: number;
    }>;
    total: number;
  };
  liabilities: {
    current: Array<{
      account_name: string;
      account_code: string;
      balance: number;
      percentage: number;
    }>;
    non_current: Array<{
      account_name: string;
      account_code: string;
      balance: number;
      percentage: number;
    }>;
    total: number;
  };
  equity: {
    total: number;
    breakdown: Array<{
      account_name: string;
      account_code: string;
      balance: number;
      percentage: number;
    }>;
  };
  summary: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    working_capital: number;
    debt_to_equity: number;
  };
}

export interface CashFlowStatement {
  period: {
    start_date: Date;
    end_date: Date;
  };
  operating_activities: {
    net_income: number;
    adjustments: Array<{
      description: string;
      amount: number;
      type: 'ADD' | 'SUBTRACT';
    }>;
    changes_in_working_capital: Array<{
      account_name: string;
      previous_balance: number;
      current_balance: number;
      change: number;
    }>;
    net_cash_from_operations: number;
  };
  investing_activities: {
    capital_expenditures: number;
    asset_sales: number;
    investments: number;
    net_cash_from_investing: number;
  };
  financing_activities: {
    debt_issuance: number;
    debt_repayment: number;
    equity_issuance: number;
    dividends: number;
    net_cash_from_financing: number;
  };
  summary: {
    net_change_in_cash: number;
    beginning_cash_balance: number;
    ending_cash_balance: number;
    free_cash_flow: number;
  };
}

export interface AdvancedAnalytics {
  trends: {
    revenue_growth: number;
    expense_growth: number;
    profit_margin_trend: number;
    cash_flow_trend: number;
  };
  kpis: {
    current_ratio: number;
    quick_ratio: number;
    debt_to_equity: number;
    return_on_assets: number;
    return_on_equity: number;
    asset_turnover: number;
  };
  forecasting: {
    next_month_revenue: number;
    next_month_expenses: number;
    cash_flow_projection: number;
    confidence_level: number;
  };
  alerts: Array<{
    type: 'WARNING' | 'CRITICAL' | 'INFO';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
}

// ===== FINANCIAL REPORTING SERVICE =====

/**
 * Financial Reporting Service
 * 
 * This service provides comprehensive financial reporting including:
 * - Profit & Loss Statement
 * - Balance Sheet
 * - Cash Flow Statement
 * - Advanced Analytics and Forecasting
 * - Real-time Financial Monitoring
 */
export class FinancialReportingService {

  // ===== PROFIT & LOSS STATEMENT =====

  /**
   * Generate comprehensive Profit & Loss statement
   */
  static async generateProfitLossStatement(
    filters: FinancialReportFilters
  ): Promise<ProfitLossStatement> {
    try {
      const { start_date, end_date, department, cost_center } = filters;
      
      // Build date filters
      const dateFilter: any = {};
      if (start_date && end_date) {
        dateFilter.transaction_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        };
      }

      // Get revenue accounts (Revenue accounts)
      const revenueAccounts = await ChartOfAccount.findAll({
        where: {
          type: AccountType.REVENUE,
          is_active: true,
        },
      });

      // Get expense accounts (Expense accounts)
      const expenseAccounts = await ChartOfAccount.findAll({
        where: {
          type: AccountType.EXPENSE,
          is_active: true,
        },
      });

      // Get journal entry lines for revenue accounts
      const revenueJournalLines = await JournalEntryLine.findAll({
        where: {
          account_id: { [Op.in]: revenueAccounts.map(acc => acc.id) },
        },
        include: [{
          model: JournalEntry,
          as: 'journal_entry',
          where: { 
            status: JournalEntryStatus.POSTED,
            ...(start_date && end_date ? { transaction_date: dateFilter.transaction_date } : {})
          },
        }],
      });

      // Get journal entry lines for expense accounts
      const expenseJournalLines = await JournalEntryLine.findAll({
        where: {
          account_id: { [Op.in]: expenseAccounts.map(acc => acc.id) },
        },
        include: [{
          model: JournalEntry,
          as: 'journal_entry',
          where: { 
            status: JournalEntryStatus.POSTED,
            ...(start_date && end_date ? { transaction_date: dateFilter.transaction_date } : {})
          },
        }],
      });

      // Calculate revenue breakdown
      const revenueBreakdown = revenueAccounts.map(account => {
        const accountLines = revenueJournalLines.filter(line => line.account_id === account.id);
        const totalCredit = accountLines.reduce((sum, line) => {
          if (line.journal_entry?.status === JournalEntryStatus.POSTED) {
            return sum + (line.credit || 0);
          }
          return sum;
        }, 0);

        return {
          account_name: account.name,
          account_code: account.code,
          amount: totalCredit,
          percentage: 0, // Will be calculated after total is known
        };
      }).filter(item => item.amount > 0);

      // Calculate expense breakdown
      const expenseBreakdown = expenseAccounts.map(account => {
        const accountLines = expenseJournalLines.filter(line => line.account_id === account.id);
        const totalDebit = accountLines.reduce((sum, line) => {
          if (line.journal_entry?.status === JournalEntryStatus.POSTED) {
            return sum + (line.debit || 0);
          }
          return sum;
        }, 0);

        return {
          account_name: account.name,
          account_code: account.code,
          amount: totalDebit,
          percentage: 0, // Will be calculated after total is known
        };
      }).filter(item => item.amount > 0);

      // Calculate totals
      const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);

      // Calculate percentages
      revenueBreakdown.forEach(item => {
        item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
      });

      expenseBreakdown.forEach(item => {
        item.percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
      });

      // Calculate profit metrics
      const grossProfit = totalRevenue - totalExpenses;
      const netProfit = grossProfit; // Simplified for now
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        period: {
          start_date: start_date ? new Date(start_date) : new Date(),
          end_date: end_date ? new Date(end_date) : new Date(),
        },
        revenue: {
          total: totalRevenue,
          breakdown: revenueBreakdown,
        },
        expenses: {
          total: totalExpenses,
          breakdown: expenseBreakdown,
        },
        gross_profit: grossProfit,
        net_profit: netProfit,
        profit_margin: profitMargin,
        summary: {
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_income: netProfit,
          gross_margin: profitMargin,
          net_margin: profitMargin,
        },
      };

    } catch (error) {
      logger.error('Failed to generate P&L statement:', error);
      throw new BadException(
        'P&L Generation Failed',
        500,
        `Failed to generate profit and loss statement: ${error.message}`
      );
    }
  }

  // ===== BALANCE SHEET =====

  /**
   * Generate comprehensive Balance Sheet
   */
  static async generateBalanceSheet(
    filters: FinancialReportFilters
  ): Promise<BalanceSheet> {
    try {
      const { end_date, include_zero_balances = false } = filters;
      const asOfDate = end_date ? new Date(end_date) : new Date();

      // Get all active accounts
      const accounts = await ChartOfAccount.findAll({
        where: { is_active: true },
      });

      // Categorize accounts by type
      const assets = accounts.filter(account => 
        account.type === AccountType.ASSET
      );
      const liabilities = accounts.filter(account => 
        account.type === AccountType.LIABILITY
      );
      const equity = accounts.filter(account => 
        account.type === AccountType.EQUITY
      );

      // Calculate account balances
      const calculateBalance = async (account: any) => {
        const journalLines = await JournalEntryLine.findAll({
          where: { account_id: account.id },
          include: [{
            model: JournalEntry,
            as: 'journal_entry',
            where: { 
              status: JournalEntryStatus.POSTED,
              transaction_date: { [Op.lte]: asOfDate },
            },
          }],
        });

        const totalDebit = journalLines.reduce((sum: number, line: any) => {
          if (line.journal_entry?.status === JournalEntryStatus.POSTED) {
            return sum + (line.debit || 0);
          }
          return sum;
        }, 0);

        const totalCredit = journalLines.reduce((sum: number, line: any) => {
          if (line.journal_entry?.status === JournalEntryStatus.POSTED) {
            return sum + (line.credit || 0);
          }
          return sum;
        }, 0);

        // For asset accounts, debit increases, credit decreases
        // For liability/equity accounts, credit increases, debit decreases
        if (account.type === AccountType.ASSET) {
          return totalDebit - totalCredit;
        } else {
          return totalCredit - totalDebit;
        }
      };

      // Process assets
      const currentAssets = assets
        .filter(account => account.name.toLowerCase().includes('cash') || 
                          account.name.toLowerCase().includes('receivable') ||
                          account.name.toLowerCase().includes('inventory'))
        .map(async account => {
          const balance = await calculateBalance(account);
          return {
            account_name: account.name,
            account_code: account.code,
            balance,
            percentage: 0,
          };
        });

      const nonCurrentAssets = assets
        .filter(account => !currentAssets.some(async (ca) => (await ca).account_code === account.code))
        .map(async account => {
          const balance = await calculateBalance(account);
          return {
            account_name: account.name,
            account_code: account.code,
            balance,
            percentage: 0,
          };
        });

      // Process liabilities
      const currentLiabilities = liabilities
        .filter(account => account.name.toLowerCase().includes('payable') ||
                          account.name.toLowerCase().includes('short'))
        .map(async account => {
          const balance = await calculateBalance(account);
          return {
            account_name: account.name,
            account_code: account.code,
            balance,
            percentage: 0,
          };
        });

      const nonCurrentLiabilities = liabilities
        .filter(account => !currentLiabilities.some(async (cl) => (await cl).account_code === account.code))
        .map(async account => {
          const balance = await calculateBalance(account);
          return {
            account_name: account.name,
            account_code: account.code,
            balance,
            percentage: 0,
          };
        });

      // Process equity
      const equityBreakdown = equity.map(async account => {
        const balance = await calculateBalance(account);
        return {
          account_name: account.name,
          account_code: account.code,
          balance,
          percentage: 0,
        };
      });

      // Wait for all async operations to complete
      const [currentAssetsResolved, nonCurrentAssetsResolved, currentLiabilitiesResolved, nonCurrentLiabilitiesResolved, equityBreakdownResolved] = await Promise.all([
        Promise.all(currentAssets),
        Promise.all(nonCurrentAssets),
        Promise.all(currentLiabilities),
        Promise.all(nonCurrentLiabilities),
        Promise.all(equityBreakdown)
      ]);

      // Filter out zero balances if needed
      const filteredCurrentAssets = currentAssetsResolved.filter(item => include_zero_balances || item.balance > 0);
      const filteredNonCurrentAssets = nonCurrentAssetsResolved.filter(item => include_zero_balances || item.balance > 0);
      const filteredCurrentLiabilities = currentLiabilitiesResolved.filter(item => include_zero_balances || item.balance > 0);
      const filteredNonCurrentLiabilities = nonCurrentLiabilitiesResolved.filter(item => include_zero_balances || item.balance > 0);
      const filteredEquityBreakdown = equityBreakdownResolved.filter(item => include_zero_balances || item.balance > 0);

      // Calculate totals
      const totalCurrentAssets = filteredCurrentAssets.reduce((sum, item) => sum + item.balance, 0);
      const totalNonCurrentAssets = filteredNonCurrentAssets.reduce((sum, item) => sum + item.balance, 0);
      const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

      const totalCurrentLiabilities = filteredCurrentLiabilities.reduce((sum, item) => sum + item.balance, 0);
      const totalNonCurrentLiabilities = filteredNonCurrentLiabilities.reduce((sum, item) => sum + item.balance, 0);
      const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

      const totalEquity = filteredEquityBreakdown.reduce((sum, item) => sum + item.balance, 0);

      // Calculate percentages
      const calculatePercentages = (items: any[], total: number) => {
        items.forEach(item => {
          item.percentage = total > 0 ? (item.balance / total) * 100 : 0;
        });
      };

      calculatePercentages(filteredCurrentAssets, totalAssets);
      calculatePercentages(filteredNonCurrentAssets, totalAssets);
      calculatePercentages(filteredCurrentLiabilities, totalLiabilities);
      calculatePercentages(filteredNonCurrentLiabilities, totalLiabilities);
      calculatePercentages(filteredEquityBreakdown, totalEquity);

      // Calculate financial ratios
      const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
      const debtToEquity = totalLiabilities > 0 ? totalLiabilities / totalEquity : 0;

      return {
        as_of_date: asOfDate,
        assets: {
          current: filteredCurrentAssets,
          non_current: filteredNonCurrentAssets,
          total: totalAssets,
        },
        liabilities: {
          current: filteredCurrentLiabilities,
          non_current: filteredNonCurrentLiabilities,
          total: totalLiabilities,
        },
        equity: {
          total: totalEquity,
          breakdown: filteredEquityBreakdown,
        },
        summary: {
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          total_equity: totalEquity,
          working_capital: workingCapital,
          debt_to_equity: debtToEquity,
        },
      };

    } catch (error) {
      logger.error('Failed to generate balance sheet:', error);
      throw new BadException(
        'Balance Sheet Generation Failed',
        500,
        `Failed to generate balance sheet: ${error.message}`
      );
    }
  }

  // ===== CASH FLOW STATEMENT =====

  /**
   * Generate comprehensive Cash Flow statement
   */
  static async generateCashFlowStatement(
    filters: FinancialReportFilters
  ): Promise<CashFlowStatement> {
    try {
      const { start_date, end_date } = filters;
      
      if (!start_date || !end_date) {
        throw new BadException(
          'Date Range Required',
          400,
          'Start date and end date are required for cash flow statement'
        );
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      // Get P&L data for net income
      const pnlStatement = await this.generateProfitLossStatement(filters);
      const netIncome = pnlStatement.net_profit;

      // Get cash and cash equivalents accounts
      const cashAccounts = await ChartOfAccount.findAll({
        where: {
          type: AccountType.ASSET,
          name: { [Op.like]: '%cash%' },
          is_active: true,
        },
      });

      // Calculate beginning and ending cash balances
      const beginningCashBalance = await this.calculateAccountBalanceAsOf(cashAccounts, startDate);
      const endingCashBalance = await this.calculateAccountBalanceAsOf(cashAccounts, endDate);

      // Operating activities adjustments
      const adjustments = [
        { description: 'Depreciation and Amortization', amount: 0, type: 'ADD' as const },
        { description: 'Changes in Working Capital', amount: 0, type: 'SUBTRACT' as const },
      ];

      // Changes in working capital
      const workingCapitalChanges = await this.calculateWorkingCapitalChanges(startDate, endDate);

      // Calculate net cash from operations
      const netCashFromOperations = netIncome + 
        adjustments.reduce((sum, adj) => sum + (adj.type === 'ADD' ? adj.amount : -adj.amount), 0) +
        workingCapitalChanges.reduce((sum, change) => sum + change.change, 0);

      // Investing activities (simplified)
      const capitalExpenditures = 0; // Would need asset purchase data
      const assetSales = 0; // Would need asset sale data
      const investments = 0; // Would need investment data
      const netCashFromInvesting = assetSales - capitalExpenditures - investments;

      // Financing activities (simplified)
      const debtIssuance = 0; // Would need debt data
      const debtRepayment = 0; // Would need debt data
      const equityIssuance = 0; // Would need equity data
      const dividends = 0; // Would need dividend data
      const netCashFromFinancing = debtIssuance + equityIssuance - debtRepayment - dividends;

      // Calculate net change and free cash flow
      const netChangeInCash = netCashFromOperations + netCashFromInvesting + netCashFromFinancing;
      const freeCashFlow = netCashFromOperations - capitalExpenditures;

      return {
        period: { start_date: startDate, end_date: endDate },
        operating_activities: {
          net_income: netIncome,
          adjustments,
          changes_in_working_capital: workingCapitalChanges,
          net_cash_from_operations: netCashFromOperations,
        },
        investing_activities: {
          capital_expenditures: capitalExpenditures,
          asset_sales: assetSales,
          investments: investments,
          net_cash_from_investing: netCashFromInvesting,
        },
        financing_activities: {
          debt_issuance: debtIssuance,
          debt_repayment: debtRepayment,
          equity_issuance: equityIssuance,
          dividends: dividends,
          net_cash_from_financing: netCashFromFinancing,
        },
        summary: {
          net_change_in_cash: netChangeInCash,
          beginning_cash_balance: beginningCashBalance,
          ending_cash_balance: endingCashBalance,
          free_cash_flow: freeCashFlow,
        },
      };

    } catch (error) {
      logger.error('Failed to generate cash flow statement:', error);
      throw new BadException(
        'Cash Flow Generation Failed',
        500,
        `Failed to generate cash flow statement: ${error.message}`
      );
    }
  }

  // ===== ADVANCED ANALYTICS =====

  /**
   * Generate advanced financial analytics
   */
  static async generateAdvancedAnalytics(
    filters: FinancialReportFilters
  ): Promise<AdvancedAnalytics> {
    try {
      const { start_date, end_date } = filters;
      
      // Get current period data
      const currentPnl = await this.generateProfitLossStatement(filters);
      
      // Get previous period data for comparison
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(startDate.getTime());

        const previousFilters = {
          ...filters,
          start_date: previousStartDate.toISOString().split('T')[0],
          end_date: previousEndDate.toISOString().split('T')[0],
        };

        const previousPnl = await this.generateProfitLossStatement(previousFilters);

        // Calculate growth trends
        const revenueGrowth = previousPnl.revenue.total > 0 ? 
          ((currentPnl.revenue.total - previousPnl.revenue.total) / previousPnl.revenue.total) * 100 : 0;
        
        const expenseGrowth = previousPnl.expenses.total > 0 ? 
          ((currentPnl.expenses.total - previousPnl.expenses.total) / previousPnl.expenses.total) * 100 : 0;

        const profitMarginTrend = currentPnl.profit_margin - previousPnl.profit_margin;

        // Get balance sheet for ratios
        const balanceSheet = await this.generateBalanceSheet(filters);
        
        // Calculate financial ratios
        const currentRatio = balanceSheet.assets.current.reduce((sum, asset) => sum + asset.balance, 0) / 
                           balanceSheet.liabilities.current.reduce((sum, liability) => sum + liability.balance, 0);
        
        const quickRatio = (balanceSheet.assets.current.reduce((sum, asset) => sum + asset.balance, 0) - 
                           balanceSheet.assets.current.filter(a => a.account_name.toLowerCase().includes('inventory')).reduce((sum, asset) => sum + asset.balance, 0)) / 
                          balanceSheet.liabilities.current.reduce((sum, liability) => sum + liability.balance, 0);

        const debtToEquity = balanceSheet.summary.debt_to_equity;
        const returnOnAssets = currentPnl.net_profit / balanceSheet.summary.total_assets;
        const returnOnEquity = currentPnl.net_profit / balanceSheet.summary.total_equity;
        const assetTurnover = currentPnl.revenue.total / balanceSheet.summary.total_assets;

        // Generate forecasting (simplified)
        const nextMonthRevenue = currentPnl.revenue.total * (1 + (revenueGrowth / 100));
        const nextMonthExpenses = currentPnl.expenses.total * (1 + (expenseGrowth / 100));
        const cashFlowProjection = nextMonthRevenue - nextMonthExpenses;
        const confidenceLevel = 85; // Simplified confidence calculation

        // Generate alerts
        const alerts = [];
        if (currentRatio < 1.5) {
          alerts.push({
            type: 'WARNING' as const,
            message: 'Current ratio is below recommended threshold',
            metric: 'Current Ratio',
            value: currentRatio,
            threshold: 1.5,
          });
        }

        if (debtToEquity > 0.5) {
          alerts.push({
            type: 'WARNING' as const,
            message: 'Debt to equity ratio is above recommended threshold',
            metric: 'Debt to Equity',
            value: debtToEquity,
            threshold: 0.5,
          });
        }

        if (profitMarginTrend < -5) {
          alerts.push({
            type: 'CRITICAL' as const,
            message: 'Profit margin has declined significantly',
            metric: 'Profit Margin Trend',
            value: profitMarginTrend,
            threshold: -5,
          });
        }

        return {
          trends: {
            revenue_growth: revenueGrowth,
            expense_growth: expenseGrowth,
            profit_margin_trend: profitMarginTrend,
            cash_flow_trend: 0, // Would need historical cash flow data
          },
          kpis: {
            current_ratio: currentRatio,
            quick_ratio: quickRatio,
            debt_to_equity: debtToEquity,
            return_on_assets: returnOnAssets,
            return_on_equity: returnOnEquity,
            asset_turnover: assetTurnover,
          },
          forecasting: {
            next_month_revenue: nextMonthRevenue,
            next_month_expenses: nextMonthExpenses,
            cash_flow_projection: cashFlowProjection,
            confidence_level: confidenceLevel,
          },
          alerts,
        };
      }

      // Return default analytics if no date range
      return {
        trends: { revenue_growth: 0, expense_growth: 0, profit_margin_trend: 0, cash_flow_trend: 0 },
        kpis: { current_ratio: 0, quick_ratio: 0, debt_to_equity: 0, return_on_assets: 0, return_on_equity: 0, asset_turnover: 0 },
        forecasting: { next_month_revenue: 0, next_month_expenses: 0, cash_flow_projection: 0, confidence_level: 0 },
        alerts: [],
      };

    } catch (error) {
      logger.error('Failed to generate advanced analytics:', error);
      throw new BadException(
        'Analytics Generation Failed',
        500,
        `Failed to generate advanced analytics: ${error.message}`
      );
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Calculate account balance as of a specific date
   */
  private static async calculateAccountBalanceAsOf(
    accounts: any[],
    asOfDate: Date
  ): Promise<number> {
    let totalBalance = 0;

    for (const account of accounts) {
      const journalLines = await JournalEntryLine.findAll({
        where: { account_id: account.id },
        include: [{
          model: JournalEntry,
          as: 'journal_entry',
          where: { 
            status: JournalEntryStatus.POSTED,
            transaction_date: { [Op.lte]: asOfDate },
          },
        }],
      });

      const balance = journalLines.reduce((sum: number, line: any) => {
        if (line.journal_entry?.status === JournalEntryStatus.POSTED &&
            line.journal_entry.transaction_date <= asOfDate) {
          if (account.type === AccountType.ASSET) {
            return sum + (line.debit || 0) - (line.credit || 0);
          } else {
            return sum + (line.credit || 0) - (line.debit || 0);
          }
        }
        return sum;
      }, 0);

      totalBalance += balance;
    }

    return totalBalance;
  }

  /**
   * Calculate working capital changes
   */
  private static async calculateWorkingCapitalChanges(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    account_name: string;
    previous_balance: number;
    current_balance: number;
    change: number;
  }>> {
    // Get current assets and current liabilities
    const currentAssets = await ChartOfAccount.findAll({
      where: {
        type: AccountType.ASSET,
        name: { [Op.like]: '%cash%' },
        is_active: true,
      },
    });

    const currentLiabilities = await ChartOfAccount.findAll({
      where: {
        type: AccountType.LIABILITY,
        name: { [Op.like]: '%payable%' },
        is_active: true,
      },
    });

    const changes = [];

    // Calculate changes for current assets
    for (const account of currentAssets) {
      const previousBalance = await this.calculateAccountBalanceAsOf([account], startDate);
      const currentBalance = await this.calculateAccountBalanceAsOf([account], endDate);
      
      changes.push({
        account_name: account.name,
        previous_balance: previousBalance,
        current_balance: currentBalance,
        change: currentBalance - previousBalance,
      });
    }

    // Calculate changes for current liabilities
    for (const account of currentLiabilities) {
      const previousBalance = await this.calculateAccountBalanceAsOf([account], startDate);
      const currentBalance = await this.calculateAccountBalanceAsOf([account], endDate);
      
      changes.push({
        account_name: account.name,
        previous_balance: previousBalance,
        current_balance: currentBalance,
        change: previousBalance - currentBalance, // Liability decrease increases working capital
      });
    }

    return changes;
  }

  // ===== COMPREHENSIVE REPORT GENERATION =====

  /**
   * Generate comprehensive financial report package
   */
  static async generateComprehensiveReport(
    filters: FinancialReportFilters
  ): Promise<{
    profit_loss: ProfitLossStatement;
    balance_sheet: BalanceSheet;
    cash_flow: CashFlowStatement;
    analytics: AdvancedAnalytics;
    generated_at: Date;
  }> {
    try {
      const [profitLoss, balanceSheet, cashFlow, analytics] = await Promise.all([
        this.generateProfitLossStatement(filters),
        this.generateBalanceSheet(filters),
        this.generateCashFlowStatement(filters),
        this.generateAdvancedAnalytics(filters),
      ]);

      return {
        profit_loss: profitLoss,
        balance_sheet: balanceSheet,
        cash_flow: cashFlow,
        analytics,
        generated_at: new Date(),
      };

    } catch (error) {
      logger.error('Failed to generate comprehensive report:', error);
      throw new BadException(
        'Comprehensive Report Generation Failed',
        500,
        `Failed to generate comprehensive financial report: ${error.message}`
      );
    }
  }
}

export default FinancialReportingService;
