import sequelizeConnection from '../../database/config/data-source';
import {
  Payment,
  PaymentHistory,
  PrescribedAdditionalItem,
  PrescribedDrug,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedTest,
  ChartOfAccount as ChartOfAccountModel,
  JournalEntry as JournalEntryModel,
  JournalEntryLine as JournalEntryLineModel,
  CostCenter as CostCenterModel,
  Department,
  Staff,
  Patient,
  Visit,
  Drug,
  Test,
  Investigation,
  Service,
} from '../../database/models';
import { PaymentStatus } from '../../database/models/prescribedDrug';
import { ServiceName } from '../../database/models/paymentHistory';
import {
  generateRandomNumbers,
  StatusCodes,
  paginate,
  calcLimitAndOffset,
} from '../../core/helpers/helper';
import { Transaction, Op, literal, QueryTypes } from 'sequelize';
import dayjs from 'dayjs';
import {
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  CostCenter,
  FinancialStatement,
  TrendAnalysis,
  CustomReport,
  CostCenterReport,
  PaginateOptions,
} from './types';
import { StatementType, TrendInterval, ExportFormat } from './enums';
import { fetchAllServiceDetailsRaw, getPaymentHistoryQuery } from './helper/account.helper';
import { BadException } from '../../common/util/api-error';

export const createPaymentHistory = async data => {
  const {
    type,
    mode_of_payment,
    selectedItems,
    staff_id,
    visit_id,
    patient_id,
    notes,
    serviceType,
  } = data;

  const serviceMappings = {
    Drugs: {
      model: PrescribedDrug,
      serviceName: ServiceName.DRUGS,
      narration: 'Prescribed Drugs',
    },
    Tests: {
      model: PrescribedTest,
      serviceName: ServiceName.TESTS,
      narration: 'Prescribed Tests',
    },
    Investigations: {
      model: PrescribedInvestigation,
      serviceName: ServiceName.INVESTIGATIONS,
      narration: 'Prescribed Investigations',
    },
    Items: {
      model: PrescribedAdditionalItem,
      serviceName: ServiceName.ITEMS,
      narration: 'Prescribed Items',
    },
    Services: {
      model: PrescribedService,
      serviceName: ServiceName.SERVICES,
      narration: 'Prescribed Services',
    },
  };

  const processPayment = async ({ model, serviceName, narration }, transaction: Transaction) => {
    await model.update(
      { payment_status: PaymentStatus.PAID },
      { where: { id: selectedItems.map(item => item.id) }, transaction }
    );

    const mappedItems = selectedItems.map((item: any) => ({
      service_id: item.id,
      service_name: serviceName,
      narration: `${narration}`,
      transaction_id: `${generateRandomNumbers(7)}-${Date.now()}`,
      transaction_date: Date.now(),
      amount: item.price,
      mode_of_payment,
      staff_id,
      visit_id,
      patient_id,
      notes,
    }));
    return PaymentHistory.bulkCreate(mappedItems, { transaction });
  };

  return sequelizeConnection.transaction(async t => {
    console.log(serviceMappings[serviceType], 'serviceMappings[type]');
    if (serviceMappings[serviceType]) {
      const { model, serviceName, narration } = serviceMappings[serviceType];
      return processPayment(
        {
          model,
          serviceName,
          narration,
        },
        t
      );
    }
    return false;
  });
};

export const getPatientPaymentHistory = async ({ currentPage = 1, pageLimit = 10, patient_id }) => {
  return await Payment.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      uid: patient_id,
    },
  });
};

export const getPaymentHistoryDataForPrint = async (
  serviceName: ServiceName | 'ALL',
  visitId: number
) => {
  if (serviceName === 'ALL') {
    return await fetchAllServiceDetailsRaw(visitId);
  }
  // Define the service table mapping
  const serviceTableMap = {
    [ServiceName.DRUGS]: {
      table: 'Prescribed_Drugs',
      joinTable: 'Drugs',
      joinField: 'drug_id',
    },
    [ServiceName.TESTS]: {
      table: 'Prescribed_Tests',
      joinTable: 'Tests',
      joinField: 'test_id',
    },
    [ServiceName.INVESTIGATIONS]: {
      table: 'Prescribed_Investigations',
      joinTable: 'Investigations',
      joinField: 'investigation_id',
    },
    [ServiceName.SERVICES]: {
      table: 'Prescribed_Services',
      joinTable: 'Services',
      joinField: 'service_id',
    },
    [ServiceName.ITEMS]: {
      table: 'Additional_item_prescriptions',
      joinTable: 'Drugs',
      joinField: 'drug_id',
    },
  };

  const serviceConfig = serviceTableMap[serviceName];

  if (!serviceConfig) {
    throw new BadException('Error', StatusCodes.BAD_REQUEST, 'Invalid service name');
  }

  const query = getPaymentHistoryQuery(serviceConfig);

  const results = await PaymentHistory.sequelize.query(query, {
    replacements: { visitId, serviceName },
    type: QueryTypes.SELECT,
  });

  // Transform the raw results
  return results.map((row: any) => {
    const baseData = {
      id: row.id,
      transaction_id: row.transaction_id,
      transaction_date: row.transaction_date,
      amount: row.amount,
      mode_of_payment: row.mode_of_payment,
      notes: row.notes,
      narration: row.narration,
      serviceName: row.serviceName,
      patient: {
        id: row.patient_id,
        firstname: row.patient_firstname,
        lastname: row.patient_lastname,
        phone: row.patient_phone,
      },
    };

    // Create service detail object
    const serviceDetail = row.service_detail_id
      ? {
          id: row.service_detail_id,
          [serviceConfig.joinField]: row.service_reference_id,
          [serviceConfig.joinTable.slice(0, -1).toLowerCase()]: {
            id: row.reference_id,
            name: row.reference_name,
          },
        }
      : null;

    // Add service-specific data
    switch (serviceName) {
      case ServiceName.DRUGS:
        return { ...baseData, drug: serviceDetail };
      case ServiceName.TESTS:
        return { ...baseData, test: serviceDetail };
      case ServiceName.INVESTIGATIONS:
        return { ...baseData, investigation: serviceDetail };
      case ServiceName.SERVICES:
        return { ...baseData, service: serviceDetail };
      case ServiceName.ITEMS:
        return { ...baseData, item: serviceDetail };
      default:
        return baseData;
    }
  });
};

export const createChartOfAccount = async (data: Partial<ChartOfAccount>) => {
  return await ChartOfAccountModel.create(data);
};

export const updateChartOfAccount = async (data: Partial<ChartOfAccount> & { id: number }) => {
  const { id, ...updateData } = data;
  return await ChartOfAccountModel.update(updateData, { where: { id } });
};

export const getChartOfAccounts = async (query: any) => {
  const { currentPage = 1, pageLimit = 10, type } = query;
  const where = type ? { type } : {};

  const options: PaginateOptions = {
    page: +currentPage,
    paginate: +pageLimit,
    where,
    include: [
      {
        model: ChartOfAccountModel,
        as: 'parent',
        attributes: ['id', 'name', 'code'],
      },
    ],
  };

  return await ChartOfAccountModel.paginate(options);
};

export const createJournalEntry = async (data: JournalEntry) => {
  return await sequelizeConnection.transaction(async t => {
    const journalEntry = await JournalEntryModel.create(
      {
        transaction_date: data.transaction_date,
        reference: data.reference,
        description: data.description,
        visit_id: data.visit_id,
        patient_id: data.patient_id,
      },
      { transaction: t }
    );

    const lines = data.lines.map(line => ({
      ...line,
      journal_entry_id: journalEntry.id,
    }));

    await JournalEntryLineModel.bulkCreate(lines, { transaction: t });

    // Update account balances
    for (const line of lines) {
      const account = await ChartOfAccountModel.findByPk(line.account_id);
      if (account) {
        const currentBalance = account.balance || 0;
        const lineDebit = (line as any).debit || 0;
        const lineCredit = (line as any).credit || 0;
        const newBalance = currentBalance + lineDebit - lineCredit;

        await account.update({ balance: newBalance }, { transaction: t });
      }
    }

    return journalEntry;
  });
};

export const getJournalEntries = async (query: any) => {
  const { currentPage = 1, pageLimit = 10, startDate, endDate } = query;
  const where: any = {};

  if (startDate && endDate) {
    where.transaction_date = {
      [Op.between]: [startDate, endDate],
    };
  }

  const options: PaginateOptions = {
    page: +currentPage,
    paginate: +pageLimit,
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            attributes: ['id', 'name', 'code', 'type'],
          },
        ],
      },
    ],
  };

  return await JournalEntryModel.paginate(options);
};

export const getAccountBalance = async (accountId: number) => {
  const account = await ChartOfAccountModel.findByPk(accountId);
  if (!account) {
    throw new Error('Account not found');
  }
  return account.balance || 0;
};

export const getTrialBalance = async () => {
  const accounts = await ChartOfAccountModel.findAll({
    attributes: ['id', 'code', 'name', 'type', 'balance'],
  });

  return accounts.map(account => ({
    account_id: account.id,
    code: account.code,
    name: account.name,
    type: account.type,
    debit: account.type === 'ASSET' || account.type === 'EXPENSE' ? account.balance || 0 : 0,
    credit:
      account.type === 'LIABILITY' || account.type === 'INCOME' || account.type === 'EQUITY'
        ? account.balance || 0
        : 0,
  }));
};

export const createCostCenter = async (data: Partial<CostCenter>) => {
  return await CostCenterModel.create(data);
};

export const updateCostCenter = async (data: Partial<CostCenter> & { id: number }) => {
  const { id, ...updateData } = data;
  return await CostCenterModel.update(updateData, { where: { id } });
};

export const getCostCenters = async (query: any) => {
  const { currentPage = 1, pageLimit = 10, department_id } = query;
  const where = department_id ? { department_id } : {};

  const options: PaginateOptions = {
    page: +currentPage,
    paginate: +pageLimit,
    where,
    include: [
      {
        model: Department,
        attributes: ['id', 'name'],
      },
    ],
  };

  // Check if CostCenterModel has paginate method, otherwise use manual pagination
  if (typeof CostCenterModel.paginate === 'function') {
    return await CostCenterModel.paginate(options);
  } else {
    // Manual pagination fallback
    const { limit, offset } = calcLimitAndOffset(options.page, options.paginate);
    const data = await CostCenterModel.findAndCountAll({
      ...options,
      limit,
      offset,
    });
    return paginate(data, options.page, options.paginate);
  }
};

export const generateFinancialStatement = async (data: FinancialStatement) => {
  const { start_date, end_date, type } = data;
  const where = {
    transaction_date: {
      [Op.between]: [start_date, end_date],
    },
  };

  switch (type) {
    case StatementType.BALANCE_SHEET:
      return await generateBalanceSheet();
    case StatementType.INCOME_STATEMENT:
      return await generateIncomeStatement(where);
    case StatementType.CASH_FLOW:
      return await generateCashFlowStatement(where);
    case StatementType.COST_CENTER:
      return await generateCostCenterReport({ start_date, end_date });
    default:
      throw new Error('Invalid statement type');
  }
};

const generateBalanceSheet = async () => {
  const accounts = await ChartOfAccountModel.findAll({
    attributes: ['id', 'code', 'name', 'type', 'balance'],
    where: {
      type: {
        [Op.in]: ['ASSET', 'LIABILITY', 'EQUITY'],
      },
    },
  });

  return {
    assets: accounts.filter(a => a.type === 'ASSET'),
    liabilities: accounts.filter(a => a.type === 'LIABILITY'),
    equity: accounts.filter(a => a.type === 'EQUITY'),
    total_assets: accounts
      .filter(a => a.type === 'ASSET')
      .reduce((sum, a) => sum + (a.balance || 0), 0),
    total_liabilities: accounts
      .filter(a => a.type === 'LIABILITY')
      .reduce((sum, a) => sum + (a.balance || 0), 0),
    total_equity: accounts
      .filter(a => a.type === 'EQUITY')
      .reduce((sum, a) => sum + (a.balance || 0), 0),
  };
};

const generateIncomeStatement = async (where: any) => {
  const accounts = await ChartOfAccountModel.findAll({
    attributes: ['id', 'code', 'name', 'type', 'balance'],
    where: {
      type: {
        [Op.in]: ['INCOME', 'EXPENSE'],
      },
    },
  });

  const journalEntries = await JournalEntryModel.findAll({
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            where: {
              type: {
                [Op.in]: ['INCOME', 'EXPENSE'],
              },
            },
          },
        ],
      },
    ],
  });

  return {
    revenue: accounts.filter(a => a.type === 'INCOME'),
    expenses: accounts.filter(a => a.type === 'EXPENSE'),
    total_revenue: accounts
      .filter(a => a.type === 'INCOME')
      .reduce((sum, a) => sum + (a.balance || 0), 0),
    total_expenses: accounts
      .filter(a => a.type === 'EXPENSE')
      .reduce((sum, a) => sum + (a.balance || 0), 0),
    net_income:
      accounts.filter(a => a.type === 'INCOME').reduce((sum, a) => sum + (a.balance || 0), 0) -
      accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + (a.balance || 0), 0),
  };
};

const generateCashFlowStatement = async (where: any) => {
  const journalEntries = await JournalEntryModel.findAll({
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            where: {
              type: 'ASSET',
            },
          },
        ],
      },
    ],
  });

  const operatingActivities = journalEntries.filter(je =>
    je.lines.some(
      line =>
        (line as any).account?.type === 'ASSET' && (line as any).account?.code?.startsWith('1000')
    )
  );

  const investingActivities = journalEntries.filter(je =>
    je.lines.some(
      line =>
        (line as any).account?.type === 'ASSET' && (line as any).account?.code?.startsWith('2000')
    )
  );

  const financingActivities = journalEntries.filter(je =>
    je.lines.some(
      line =>
        (line as any).account?.type === 'ASSET' && (line as any).account?.code?.startsWith('3000')
    )
  );

  return {
    operating_activities: operatingActivities,
    investing_activities: investingActivities,
    financing_activities: financingActivities,
    net_cash_flow:
      operatingActivities.reduce(
        (sum, je) =>
          sum +
          je.lines.reduce((s, l) => s + (((l as any).debit || 0) - ((l as any).credit || 0)), 0),
        0
      ) +
      investingActivities.reduce(
        (sum, je) =>
          sum +
          je.lines.reduce((s, l) => s + (((l as any).debit || 0) - ((l as any).credit || 0)), 0),
        0
      ) +
      financingActivities.reduce(
        (sum, je) =>
          sum +
          je.lines.reduce((s, l) => s + (((l as any).debit || 0) - ((l as any).credit || 0)), 0),
        0
      ),
  };
};

const generateCostCenterReport = async (data: CostCenterReport) => {
  const { start_date, end_date, department_id } = data;
  const where: any = {
    transaction_date: {
      [Op.between]: [start_date, end_date],
    },
  };

  if (department_id) {
    where.department_id = department_id;
  }

  const costCenters = await ChartOfAccountModel.findAll({
    include: [
      {
        model: Department,
        attributes: ['id', 'name'],
      },
    ],
  });

  const journalEntries = await JournalEntryModel.findAll({
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            attributes: ['id', 'code', 'name', 'type'],
          },
        ],
      },
    ],
  });

  return costCenters.map(cc => {
    const entries = journalEntries.filter(je =>
      je.lines.some(line => (line as any).cost_center_id === cc.id)
    );
    const revenue = entries.reduce(
      (sum, je) =>
        sum +
        je.lines
          .filter(l => (l as any).account?.type === 'INCOME')
          .reduce((s, l) => s + (((l as any).debit || 0) - ((l as any).credit || 0)), 0),
      0
    );
    const expenses = entries.reduce(
      (sum, je) =>
        sum +
        je.lines
          .filter(l => (l as any).account?.type === 'EXPENSE')
          .reduce((s, l) => s + (((l as any).debit || 0) - ((l as any).credit || 0)), 0),
      0
    );

    return {
      cost_center: cc,
      revenue,
      expenses,
      net_income: revenue - expenses,
    };
  });
};

export const generateTrendAnalysis = async (data: TrendAnalysis) => {
  const { start_date, end_date, interval, metrics, department_id } = data;
  const where: any = {
    transaction_date: {
      [Op.between]: [start_date, end_date],
    },
  };

  if (department_id) {
    where.department_id = department_id;
  }

  const journalEntries = await JournalEntryModel.findAll({
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            attributes: ['id', 'code', 'name', 'type'],
          },
        ],
      },
    ],
  });

  const intervalFormat = {
    [TrendInterval.DAILY]: 'YYYY-MM-DD',
    [TrendInterval.WEEKLY]: 'YYYY-[W]WW',
    [TrendInterval.MONTHLY]: 'YYYY-MM',
    [TrendInterval.QUARTERLY]: 'YYYY-[Q]Q',
    [TrendInterval.YEARLY]: 'YYYY',
  }[interval];

  const groupedData = journalEntries.reduce((acc, entry) => {
    const date = dayjs(entry.transaction_date).format(intervalFormat);
    if (!acc[date]) {
      acc[date] = {
        revenue: 0,
        expenses: 0,
        net_income: 0,
        transactions: 0,
      };
    }

    const revenue = entry.lines
      .filter(line => (line as any).account?.type === 'INCOME')
      .reduce((sum, line) => sum + (((line as any).debit || 0) - ((line as any).credit || 0)), 0);

    const expenses = entry.lines
      .filter(line => (line as any).account?.type === 'EXPENSE')
      .reduce((sum, line) => sum + (((line as any).debit || 0) - ((line as any).credit || 0)), 0);

    acc[date].revenue += revenue;
    acc[date].expenses += expenses;
    acc[date].net_income += revenue - expenses;
    acc[date].transactions += 1;

    return acc;
  }, {} as Record<string, { revenue: number; expenses: number; net_income: number; transactions: number }>);

  return {
    interval,
    metrics: metrics || ['revenue', 'expenses', 'net_income', 'transactions'],
    data: Object.entries(groupedData).map(([date, values]) => ({
      date,
      ...values,
    })),
  };
};

export const generateCustomReport = async (data: CustomReport) => {
  const { start_date, end_date, metrics, dimensions, filters } = data;
  const where: any = {
    transaction_date: {
      [Op.between]: [start_date, end_date],
    },
  };

  if (filters) {
    filters.forEach(filter => {
      const [field, operator, value] = filter.split(':');
      where[field] = { [Op[operator]]: value };
    });
  }

  const journalEntries = await JournalEntryModel.findAll({
    where,
    include: [
      {
        model: JournalEntryLineModel,
        include: [
          {
            model: ChartOfAccountModel,
            attributes: ['id', 'code', 'name', 'type'],
          },
        ],
      },
    ],
  });

  const groupedData = journalEntries.reduce((acc, entry) => {
    const groupKey = dimensions
      ? dimensions.map(dim => entry[dim as keyof JournalEntryModel]).join('|')
      : 'all';

    if (!acc[groupKey]) {
      acc[groupKey] = {
        revenue: 0,
        expenses: 0,
        net_income: 0,
        transactions: 0,
      };
    }

    const revenue = entry.lines
      .filter(line => (line as any).account?.type === 'INCOME')
      .reduce((sum, line) => sum + (((line as any).debit || 0) - ((line as any).credit || 0)), 0);

    const expenses = entry.lines
      .filter(line => (line as any).account?.type === 'EXPENSE')
      .reduce((sum, line) => sum + (((line as any).debit || 0) - ((line as any).credit || 0)), 0);

    acc[groupKey].revenue += revenue;
    acc[groupKey].expenses += expenses;
    acc[groupKey].net_income += revenue - expenses;
    acc[groupKey].transactions += 1;

    return acc;
  }, {} as Record<string, { revenue: number; expenses: number; net_income: number; transactions: number }>);

  return {
    metrics,
    dimensions: dimensions || ['all'],
    data: Object.entries(groupedData).map(([key, values]) => ({
      key,
      ...values,
    })),
  };
};

export const exportReport = async (data: any, format: ExportFormat) => {
  switch (format) {
    case ExportFormat.PDF:
      return await generatePDF(data);
    case ExportFormat.EXCEL:
      return await generateExcel(data);
    case ExportFormat.CSV:
      return await generateCSV(data);
    case ExportFormat.JSON:
      return JSON.stringify(data, null, 2);
    default:
      throw new Error('Unsupported export format');
  }
};

const generatePDF = async (data: any) => {
  // Implement PDF generation using a library like PDFKit
  // This is a placeholder implementation
  return Buffer.from('PDF content');
};

const generateExcel = async (data: any) => {
  // Implement Excel generation using a library like ExcelJS
  // This is a placeholder implementation
  return Buffer.from('Excel content');
};

const generateCSV = async (data: any) => {
  // Implement CSV generation
  // This is a placeholder implementation
  return Buffer.from('CSV content');
};
