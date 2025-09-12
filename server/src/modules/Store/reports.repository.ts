/* eslint-disable camelcase */
import { literal, Op, QueryTypes } from 'sequelize';
import {
  Drug,
  PharmacyStore,
  Unit,
  DosageForm,
  Measurement,
  RoutesOfAdministration,
  PharmacyStoreHistory,
  Staff,
  Vendor,
  PrescribedDrug,
  Patient,
  Visit,
  InventoryItem,
  Inventory,
} from '../../database/models';
import sequelizeConnection from '../../database/config/config';
import {
  DashboardOverviewParams,
  DashboardOverviewResponse,
  InventoryMovementsParams,
  InventoryMovementsResponse,
  MovementHistoryParams,
  MovementHistoryResponse,
  AnalyticsParams,
  AnalyticsResponse,
  SalesPerformanceParams,
  SalesPerformanceResponse,
  ExpiryTrackingParams,
  ExpiryTrackingResponse,
  StockLevelsParams,
  StockLevelsResponse,
  RevenueAnalysisParams,
  RevenueAnalysisResponse,
  TrendsAnalysisParams,
  TrendsAnalysisResponse,
  StockDistribution,
  TimeSeriesDataPoint,
  SeasonalPattern,
  TrendMetrics,
  ExpiryTrend,
  WasteAnalysis,
} from './types/reports.types';
import { staffAttributes } from '../../core/helpers/helper';

/**
 * Get dashboard overview with key metrics
 */
export async function getDashboardOverview(
  params?: DashboardOverviewParams
): Promise<DashboardOverviewResponse> {
  try {
    // Get total inventory value
    const totalInventoryValueResult = await sequelizeConnection.query(
      'SELECT SUM(quantity_remaining * unit_price) as total_value FROM Pharmacy_Store_Items WHERE quantity_remaining > 0',
      { type: QueryTypes.SELECT }
    );
    const totalInventoryValue = (totalInventoryValueResult[0] as any)?.total_value || 0;

    // Get low stock count (items below 10% of received quantity)
    const lowStockCount = await PharmacyStore.count({
      where: {
        quantity_remaining: {
          [Op.lt]: literal('quantity_received * 0.1'),
        },
      },
    });

    // Get near expiry count (items expiring within 30 days)
    const nearExpiryCount = await PharmacyStore.count({
      where: {
        expiration: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
        },
      },
    });

    // Get monthly sales (current month)
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlySalesResult = await sequelizeConnection.query(
      `
      SELECT COALESCE(SUM(quantity_dispensed * ps.unit_price), 0) as monthly_sales
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      AND psh.createdAt BETWEEN :startOfMonth AND :endOfMonth
      `,
      {
        replacements: { startOfMonth, endOfMonth },
        type: QueryTypes.SELECT,
      }
    );

    const monthlySales = (monthlySalesResult[0] as any)?.monthly_sales || 0;

    // Get recent movements (last 10)
    const recentMovementsData = await PharmacyStoreHistory.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: PharmacyStore,
          as: 'store',
          include: [
            {
              model: Drug,
              attributes: ['name'],
            },
          ],
        },
        {
          model: Staff,
          as: 'dispenser',
          attributes: staffAttributes,
        },
      ],
    });

    // Map to RecentMovement interface
    const recentMovements = recentMovementsData.map((movement: any) => ({
      id: movement.id,
      action: movement.history_type,
      quantity_changed:
        movement.quantity_dispensed ||
        movement.quantity_supplied ||
        movement.quantity_returned ||
        0,
      createdAt: movement.createdAt,
      PharmacyStore: movement.store,
      Staff: movement.dispenser,
    }));

    return {
      totalInventoryValue: totalInventoryValue || 0,
      lowStockCount: lowStockCount || 0,
      nearExpiryCount: nearExpiryCount || 0,
      monthlySales: monthlySales || 0,
      recentMovements,
    };
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    throw new Error(`Failed to get dashboard overview: ${error.message}`);
  }
}

/**
 * Get pharmacy movement history with filtering and pagination
 */
export async function getMovementHistory(
  params?: MovementHistoryParams
): Promise<MovementHistoryResponse> {
  const {
    action,
    startDate,
    endDate,
    drugId,
    currentPage = 1,
    pageLimit = 10,
    sortBy = 'createdAt',
    order = 'DESC',
  } = params || {};

  try {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (action) {
      whereClause.history_type = action;
    }

    const includeClause: any = [
      {
        model: PharmacyStore,
        as: 'store',
        attributes: ['id', 'product_code', 'batch', 'quantity_remaining', 'unit_price', 'selling_price'],
        include: [
          {
            model: Drug,
            attributes: ['name'],
            where: drugId ? { id: drugId } : undefined,
          },
          {
            model: Unit,
            attributes: ['name'],
          },
          {
            model: DosageForm,
            attributes: ['name'],
          },
        ],
      },
      {
        model: Staff,
        as: 'dispenser',
        foreignKey: 'dispensed_by',
        attributes: staffAttributes,
      },
    ];

    const movements = await PharmacyStoreHistory.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: whereClause,
      include: includeClause,
      order: [[sortBy, order]],
    });

    // Get chart data for movements over time
    const chartDataQuery = `
      SELECT 
        DATE(createdAt) as date,
        history_type as action,
        SUM(CASE 
          WHEN history_type = 'dispensed' THEN quantity_dispensed 
          WHEN history_type = 'supplied' THEN quantity_supplied 
          WHEN history_type = 'returned' THEN quantity_returned 
          ELSE 0 END) as total_quantity
      FROM Pharmacy_Store_Histories
      WHERE createdAt >= :startDate AND createdAt <= :endDate
      ${
        drugId
          ? 'AND pharmacy_store_id IN (SELECT id FROM Pharmacy_Store_Items WHERE drug_id = :drugId)'
          : ''
      }
      GROUP BY DATE(createdAt), history_type
      ORDER BY date ASC
    `;

    const chartDataRaw = await sequelizeConnection.query(chartDataQuery, {
      replacements: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
        ...(drugId && { drugId }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to ChartDataPoint interface
    const chartData = (chartDataRaw as any[]).map((item: any) => ({
      date: item.date,
      action: item.action,
      total_quantity: item.total_quantity,
    }));

    return {
      rows: movements.docs,
      count: movements.total,
      chartData,
    };
  } catch (error) {
    console.error('Error in getMovementHistory:', error);
    throw new Error(`Failed to get movement history: ${error.message}`);
  }
}

/**
 * Get pharmacy analytics and reports
 */
export async function getPharmacyAnalytics(params?: AnalyticsParams): Promise<AnalyticsResponse> {
  const { period = 'monthly', startDate, endDate, groupBy = 'drug', vendorId } = params || {};

  try {
    const dateFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%u' : '%Y-%m';

    // Revenue data over time
    const revenueQuery = `
      SELECT 
        DATE_FORMAT(psh.createdAt, '${dateFormat}') as period,
        SUM(psh.quantity_dispensed * psh.selling_price) as revenue,
        SUM(psh.quantity_dispensed) as quantity_sold
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      ${vendorId ? 'AND ps.vendor_id = :vendorId' : ''}
      GROUP BY period
      ORDER BY period ASC
    `;

    const revenueDataRaw = await sequelizeConnection.query(revenueQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(vendorId && { vendorId }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to RevenueDataPoint interface
    const revenueData = (revenueDataRaw as any[]).map((item: any) => ({
      period: item.period,
      total_revenue: parseFloat(item.revenue) || 0,
      total_quantity: parseInt(item.quantity_sold) || 0,
    }));

    // Top performing drugs
    const topDrugsQuery = `
      SELECT 
        d.name as drug_name,
        SUM(psh.quantity_dispensed * psh.selling_price) as total_revenue,
        SUM(psh.quantity_dispensed) as total_quantity_sold,
        COUNT(DISTINCT psh.id) as transaction_count
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      JOIN Drugs d ON ps.drug_id = d.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      GROUP BY d.id, d.name
      ORDER BY total_revenue DESC
      LIMIT 20
    `;

    const topPerformingDrugs = await sequelizeConnection.query(topDrugsQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    // Vendor analysis
    const vendorAnalysisQuery = `
      SELECT 
        v.id as vendor_id,
        v.name as vendor_name,
        SUM(psh.quantity_dispensed * psh.selling_price) as total_revenue,
        SUM(psh.quantity_dispensed) as total_quantity_sold,
        AVG(psh.selling_price - ps.unit_price) as avg_profit_margin,
        COUNT(DISTINCT ps.drug_id) as unique_drugs_sold
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      JOIN Vendors v ON ps.vendor_id = v.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      GROUP BY v.id, v.name
      ORDER BY total_revenue DESC
    `;

    const vendorAnalysisRaw = await sequelizeConnection.query(vendorAnalysisQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to VendorAnalysis interface
    const vendorAnalysis = (vendorAnalysisRaw as any[]).map((item: any) => ({
      vendor_id: item.vendor_id || 0,
      vendor_name: item.vendor_name,
      total_revenue: parseFloat(item.total_revenue) || 0,
      total_quantity: parseInt(item.total_quantity_sold) || 0,
      drug_count: parseInt(item.unique_drugs_sold) || 0,
    }));

    // Total Revenue
    const totalRevenueQuery = `
      SELECT SUM(psh.quantity_dispensed * psh.selling_price) as total_revenue
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
    `;

    const totalRevenueResult = await sequelizeConnection.query(totalRevenueQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    const totalRevenue = (totalRevenueResult[0] as any)?.total_revenue || 0;

    // Period comparison logic
    let periodComparison: any = {
      current_period: 0,
      previous_period: 0,
      growth_rate: 0,
      trend: 'stable' as const,
    };

    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const periodDays = Math.ceil(
        (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate previous period dates
      const prevEndDate = new Date(startDateObj.getTime() - 24 * 60 * 60 * 1000);
      const prevStartDate = new Date(prevEndDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Get previous period revenue
      const prevRevenueQuery = `
        SELECT 
          SUM(psh.quantity_dispensed * psh.selling_price) as total_revenue,
          COUNT(DISTINCT psh.pharmacy_store_id) as items_sold
        FROM Pharmacy_Store_Histories psh
        JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
        WHERE psh.history_type = 'dispensed'
        AND psh.createdAt BETWEEN :prevStartDate AND :prevEndDate
      `;

      const prevRevenueResult = await sequelizeConnection.query(prevRevenueQuery, {
        replacements: { prevStartDate, prevEndDate },
        type: QueryTypes.SELECT,
      });

      const prevRevenue = (prevRevenueResult[0] as any)?.total_revenue || 0;

      periodComparison = {
        current_period: totalRevenue,
        previous_period: prevRevenue,
        growth_rate: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        trend: totalRevenue > prevRevenue ? 'up' : totalRevenue < prevRevenue ? 'down' : 'stable',
      };
    }

    return {
      revenueData,
      topPerformingDrugs,
      vendorAnalysis,
      totalRevenue,
      periodComparison,
    };
  } catch (error) {
    console.error('Error in getPharmacyAnalytics:', error);
    throw new Error(`Failed to get pharmacy analytics: ${error.message}`);
  }
}

/**
 * Get inventory movements with filtering and pagination
 */
export async function getInventoryMovements(
  params: InventoryMovementsParams
): Promise<InventoryMovementsResponse> {
  const {
    action,
    startDate,
    endDate,
    drugId,
    currentPage = 1,
    pageLimit = 10,
    sortBy = 'createdAt',
    order = 'DESC',
  } = params;
  try {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (action) {
      whereClause.history_type = action;
    }

    const includeClause: any = [
      {
        model: PharmacyStore,
        include: [
          {
            model: Drug,
            attributes: ['name'],
            where: drugId ? { id: drugId } : undefined,
          },
          {
            model: Unit,
            attributes: ['name'],
          },
          {
            model: DosageForm,
            attributes: ['name'],
          },
        ],
      },
      {
        model: Staff,
        as: 'dispenser',
        attributes: staffAttributes,
      },
    ];

    const movements = await PharmacyStoreHistory.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: whereClause,
      include: includeClause,
      order: [[sortBy, order]],
    });

    // Get chart data for movements over time
    const chartDataQuery = `
    SELECT 
      DATE(createdAt) as date,
      history_type,
      SUM(quantity_dispensed) as total_quantity
    FROM Pharmacy_Store_Histories
    WHERE createdAt >= :startDate AND createdAt <= :endDate
    ${
      drugId
        ? 'AND pharmacy_store_id IN (SELECT id FROM Pharmacy_Store_Items WHERE drug_id = :drugId)'
        : ''
    }
    GROUP BY DATE(createdAt), history_type
    ORDER BY date ASC
  `;

    const chartDataRaw = await sequelizeConnection.query(chartDataQuery, {
      replacements: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
        ...(drugId && { drugId }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to ChartDataPoint interface
    const chartData = (chartDataRaw as any[]).map((item: any) => ({
      date: item.date,
      action: item.action,
      total_quantity: item.total_quantity,
    }));

    return {
      rows: movements.docs,
      count: movements.total,
      chartData,
    };
  } catch (error) {
    console.error('Error in getInventoryMovements:', error);
    throw new Error(`Failed to get inventory movements: ${error.message}`);
  }
}

/**
 * Get sales performance data
 */
export async function getSalesPerformance(
  params: SalesPerformanceParams
): Promise<SalesPerformanceResponse> {
  const { period = 'monthly', startDate, endDate, groupBy = 'drug', vendorId } = params;
  try {
    const dateFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%u' : '%Y-%m';

    // Revenue data over time
    const revenueQuery = `
    SELECT 
      DATE_FORMAT(psh.createdAt, '${dateFormat}') as period,
      SUM(psh.quantity_dispensed * ps.selling_price) as revenue,
      SUM(psh.quantity_dispensed) as quantity_sold
    FROM Pharmacy_Store_Histories psh
    JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    WHERE psh.history_type = 'dispensed'
    ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
    ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
    ${vendorId ? 'AND ps.vendor_id = :vendorId' : ''}
    GROUP BY period
    ORDER BY period ASC
  `;

    const revenueDataRaw = await sequelizeConnection.query(revenueQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(vendorId && { vendorId }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to RevenueDataPoint interface
    const revenueData = (revenueDataRaw as any[]).map((item: any) => ({
      period: item.period,
      total_revenue: parseFloat(item.revenue) || 0,
      total_quantity: parseInt(item.quantity_sold) || 0,
    }));

    // Top performing drugs
    const topDrugsQuery = `
    SELECT 
      d.name as drug_name,
      SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue,
      SUM(psh.quantity_dispensed) as total_quantity_sold,
      COUNT(DISTINCT psh.id) as transaction_count
    FROM Pharmacy_Store_Histories psh
       JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    JOIN Drugs d ON ps.drug_id = d.id
    WHERE psh.history_type = 'dispensed'
    ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
    ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
    GROUP BY d.id, d.name
    ORDER BY total_revenue DESC
    LIMIT 20
  `;

    const topPerformingDrugs = await sequelizeConnection.query(topDrugsQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    // Vendor analysis
    const vendorAnalysisQuery = `
    SELECT 
      v.id as vendor_id,
      v.name as vendor_name,
      SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue,
      SUM(psh.quantity_dispensed) as total_quantity_sold,
      AVG(ps.selling_price - ps.unit_price) as avg_profit_margin,
      COUNT(DISTINCT ps.drug_id) as unique_drugs_sold
    FROM Pharmacy_Store_Histories psh
       JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    JOIN Vendors v ON ps.vendor_id = v.id
    WHERE psh.history_type = 'dispensed'
    ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
    ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
    GROUP BY v.id, v.name
    ORDER BY total_revenue DESC
  `;

    const vendorAnalysisRaw = await sequelizeConnection.query(vendorAnalysisQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    // Map to VendorAnalysis interface
    const vendorAnalysis = (vendorAnalysisRaw as any[]).map((item: any) => ({
      vendor_id: item.vendor_id || 0,
      vendor_name: item.vendor_name,
      total_revenue: parseFloat(item.total_revenue) || 0,
      total_quantity: parseInt(item.total_quantity_sold) || 0,
      drug_count: parseInt(item.unique_drugs_sold) || 0,
    }));

    // Total revenue
    const totalRevenueQuery = `
    SELECT SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue
    FROM Pharmacy_Store_Histories psh
    JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    WHERE psh.history_type = 'dispensed'
    ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
    ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
  `;

    const totalRevenueResult = await sequelizeConnection.query(totalRevenueQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      type: QueryTypes.SELECT,
    });

    const totalRevenue = (totalRevenueResult[0] as any)?.total_revenue || 0;

    // Period comparison logic
    let periodComparison: any = {
      current_period: 0,
      previous_period: 0,
      growth_rate: 0,
      trend: 'stable' as const,
    };
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const periodDays = Math.ceil(
        (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate previous period dates
      const prevEndDate = new Date(startDateObj.getTime() - 24 * 60 * 60 * 1000);
      const prevStartDate = new Date(prevEndDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Get previous period revenue
      const prevRevenueQuery = `
      SELECT 
        SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue,
        COUNT(DISTINCT psh.pharmacy_store_id) as items_sold
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      AND psh.createdAt BETWEEN :prevStartDate AND :prevEndDate
    `;

      const prevRevenueResult = await sequelizeConnection.query(prevRevenueQuery, {
        replacements: {
          prevStartDate: prevStartDate.toISOString().split('T')[0],
          prevEndDate: prevEndDate.toISOString().split('T')[0],
        },
        type: QueryTypes.SELECT,
      });

      const prevRevenue = (prevRevenueResult[0] as any)?.total_revenue || 0;
      const currentRevenue = totalRevenue || 0;

      const revenueChange = currentRevenue - prevRevenue;
      const revenueChangePercent = prevRevenue > 0 ? (revenueChange / prevRevenue) * 100 : 0;

      periodComparison = {
        current_period: currentRevenue,
        previous_period: prevRevenue,
        growth_rate: Math.round(revenueChangePercent * 100) / 100,
        trend: revenueChange > 0 ? 'increasing' : revenueChange < 0 ? 'decreasing' : 'stable',
      };
    }

    // Map topPerformingDrugs to TopDrug interface
    const topDrugs = (topPerformingDrugs as any[]).map((item: any) => ({
      drug_id: item.drug_id || 0,
      drug_name: item.drug_name || '',
      generic_name: item.name || '',
      total_revenue: parseFloat(item.total_revenue) || 0,
      total_quantity: parseInt(item.total_quantity) || 0,
    }));

    return {
      revenueData,
      topDrugs,
      vendorAnalysis,
      totalRevenue,
      periodComparison,
    };
  } catch (error) {
    console.error('Error in getSalesPerformance:', error);
    throw new Error(`Failed to get sales performance: ${error.message}`);
  }
}

/**
 * Get expiry tracking data
 */
export async function getExpiryTracking(
  params: ExpiryTrackingParams
): Promise<ExpiryTrackingResponse> {
  const { threshold = 30, startDate, endDate, currentPage = 1, pageLimit = 50 } = params;
  try {
    const currentDate = new Date();
    const futureDate = new Date(Date.now() + threshold * 24 * 60 * 60 * 1000);

    // Near expiry items
    const nearExpiryWhere: any = {
      expiration: {
        [Op.between]: [currentDate, futureDate],
      },
      quantity_remaining: {
        [Op.gt]: 0,
      },
    };

    const nearExpiryItemsData = await PharmacyStore.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: nearExpiryWhere,
      include: [
        {
          model: Drug,
          attributes: ['name', 'id'],
        },
        {
          model: Unit,
          attributes: ['name'],
        },
        {
          model: Vendor,
          attributes: ['name'],
        },
      ],
      order: [['expiration', 'ASC']],
    });

    // Map to ExpiryItem interface
    const nearExpiryItems = nearExpiryItemsData.docs.map((item: any) => ({
      id: item.id,
      drug_name: item.drug?.name || '',
      batch: item.batch || '',
      expiration: item.expiration,
      quantity_remaining: item.quantity_remaining,
      unit_price: parseFloat(item.unit_price) || 0,
      days_until_expiry: Math.ceil(
        (new Date(item.expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
      total_value: item.quantity_remaining * parseFloat(item.unit_price) || 0,
    }));

    // Expired items
    const expiredItemsData = await PharmacyStore.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: {
        expiration: {
          [Op.lt]: currentDate,
        },
        quantity_remaining: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: Drug,
          attributes: ['name'],
        },
        {
          model: Unit,
          attributes: ['name'],
        },
        {
          model: Vendor,
          attributes: ['name'],
        },
      ],
      order: [['expiration', 'DESC']],
    });

    // Map expired items to ExpiryItem interface
    const expiredItems = expiredItemsData.docs.map((item: any) => ({
      id: item.id,
      drug_name: item.drug?.name || 'Unknown',
      batch: item.batch || '',
      expiration: item.expiration,
      quantity_remaining: item.quantity_remaining,
      unit_price: parseFloat(item.unit_price) || 0,
      days_until_expiry: Math.ceil(
        (new Date(item.expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
      total_value: item.quantity_remaining * parseFloat(item.unit_price) || 0,
    }));

    // Waste analysis
    const wasteAnalysisQuery = `
    SELECT 
      SUM(quantity_remaining * unit_price) as total_waste_value,
      COUNT(*) as expired_items_count,
      AVG(DATEDIFF(CURDATE(), expiration)) as avg_days_expired
    FROM Pharmacy_Store_Items
    WHERE expiration < CURDATE() AND quantity_remaining > 0
  `;

    const wasteAnalysisResult = await sequelizeConnection.query(wasteAnalysisQuery, {
      type: QueryTypes.SELECT,
    });

    const totalWasteValue = expiredItems.reduce((sum, item) => sum + item.total_value, 0);

    const wasteAnalysis: WasteAnalysis = {
      total_expired_items: expiredItems.length,
      total_waste_value: totalWasteValue,
      most_wasted_drug: expiredItems.length > 0 ? expiredItems[0].drug_name : '',
      waste_by_category: [],
    };

    // Expiry trends
    const expiryTrendsQuery = `
    SELECT 
      DATE_FORMAT(expiration, '%Y-%m') as month,
      COUNT(*) as items_expiring,
      SUM(quantity_remaining * unit_price) as value_expiring
    FROM Pharmacy_Store_Items
    WHERE expiration BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH)
    AND quantity_remaining > 0
    GROUP BY month
    ORDER BY month ASC
  `;

    const expiryTrends = (await sequelizeConnection.query(expiryTrendsQuery, {
      type: QueryTypes.SELECT,
    })) as ExpiryTrend[];

    return {
      nearExpiryItems,
      expiredItems,
      wasteAnalysis,
      totalWasteValue: (wasteAnalysis as any)?.total_waste_value || 0,
      expiryTrends,
    };
  } catch (error) {
    console.error('Error in getExpiryTracking:', error);
    throw new Error(`Failed to get expiry tracking: ${error.message}`);
  }
}

/**
 * Get stock levels analysis
 */
export async function getStockLevels(params: StockLevelsParams): Promise<StockLevelsResponse> {
  const {
    threshold,
    sortBy = 'quantity_remaining',
    order = 'ASC',
    currentPage = 1,
    pageLimit = 50,
  } = params;
  try {
    const whereClause: any = {
      quantity_remaining: {
        [Op.gte]: 0,
      },
    };

    // Apply threshold filters
    if (threshold && threshold < 20) {
      whereClause.quantity_remaining = {
        [Op.lt]: literal('quantity_received * 0.2'),
      };
    } else if (threshold && threshold > 80) {
      whereClause.quantity_remaining = {
        [Op.gt]: literal('quantity_received * 0.8'),
      };
    }

    const stockLevels = await PharmacyStore.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: whereClause,
      include: [
        {
          model: Drug,
          attributes: ['name'],
        },
        {
          model: Unit,
          attributes: ['name'],
        },
        {
          model: Vendor,
          attributes: ['name'],
        },
      ],
      order: [[sortBy, order]],
    });

    // Low stock alerts
    const lowStockAlerts = await PharmacyStore.paginate({
      page: +currentPage,
      paginate: +pageLimit,
      where: {
        quantity_remaining: {
          [Op.lt]: literal('quantity_received * 0.1'),
        },
      },
      include: [
        {
          model: Drug,
          attributes: ['name'],
        },
        {
          model: Unit,
          attributes: ['name'],
        },
      ],
      order: [['quantity_remaining', 'ASC']],
    });

    // Stock distribution
    const stockDistributionQuery = `
    SELECT 
      CASE 
        WHEN quantity_remaining = 0 THEN 'Out of Stock'
        WHEN quantity_remaining < quantity_received * 0.2 THEN 'Low Stock'
        WHEN quantity_remaining > quantity_received * 0.8 THEN 'Overstocked'
        ELSE 'Adequate Stock'
      END as stock_status,
      COUNT(*) as item_count,
      SUM(quantity_remaining * unit_price) as total_value
    FROM Pharmacy_Store_Items
    GROUP BY stock_status
  `;

    const stockDistribution = (await sequelizeConnection.query(stockDistributionQuery, {
      type: QueryTypes.SELECT,
    })) as StockDistribution[];

    // Generate optimization recommendations based on stock analysis
    const optimizationRecommendations = [];
    // Analyze low stock alerts for recommendations
    for (const item of lowStockAlerts.docs) {
      const stockPercentage = (item.quantity_remaining / item.quantity_received) * 100;

      if (stockPercentage < 5) {
        optimizationRecommendations.push({
          type: 'urgent_reorder',
          priority: 'high',
          drugId: item.drug_id,
          drugName: item.drug?.name || 'Unknown',
          message: `Critical stock level: Only ${item.quantity_remaining} ${item.unit?.name ||
            'units'} remaining. Immediate reorder required.`,
          suggestedAction: 'Place emergency order',
          estimatedDaysLeft: Math.ceil(item.quantity_remaining / 10), // Assuming 10 units/day average usage
        });
      } else if (stockPercentage < 15) {
        optimizationRecommendations.push({
          type: 'reorder_soon',
          priority: 'medium',
          drugId: item.drug_id,
          drugName: item.drug?.name || 'Unknown',
          message: `Low stock level: ${item.quantity_remaining} ${item.unit?.name ||
            'units'} remaining. Consider reordering soon.`,
          suggestedAction: 'Schedule reorder within 3-5 days',
          estimatedDaysLeft: Math.ceil(item.quantity_remaining / 10),
        });
      }
    }

    // Analyze stock distribution for overstocking recommendations
    const overstockedItems = await PharmacyStore.findAll({
      where: {
        quantity_remaining: {
          [Op.gt]: literal('quantity_received * 0.9'),
        },
      },
      include: [
        {
          model: Drug,
          attributes: ['name'],
        },
        {
          model: Unit,
          attributes: ['name'],
        },
      ],
      limit: 10,
    });

    for (const item of overstockedItems) {
      const stockPercentage = (item.quantity_remaining / item.quantity_received) * 100;

      if (stockPercentage > 90) {
        optimizationRecommendations.push({
          type: 'reduce_ordering',
          priority: 'low',
          drugId: item.drug_id,
          drugName: item.drug?.name || 'Unknown',
          message: `Overstocked item: ${stockPercentage.toFixed(
            1
          )}% of original quantity remaining. Consider reducing next order.`,
          suggestedAction: 'Reduce next order quantity by 20-30%',
          currentStock: item.quantity_remaining,
        });
      }
    }

    // Add general recommendations based on overall stock health
    const totalItems = stockLevels.docs?.length || 0;
    const lowStockCount = lowStockAlerts.docs.length;
    const lowStockPercentage = totalItems > 0 ? (lowStockCount / totalItems) * 100 : 0;

    if (lowStockPercentage > 20) {
      optimizationRecommendations.push({
        type: 'inventory_management',
        priority: 'medium',
        message: `${lowStockPercentage.toFixed(
          1
        )}% of inventory items are running low. Consider reviewing reorder policies.`,
        suggestedAction: 'Review and optimize reorder points and quantities',
        affectedItems: lowStockCount,
      });
    }

    return {
      stockLevels: stockLevels.docs,
      lowStockAlerts: lowStockAlerts.docs,
      optimizationRecommendations,
      stockDistribution,
    };
  } catch (error) {
    console.error('Error in getStockLevels:', error);
    throw new Error(`Failed to get stock levels: ${error.message}`);
  }
}

/**
 * Get revenue analysis data
 */
export async function getRevenueAnalysis(
  params: RevenueAnalysisParams
): Promise<RevenueAnalysisResponse> {
  const { startDate, endDate, drugId, vendorId, categoryId } = params;
  try {
    // Revenue by period query
    const revenueByPeriodQuery = `
      SELECT 
        DATE(psh.createdAt) as date,
        SUM(psh.quantity_dispensed * ps.selling_price) as daily_revenue,
        SUM(psh.quantity_dispensed) as units_sold,
        COUNT(DISTINCT ps.drug_id) as unique_drugs_sold
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      ${drugId ? 'AND ps.drug_id = :drugId' : ''}
      ${vendorId ? 'AND ps.vendor_id = :vendorId' : ''}
      GROUP BY DATE(psh.createdAt)
      ORDER BY date DESC
    `;

    const revenueData = await sequelizeConnection.query(revenueByPeriodQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(drugId && { drugId }),
        ...(vendorId && { vendorId }),
        ...(categoryId && { categoryId }),
      },
      type: QueryTypes.SELECT,
    });

    // Total revenue calculation
    const totalRevenueQuery = `
      SELECT 
        SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue,
        SUM(psh.quantity_dispensed * ps.unit_price) as total_cost,
        SUM(psh.quantity_dispensed) as total_units_sold,
        COUNT(DISTINCT ps.drug_id) as total_unique_drugs
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      ${drugId ? 'AND ps.drug_id = :drugId' : ''}
      ${vendorId ? 'AND ps.vendor_id = :vendorId' : ''}
      ${categoryId ? 'AND ps.category_id = :categoryId' : ''}
    `;

    const totalRevenueResult = await sequelizeConnection.query(totalRevenueQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(drugId && { drugId }),
        ...(vendorId && { vendorId }),
        ...(categoryId && { categoryId }),
      },
      type: QueryTypes.SELECT,
    });

    const totals = totalRevenueResult[0];
    const totalRevenue = parseFloat((totals as any).total_revenue) || 0;
    const totalCost = parseFloat((totals as any).total_cost) || 0;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Top performing drugs by revenue
    const topDrugsQuery = `
      SELECT 
        d.name as drug_name,
        d.id as drug_id,
        SUM(psh.quantity_dispensed * ps.selling_price) as revenue,
        SUM(psh.quantity_dispensed) as units_sold,
        AVG(ps.selling_price) as avg_selling_price
      FROM Pharmacy_Store_Histories psh
        JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      JOIN Drug d ON ps.drug_id = d.id
      WHERE psh.history_type = 'dispensed'
      ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
      ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
      ${drugId ? 'AND ps.drug_id = :drugId' : ''}
      ${vendorId ? 'AND ps.vendor_id = :vendorId' : ''}
      ${categoryId ? 'AND ps.category_id = :categoryId' : ''}
      GROUP BY d.id, d.name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const topDrugs = await sequelizeConnection.query(topDrugsQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(drugId && { drugId }),
        ...(vendorId && { vendorId }),
        ...(categoryId && { categoryId }),
      },
      type: QueryTypes.SELECT,
    });

    return {
      revenueData: revenueData.map((item: any) => ({
        date: (item as any).date,
        revenue: parseFloat((item as any).daily_revenue) || 0,
        unitsSold: parseInt((item as any).units_sold) || 0,
        uniqueDrugsSold: parseInt((item as any).unique_drugs_sold) || 0,
      })),
      totalRevenue,
    };
  } catch (error) {
    console.error('Error in getRevenueAnalysis:', error);
    throw new Error(`Failed to get revenue analysis: ${error.message}`);
  }
}

/**
 * Get trends analysis data
 */
export async function getTrendsAnalysis(
  params: TrendsAnalysisParams
): Promise<TrendsAnalysisResponse> {
  const { period = 'monthly', startDate, endDate, drugId, categoryId } = params;
  try {
    const dateFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%u' : '%Y-%m';

    // Time series data
    const timeSeriesQuery = `
    SELECT 
      DATE_FORMAT(psh.createdAt, '${dateFormat}') as period,
      SUM(CASE WHEN psh.history_type = 'dispensed' THEN psh.quantity_dispensed ELSE 0 END) as dispensed,
      SUM(CASE WHEN psh.history_type = 'received' THEN psh.quantity_dispensed ELSE 0 END) as received,
      SUM(CASE WHEN psh.history_type = 'dispensed' THEN psh.quantity_dispensed * ps.selling_price ELSE 0 END) as revenue
    FROM Pharmacy_Store_Histories psh
     JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    WHERE 1=1
    ${startDate ? 'AND psh.createdAt >= :startDate' : ''}
    ${endDate ? 'AND psh.createdAt <= :endDate' : ''}
    ${drugId ? 'AND ps.drug_id = :drugId' : ''}
    GROUP BY period
    ORDER BY period ASC
  `;

    const timeSeriesData = (await sequelizeConnection.query(timeSeriesQuery, {
      replacements: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(drugId && { drugId }),
      },
      type: QueryTypes.SELECT,
    })) as TimeSeriesDataPoint[];

    // Seasonal patterns (monthly aggregation over years)
    const seasonalPatternsQuery = `
    SELECT 
      daily_dispensed.month,
      MONTHNAME(STR_TO_DATE(daily_dispensed.month, '%m')) as month_name,
      AVG(daily_dispensed.total_dispensed) as avg_daily_dispensed,
      AVG(daily_revenue.total_revenue) as avg_daily_revenue
    FROM (
      SELECT 
        DATE(createdAt) as date,
        MONTH(createdAt) as month,
        SUM(quantity_dispensed) as total_dispensed
      FROM Pharmacy_Store_Histories
      WHERE history_type = 'dispensed'
      GROUP BY DATE(createdAt), MONTH(createdAt)
    ) daily_dispensed
    JOIN (
      SELECT 
        DATE(psh.createdAt) as date,
        SUM(psh.quantity_dispensed * ps.selling_price) as total_revenue
      FROM Pharmacy_Store_Histories psh
      JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
      WHERE psh.history_type = 'dispensed'
      GROUP BY DATE(psh.createdAt)
    ) daily_revenue ON daily_dispensed.date = daily_revenue.date
    GROUP BY daily_dispensed.month
    ORDER BY daily_dispensed.month
  `;

    const seasonalPatterns = (await sequelizeConnection.query(seasonalPatternsQuery, {
      type: QueryTypes.SELECT,
    })) as SeasonalPattern[];

    // Trend metrics
    const trendMetricsQuery = `
    SELECT 
      AVG(quantity_remaining) as avg_stock_level,
      STDDEV(quantity_remaining) as stock_volatility,
      COUNT(DISTINCT drug_id) as unique_drugs,
      SUM(quantity_remaining * unit_price) as total_inventory_value
    FROM Pharmacy_Store_Items
    WHERE quantity_remaining > 0
  `;

    const trendMetricsResult = await sequelizeConnection.query(trendMetricsQuery, {
      type: QueryTypes.SELECT,
    });

    const trendMetrics = (trendMetricsResult[0] as TrendMetrics) || {
      avg_stock_level: 0,
      stock_volatility: 0,
      unique_drugs: 0,
      total_inventory_value: 0,
    };

    // Generate predictive insights based on historical data
    const predictiveInsights = [];

    if (timeSeriesData.length >= 3) {
      // Calculate trend direction and velocity
      const recentPeriods = timeSeriesData.slice(-3);
      const revenues = recentPeriods.map(period => Number(period.revenue) || 0);
      const dispensedQuantities = recentPeriods.map(period => Number(period.dispensed) || 0);

      // Revenue trend analysis
      const revenueGrowthRates = [];
      for (let i = 1; i < revenues.length; i++) {
        if (revenues[i - 1] > 0) {
          const growthRate = ((revenues[i] - revenues[i - 1]) / revenues[i - 1]) * 100;
          revenueGrowthRates.push(growthRate);
        }
      }

      if (revenueGrowthRates.length > 0) {
        const avgGrowthRate =
          revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) / revenueGrowthRates.length;
        const lastRevenue = revenues[revenues.length - 1];
        const projectedRevenue = lastRevenue * (1 + avgGrowthRate / 100);

        predictiveInsights.push({
          type: 'revenue_forecast',
          category: 'financial',
          confidence: revenueGrowthRates.length >= 2 ? 'medium' : 'low',
          insight: `Based on recent trends, next period revenue is projected to be $${projectedRevenue.toFixed(
            2
          )}`,
          data: {
            currentRevenue: lastRevenue,
            projectedRevenue: projectedRevenue.toFixed(2),
            growthRate: avgGrowthRate.toFixed(2),
            trend: avgGrowthRate > 0 ? 'increasing' : avgGrowthRate < 0 ? 'decreasing' : 'stable',
          },
        });
      }

      // Demand pattern analysis
      const avgDispensed =
        dispensedQuantities.reduce((sum, qty) => sum + qty, 0) / dispensedQuantities.length;
      const lastDispensed = dispensedQuantities[dispensedQuantities.length - 1];

      if (lastDispensed > avgDispensed * 1.2) {
        predictiveInsights.push({
          type: 'demand_spike',
          category: 'inventory',
          confidence: 'medium',
          insight: `Current demand is ${((lastDispensed / avgDispensed - 1) * 100).toFixed(
            1
          )}% above average. Consider increasing stock levels.`,
          data: {
            currentDemand: lastDispensed,
            averageDemand: avgDispensed.toFixed(2),
            demandIncrease: ((lastDispensed / avgDispensed - 1) * 100).toFixed(1),
          },
        });
      } else if (lastDispensed < avgDispensed * 0.8) {
        predictiveInsights.push({
          type: 'demand_decline',
          category: 'inventory',
          confidence: 'medium',
          insight: `Current demand is ${((1 - lastDispensed / avgDispensed) * 100).toFixed(
            1
          )}% below average. Consider reducing next orders.`,
          data: {
            currentDemand: lastDispensed,
            averageDemand: avgDispensed.toFixed(2),
            demandDecrease: ((1 - lastDispensed / avgDispensed) * 100).toFixed(1),
          },
        });
      }
    }

    // Seasonal insights from patterns
    if (seasonalPatterns.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentSeasonData = seasonalPatterns.find(pattern => pattern.month === currentMonth);
      const avgMonthlyRevenue =
        seasonalPatterns.reduce((sum, pattern) => sum + Number(pattern.avg_daily_revenue || 0), 0) /
        seasonalPatterns.length;

      if (currentSeasonData) {
        const currentMonthRevenue = Number(currentSeasonData.avg_daily_revenue || 0);

        if (currentMonthRevenue > avgMonthlyRevenue * 1.15) {
          predictiveInsights.push({
            type: 'seasonal_peak',
            category: 'seasonal',
            confidence: 'high',
            insight: `This month typically shows ${(
              (currentMonthRevenue / avgMonthlyRevenue - 1) *
              100
            ).toFixed(1)}% higher revenue than average. Ensure adequate stock levels.`,
            data: {
              monthName: currentSeasonData.month_name,
              expectedIncrease: ((currentMonthRevenue / avgMonthlyRevenue - 1) * 100).toFixed(1),
            },
          });
        } else if (currentMonthRevenue < avgMonthlyRevenue * 0.85) {
          predictiveInsights.push({
            type: 'seasonal_low',
            category: 'seasonal',
            confidence: 'high',
            insight: `This month typically shows ${(
              (1 - currentMonthRevenue / avgMonthlyRevenue) *
              100
            ).toFixed(1)}% lower revenue than average. Optimize inventory accordingly.`,
            data: {
              monthName: currentSeasonData.month_name,
              expectedDecrease: ((1 - currentMonthRevenue / avgMonthlyRevenue) * 100).toFixed(1),
            },
          });
        }
      }
    }

    // Stock volatility insights
    const stockVolatility = Number(trendMetrics.stock_volatility || 0);
    const avgStockLevel = Number(trendMetrics.avg_stock_level || 0);

    if (stockVolatility > avgStockLevel * 0.3) {
      predictiveInsights.push({
        type: 'high_volatility',
        category: 'risk',
        confidence: 'medium',
        insight:
          'High stock level volatility detected. Consider implementing more consistent ordering patterns.',
        data: {
          volatilityRatio: (stockVolatility / avgStockLevel).toFixed(2),
          recommendation: 'Implement automated reorder points',
        },
      });
    }

    return {
      timeSeriesData,
      seasonalPatterns,
      predictiveInsights,
      trendMetrics,
    };
  } catch (error) {
    console.error('Error in getTrendsAnalysis:', error);
    throw new Error(`Failed to get trends analysis: ${error.message}`);
  }
}
