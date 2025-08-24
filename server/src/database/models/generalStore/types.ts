export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum MovementType {
  IN = 'IN',                    // Stock received
  OUT = 'OUT',                  // Stock issued
  TRANSFER = 'TRANSFER',        // Stock transferred
  ADJUSTMENT = 'ADJUSTMENT'     // Stock adjusted (correction)
}

export enum RequestStatus {
  PENDING = 'PENDING',          // Awaiting approval
  APPROVED = 'APPROVED',        // Approved, awaiting fulfillment
  REJECTED = 'REJECTED',        // Rejected
  FULFILLED = 'FULFILLED',      // Completely fulfilled
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED' // Partially fulfilled
}

export enum Priority {
  LOW = 'LOW',                  // Normal priority
  MEDIUM = 'MEDIUM',            // Medium priority
  HIGH = 'HIGH',                // High priority
  URGENT = 'URGENT'             // Urgent priority
}

export enum ItemRequestStatus {
  PENDING = 'PENDING',          // Awaiting approval
  APPROVED = 'APPROVED',        // Approved, awaiting issuance
  ISSUED = 'ISSUED',            // Completely issued
  PARTIALLY_ISSUED = 'PARTIALLY_ISSUED' // Partially issued
}

// DTOs for API requests
export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent_id?: number;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parent_id?: number;
  is_active?: boolean;
}

export interface CreateSubcategoryDto {
  name: string;
  description?: string;
  category_id: number;
  is_active?: boolean;
}

export interface UpdateSubcategoryDto {
  name?: string;
  description?: string;
  category_id?: number;
  is_active?: boolean;
}

export interface CreateItemDto {
  item_code: string;
  name: string;
  description?: string;
  category_id: number;
  subcategory_id: number;
  unit_id: number;
  manufacturer?: string;
  model_number?: string;
  specifications?: string;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  location: string;
  shelf_number?: string;
  expiry_date?: Date;
  is_expirable: boolean;
  is_serialized: boolean;
  is_lot_tracked: boolean;
  supplier_id?: number;
}

export interface UpdateItemDto {
  item_code?: string;
  name?: string;
  description?: string;
  category_id?: number;
  subcategory_id?: number;
  unit_id?: number;
  manufacturer?: string;
  model_number?: string;
  specifications?: string;
  minimum_stock?: number;
  maximum_stock?: number;
  unit_cost?: number;
  location?: string;
  shelf_number?: string;
  expiry_date?: Date;
  is_expirable?: boolean;
  is_serialized?: boolean;
  is_lot_tracked?: boolean;
  supplier_id?: number;
  status?: ItemStatus;
}

export interface CreateMovementDto {
  item_id: number;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number;
  reference_type: string;
  reference_id: number;
  from_location?: string;
  to_location?: string;
  notes?: string;
}

export interface CreateRequestDto {
  requesting_department: string;
  priority: Priority;
  required_date: Date;
  notes?: string;
  items: CreateRequestItemDto[];
}

export interface CreateRequestItemDto {
  item_id: number;
  quantity_requested: number;
  notes?: string;
}

export interface ApprovedItem {
  item_id: number;
  quantity_approved: number;
}

export interface IssuedItem {
  item_id: number;
  quantity_issued: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DateRange {
  start_date: Date;
  end_date: Date;
}

export interface StockReportFilters {
  category_id?: number;
  subcategory_id?: number;
  status?: ItemStatus;
  include_zero?: boolean;
}

export interface MovementReportFilters {
  item_id?: number;
  movement_type?: MovementType;
  start_date?: Date;
  end_date?: Date;
  staff_id?: number;
}

export interface CostReportFilters {
  start_date?: Date;
  end_date?: Date;
  group_by?: 'category' | 'subcategory' | 'supplier';
  category_id?: number;
  subcategory_id?: number;
}

export interface UsageReport {
  department: string;
  total_requests: number;
  total_items: number;
  total_cost: number;
  period: DateRange;
}

export interface StockReport {
  items: Array<{
    id: number;
    name: string;
    category: string;
    subcategory: string;
    current_stock: number;
    minimum_stock: number;
    unit_cost: number;
    total_value: number;
    status: ItemStatus;
  }>;
  summary: {
    total_items: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
}

export interface MovementReport {
  movements: Array<{
    id: number;
    item_name: string;
    movement_type: MovementType;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    reference_type: string;
    reference_id: number;
    staff_name: string;
    movement_date: Date;
  }>;
  summary: {
    total_movements: number;
    total_in: number;
    total_out: number;
    total_transfers: number;
    total_adjustments: number;
  };
}

export interface CostReport {
  items: Array<{
    id: number;
    name: string;
    category: string;
    subcategory: string;
    unit_cost: number;
    current_stock: number;
    total_value: number;
    supplier_name?: string;
  }>;
  summary: {
    total_items: number;
    total_value: number;
    average_unit_cost: number;
    highest_cost_item: string;
    lowest_cost_item: string;
  };
}
