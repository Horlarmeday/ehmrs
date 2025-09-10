# Comprehensive Store Standardization Plan

## Executive Summary

Your pharmacy's three-tier model (PharmacyStore → Inventory/Dispensaries → InventoryItems) is excellent for healthcare. The plan standardizes all store operations around this proven pattern while maintaining financial separation and adding laboratory supplies to GeneralStore.

## Current State Analysis

### Existing Architecture
```
PHARMACY (EXCELLENT MODEL):
PharmacyStore (warehouse) → Inventory (Cash/NHIS dispensaries) → InventoryItem (prescribable items)

GENERAL STORE (NEEDS DISPENSARY LAYER):
Categories/Items → Direct department requests (bypasses dispensary model)

LABORATORY (TO DEPRECATE):
LaboratoryStore → Direct usage (simple, will migrate to GeneralStore)

PROCUREMENT (NEEDS MULTI-STORE SUPPORT):
Currently hardcoded to PharmacyStore only
```

## Phase 1: Foundation Architecture (Weeks 1-2)

### 1.1 Create Universal Store Models

#### Server-Side Database Schema
```sql
-- Extend existing pattern to all stores
CREATE TABLE GeneralStore_Dispensaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,  -- 'Surgery Dispensary', 'ICU Dispensary'
    department_id INT,
    location VARCHAR(255),
    accepted_item_types ENUM('medical_supplies', 'consumables', 'equipment', 'all'),
    funding_source ENUM('hospital', 'donor', 'research', 'department_budget'),
    status ENUM('active', 'inactive') DEFAULT 'active',
    manager_staff_id INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (manager_staff_id) REFERENCES Staff(id)
);

CREATE TABLE GeneralStore_DispensaryItems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dispensary_id INT NOT NULL,
    item_id INT NOT NULL,  -- References GeneralStoreItem
    quantity_received INT DEFAULT 0,
    quantity_remaining INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,  -- For pending requests
    unit_cost DECIMAL(10,2),
    batch_number VARCHAR(100),
    expiration_date DATE,
    status ENUM('active', 'expired', 'damaged', 'recalled') DEFAULT 'active',
    last_movement_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (dispensary_id) REFERENCES GeneralStore_Dispensaries(id),
    FOREIGN KEY (item_id) REFERENCES GeneralStore_Items(id),
    UNIQUE KEY unique_item_per_dispensary (dispensary_id, item_id, batch_number)
);

-- Add laboratory categories to GeneralStore
INSERT INTO GeneralStore_Categories (name, description, parent_id, is_active) VALUES
('Laboratory Supplies', 'All laboratory-related inventory', NULL, true),
('Clinical Chemistry', 'Chemistry dept supplies', @lab_id, true),
('Hematology', 'Hematology dept supplies', @lab_id, true),
('Microbiology', 'Microbiology dept supplies', @lab_id, true),
('Pathology', 'Pathology dept supplies', @lab_id, true);
```

#### Server-Side Models Enhancement
```typescript
// server/src/database/models/generalStoreDispensary.ts
@Table({ timestamps: true, tableName: 'GeneralStore_Dispensaries' })
export class GeneralStoreDispensary extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ForeignKey(() => Department)
  @Column({ type: DataType.INTEGER })
  department_id: number;

  @Column({ type: DataType.ENUM('medical_supplies', 'consumables', 'equipment', 'all') })
  accepted_item_types: string;

  @Column({ type: DataType.ENUM('hospital', 'donor', 'research', 'department_budget') })
  funding_source: string;

  @HasMany(() => GeneralStoreDispensaryItem)
  dispensaryItems: GeneralStoreDispensaryItem[];

  // Business methods
  canReceiveItemType(itemType: string): boolean {
    return this.accepted_item_types === 'all' || this.accepted_item_types === itemType;
  }

  getTotalValue(): number {
    return this.dispensaryItems.reduce((sum, item) => 
      sum + (item.quantity_remaining * item.unit_cost), 0);
  }
}
```

### 1.2 Universal Stock Movement System
```typescript
// server/src/services/UniversalInventoryService.ts
export class UniversalInventoryService {
  static async transferToDispensary(transfer: {
    from_store_type: 'pharmacy' | 'general' | 'laboratory';
    from_store_id: number;
    to_dispensary_id: number;
    item_id: number;
    quantity: number;
    reason: string;
    staff_id: number;
  }) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validate source has sufficient stock
      const sourceItem = await this.getSourceItem(
        transfer.from_store_type, 
        transfer.from_store_id, 
        transfer.item_id
      );
      
      if (sourceItem.quantity_remaining < transfer.quantity) {
        throw new BadException('INSUFFICIENT_STOCK', 400, 
          `Only ${sourceItem.quantity_remaining} available`);
      }

      // 2. Update source inventory
      await this.updateSourceInventory(sourceItem, -transfer.quantity, transaction);

      // 3. Update/create dispensary item
      const dispensaryItem = await this.updateDispensaryInventory(
        transfer.to_dispensary_id,
        transfer.item_id,
        transfer.quantity,
        sourceItem.unit_cost,
        transaction
      );

      // 4. Record movement
      await this.recordStockMovement({
        ...transfer,
        movement_type: 'TRANSFER',
        transaction
      });

      await transaction.commit();
      return dispensaryItem;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async dispenseFromDispensary(dispense: {
    dispensary_id: number;
    item_id: number;
    quantity: number;
    reason: string;
    staff_id: number;
    patient_id?: number;
    visit_id?: number;
  }) {
    // Similar transaction-based logic for dispensing
  }
}
```

## Phase 2: GeneralStore Dispensary Implementation (Weeks 3-4)

### 2.1 GeneralStore Service Enhancement
```typescript
// server/src/modules/GeneralStore/services/dispensaryManagement.service.ts
export class DispensaryManagementService {
  
  static async createDispensary(data: {
    name: string;
    department_id: number;
    accepted_item_types: string;
    funding_source: string;
    manager_staff_id: number;
  }) {
    // Create new dispensary with validation
    const dispensary = await GeneralStoreDispensary.create(data);
    
    // Auto-stock with department's commonly used items
    await this.autoStockDispensary(dispensary.id, data.department_id);
    
    return dispensary;
  }

  static async requestFromDispensary(request: {
    dispensary_id: number;
    requesting_staff_id: number;
    items: Array<{
      item_id: number;
      quantity_requested: number;
      urgency: 'low' | 'medium' | 'high' | 'emergency';
    }>;
  }) {
    // Create requisition request following existing pattern
    const requisition = await GeneralStoreRequest.create({
      requesting_staff_id: request.requesting_staff_id,
      dispensary_id: request.dispensary_id,
      status: 'PENDING',
      priority: this.mapUrgencyToPriority(request.items[0].urgency)
    });

    // Add items to request
    for (const item of request.items) {
      await GeneralStoreRequestItem.create({
        request_id: requisition.id,
        item_id: item.item_id,
        quantity_requested: item.quantity_requested,
        status: 'PENDING'
      });
    }

    return requisition;
  }

  static async autoReplenishDispensaries() {
    // Background job to auto-replenish dispensaries based on usage patterns
    const lowStockItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        quantity_remaining: { [Op.lt]: sequelize.col('minimum_stock') }
      },
      include: [GeneralStoreDispensary, GeneralStoreItem]
    });

    for (const item of lowStockItems) {
      await this.createReplenishmentRequest(item);
    }
  }
}
```

### 2.2 Request/Approval Workflow Enhancement
```typescript
// server/src/modules/GeneralStore/services/workflowManagement.service.ts
export class WorkflowManagementService {
  
  static async approveDispensaryRequest(
    requestId: number,
    approverId: number,
    approvedItems: Array<{
      item_id: number;
      quantity_approved: number;
      source_dispensary_id?: number; // Allow cross-dispensary transfers
    }>
  ) {
    const request = await GeneralStoreRequest.findByPk(requestId, {
      include: [GeneralStoreRequestItem, GeneralStoreDispensary]
    });

    if (!request.canBeApproved()) {
      throw new BadException('INVALID_STATUS', 400, 'Request cannot be approved');
    }

    const transaction = await sequelize.transaction();

    try {
      // Process each approved item
      for (const approvedItem of approvedItems) {
        const requestItem = request.items.find(i => i.item_id === approvedItem.item_id);
        
        // Update request item
        await requestItem.update({
          quantity_approved: approvedItem.quantity_approved,
          status: 'APPROVED',
          approved_by: approverId
        }, { transaction });

        // Transfer from main store or other dispensary
        await this.executeTransfer(
          approvedItem.source_dispensary_id || 'main_store',
          request.dispensary_id,
          approvedItem.item_id,
          approvedItem.quantity_approved,
          transaction
        );
      }

      // Update request status
      await request.update({
        status: 'APPROVED',
        approved_by: approverId,
        approved_date: new Date()
      }, { transaction });

      await transaction.commit();
      return request;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## Phase 3: Procurement Multi-Store Integration (Week 5)

### 3.1 Smart Procurement Routing
```typescript
// server/src/modules/Procurement/services/routingService.ts
export class ProcurementRoutingService {
  
  static async routeReceivedItems(
    procurementOrderId: number,
    receivedItems: Array<{
      item_id: number;
      quantity_received: number;
      batch_number?: string;
      expiration_date?: Date;
    }>
  ) {
    for (const receivedItem of receivedItems) {
      const itemType = await this.determineItemType(receivedItem.item_id);
      const destination = await this.determineDestination(itemType, receivedItem.item_id);

      switch (destination.store_type) {
        case 'pharmacy':
          await this.routeToPharmacyStore(receivedItem, destination);
          break;
          
        case 'general':
          await this.routeToGeneralStore(receivedItem, destination);
          break;
          
        case 'laboratory':
          // Route to GeneralStore with laboratory category
          await this.routeToGeneralStore(receivedItem, {
            ...destination,
            category: 'laboratory',
            auto_distribute_to_dispensaries: true
          });
          break;
      }
    }
  }

  private static async determineItemType(itemId: number) {
    // Check if item is a drug
    const drug = await Drug.findByPk(itemId);
    if (drug) return 'drug';

    // Check GeneralStore categories
    const generalItem = await GeneralStoreItem.findOne({
      where: { id: itemId },
      include: [GeneralStoreCategory]
    });

    if (generalItem?.category?.name?.includes('Laboratory')) {
      return 'laboratory';
    }

    return 'general';
  }

  private static async routeToGeneralStore(
    receivedItem: any,
    destination: { category?: string; auto_distribute_to_dispensaries?: boolean }
  ) {
    // Add to main GeneralStore inventory
    const storeItem = await GeneralStoreItem.findByPk(receivedItem.item_id);
    await storeItem.update({
      current_stock: storeItem.current_stock + receivedItem.quantity_received,
      last_received_date: new Date()
    });

    // Auto-distribute to relevant dispensaries if configured
    if (destination.auto_distribute_to_dispensaries) {
      await this.autoDistributeToDispensaries(
        receivedItem.item_id,
        receivedItem.quantity_received,
        destination.category
      );
    }

    // Record movement
    await GeneralStoreMovement.create({
      item_id: receivedItem.item_id,
      movement_type: 'IN',
      quantity: receivedItem.quantity_received,
      reference_type: 'PROCUREMENT',
      notes: `Received from procurement order`,
      batch_number: receivedItem.batch_number,
      expiration_date: receivedItem.expiration_date
    });
  }

  private static async autoDistributeToDispensaries(
    itemId: number,
    totalQuantity: number,
    category: string
  ) {
    // Find dispensaries that typically use this item category
    const relevantDispensaries = await GeneralStoreDispensary.findAll({
      where: {
        accepted_item_types: { [Op.in]: [category, 'all'] },
        status: 'active'
      }
    });

    // Distribute proportionally based on usage history
    const distributionPlan = await this.calculateDistribution(
      itemId,
      totalQuantity,
      relevantDispensaries
    );

    for (const distribution of distributionPlan) {
      await UniversalInventoryService.transferToDispensary({
        from_store_type: 'general',
        from_store_id: 1, // Main GeneralStore ID
        to_dispensary_id: distribution.dispensary_id,
        item_id: itemId,
        quantity: distribution.quantity,
        reason: 'Auto-distribution from procurement',
        staff_id: 1 // System user
      });
    }
  }
}
```

### 3.2 Enhanced Procurement Service
```typescript
// Update existing procurement service
export class ProcurementService {
  static async receiveProcurementOrderItems(
    orderId: number,
    receivedItems: Array<{
      item_id: number;
      quantity_received: number;
      batch_number?: string;
      expiration_date?: Date;
      destination_override?: {
        store_type: 'pharmacy' | 'general';
        dispensary_id?: number;
      };
    }>
  ) {
    const order = await ProcurementOrder.findByPk(orderId, {
      include: [ProcurementOrderItem]
    });

    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    const transaction = await sequelize.transaction();

    try {
      // Use new routing service instead of hardcoded pharmacy logic
      await ProcurementRoutingService.routeReceivedItems(orderId, receivedItems);

      // Update order items
      for (const receivedItem of receivedItems) {
        const orderItem = order.items.find(item => item.id === receivedItem.item_id);
        await orderItem.update({
          quantity_received: receivedItem.quantity_received,
          date_received: new Date(),
          batch_number: receivedItem.batch_number,
          expiration_date: receivedItem.expiration_date,
          receipt_status: receivedItem.quantity_received === orderItem.quantity_ordered 
            ? 'COMPLETE' : 'PARTIAL'
        }, { transaction });
      }

      // Update order status
      const allItemsReceived = order.items.every(
        item => item.receipt_status === 'COMPLETE'
      );

      if (allItemsReceived) {
        await order.update({
          status: 'RECEIVED',
          received_date: new Date()
        }, { transaction });
      }

      await transaction.commit();
      return order;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## Phase 4: Laboratory Store Migration (Week 6)

### 4.1 Data Migration Strategy
```sql
-- Step 1: Backup existing data
CREATE TABLE Lab_Items_Backup AS SELECT * FROM Lab_Items;

-- Step 2: Create laboratory categories in GeneralStore
INSERT INTO GeneralStore_Categories (name, description, parent_id, is_active, created_at, updated_at) VALUES
('Laboratory Supplies', 'All laboratory-related items', NULL, true, NOW(), NOW());

SET @lab_cat_id = LAST_INSERT_ID();

INSERT INTO GeneralStore_Subcategories (name, description, category_id, is_active, created_at, updated_at) VALUES
('Reagents', 'Chemical reagents and solutions', @lab_cat_id, true, NOW(), NOW()),
('Consumables', 'Laboratory consumables and disposables', @lab_cat_id, true, NOW(), NOW()),
('Test Kits', 'Diagnostic test kits and components', @lab_cat_id, true, NOW(), NOW()),
('Lab Equipment', 'Laboratory equipment and instruments', @lab_cat_id, true, NOW(), NOW());

-- Step 3: Migrate LaboratoryStore items to GeneralStore
INSERT INTO GeneralStore_Items (
    name, description, sku, category_id, subcategory_id,
    unit_cost, current_stock, minimum_stock, maximum_stock,
    unit_of_measure, supplier_id, status, item_type,
    batch_number, expiration_date, created_by, created_at, updated_at
)
SELECT 
    ls.name,
    CONCAT('Migrated from Lab Store - Product Code: ', COALESCE(ls.product_code, 'N/A')),
    CONCAT('LAB-', LPAD(ls.id, 6, '0')), -- Generate SKU
    @lab_cat_id, -- Default to main lab category
    (SELECT id FROM GeneralStore_Subcategories WHERE name = 'Reagents' LIMIT 1), -- Default subcategory
    ls.unit_price,
    ls.remain_quantity,
    GREATEST(5, FLOOR(ls.quantity * 0.2)), -- 20% of original quantity as minimum
    ls.quantity * 2, -- Double original quantity as maximum
    COALESCE(u.name, 'Each'), -- Unit of measure
    NULL, -- supplier_id (can be updated later)
    CASE WHEN ls.remain_quantity > 0 THEN 'ACTIVE' ELSE 'INACTIVE' END,
    'laboratory',
    ls.batch,
    ls.expiration,
    COALESCE(ls.staff_id, 1), -- Default to system user if no staff
    ls.createdAt,
    ls.updatedAt
FROM Lab_Items ls
LEFT JOIN Units u ON ls.unit_id = u.id;

-- Step 4: Create initial laboratory dispensaries
INSERT INTO GeneralStore_Dispensaries (name, department_id, accepted_item_types, funding_source, status, created_at, updated_at) VALUES
('Chemistry Dispensary', (SELECT id FROM Departments WHERE name LIKE '%Chemistry%' LIMIT 1), 'laboratory', 'hospital', 'active', NOW(), NOW()),
('Hematology Dispensary', (SELECT id FROM Departments WHERE name LIKE '%Hematology%' LIMIT 1), 'laboratory', 'hospital', 'active', NOW(), NOW()),
('Microbiology Dispensary', (SELECT id FROM Departments WHERE name LIKE '%Microbiology%' LIMIT 1), 'laboratory', 'hospital', 'active', NOW(), NOW()),
('General Lab Dispensary', NULL, 'laboratory', 'hospital', 'active', NOW(), NOW());

-- Step 5: Distribute items to dispensaries (if there's remaining stock)
INSERT INTO GeneralStore_DispensaryItems (dispensary_id, item_id, quantity_received, quantity_remaining, unit_cost, created_at, updated_at)
SELECT 
    gd.id,
    gi.id,
    FLOOR(gi.current_stock / (SELECT COUNT(*) FROM GeneralStore_Dispensaries WHERE accepted_item_types = 'laboratory')), -- Distribute evenly
    FLOOR(gi.current_stock / (SELECT COUNT(*) FROM GeneralStore_Dispensaries WHERE accepted_item_types = 'laboratory')),
    gi.unit_cost,
    NOW(),
    NOW()
FROM GeneralStore_Items gi
CROSS JOIN GeneralStore_Dispensaries gd
WHERE gi.item_type = 'laboratory' 
AND gd.accepted_item_types = 'laboratory'
AND gi.current_stock > 0;
```

### 4.2 API Migration and Backward Compatibility
```typescript
// server/src/modules/Store/store.routes.ts - Add backward compatibility
router.get('/laboratory/items/get', verify, (req, res, next) => {
  // Redirect to GeneralStore with laboratory filter
  req.query.category = 'laboratory';
  req.query.item_type = 'laboratory';
  return GeneralStoreController.getItems(req, res, next);
});

router.post('/laboratory/items/create', verify, (req, res, next) => {
  // Redirect to GeneralStore creation with laboratory category
  req.body.category_id = LABORATORY_CATEGORY_ID;
  req.body.item_type = 'laboratory';
  return GeneralStoreController.createItem(req, res, next);
});

// server/src/modules/GeneralStore/generalStore.controller.ts
export class GeneralStoreController {
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      
      // Handle legacy laboratory requests
      if (filters.category === 'laboratory' || filters.item_type === 'laboratory') {
        filters.category_name = 'Laboratory Supplies';
        delete filters.category; // Remove to use category_name filter
      }

      const result = await GeneralStoreService.getItems(filters);
      
      // Format response for backward compatibility
      if (filters.item_type === 'laboratory') {
        return res.json({
          success: true,
          data: {
            docs: result.items,
            total: result.total,
            pages: result.pages,
            currentPage: result.currentPage,
            perPage: result.perPage
          }
        });
      }

      return successResponse({ res, data: result });
    } catch (error) {
      next(error);
    }
  }
}
```

## Phase 5: Client-Side Standardization (Weeks 7-8)

### 5.1 Unified Store Components
```vue
<!-- client/src/view/components/inventory/UniversalStoreManager.vue -->
<template>
  <div class="universal-store-manager">
    <!-- Store Type Selector -->
    <div class="store-selector mb-4">
      <b-nav tabs>
        <b-nav-item 
          v-for="storeType in availableStores"
          :key="storeType.key"
          :active="currentStore === storeType.key"
          @click="switchStore(storeType.key)"
        >
          {{ storeType.name }}
        </b-nav-item>
      </b-nav>
    </div>

    <!-- Dynamic Store Content -->
    <component 
      :is="currentStoreComponent" 
      :store-type="currentStore"
      :user-permissions="userPermissions"
      @store-changed="handleStoreChange"
    />
  </div>
</template>

<script>
import PharmacyStoreManager from './PharmacyStoreManager.vue'
import GeneralStoreManager from './GeneralStoreManager.vue'
import DispensaryManager from './DispensaryManager.vue'

export default {
  name: 'UniversalStoreManager',
  components: {
    PharmacyStoreManager,
    GeneralStoreManager,
    DispensaryManager
  },
  data() {
    return {
      currentStore: 'pharmacy',
      availableStores: [
        { key: 'pharmacy', name: 'Pharmacy', component: 'PharmacyStoreManager' },
        { key: 'general', name: 'General Store', component: 'GeneralStoreManager' },
        { key: 'laboratory', name: 'Laboratory', component: 'GeneralStoreManager' },
        { key: 'dispensary', name: 'My Dispensary', component: 'DispensaryManager' }
      ]
    }
  },
  computed: {
    currentStoreComponent() {
      const store = this.availableStores.find(s => s.key === this.currentStore)
      return store ? store.component : 'GeneralStoreManager'
    },
    userPermissions() {
      return this.$store.getters['auth/getUserPermissions']
    }
  },
  methods: {
    switchStore(storeType) {
      this.currentStore = storeType
      // Update route without page reload
      this.$router.push({ query: { ...this.$route.query, store: storeType }})
    },
    handleStoreChange(event) {
      this.$emit('store-changed', event)
    }
  }
}
</script>
```

### 5.2 Enhanced Dispensary Management
```vue
<!-- client/src/view/components/inventory/DispensaryManager.vue -->
<template>
  <div class="dispensary-manager">
    <div class="row">
      <!-- Dispensary Selection -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-header">
            <h5>My Dispensaries</h5>
          </div>
          <div class="card-body">
            <div 
              v-for="dispensary in myDispensaries"
              :key="dispensary.id"
              class="dispensary-item"
              :class="{ active: selectedDispensary?.id === dispensary.id }"
              @click="selectDispensary(dispensary)"
            >
              <div class="d-flex justify-content-between">
                <span>{{ dispensary.name }}</span>
                <b-badge :variant="getStockStatusVariant(dispensary.stock_status)">
                  {{ dispensary.total_items }}
                </b-badge>
              </div>
              <small class="text-muted">{{ dispensary.department?.name }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Dispensary Content -->
      <div class="col-md-9">
        <div v-if="selectedDispensary" class="dispensary-content">
          <!-- Action Buttons -->
          <div class="d-flex justify-content-between mb-3">
            <h4>{{ selectedDispensary.name }}</h4>
            <div>
              <b-button variant="primary" @click="showRequestModal = true">
                <i class="fas fa-plus"></i> Request Items
              </b-button>
              <b-button variant="success" @click="showReceiveModal = true" class="ml-2">
                <i class="fas fa-download"></i> Receive Items
              </b-button>
              <b-button variant="warning" @click="showDispenseModal = true" class="ml-2">
                <i class="fas fa-upload"></i> Dispense Items
              </b-button>
            </div>
          </div>

          <!-- Stock Overview -->
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="card bg-primary text-white">
                <div class="card-body">
                  <h5>{{ selectedDispensary.total_items }}</h5>
                  <p>Total Items</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-warning text-white">
                <div class="card-body">
                  <h5>{{ selectedDispensary.low_stock_items }}</h5>
                  <p>Low Stock</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-danger text-white">
                <div class="card-body">
                  <h5>{{ selectedDispensary.expired_items }}</h5>
                  <p>Expired</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-info text-white">
                <div class="card-body">
                  <h5>{{ formatCurrency(selectedDispensary.total_value) }}</h5>
                  <p>Total Value</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <UniversalItemsTable
            :items="dispensaryItems"
            :loading="loading"
            :store-type="storeType"
            show-dispensary-actions
            @dispense="handleDispense"
            @request-more="handleRequestMore"
          />
        </div>
      </div>
    </div>

    <!-- Request Modal -->
    <ItemRequestModal
      v-if="showRequestModal"
      :dispensary="selectedDispensary"
      @close="showRequestModal = false"
      @submitted="handleRequestSubmitted"
    />

    <!-- Receive Modal -->
    <ItemReceiveModal
      v-if="showReceiveModal"
      :dispensary="selectedDispensary"
      @close="showReceiveModal = false"
      @received="handleItemsReceived"
    />

    <!-- Dispense Modal -->
    <ItemDispenseModal
      v-if="showDispenseModal"
      :dispensary="selectedDispensary"
      :available-items="dispensaryItems"
      @close="showDispenseModal = false"
      @dispensed="handleItemsDispensed"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UniversalItemsTable from './UniversalItemsTable.vue'
import ItemRequestModal from './modals/ItemRequestModal.vue'
import ItemReceiveModal from './modals/ItemReceiveModal.vue'
import ItemDispenseModal from './modals/ItemDispenseModal.vue'

export default {
  name: 'DispensaryManager',
  components: {
    UniversalItemsTable,
    ItemRequestModal,
    ItemReceiveModal,
    ItemDispenseModal
  },
  data() {
    return {
      selectedDispensary: null,
      dispensaryItems: [],
      loading: false,
      showRequestModal: false,
      showReceiveModal: false,
      showDispenseModal: false
    }
  },
  computed: {
    ...mapGetters('dispensary', ['myDispensaries']),
    ...mapGetters('auth', ['currentUser']),
    
    storeType() {
      return this.selectedDispensary?.accepted_item_types || 'general'
    }
  },
  mounted() {
    this.loadMyDispensaries()
  },
  methods: {
    ...mapActions('dispensary', [
      'fetchMyDispensaries',
      'fetchDispensaryItems',
      'requestItems',
      'receiveItems',
      'dispenseItems'
    ]),

    async loadMyDispensaries() {
      try {
        await this.fetchMyDispensaries()
        if (this.myDispensaries.length > 0) {
          this.selectDispensary(this.myDispensaries[0])
        }
      } catch (error) {
        this.$notify({ type: 'error', message: 'Failed to load dispensaries' })
      }
    },

    async selectDispensary(dispensary) {
      this.selectedDispensary = dispensary
      await this.loadDispensaryItems()
    },

    async loadDispensaryItems() {
      if (!this.selectedDispensary) return
      
      this.loading = true
      try {
        this.dispensaryItems = await this.fetchDispensaryItems({
          dispensary_id: this.selectedDispensary.id,
          include_expired: false
        })
      } catch (error) {
        this.$notify({ type: 'error', message: 'Failed to load dispensary items' })
      } finally {
        this.loading = false
      }
    },

    async handleRequestSubmitted(requestData) {
      try {
        await this.requestItems({
          dispensary_id: this.selectedDispensary.id,
          ...requestData
        })
        this.$notify({ type: 'success', message: 'Request submitted successfully' })
        await this.loadDispensaryItems()
      } catch (error) {
        this.$notify({ type: 'error', message: 'Failed to submit request' })
      }
    },

    async handleItemsReceived(receiveData) {
      try {
        await this.receiveItems({
          dispensary_id: this.selectedDispensary.id,
          ...receiveData
        })
        this.$notify({ type: 'success', message: 'Items received successfully' })
        await this.loadDispensaryItems()
      } catch (error) {
        this.$notify({ type: 'error', message: 'Failed to receive items' })
      }
    },

    async handleItemsDispensed(dispenseData) {
      try {
        await this.dispenseItems({
          dispensary_id: this.selectedDispensary.id,
          ...dispenseData
        })
        this.$notify({ type: 'success', message: 'Items dispensed successfully' })
        await this.loadDispensaryItems()
      } catch (error) {
        this.$notify({ type: 'error', message: 'Failed to dispense items' })
      }
    },

    getStockStatusVariant(status) {
      switch (status) {
        case 'adequate': return 'success'
        case 'low': return 'warning'
        case 'critical': return 'danger'
        default: return 'secondary'
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount || 0)
    }
  }
}
</script>
```

### 5.3 Unified Vuex Store Structure
```javascript
// client/src/core/services/store/universal/universalInventory.js
export default {
  namespaced: true,
  
  state: {
    currentStoreType: 'pharmacy',
    dispensaries: [],
    currentDispensary: null,
    stockMovements: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_CURRENT_STORE_TYPE(state, storeType) {
      state.currentStoreType = storeType
    },
    
    SET_DISPENSARIES(state, dispensaries) {
      state.dispensaries = dispensaries
    },
    
    SET_CURRENT_DISPENSARY(state, dispensary) {
      state.currentDispensary = dispensary
    },
    
    SET_STOCK_MOVEMENTS(state, movements) {
      state.stockMovements = movements
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async transferToDispensary({ commit }, transferData) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('/api/universal-inventory/transfer', transferData)
        
        if (response.data.success) {
          commit('SET_ERROR', null)
          return response.data.data
        }
        
        throw new Error(response.data.message)
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchStockMovements({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get('/api/universal-inventory/movements', { params: filters })
        
        if (response.data.success) {
          commit('SET_STOCK_MOVEMENTS', response.data.data)
          commit('SET_ERROR', null)
          return response.data.data
        }
        
        throw new Error(response.data.message)
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async generateCrossStoreReport({ commit }, reportParams) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get('/api/universal-inventory/reports/cross-store', {
          params: reportParams
        })
        
        if (response.data.success) {
          commit('SET_ERROR', null)
          return response.data.data
        }
        
        throw new Error(response.data.message)
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  
  getters: {
    getDispensariesByType: (state) => (storeType) => {
      return state.dispensaries.filter(d => d.accepted_item_types === storeType || d.accepted_item_types === 'all')
    },
    
    getCurrentDispensaryItems: (state) => {
      return state.currentDispensary?.dispensaryItems || []
    },
    
    getLowStockItems: (state, getters) => {
      return getters.getCurrentDispensaryItems.filter(item => 
        item.quantity_remaining <= item.minimum_stock
      )
    },
    
    getTotalInventoryValue: (state) => {
      return state.dispensaries.reduce((total, dispensary) => {
        return total + (dispensary.total_value || 0)
      }, 0)
    }
  }
}
```

## Phase 6: Testing and Validation (Week 9)

### 6.1 Automated Testing Suite
```typescript
// server/tests/integration/universalInventory.test.ts
describe('Universal Inventory System', () => {
  let testDispensary: GeneralStoreDispensary
  let testItem: GeneralStoreItem
  
  beforeEach(async () => {
    // Setup test data
    testDispensary = await GeneralStoreDispensary.create({
      name: 'Test Dispensary',
      department_id: 1,
      accepted_item_types: 'medical_supplies',
      funding_source: 'hospital'
    })
    
    testItem = await GeneralStoreItem.create({
      name: 'Test Medical Supply',
      category_id: 1,
      unit_cost: 10.00,
      current_stock: 100,
      minimum_stock: 10,
      maximum_stock: 200
    })
  })
  
  describe('Stock Transfers', () => {
    it('should transfer stock from main store to dispensary', async () => {
      const transfer = await UniversalInventoryService.transferToDispensary({
        from_store_type: 'general',
        from_store_id: 1,
        to_dispensary_id: testDispensary.id,
        item_id: testItem.id,
        quantity: 50,
        reason: 'Initial stock',
        staff_id: 1
      })
      
      expect(transfer.quantity_remaining).toBe(50)
      
      // Verify main store stock decreased
      await testItem.reload()
      expect(testItem.current_stock).toBe(50)
    })
    
    it('should prevent transfer when insufficient stock', async () => {
      await expect(
        UniversalInventoryService.transferToDispensary({
          from_store_type: 'general',
          from_store_id: 1,
          to_dispensary_id: testDispensary.id,
          item_id: testItem.id,
          quantity: 150, // More than available
          reason: 'Test',
          staff_id: 1
        })
      ).rejects.toThrow('INSUFFICIENT_STOCK')
    })
  })
  
  describe('Dispensary Operations', () => {
    it('should dispense items from dispensary', async () => {
      // First transfer stock to dispensary
      await UniversalInventoryService.transferToDispensary({
        from_store_type: 'general',
        from_store_id: 1,
        to_dispensary_id: testDispensary.id,
        item_id: testItem.id,
        quantity: 50,
        reason: 'Initial stock',
        staff_id: 1
      })
      
      // Then dispense
      const dispense = await UniversalInventoryService.dispenseFromDispensary({
        dispensary_id: testDispensary.id,
        item_id: testItem.id,
        quantity: 20,
        reason: 'Patient treatment',
        staff_id: 1,
        patient_id: 123
      })
      
      expect(dispense.quantity_remaining).toBe(30)
    })
  })
  
  describe('Procurement Integration', () => {
    it('should route received items correctly', async () => {
      const procurementOrder = await ProcurementOrder.create({
        po_number: 'TEST-001',
        vendor_id: 1,
        total_amount: 500,
        status: 'SENT'
      })
      
      await ProcurementRoutingService.routeReceivedItems(procurementOrder.id, [{
        item_id: testItem.id,
        quantity_received: 100,
        batch_number: 'BATCH001'
      }])
      
      // Verify item was added to main store
      await testItem.reload()
      expect(testItem.current_stock).toBe(200) // Original 100 + received 100
    })
  })
})
```

### 6.2 Performance Testing
```typescript
// server/tests/performance/inventory.performance.test.ts
describe('Inventory Performance Tests', () => {
  it('should handle bulk transfers efficiently', async () => {
    const startTime = Date.now()
    
    // Transfer 1000 different items
    const transfers = Array.from({ length: 1000 }, (_, i) => ({
      from_store_type: 'general' as const,
      from_store_id: 1,
      to_dispensary_id: 1,
      item_id: i + 1,
      quantity: 10,
      reason: 'Bulk test',
      staff_id: 1
    }))
    
    await Promise.all(
      transfers.map(transfer => 
        UniversalInventoryService.transferToDispensary(transfer)
      )
    )
    
    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(30000) // Should complete within 30 seconds
  })
  
  it('should generate reports efficiently', async () => {
    const startTime = Date.now()
    
    const report = await UniversalInventoryService.generateCrossStoreReport({
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
      store_types: ['pharmacy', 'general', 'laboratory'],
      include_movements: true
    })
    
    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
    expect(report.stores.length).toBeGreaterThan(0)
  })
})
```

## Phase 7: Training and Documentation (Week 10)

### 7.1 User Documentation
```markdown
# Universal Inventory Management System - User Guide

## Overview
The new inventory system unifies all store operations under a consistent three-tier model:
- **Main Store** (warehouse level)
- **Dispensaries** (department distribution points) 
- **Items** (actual usable inventory)

## For Store Managers

### Managing Your Store
1. **Stock Receiving**: All procurement items are automatically routed to appropriate stores
2. **Dispensary Management**: Create and manage department dispensaries
3. **Stock Transfers**: Move items from main store to dispensaries
4. **Reporting**: Generate comprehensive cross-store reports

### Daily Operations
1. **Morning**: Check dispensary stock levels and low stock alerts
2. **Throughout Day**: Process dispensary requests and approvals
3. **Evening**: Review movement reports and plan next day's transfers

## For Department Staff

### Using Your Dispensary
1. **Requesting Items**: Submit requests through the dispensary interface
2. **Receiving Items**: Accept approved items into your dispensary
3. **Dispensing**: Track items dispensed for patient care
4. **Monitoring**: Keep track of stock levels and expiration dates

### Best Practices
- Request items before reaching minimum stock levels
- Always record accurate dispensing information
- Report expired or damaged items immediately
- Review usage patterns monthly to optimize stock levels

## For Laboratory Staff

### Laboratory Supplies Management
Laboratory items are now managed through the GeneralStore system with specialized categories:
- **Reagents**: Chemical reagents and solutions
- **Consumables**: Lab consumables and disposables  
- **Test Kits**: Diagnostic test kits and components
- **Equipment**: Laboratory equipment and instruments

### Workflow Changes
1. **Requesting Supplies**: Use GeneralStore interface with laboratory filters
2. **Receiving**: Items arrive in laboratory dispensaries (Chemistry, Hematology, etc.)
3. **Usage Tracking**: Record consumption for better forecasting
4. **Quality Control**: Track batch numbers and expiration dates

## Troubleshooting

### Common Issues
1. **"Insufficient Stock" Error**: Check if item is available in main store or other dispensaries
2. **Request Not Approved**: Contact your department manager or store supervisor
3. **Item Not Found**: Verify item category and search filters
4. **Transfer Failed**: Ensure destination dispensary accepts the item type

### Getting Help
- **Technical Issues**: Contact IT Support
- **Process Questions**: Contact Store Manager
- **Training Needs**: Contact Training Department
```

### 7.2 API Documentation
```yaml
# OpenAPI 3.0 Specification for Universal Inventory API
openapi: 3.0.0
info:
  title: Universal Inventory Management API
  version: 1.0.0
  description: Unified API for managing pharmacy, general store, and laboratory inventory

paths:
  /api/universal-inventory/transfer:
    post:
      summary: Transfer stock between stores/dispensaries
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - from_store_type
                - from_store_id
                - to_dispensary_id
                - item_id
                - quantity
                - reason
                - staff_id
              properties:
                from_store_type:
                  type: string
                  enum: [pharmacy, general, laboratory]
                from_store_id:
                  type: integer
                to_dispensary_id:
                  type: integer
                item_id:
                  type: integer
                quantity:
                  type: integer
                  minimum: 1
                reason:
                  type: string
                staff_id:
                  type: integer
      responses:
        200:
          description: Transfer successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransferResponse'
        400:
          description: Bad request (insufficient stock, invalid data, etc.)
        404:
          description: Store, dispensary, or item not found

  /api/universal-inventory/dispensaries/{id}/items:
    get:
      summary: Get items in a dispensary
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
        - name: include_expired
          in: query
          schema:
            type: boolean
            default: false
        - name: category
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of dispensary items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DispensaryItem'

  /api/universal-inventory/reports/cross-store:
    get:
      summary: Generate cross-store inventory report
      parameters:
        - name: start_date
          in: query
          schema:
            type: string
            format: date
        - name: end_date
          in: query
          schema:
            type: string
            format: date
        - name: store_types
          in: query
          schema:
            type: array
            items:
              type: string
              enum: [pharmacy, general, laboratory]
        - name: include_movements
          in: query
          schema:
            type: boolean
            default: false
      responses:
        200:
          description: Cross-store report data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CrossStoreReport'

components:
  schemas:
    TransferResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          type: object
          properties:
            dispensary_item_id:
              type: integer
            quantity_remaining:
              type: integer
            movement_id:
              type: integer

    DispensaryItem:
      type: object
      properties:
        id:
          type: integer
        item_id:
          type: integer
        item_name:
          type: string
        quantity_remaining:
          type: integer
        quantity_reserved:
          type: integer
        unit_cost:
          type: number
        total_value:
          type: number
        batch_number:
          type: string
        expiration_date:
          type: string
          format: date
        status:
          type: string
          enum: [active, expired, damaged, recalled]

    CrossStoreReport:
      type: object
      properties:
        summary:
          type: object
          properties:
            total_stores:
              type: integer
            total_dispensaries:
              type: integer
            total_value:
              type: number
            total_movements:
              type: integer
        stores:
          type: array
          items:
            type: object
            properties:
              store_type:
                type: string
              store_name:
                type: string
              total_items:
                type: integer
              total_value:
                type: number
              dispensaries:
                type: array
                items:
                  type: object
```

## Expected Outcomes and Benefits

### Immediate Benefits (Weeks 1-6)
1. **Unified Architecture**: All stores follow the same proven dispensary model
2. **Reduced Complexity**: Consolidation from 3 different systems to 1 standardized approach
3. **Better Integration**: Seamless procurement routing to appropriate stores
4. **Enhanced Tracking**: Complete audit trail across all inventory movements

### Medium-term Benefits (Months 2-6)
1. **Improved Efficiency**: Staff trained on single system vs. multiple interfaces  
2. **Better Planning**: Cross-store analytics enable better procurement decisions
3. **Cost Control**: Visibility into departmental usage patterns and costs
4. **Compliance**: Standardized processes meet regulatory requirements

### Long-term Benefits (6+ Months)
1. **Scalability**: Easy addition of new store types or locations
2. **Advanced Analytics**: Machine learning for demand forecasting
3. **Mobile Access**: Mobile apps for dispensary management
4. **Integration**: API-ready for integration with other healthcare systems

### Key Performance Indicators (KPIs)
1. **Stock Accuracy**: >95% inventory accuracy across all stores
2. **Stock-outs**: <2% stock-out incidents per month
3. **Processing Time**: <24 hours for standard requisition processing
4. **User Satisfaction**: >90% user satisfaction with new system
5. **Cost Reduction**: 15-20% reduction in carrying costs through better optimization

## Risk Mitigation and Rollback Plan

### Identified Risks and Mitigations
1. **Data Loss During Migration**
   - **Mitigation**: Complete backups before each phase
   - **Rollback**: Restore from backup and revert code changes

2. **User Adoption Issues**  
   - **Mitigation**: Comprehensive training and parallel running
   - **Rollback**: Maintain old system access during transition

3. **Performance Degradation**
   - **Mitigation**: Load testing and database optimization
   - **Rollback**: Database scaling and query optimization

4. **Integration Failures**
   - **Mitigation**: Thorough API testing and error handling
   - **Rollback**: Feature flags to disable problematic integrations

### Success Criteria
- [ ] All existing functionality preserved or enhanced
- [ ] Data migration 100% successful with verification
- [ ] User training completion >95%
- [ ] System performance within acceptable thresholds
- [ ] Regulatory compliance maintained
- [ ] Zero critical bugs in production

## Implementation Checklist

### Phase 1: Foundation Architecture
- [ ] Create GeneralStore_Dispensaries table
- [ ] Create GeneralStore_DispensaryItems table
- [ ] Add laboratory categories to GeneralStore
- [ ] Create GeneralStoreDispensary model
- [ ] Create GeneralStoreDispensaryItem model
- [ ] Implement UniversalInventoryService
- [ ] Write unit tests for new models

### Phase 2: GeneralStore Dispensary Implementation
- [ ] Create DispensaryManagementService
- [ ] Implement WorkflowManagementService
- [ ] Update GeneralStore controllers for dispensary support
- [ ] Add dispensary management API endpoints
- [ ] Create dispensary request/approval workflows
- [ ] Implement auto-replenishment logic
- [ ] Write integration tests

### Phase 3: Procurement Multi-Store Integration
- [ ] Create ProcurementRoutingService
- [ ] Implement smart item type detection
- [ ] Update ProcurementService for multi-store support
- [ ] Add auto-distribution to dispensaries
- [ ] Update procurement controllers
- [ ] Test routing logic for all store types
- [ ] Write procurement integration tests

### Phase 4: Laboratory Store Migration
- [ ] Backup existing Lab_Items table
- [ ] Create laboratory categories in GeneralStore
- [ ] Migrate data from Lab_Items to GeneralStore_Items
- [ ] Create laboratory dispensaries
- [ ] Distribute existing stock to dispensaries
- [ ] Add backward compatibility API endpoints
- [ ] Update GeneralStore controllers for lab items
- [ ] Test migration thoroughly

### Phase 5: Client-Side Standardization
- [ ] Create UniversalStoreManager component
- [ ] Create DispensaryManager component
- [ ] Create UniversalItemsTable component
- [ ] Create item request/receive/dispense modals
- [ ] Update Vuex store structure
- [ ] Add universal inventory actions
- [ ] Update routing for new components
- [ ] Test all client-side functionality

### Phase 6: Testing and Validation
- [ ] Write comprehensive integration tests
- [ ] Create performance test suite
- [ ] Test data migration scripts
- [ ] Validate API backward compatibility
- [ ] Test cross-store functionality
- [ ] Load test with realistic data volumes
- [ ] User acceptance testing

### Phase 7: Training and Documentation
- [ ] Create user documentation
- [ ] Write API documentation
- [ ] Create training materials
- [ ] Conduct staff training sessions
- [ ] Create troubleshooting guides
- [ ] Set up help desk procedures
- [ ] Monitor user adoption

This comprehensive plan standardizes your inventory management while preserving the excellent dispensary architecture you've established. The phased approach minimizes risk while delivering immediate value.