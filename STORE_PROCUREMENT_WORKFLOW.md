# EHMRS Store and Procurement Management System
## Complete Workflow Documentation

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Store Management Workflow](#store-management-workflow)
3. [Procurement Workflow](#procurement-workflow)
4. [Phase 5 Implementation](#phase-5-implementation)
5. [Integration Points](#integration-points)
6. [User Roles and Permissions](#user-roles-and-permissions)
7. [Technology Stack](#technology-stack)
8. [API Endpoints](#api-endpoints)

---

## 🏗️ System Architecture

### Overall Architecture
```
EHMRS Store & Procurement System
├── Frontend (Vue.js 2.6)
│   ├── Store Management
│   │   ├── Universal Store Manager (Cross-store)
│   │   ├── General Store
│   │   ├── Pharmacy Store  
│   │   └── Laboratory Store
│   ├── Procurement Management
│   └── Dispensary Management (Phase 5)
├── Backend (Node.js/TypeScript/Express)
│   ├── General Store Module
│   ├── Procurement Module
│   └── Dispensary APIs (Phase 5)
└── Database (MySQL with Sequelize ORM)
    ├── Store Tables
    ├── Procurement Tables
    └── Dispensary Tables (Phase 5)
```

---

## 🏪 Store Management Workflow

### 1. Store Type Structure
```
Universal Store System
├── 📊 Universal Store Manager (/store/universal-manager)
│   └── Manages ALL store types in unified interface
├── 💊 Pharmacy Store (/store/pharmacy/*)
│   ├── Pharmaceutical items
│   ├── Prescription management
│   └── Drug inventory tracking
├── 🏥 General Store (/general-store/*)
│   ├── Medical supplies & equipment
│   ├── Administrative supplies
│   └── General hospital resources
└── 🧪 Laboratory Store (/laboratory/*)
    ├── Lab consumables
    ├── Test reagents
    └── Lab equipment
```

### 2. General Store Management Flow

#### **A. Category & Item Management**
```
1. Category Creation → 2. Subcategory Creation → 3. Item Creation
   ↓                     ↓                       ↓
   Categories           Subcategories           Items
   - Medical Supplies   - Surgical Supplies     - Bandages
   - Equipment         - Diagnostic Tools       - Stethoscopes
   - Administrative    - Office Supplies        - Computers
```

#### **B. Inventory Management Flow**
```
📥 STOCK IN Process:
1. Procurement Order Received
2. Stock Movement (IN) Created
3. Item Quantity Updated
4. Audit Log Generated

📤 STOCK OUT Process:  
1. Request Created (Department/User)
2. Request Approved (Store Manager)
3. Stock Movement (OUT) Created  
4. Item Quantity Reduced
5. Request Fulfilled
```

#### **C. Request Management Workflow**
```
🔄 Request Lifecycle:
PENDING → APPROVED → FULFILLED
   ↓         ↓          ↓
Created   Validated   Dispatched
by User   by Manager  by Staff
```

### 3. Dispensary Management (Phase 5 Implementation)

#### **A. Dispensary Structure**
```
Main Store (General Store)
├── 🏪 Dispensary A (ICU)
│   ├── Auto-replenishment: Enabled
│   ├── Threshold: 30%
│   └── Capacity: 1000 items
├── 🏪 Dispensary B (Emergency)
│   ├── Auto-replenishment: Enabled  
│   ├── Threshold: 20%
│   └── Capacity: 500 items
└── 🏪 Dispensary C (General Ward)
    ├── Auto-replenishment: Disabled
    └── Manual restocking
```

#### **B. Dispensary Operations Flow**
```
📦 Transfer Flow:
Main Store → Transfer Modal → Select Items & Quantities → Dispensary Stock

🏥 Dispense Flow:  
Dispensary → Select Item → Patient/Purpose → Dispense → Stock Reduction

🔄 Auto-Replenishment:
Monitor Stock → Threshold Reached → Auto-Request → Main Store Approval
```

---

## 🛒 Procurement Workflow

### 1. Procurement Process Flow
```
📋 Procurement Lifecycle:
1. REQUISITION → 2. PROCUREMENT ORDER → 3. RECEIVING → 4. PAYMENT
   ↓               ↓                     ↓              ↓
   Department      Purchase Order        Goods Receipt  Invoice Processing
   Request         Generation            & Inspection   & Payment
```

### 2. Detailed Procurement Steps

#### **A. Requisition Phase**
```
Department Need Identified
    ↓
Internal Request Created
    ↓
Store Manager Review
    ↓
Approved for Procurement
```

#### **B. Purchase Order Phase** 
```
Vendor Selection
    ↓
Purchase Order Creation
    ↓
PO Approval Workflow
    ↓
PO Sent to Vendor
```

#### **C. Receiving Phase**
```
Goods Received
    ↓
Quality Inspection
    ↓
Quantity Verification
    ↓
Stock Movement (IN) Created
    ↓
Inventory Updated
```

---

## 🆕 Phase 5 Implementation Details

### What Was Implemented in Phase 5

#### **1. Universal Store Manager Component**
- **Location**: `/store/universal-manager`
- **Features**:
  - Cross-store inventory management
  - Unified filtering and search
  - Dispensary management interface
  - Transfer and dispensing workflows

#### **2. Dispensary Management System**
- **Routes Added**:
  ```
  /general-store/dispensaries           → List all dispensaries
  /general-store/dispensaries/create    → Create new dispensary  
  /general-store/dispensaries/:id       → Dispensary details
  /general-store/dispensaries/:id/edit  → Edit dispensary
  /general-store/dispensaries/:id/stock → Manage dispensary stock
  ```

#### **3. Vue Components Created**
```
📁 Shared Components (/view/components/shared/)
├── UniversalStoreManager.vue      → Main unified interface
├── DispensaryCard.vue             → Individual dispensary display
├── UniversalItemsTable.vue        → Flexible items table
├── TransferModal.vue              → Multi-item transfers
├── DispenseModal.vue              → Item dispensing
├── DispensaryFormModal.vue        → CRUD operations
└── DispensaryStockModal.vue       → Stock overview

📁 Page Components (/view/pages/generalStore/dispensaries/)
├── DispensariesList.vue           → List all dispensaries
├── CreateDispensary.vue           → Create form
├── EditDispensary.vue             → Edit form  
├── DispensaryDetails.vue          → Detail view
└── DispensaryStock.vue            → Stock management
```

#### **4. Vuex Store Extensions**
```javascript
// State Extensions
dispensaries: [],
currentDispensary: null,
dispensaryStock: [],
dispensaryMetrics: null,

// Actions Added
fetchDispensaries(),
fetchDispensaryById(),  
createDispensary(),
updateDispensary(),
deleteDispensary(),
fetchDispensaryStock(),
transferToDispensary(),
dispenseFromDispensary(),
autoReplenishDispensary(),
fetchDispensaryActivity()
```

#### **5. Production-Quality Features**
- ✅ **No TODO comments** - All production-ready code
- ✅ **Real API integration** - No mock data
- ✅ **Comprehensive error handling** - HTTP status-specific responses
- ✅ **Form validation** - Client & server-side validation
- ✅ **Defensive programming** - Null/undefined checks throughout
- ✅ **Consistent UI patterns** - Bootstrap Vue components

---

## 🔗 Integration Points

### 1. Store → Procurement Integration
```
Low Stock Detection → Auto-Procurement Request → Purchase Order
    ↓                      ↓                        ↓
Inventory Monitor     Requisition System      Procurement Module
```

### 2. Dispensary → Main Store Integration  
```
Dispensary Stock Low → Transfer Request → Main Store Approval → Stock Transfer
       ↓                     ↓                  ↓                    ↓
   Auto-Detection      Request Generation   Manager Review      Inventory Update
```

### 3. Cross-Module Data Flow
```
Patient Visit → Clinical Orders → Store Requests → Stock Dispensing
     ↓              ↓                ↓               ↓
Visit Module   Clinical Modules  Store Module   Inventory Update
```

---

## 👥 User Roles and Permissions

### 1. Store Manager
- Full store management access
- Approve/reject requests  
- Create/manage dispensaries
- View all reports and analytics
- Manage store settings

### 2. Store Keeper
- Manage inventory items
- Process stock movements
- Fulfill approved requests
- Update dispensary stock
- Generate operational reports

### 3. Department Staff  
- Create store requests
- View request status
- Dispense from assigned dispensaries
- View limited inventory reports

### 4. Procurement Officer
- Manage procurement orders
- Vendor management
- Purchase approvals
- Procurement analytics

---

## 💻 Technology Stack

### Frontend
- **Framework**: Vue.js 2.6.11
- **State Management**: Vuex (Modular)
- **UI Library**: Bootstrap Vue
- **Router**: Vue Router
- **HTTP Client**: Axios

### Backend  
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Validation**: Joi
- **Database**: MySQL

### Key Libraries
- **Audit Logging**: Custom audit service
- **Error Handling**: Custom exception classes
- **Pagination**: Custom helpers
- **Validation**: Joi schemas

---

## 🌐 API Endpoints

### General Store APIs
```
📁 Categories
GET    /api/general-store/categories
POST   /api/general-store/categories  
GET    /api/general-store/categories/:id
PUT    /api/general-store/categories/:id
DELETE /api/general-store/categories/:id

📁 Items
GET    /api/general-store/items
POST   /api/general-store/items
GET    /api/general-store/items/:id
PUT    /api/general-store/items/:id
DELETE /api/general-store/items/:id
GET    /api/general-store/items/search

📁 Movements  
GET    /api/general-store/movements
POST   /api/general-store/movements
GET    /api/general-store/items/:id/movements

📁 Requests
GET    /api/general-store/requests
POST   /api/general-store/requests
GET    /api/general-store/requests/:id
PUT    /api/general-store/requests/:id/approve
PUT    /api/general-store/requests/:id/reject
PUT    /api/general-store/requests/:id/fulfill

📁 Reports
GET    /api/general-store/reports/stock
GET    /api/general-store/reports/movements  
GET    /api/general-store/reports/usage
GET    /api/general-store/reports/cost
GET    /api/general-store/reports/low-stock
GET    /api/general-store/reports/expiring
```

### Dispensary APIs (Phase 5)
```
📁 Dispensaries
GET    /api/general-store/dispensaries
POST   /api/general-store/dispensaries
GET    /api/general-store/dispensaries/:id
PUT    /api/general-store/dispensaries/:id
DELETE /api/general-store/dispensaries/:id

📁 Dispensary Operations
GET    /api/general-store/dispensaries/:id/stock
POST   /api/general-store/dispensaries/transfer
POST   /api/general-store/dispensaries/dispense  
POST   /api/general-store/dispensaries/auto-replenish
GET    /api/general-store/dispensaries/:id/activity
```

### Procurement APIs
```
📁 Orders
GET    /api/procurement/orders
POST   /api/procurement/orders
GET    /api/procurement/orders/:id
PUT    /api/procurement/orders/:id
DELETE /api/procurement/orders/:id

📁 Order Management
PUT    /api/procurement/orders/:id/approve
PUT    /api/procurement/orders/:id/reject  
PUT    /api/procurement/orders/:id/receive
PUT    /api/procurement/orders/:id/complete
```

---

## 📊 Key Metrics & Analytics

### Store Metrics
- Total inventory value
- Stock turnover rates
- Low stock alerts
- Expiring items tracking
- Department-wise consumption

### Dispensary Metrics  
- Dispensary utilization rates
- Auto-replenishment efficiency
- Transfer frequencies
- Stock distribution patterns

### Procurement Metrics
- Order processing times
- Vendor performance
- Cost savings achieved
- Purchase order accuracy

---

## 🔄 Audit & Compliance

### Audit Trail Features
- All inventory movements logged
- User action tracking  
- Time-stamped transactions
- Change history maintenance
- Compliance reporting

### Data Integrity
- Transaction atomicity
- Referential integrity constraints
- Automated backup procedures
- Data validation at all levels

---

## 🚀 Future Enhancement Opportunities

### Short Term
1. **Barcode Integration** - Item scanning capabilities
2. **Mobile App** - Store operations on mobile devices
3. **Advanced Analytics** - Predictive inventory management
4. **Vendor Portal** - Direct vendor integration

### Long Term  
1. **AI-Powered Demand Forecasting** - Machine learning models
2. **IoT Integration** - Smart storage monitoring
3. **Blockchain Compliance** - Immutable audit trails
4. **Advanced Reporting** - Custom dashboard creation

---

*This workflow documentation provides a complete overview of the EHMRS Store and Procurement Management System, including the Phase 5 dispensary management implementation.*