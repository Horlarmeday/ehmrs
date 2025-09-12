/* eslint-disable camelcase */
import {
  createCashItem,
  createLaboratoryItem,
  createNHISItem,
  createPrivateItem,
  createVendor,
  dispensePharmacyItems,
  findPharmacyStoreItems,
  getAllPharmacyStoreItems,
  getLaboratoryItems,
  getOnePharmacyStoreItem,
  getPharmacyItemByDrugId,
  getPharmacyStoreItemById,
  getPharmacyStoreItemHistory,
  getPharmacyStoreItemLogs,
  getPharmacyStoreItems,
  getVendors,
  reorderPharmacyItems,
  resetPharmacyStoreItemsQuantities,
  searchLaboratoryItems,
  searchPharmacyStoreItems,
  updatePharmacyStoreItem,
  updatePharmacyStoreItems,
  updateVendor,
  getInventoryReports,
  getDispenseReports,
  getExpiryReports,
  getStockLevelReports,
  getVendorPerformanceReports,
} from './store.repository';
import { splitSort } from '../../core/helpers/helper';
import { LaboratoryStore, PharmacyStore } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import {
  ITEM_EXISTS_CASH,
  ITEM_EXISTS_NHIS,
  ITEM_EXISTS_PRIVATE,
} from '../Inventory/messages/response-messages';
import { ItemsToReorder } from './types/pharmacy-item.types';
import { DrugType } from '../../database/models/pharmacyStore';
import { Status } from '../../database/models/staff';
import { VendorPerformance, StockLevelItem, ExpiryReportItem, DispenseReportItem } from './types/reports.types';

class StoreService {
  /**
   * add item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createPharmacyItemService(body): Promise<PharmacyStore> {
    const { create_cash_item, create_nhis_item, drug_id, create_private_item } = body;
    let item: PharmacyStore;
    await this.pharmacyStoreValidations(
      drug_id,
      create_cash_item,
      create_nhis_item,
      create_private_item
    );

    if (create_cash_item) item = await createCashItem(body);
    if (create_nhis_item) item = await createNHISItem(body);
    if (create_private_item) item = await createPrivateItem(body);
    return item;
  }

  /**
   * get pharmacy items
   *
   * @static
   * @returns {json} json object with pharmacy items data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyItems(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search, sort, filter } = body;
    if (search) {
      return searchPharmacyStoreItems(currentPage, pageLimit, search);
    }

    if (sort) {
      const { sort_by, order } = splitSort(sort);
      return getPharmacyStoreItems({ currentPage, pageLimit, sort_by, order });
    }

    if (filter && Object.values(JSON.parse(filter)).filter(Boolean)?.length) {
      return getPharmacyStoreItems({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPharmacyStoreItems({ currentPage, pageLimit });
    }

    return getPharmacyStoreItems({});
  }

  /**
   * get an item from the store via its Id
   * @param storeId
   */
  static async getPharmacyStoreItem(storeId: number) {
    const item = await getPharmacyStoreItemById(storeId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  /**
   * get an item from the store the drug ID
   * @param drugId
   */
  async getPharmacyStoreItemByDrugId(drugId: number) {
    const item = await getPharmacyItemByDrugId(drugId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  /**
   * Reorder pharmacy store
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param items
   * @param staff_id
   */
  static async reorderPharmacyStoreItems(items: ItemsToReorder[], staff_id: number): Promise<void> {
    return reorderPharmacyItems(items, staff_id);
  }

  static async dispenseItemsFromStore(items: ItemsToDispensedBody[], staff_id: number) {
    return dispensePharmacyItems(items, staff_id);
  }

  /**
   * get pharmacy item history
   *
   * @static
   * @returns {json} json object with pharmacy item history data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyStoreItemHistory(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, filter, storeId } = body;

    if (filter) {
      return getPharmacyStoreItemHistory({ currentPage, pageLimit, filter, storeId });
    }

    if (Object.values(body).length) {
      return getPharmacyStoreItemHistory({ currentPage, pageLimit, storeId });
    }

    return getPharmacyStoreItemHistory({ storeId });
  }

  /**
   * update pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param items
   */
  static async updatePharmacyStoreItems(items: Partial<PharmacyStore>[], staffId: number) {
    return updatePharmacyStoreItems(items, staffId);
  }

  /**
   * deactivate pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item data
   * @memberOf StoreService
   * @param items
   */
  static async deactivatePharmacyStoreItems(items: number[]) {
    return updatePharmacyStoreItem({ id: items }, { status: Status.INACTIVE });
  }

  /**
   * get pharmacy item logs
   *
   * @static
   * @returns {json} json object with pharmacy item logs data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyStoreItemLogs(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, storeId } = body;

    if (Object.values(body).length) {
      return getPharmacyStoreItemLogs({ currentPage, pageLimit, storeId });
    }

    return getPharmacyStoreItemLogs({ storeId });
  }

  /**
   * get pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy items data
   * @memberOf StoreService
   * @param itemIds
   */
  static async getPharmacyStoreItems(itemIds: number[]) {
    const items = await findPharmacyStoreItems(itemIds);
    return items;
  }

  /**
   * Export pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param selectedItemsId
   * @param selectAll
   */
  static async exportData(selectedItemsId: number[], selectAll: boolean) {
    let items;
    if (selectAll) {
      items = await getAllPharmacyStoreItems();
    } else {
      items = await findPharmacyStoreItems(selectedItemsId);
    }
    const headers = [
      [
        'Drug',
        'Product Code',
        'Voucher',
        'Batch',
        'Quantity Last Received',
        'Quantity Remaining',
        'Unit Price',
        'Selling Price',
        'Expiry Date',
        'Strength',
        'Drug Type',
      ],
    ];
    return { headers, mappedData: this.mapExportedData(items) };
  }

  /**
   * reset pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item data
   * @memberOf StoreService
   */
  static async resetPharmacyStoreItemsQuantities() {
    return resetPharmacyStoreItemsQuantities();
  }

  /**
   * Create a pharmacy vendor
   * @param body
   * @param staff_id
   */
  static async createVendor(body, staff_id: number) {
    return createVendor(body, staff_id);
  }

  /**
   * Update a pharmacy vendor
   * @param body
   * @param vendorId
   */
  static async updateVendor(body, vendorId: number) {
    return updateVendor(vendorId, body);
  }

  /**
   * get pharmacy vendors
   *
   * @static
   * @returns json object with pharmacy item logs data
   * @param body
   * @memberOf StoreService
   */
  static async getVendors(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit } = body;

    if (Object.values(body).length) {
      return getVendors(currentPage, pageLimit);
    }

    return getVendors();
  }

  private static mapExportedData(items: PharmacyStore[]) {
    return items.map(item => ({
      drug: item?.drug?.name || '-',
      productCode: item.product_code || '-',
      voucher: item.voucher || '-',
      batch: item.batch || '-',
      quantityReceived: `${item.quantity_received} ${item?.unit?.name}` || '-',
      quantityRemaining: `${item.quantity_remaining} ${item.unit.name}` || '-',
      unitPrice: item.unit_price || '-',
      sellingPrice: item.selling_price || '-',
      expiryDate: item.expiration?.toLocaleDateString() || '-',
      strength: item.strength_input ? `${item?.strength_input} ${item?.strength?.name}` : '-',
      drugType: item.drug_type || '-',
    }));
  }

  private static async pharmacyStoreValidations(
    drugId: number,
    create_cash_item: boolean,
    create_nhis_item: boolean,
    create_private_item: boolean
  ) {
    const [cashItem, nhisItem, privateItem] = await Promise.all([
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.CASH }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.NHIS }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.PRIVATE }),
    ]);

    if (cashItem && create_cash_item) throw new BadException('Invalid', 400, ITEM_EXISTS_CASH);
    if (nhisItem && create_nhis_item) throw new BadException('Invalid', 400, ITEM_EXISTS_NHIS);
    if (privateItem && create_private_item)
      throw new BadException('Invalid', 400, ITEM_EXISTS_PRIVATE);
  }

  /**************************
   * LABORATORY STORE
   *************************/

  /**
   * add laboratory item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createLaboratoryItemService(body): Promise<LaboratoryStore> {
    return createLaboratoryItem(body);
  }

  /**
   * get laboratory items
   *
   * @static
   * @returns {json} json object with laboratory items data
   * @param body
   * @memberOf StoreService
   */
  static async getLaboratoryItems(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchLaboratoryItems(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getLaboratoryItems(+currentPage, +pageLimit);
    }

    return getLaboratoryItems();
  }

  /** ***********************
   * PHARMACY REPORTS
   ********************** */

  /**
   * Get inventory reports with trend analysis
   * @param filters - Filter options for the report
   * @returns {Promise} Processed inventory report data with trends
   */
  static async getInventoryReportsService(filters: {
    startDate?: string;
    endDate?: string;
    drugId?: number;
    vendorId?: number;
    drugType?: string;
  }) {
    const rawData = await getInventoryReports(filters);
    
    // Calculate summary statistics
    const summary = {
      totalItems: rawData.length,
      totalValue: rawData.reduce((sum, item) => sum + (item.total_price || 0), 0),
      totalQuantityReceived: rawData.reduce((sum, item) => sum + (item.quantity_received || 0), 0),
      totalQuantityRemaining: rawData.reduce((sum, item) => sum + (item.quantity_remaining || 0), 0),
      totalRevenue: rawData.reduce((sum, item) => sum + ((item.selling_price || 0) * (item.quantity_received || 0)), 0),
      averageUnitPrice: rawData.length > 0 ? rawData.reduce((sum, item) => sum + (item.unit_price || 0), 0) / rawData.length : 0,
    };

    // Group by drug type for analysis
    const byDrugType = rawData.reduce((acc, item) => {
      const type = item.drug_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[type].count += 1;
      acc[type].totalValue += item.total_price || 0;
      acc[type].totalQuantity += item.quantity_remaining || 0;
      return acc;
    }, {});

    // Group by vendor for analysis
    const byVendor = rawData.reduce((acc, item) => {
      const vendorName = item.vendor?.name || 'Unknown';
      if (!acc[vendorName]) {
        acc[vendorName] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[vendorName].count += 1;
      acc[vendorName].totalValue += item.total_price || 0;
      acc[vendorName].totalQuantity += item.quantity_remaining || 0;
      return acc;
    }, {});

    return {
      data: rawData,
      summary,
      analytics: {
        byDrugType,
        byVendor,
      },
    };
  }

  /**
   * Get dispense reports with trend analysis
   * @param filters - Filter options for the report
   * @returns {Promise} Processed dispense report data with trends
   */
  static async getDispenseReportsService(filters: {
    startDate?: string;
    endDate?: string;
    drugId?: number;
    inventoryId?: number;
    dispensedBy?: number;
  }) {
    const rawData = await getDispenseReports(filters) as any[];
    
    // Calculate summary statistics
    const summary = {
      totalDispenses: rawData.length,
      totalQuantityDispensed: rawData.reduce((sum, item) => sum + (item.quantity_dispensed || 0), 0),
      totalRevenue: rawData.reduce((sum, item) => sum + (item.total_amount || 0), 0),
      averageDispenseValue: rawData.length > 0 ? rawData.reduce((sum, item) => sum + (item.total_amount || 0), 0) / rawData.length : 0,
    };

    // Group by date for trend analysis
    const dailyTrends = rawData.reduce((acc, item) => {
      const date = new Date(item.history_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, totalQuantity: 0, totalRevenue: 0 };
      }
      acc[date].count += 1;
      acc[date].totalQuantity += item.quantity_dispensed || 0;
      acc[date].totalRevenue += item.total_amount || 0;
      return acc;
    }, {});

    // Group by drug for analysis
    const byDrug = rawData.reduce((acc, item) => {
      const drugName = item.PharmacyStore?.Drug?.name || 'Unknown';
      if (!acc[drugName]) {
        acc[drugName] = { count: 0, totalQuantity: 0, totalRevenue: 0 };
      }
      acc[drugName].count += 1;
      acc[drugName].totalQuantity += item.quantity_dispensed || 0;
      acc[drugName].totalRevenue += item.total_amount || 0;
      return acc;
    }, {});

    return {
      data: rawData,
      summary,
      analytics: {
        dailyTrends,
        byDrug,
      },
    };
  }

  /**
   * Get expiry tracking reports with risk analysis
   * @param filters - Filter options for the report
   * @returns {Promise} Processed expiry report data with risk analysis
   */
  static async getExpiryReportsService(filters: {
    daysToExpiry?: number;
    includeExpired?: boolean;
    drugId?: number;
    vendorId?: number;
  }) {
    const rawData = await getExpiryReports(filters) as any[];
    
    // Calculate summary statistics
    const summary = {
      totalItems: rawData.length,
      totalPotentialLoss: rawData.reduce((sum, item) => sum + (item.potential_loss_value || 0), 0),
      totalQuantityAtRisk: rawData.reduce((sum, item) => sum + (item.quantity_remaining || 0), 0),
    };

    // Categorize by expiry risk
    const riskCategories = rawData.reduce((acc, item) => {
      const daysToExpiry = item.days_to_expiry || 0;
      let category;
      
      if (daysToExpiry < 0) category = 'expired';
      else if (daysToExpiry <= 7) category = 'critical';
      else if (daysToExpiry <= 30) category = 'warning';
      else category = 'normal';

      if (!acc[category]) {
        acc[category] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[category].count += 1;
      acc[category].totalValue += item.potential_loss_value || 0;
      acc[category].totalQuantity += item.quantity_remaining || 0;
      return acc;
    }, {});

    // Group by vendor for accountability
    const byVendor = rawData.reduce((acc, item) => {
      const vendorName = item.Vendor?.name || 'Unknown';
      if (!acc[vendorName]) {
        acc[vendorName] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[vendorName].count += 1;
      acc[vendorName].totalValue += item.potential_loss_value || 0;
      acc[vendorName].totalQuantity += item.quantity_remaining || 0;
      return acc;
    }, {});

    return {
      data: rawData,
      summary,
      analytics: {
        riskCategories,
        byVendor,
      },
    };
  }

  /**
   * Get stock level analysis reports
   * @param filters - Filter options for the report
   * @returns {Promise} Processed stock level report data
   */
  static async getStockLevelReportsService(filters: {
    threshold?: 'low' | 'adequate' | 'overstocked';
    drugId?: number;
    vendorId?: number;
    sortBy?: 'quantity' | 'value' | 'turnover';
    order?: 'ASC' | 'DESC';
  }) {
    const rawData = await getStockLevelReports(filters) as any[];
    
    // Calculate summary statistics
    const summary = {
      totalDrugs: rawData.length,
      totalStockValue: rawData.reduce((sum, item) => sum + (item.total_value || 0), 0),
      totalQuantity: rawData.reduce((sum, item) => sum + (item.total_quantity || 0), 0),
      averageTurnoverRate: rawData.length > 0 ? rawData.reduce((sum, item) => sum + (item.turnover_rate || 0), 0) / rawData.length : 0,
    };

    // Group by stock status
    const stockStatusSummary = rawData.reduce((acc, item) => {
      const status = item.stock_status || 'unknown';
      if (!acc[status]) {
        acc[status] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[status].count += 1;
      acc[status].totalValue += item.total_value || 0;
      acc[status].totalQuantity += item.total_quantity || 0;
      return acc;
    }, {});

    // Identify fast and slow moving items
    const sortedByTurnover = [...rawData].sort((a, b) => (b.turnover_rate || 0) - (a.turnover_rate || 0));
    const fastMoving = sortedByTurnover.slice(0, Math.ceil(rawData.length * 0.2)); // Top 20%
    const slowMoving = sortedByTurnover.slice(-Math.ceil(rawData.length * 0.2)); // Bottom 20%

    return {
      data: rawData,
      summary,
      analytics: {
        stockStatusSummary,
        fastMovingItems: fastMoving,
        slowMovingItems: slowMoving,
      },
    };
  }

  /**
   * Get vendor performance reports with analysis
   * @param filters - Filter options for the report
   * @returns {Promise} Processed vendor performance report data
   */
  static async getVendorPerformanceReportsService(filters: {
    startDate?: string;
    endDate?: string;
    vendorId?: number;
    sortBy?: 'revenue' | 'quantity' | 'reliability';
    order?: 'ASC' | 'DESC';
  }) {
    const rawData = await getVendorPerformanceReports(filters) as any[];
    
    // Calculate summary statistics
    const summary = {
      totalVendors: rawData.length,
      totalPurchaseValue: rawData.reduce((sum, item) => sum + (item.total_purchase_value || 0), 0),
      totalRevenueGenerated: rawData.reduce((sum, item) => sum + (item.total_revenue_generated || 0), 0),
      averageReliabilityScore: rawData.length > 0 ? rawData.reduce((sum, item) => sum + (item.reliability_score || 0), 0) / rawData.length : 0,
      totalExpiredItems: rawData.reduce((sum, item) => sum + (item.expired_items_count || 0), 0),
    };

    // Categorize vendors by performance
    const performanceCategories = rawData.reduce((acc, vendor) => {
      const reliabilityScore = vendor.reliability_score || 0;
      let category;
      
      if (reliabilityScore >= 90) category = 'excellent';
      else if (reliabilityScore >= 75) category = 'good';
      else if (reliabilityScore >= 60) category = 'average';
      else category = 'poor';

      if (!acc[category]) {
        acc[category] = { count: 0, totalRevenue: 0, totalPurchaseValue: 0 };
      }
      acc[category].count += 1;
      acc[category].totalRevenue += vendor.total_revenue_generated || 0;
      acc[category].totalPurchaseValue += vendor.total_purchase_value || 0;
      return acc;
    }, {});

    // Identify top and bottom performers
    const sortedByRevenue = [...rawData].sort((a, b) => (b.total_revenue_generated || 0) - (a.total_revenue_generated || 0));
    const topPerformers = sortedByRevenue.slice(0, Math.min(5, rawData.length));
    const bottomPerformers = sortedByRevenue.slice(-Math.min(5, rawData.length));

    return {
      data: rawData,
      summary,
      analytics: {
        performanceCategories,
        topPerformers,
        bottomPerformers,
      },
    };
  }
}
export default StoreService;
