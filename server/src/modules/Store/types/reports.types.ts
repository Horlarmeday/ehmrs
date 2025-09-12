/* eslint-disable camelcase */

// Base interfaces for common data structures
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  currentPage?: number;
  pageLimit?: number;
}

export interface SortParams {
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

// Dashboard Overview Interfaces
export interface DashboardOverviewParams {
  // No specific parameters needed for dashboard overview
}

export interface RecentMovement {
  id: number;
  action: string;
  quantity_dispensed?: number;
  quantity_supplied?: number;
  quantity_returned?: number;
  createdAt: Date;
  PharmacyStore: {
    Drug: {
      name: string;
    };
  };
  Staff: {
    firstname: string;
    lastname: string;
  };
}

export interface DashboardOverviewResponse {
  totalInventoryValue: number;
  lowStockCount: number;
  nearExpiryCount: number;
  monthlySales: number;
  recentMovements: RecentMovement[];
}

// Inventory Movements Interfaces
export interface InventoryMovementsParams extends DateRange, PaginationParams, SortParams {
  action?: string;
  drugId?: number;
}

// Movement History Interfaces
export interface MovementHistoryParams extends DateRange, PaginationParams, SortParams {
  action?: string;
  drugId?: number;
}

export interface MovementHistoryResponse {
  rows: any[];
  count: number;
  chartData: ChartDataPoint[];
}

// Analytics Interfaces
export interface AnalyticsParams extends DateRange {
  period?: 'daily' | 'weekly' | 'monthly';
  groupBy?: 'drug' | 'vendor' | 'category';
  drugId?: number;
  vendorId?: number;
  categoryId?: number;
}

export interface AnalyticsResponse {
  revenueData: any[];
  topPerformingDrugs: any[];
  vendorAnalysis: any[];
  totalRevenue: number;
  periodComparison: any;
}

export interface ChartDataPoint {
  date: string;
  action: string;
  total_quantity: number;
}

export interface InventoryMovementsResponse {
  rows: any[];
  count: number;
  chartData: ChartDataPoint[];
}

// Sales Performance Interfaces
export interface SalesPerformanceParams extends DateRange {
  period?: 'daily' | 'weekly' | 'monthly';
  groupBy?: 'drug' | 'vendor' | 'category';
  vendorId?: number;
}

export interface RevenueDataPoint {
  period: string;
  total_revenue: number;
  total_quantity: number;
}

export interface TopDrug {
  drug_id: number;
  drug_name: string;
  generic_name: string;
  total_revenue: number;
  total_quantity: number;
}

export interface VendorAnalysis {
  vendor_id: number;
  vendor_name: string;
  total_revenue: number;
  total_quantity: number;
  drug_count: number;
}

export interface VendorPerformance {
  vendor_id: number;
  vendor_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  total_items_supplied: number;
  total_quantity_supplied: number;
  total_purchase_value: number;
  avg_unit_price: number;
  unique_drugs_supplied: number;
  total_revenue_generated: number;
  expired_items_count: number;
  avg_delivery_time_days: number;
  reliability_score: number;
}

export interface StockLevelItem {
  drug_id: number;
  drug_name: string;
  unit_name: string;
  vendor_name: string;
  total_quantity: number;
  avg_unit_price: number;
  avg_selling_price: number;
  total_value: number;
  earliest_expiry: string;
  minimum_quantity: number;
  stock_status: 'low' | 'adequate' | 'overstocked';
  monthly_dispensed: number;
  turnover_rate: number;
}

export interface ExpiryReportItem {
  id: number;
  drug_id: number;
  vendor_id: number;
  quantity_remaining: number;
  unit_price: number;
  selling_price: number;
  expiration: Date;
  batch: string;
  date_received: Date;
  days_to_expiry: number;
  potential_loss_value: number;
  Drug: {
    id: number;
    name: string;
  };
  Unit: {
    name: string;
  };
  Vendor: {
    name: string;
  };
}

export interface DispenseReportItem {
  id: number;
  quantity_dispensed: number;
  quantity_remaining: number;
  selling_price: number;
  unit_price: number;
  history_date: Date;
  item_receiver: string;
  total_amount: number;
  PharmacyStore: {
    drug_id: number;
    batch: string;
    expiration: Date;
    Drug: {
      id: number;
      name: string;
    };
    Unit: {
      name: string;
    };
  };
  Inventory: {
    name: string;
  };
  staff: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface PeriodComparison {
  current_period: number;
  previous_period: number;
  growth_rate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SalesPerformanceResponse {
  revenueData: RevenueDataPoint[];
  topDrugs: TopDrug[];
  vendorAnalysis: VendorAnalysis[];
  totalRevenue: number;
  periodComparison: PeriodComparison;
}

// Expiry Tracking Interfaces
export interface ExpiryTrackingParams extends DateRange, PaginationParams {
  threshold?: number; // days until expiry
}

export interface ExpiryItem {
  id: number;
  drug_name: string;
  batch: string;
  quantity_remaining: number;
  expiration: Date;
  days_until_expiry: number;
  unit_price: number;
  total_value: number;
}

export interface WasteAnalysis {
  total_expired_items: number;
  total_waste_value: number;
  most_wasted_drug: string;
  waste_by_category: any[];
}

export interface ExpiryTrend {
  month: string;
  expired_count: number;
  waste_value: number;
}

export interface ExpiryTrackingResponse {
  nearExpiryItems: ExpiryItem[];
  expiredItems: ExpiryItem[];
  wasteAnalysis: WasteAnalysis;
  totalWasteValue: number;
  expiryTrends: ExpiryTrend[];
}

// Stock Levels Interfaces
export interface StockLevelsParams extends PaginationParams, SortParams {
  threshold?: number;
}

export interface StockLevel {
  id: number;
  drug_name: string;
  quantity_remaining: number;
  quantity_received: number;
  stock_percentage: number;
  unit_price: number;
  total_value: number;
  last_received: Date;
  status: 'low' | 'adequate' | 'overstocked';
}

export interface LowStockAlert {
  drug_id: number;
  drug_name: string;
  current_stock: number;
  recommended_order: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OptimizationRecommendation {
  type: 'reorder' | 'reduce' | 'redistribute';
  drug_name: string;
  current_stock: number;
  recommended_action: string;
  potential_savings: number;
}

export interface StockDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface StockLevelsResponse {
  stockLevels: StockLevel[];
  lowStockAlerts: LowStockAlert[];
  optimizationRecommendations: OptimizationRecommendation[];
  stockDistribution: StockDistribution[];
}

// Revenue Analysis Interfaces
export interface RevenueAnalysisParams extends DateRange {
  drugId?: number;
  vendorId?: number;
  categoryId?: number;
}

export interface RevenueAnalysisResponse {
  revenueData: any[];
  totalRevenue: number;
}

// Trends Analysis Interfaces
export interface TrendsAnalysisParams extends DateRange {
  period?: 'daily' | 'weekly' | 'monthly';
  drugId?: number;
  categoryId?: number;
}

export interface TimeSeriesDataPoint {
  period: string;
  dispensed: number;
  received: number;
  revenue: number;
}

export interface SeasonalPattern {
  month: number;
  month_name: string;
  avg_daily_dispensed: number;
  avg_daily_revenue: number;
}

export interface TrendMetrics {
  avg_stock_level: number;
  stock_volatility: number;
  unique_drugs: number;
  total_inventory_value: number;
}

export interface PredictiveInsight {
  type: 'revenue_forecast' | 'demand_spike' | 'demand_decline' | 'seasonal_peak' | 'seasonal_low' | 'high_volatility';
  category: 'financial' | 'inventory' | 'seasonal' | 'risk';
  confidence: 'high' | 'medium' | 'low';
  insight: string;
  data: Record<string, any>;
}

export interface TrendsAnalysisResponse {
  timeSeriesData: TimeSeriesDataPoint[];
  seasonalPatterns: SeasonalPattern[];
  predictiveInsights: PredictiveInsight[];
  trendMetrics: TrendMetrics;
}

// Generic Report Response Interface
export interface ReportResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

// Error Response Interface
export interface ReportError {
  success: false;
  error: string;
  details?: any;
  timestamp: Date;
}

// Export format types
export type ExportFormat = 'csv' | 'pdf' | 'excel';

// Filter options for reports
export interface ReportFilters {
  periods?: string[];
  movementTypes?: string[];
  thresholds?: string[];
  sortOptions?: string[];
}

// Report metadata
export interface ReportMetadata {
  title: string;
  description: string;
  filters: string[];
  exportFormats: ExportFormat[];
}