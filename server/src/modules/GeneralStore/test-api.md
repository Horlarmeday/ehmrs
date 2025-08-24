# General Store API Test Guide

## Overview
This document provides test cases to verify that all General Store API endpoints are working correctly.

## Base URL
```
http://localhost:3000/api/general-store
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Test Cases

### 1. Categories Management

#### 1.1 Get All Categories
```bash
GET /categories
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&parent_id=1&is_active=true
```

#### 1.2 Get Category by ID
```bash
GET /categories/1
Headers: Authorization: Bearer <token>
```

#### 1.3 Create Category
```bash
POST /categories
Headers: Authorization: Bearer <token>
Body: {
  "name": "Test Category",
  "description": "Test category description",
  "parent_id": null,
  "is_active": true
}
```

#### 1.4 Update Category
```bash
PUT /categories/1
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Category",
  "description": "Updated description"
}
```

#### 1.5 Delete Category
```bash
DELETE /categories/1
Headers: Authorization: Bearer <token>
```

#### 1.6 Get Subcategories by Category
```bash
GET /categories/1/subcategories
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20
```

### 2. Subcategories Management

#### 2.1 Get All Subcategories
```bash
GET /subcategories
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&category_id=1&is_active=true
```

#### 2.2 Get Subcategory by ID
```bash
GET /subcategories/1
Headers: Authorization: Bearer <token>
```

#### 2.3 Create Subcategory
```bash
POST /subcategories
Headers: Authorization: Bearer <token>
Body: {
  "name": "Test Subcategory",
  "description": "Test subcategory description",
  "category_id": 1,
  "is_active": true
}
```

#### 2.4 Update Subcategory
```bash
PUT /subcategories/1
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Subcategory",
  "description": "Updated description"
}
```

#### 2.5 Delete Subcategory
```bash
DELETE /subcategories/1
Headers: Authorization: Bearer <token>
```

### 3. Items Management

#### 3.1 Get All Items
```bash
GET /items
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&category_id=1&subcategory_id=1&status=ACTIVE
```

#### 3.2 Get Item by ID
```bash
GET /items/1
Headers: Authorization: Bearer <token>
```

#### 3.3 Create Item
```bash
POST /items
Headers: Authorization: Bearer <token>
Body: {
  "name": "Test Item",
  "description": "Test item description",
  "category_id": 1,
  "subcategory_id": 1,
  "unit_id": 1,
  "manufacturer": "Test Manufacturer",
  "model_number": "TM-001",
  "minimum_stock": 10,
  "maximum_stock": 100,
  "unit_cost": 25.50,
  "location": "Warehouse A",
  "shelf_number": "A1-B2",
  "is_expirable": false,
  "is_serialized": false,
  "is_lot_tracked": false,
  "supplier_id": 1
}
```

#### 3.4 Update Item
```bash
PUT /items/1
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Item",
  "description": "Updated description"
}
```

#### 3.5 Delete Item
```bash
DELETE /items/1
Headers: Authorization: Bearer <token>
```

#### 3.6 Search Items
```bash
GET /items/search
Headers: Authorization: Bearer <token>
Query: ?q=test&category_id=1&subcategory_id=1&status=ACTIVE
```

#### 3.7 Get Low Stock Items
```bash
GET /items/low-stock
Headers: Authorization: Bearer <token>
```

#### 3.8 Get Expiring Items
```bash
GET /items/expiring
Headers: Authorization: Bearer <token>
Query: ?days=30
```

### 4. Stock Movements

#### 4.1 Get All Movements
```bash
GET /movements
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&item_id=1&movement_type=IN&start_date=2024-01-01&end_date=2024-12-31
```

#### 4.2 Create Movement
```bash
POST /movements
Headers: Authorization: Bearer <token>
Body: {
  "item_id": 1,
  "movement_type": "IN",
  "quantity": 50,
  "unit_cost": 25.50,
  "reference_type": "PURCHASE",
  "reference_id": 1,
  "from_location": "Supplier",
  "to_location": "Warehouse A",
  "notes": "Initial stock received"
}
```

#### 4.3 Get Item Movements
```bash
GET /movements/item/1
Headers: Authorization: Bearer <token>
Query: ?start_date=2024-01-01&end_date=2024-12-31
```

### 5. Request Management

#### 5.1 Get All Requests
```bash
GET /requests
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&status=PENDING&priority=HIGH&requesting_department=Emergency
```

#### 5.2 Get Request by ID
```bash
GET /requests/1
Headers: Authorization: Bearer <token>
```

#### 5.3 Create Request
```bash
POST /requests
Headers: Authorization: Bearer <token>
Body: {
  "requesting_department": "Emergency",
  "priority": "HIGH",
  "required_date": "2024-12-25",
  "notes": "Urgent request for emergency supplies",
  "items": [
    {
      "item_id": 1,
      "quantity_requested": 25,
      "notes": "Emergency stock needed"
    }
  ]
}
```

#### 5.4 Approve Request
```bash
PUT /requests/1/approve
Headers: Authorization: Bearer <token>
Body: {
  "approved_items": [
    {
      "item_id": 1,
      "quantity_approved": 20
    }
  ]
}
```

#### 5.5 Reject Request
```bash
PUT /requests/1/reject
Headers: Authorization: Bearer <token>
Body: {
  "rejection_reason": "Insufficient budget allocation"
}
```

#### 5.6 Fulfill Request
```bash
PUT /requests/1/fulfill
Headers: Authorization: Bearer <token>
Body: {
  "issued_items": [
    {
      "item_id": 1,
      "quantity_issued": 20
    }
  ]
}
```

#### 5.7 Get My Requests
```bash
GET /requests/my-requests
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20
```

#### 5.8 Get Pending Approval Requests
```bash
GET /requests/pending-approval
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20
```

### 6. Reports and Analytics

#### 6.1 Stock Report
```bash
GET /reports/stock
Headers: Authorization: Bearer <token>
Query: ?category_id=1&subcategory_id=1&status=ACTIVE&include_zero=false
```

#### 6.2 Movement Report
```bash
GET /reports/movements
Headers: Authorization: Bearer <token>
Query: ?start_date=2024-01-01&end_date=2024-12-31&movement_type=OUT
```

#### 6.3 Usage Report
```bash
GET /reports/usage
Headers: Authorization: Bearer <token>
Query: ?department_id=1&start_date=2024-01-01&end_date=2024-12-31
```

#### 6.4 Cost Report
```bash
GET /reports/costs
Headers: Authorization: Bearer <token>
Query: ?start_date=2024-01-01&end_date=2024-12-31&group_by=category
```

#### 6.5 Low Stock Report
```bash
GET /reports/low-stock
Headers: Authorization: Bearer <token>
```

#### 6.6 Expiring Report
```bash
GET /reports/expiring
Headers: Authorization: Bearer <token>
Query: ?days=30
```

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 20
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## Testing Checklist

- [ ] All GET endpoints return proper data
- [ ] All POST endpoints create new records
- [ ] All PUT endpoints update existing records
- [ ] All DELETE endpoints remove records
- [ ] Validation works for all inputs
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] Error handling works properly
- [ ] Authentication middleware works
- [ ] All business logic is enforced

## Notes

1. **Database Setup**: Ensure all migrations have been run
2. **Seed Data**: Verify that seed data exists for testing
3. **Authentication**: Use valid JWT tokens for testing
4. **Dependencies**: Ensure all required models (Staff, Vendor, Unit) exist
5. **Business Rules**: Test that business logic is properly enforced
