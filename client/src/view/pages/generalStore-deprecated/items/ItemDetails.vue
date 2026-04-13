<template>
  <div class="item-details">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <div class="d-flex align-items-center">
            <button @click="$router.go(-1)" class="btn btn-light btn-sm mr-3">
              <i class="flaticon2-arrow-left mr-1"></i>
              Back
            </button>
            <div>
              <h1 class="text-dark font-weight-bold mb-2">
                <i class="flaticon2-box text-primary mr-3"></i>
                {{ item?.name || 'Item Details' }}
              </h1>
              <p class="text-muted font-size-lg mb-0">
                {{ item?.description || 'View detailed information about this item' }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showEditModal = true"
              class="btn btn-warning btn-lg mr-3"
            >
              <i class="flaticon2-edit mr-2"></i>
              Edit Item
            </button>
            <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading item details...</span>
      </div>
      <p class="text-muted mt-3">Loading item details...</p>
    </div>

    <!-- Item Details Content -->
    <div v-else-if="item" class="item-content">
      <div class="row">
        <!-- Main Information -->
        <div class="col-lg-8">
          <!-- Basic Information Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-primary mr-2"></i>
                Basic Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Item Code</label>
                  <p class="form-control-static">
                    <span class="badge badge-primary badge-lg">{{ item.item_code }}</span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Status</label>
                  <p class="form-control-static">
                    <span :class="getStatusBadgeClass(item.status)">
                      {{ item.status }}
                    </span>
                  </p>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label font-weight-bold text-muted">Description</label>
                  <p class="form-control-static">
                    {{ item.description || 'No description provided' }}
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Category</label>
                  <p class="form-control-static">
                    <span class="badge badge-light-primary">{{
                      item.category?.name || 'N/A'
                    }}</span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Subcategory</label>
                  <p class="form-control-static">
                    <span class="badge badge-light-info">{{
                      item.subcategory?.name || 'N/A'
                    }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Details Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-settings text-primary mr-2"></i>
                Technical Details
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Manufacturer</label>
                  <p class="form-control-static">
                    {{ item.manufacturer || 'Not specified' }}
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Model Number</label>
                  <p class="form-control-static">
                    {{ item.model_number || 'Not specified' }}
                  </p>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label font-weight-bold text-muted">Specifications</label>
                  <div class="form-control-static">
                    <pre v-if="item.specifications" class="specifications-json">{{
                      formatSpecifications(item.specifications)
                    }}</pre>
                    <span v-else class="text-muted">No specifications provided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stock Movements Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-arrow text-primary mr-2"></i>
                Recent Stock Movements
              </h5>
            </div>
            <div class="card-body">
              <div v-if="itemMovements.length === 0" class="text-center py-4">
                <i class="flaticon2-arrow text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No recent movements</p>
              </div>
              <div v-else>
                <div
                  v-for="movement in itemMovements.slice(0, 5)"
                  :key="movement.id"
                  class="movement-item d-flex align-items-center py-3 border-bottom"
                >
                  <div class="movement-icon mr-3">
                    <i
                      :class="[
                        getMovementIcon(movement.movement_type),
                        getMovementColor(movement.movement_type),
                      ]"
                    ></i>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="font-weight-bold mb-1">{{ movement.movement_type }}</h6>
                    <p class="text-muted mb-0">
                      Quantity: {{ movement.quantity }} | Reference:
                      {{ movement.reference_number || 'N/A' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <small class="text-muted">{{ formatDate(movement.created_at) }}</small>
                  </div>
                </div>

                <div class="text-center pt-3">
                  <button @click="viewAllMovements" class="btn btn-sm btn-outline-primary">
                    View All Movements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Stock Information Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-graph text-primary mr-2"></i>
                Stock Information
              </h5>
            </div>
            <div class="card-body">
              <div class="stock-overview text-center mb-4">
                <div class="stock-circle" :class="getStockLevelClass(item)">
                  <h2 class="stock-number">{{ item.current_stock }}</h2>
                  <small class="stock-label">Current Stock</small>
                </div>
              </div>

              <div class="stock-details">
                <div class="stock-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Minimum Stock:</span>
                  <span class="font-weight-bold">{{ item.minimum_stock }}</span>
                </div>

                <div class="stock-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Maximum Stock:</span>
                  <span class="font-weight-bold">{{ item.maximum_stock || 'Not set' }}</span>
                </div>

                <div class="stock-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Unit Cost:</span>
                  <span class="font-weight-bold text-success"
                    >${{ formatCurrency(item.unit_cost) }}</span
                  >
                </div>

                <div class="stock-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Total Value:</span>
                  <span class="font-weight-bold text-primary"
                    >${{ formatCurrency(item.current_stock * item.unit_cost) }}</span
                  >
                </div>

                <div class="stock-bar mb-3">
                  <div class="stock-bar-label d-flex justify-content-between mb-1">
                    <small class="text-muted">Stock Level</small>
                    <small class="text-muted">{{ getStockPercentage(item) }}%</small>
                  </div>
                  <div class="stock-bar-bg">
                    <div
                      class="stock-bar-fill"
                      :class="getStockLevelClass(item)"
                      :style="{ width: getStockPercentage(item) + '%' }"
                    ></div>
                  </div>
                </div>

                <div class="stock-alerts">
                  <div v-if="item.current_stock === 0" class="alert alert-danger py-2 mb-2">
                    <i class="flaticon2-warning mr-1"></i>
                    Out of Stock
                  </div>
                  <div
                    v-else-if="item.current_stock <= item.minimum_stock"
                    class="alert alert-warning py-2 mb-2"
                  >
                    <i class="flaticon2-warning mr-1"></i>
                    Low Stock Alert
                  </div>
                  <div v-else class="alert alert-success py-2 mb-2">
                    <i class="flaticon2-check mr-1"></i>
                    Stock Level Normal
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Storage Information Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-location text-primary mr-2"></i>
                Storage Information
              </h5>
            </div>
            <div class="card-body">
              <div class="storage-details">
                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Location:</span>
                  <span class="font-weight-bold">{{ item.location || 'Not specified' }}</span>
                </div>

                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Shelf Number:</span>
                  <span class="font-weight-bold">{{ item.shelf_number || 'Not specified' }}</span>
                </div>

                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Expiry Date:</span>
                  <span class="font-weight-bold">{{
                    item.expiry_date ? formatDate(item.expiry_date) : 'Not specified'
                  }}</span>
                </div>

                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Expirable:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        item.is_expirable
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ item.is_expirable ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Serialized:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        item.is_serialized
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ item.is_serialized ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div class="storage-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Lot Tracked:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        item.is_lot_tracked
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ item.is_lot_tracked ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-gear text-primary mr-2"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button @click="showMovementModal = true" class="btn btn-success btn-block mb-2">
                  <i class="flaticon2-arrow mr-2"></i>
                  Record Movement
                </button>

                <button @click="showRequestModal = true" class="btn btn-warning btn-block mb-2">
                  <i class="flaticon2-file mr-2"></i>
                  Create Request
                </button>

                <button @click="printItem" class="btn btn-info btn-block mb-2">
                  <i class="flaticon2-printer mr-2"></i>
                  Print Details
                </button>

                <button @click="exportItem" class="btn btn-secondary btn-block">
                  <i class="flaticon2-download mr-2"></i>
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-edit text-warning mr-2"></i>
            Edit Item
          </h4>
          <button @click="showEditModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <EditItemForm
            :item="item"
            @item-updated="handleItemUpdated"
            @cancel="showEditModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Record Movement Modal -->
    <div v-if="showMovementModal" class="modal-overlay" @click="showMovementModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-arrow text-success mr-2"></i>
            Record Stock Movement
          </h4>
          <button @click="showMovementModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateMovementForm
            :item="item"
            @movement-created="handleMovementCreated"
            @cancel="showMovementModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div v-if="showRequestModal" class="modal-overlay" @click="showRequestModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-file text-warning mr-2"></i>
            Create Request
          </h4>
          <button @click="showRequestModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateRequestForm
            :item="item"
            @request-created="handleRequestCreated"
            @cancel="showRequestModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';
import EditItemForm from './EditItem.vue';
import CreateMovementForm from '../movements/CreateMovement.vue';
import CreateRequestForm from '../requests/CreateRequest.vue';

export default {
  name: 'ItemDetails',
  components: {
    EditItemForm,
    CreateMovementForm,
    CreateRequestForm,
  },
  data() {
    return {
      loading: false,
      showEditModal: false,
      showMovementModal: false,
      showRequestModal: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'General Store Manager', 'General Store Staff'],
    };
  },
  computed: {
    // Get data from Vuex store
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    storeError() {
      return this.$store.state.generalStore.error;
    },
    itemMovements() {
      return this.$store.state.generalStore.itemMovements;
    },
    item() {
      return this.$store.state.generalStore.currentItem;
    },
  },
  async created() {
    await this.loadItemDetails();
  },
  methods: {
    async loadItemDetails() {
      this.loading = true;
      try {
        const itemId = this.$route.params.id;
        await this.$store.dispatch('generalStore/fetchItemById', itemId);
        await this.$store.dispatch('generalStore/fetchItemMovements', { itemId: itemId, limit: 5 });

        // if (!this.item) {
        //   this.$router.push('/general-store/items');
        // }
      } catch (error) {
        this.$toast.error('Failed to load item details');
      } finally {
        this.loading = false;
      }
    },

    getStatusBadgeClass(status) {
      const classes = {
        ACTIVE: 'badge badge-success',
        INACTIVE: 'badge badge-warning',
        DISCONTINUED: 'badge badge-danger',
      };
      return classes[status] || 'badge badge-secondary';
    },

    getStockLevelClass(item) {
      if (item.current_stock === 0) return 'stock-empty';
      if (item.current_stock <= item.minimum_stock) return 'stock-low';
      return 'stock-normal';
    },

    getStockPercentage(item) {
      if (item.maximum_stock === 0) return 0;
      return Math.min(100, (item.current_stock / item.maximum_stock) * 100);
    },

    getMovementIcon(type) {
      const icons = {
        IN: 'flaticon2-arrow-down',
        OUT: 'flaticon2-arrow-up',
        TRANSFER: 'flaticon2-arrow-right',
        ADJUSTMENT: 'flaticon2-edit',
      };
      return icons[type] || 'flaticon2-arrow';
    },

    getMovementColor(type) {
      const colors = {
        IN: 'text-success',
        OUT: 'text-danger',
        TRANSFER: 'text-info',
        ADJUSTMENT: 'text-warning',
      };
      return colors[type] || 'text-muted';
    },

    formatSpecifications(specs) {
      try {
        if (typeof specs === 'string') {
          return JSON.stringify(JSON.parse(specs), null, 2);
        }
        return JSON.stringify(specs, null, 2);
      } catch {
        return specs;
      }
    },

    formatCurrency(amount) {
      return parseFloat(amount).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    viewAllMovements() {
      this.$router.push(`/general-store/movements?item_id=${this.item.id}`);
    },

    handleItemUpdated() {
      this.showEditModal = false;
      this.loadItemDetails();
      this.$toast.success('Item updated successfully');
    },

    handleMovementCreated() {
      this.showMovementModal = false;
      this.loadItemDetails();
      this.$toast.success('Movement recorded successfully');
    },

    handleRequestCreated() {
      this.showRequestModal = false;
      this.$toast.success('Request created successfully');
    },

    async refreshData() {
      await this.loadItemDetails();
    },

    async printItem() {
      try {
        const itemData = [
          {
            id: this.item.id,
            name: this.item.name,
            code: this.item.code,
            description: this.item.description,
            current_stock: this.item.current_stock,
            minimum_stock: this.item.minimum_stock,
            unit_price: this.item.unit_price,
            total_value: this.item.current_stock * this.item.unit_price,
            category: this.item.category?.name || 'N/A',
            subcategory: this.item.subcategory?.name || 'N/A',
            created_at: this.item.created_at,
          },
        ];

        const reportConfig = {
          title: `Item Details - ${this.item.name}`,
          subtitle: `Item Code: ${this.item.code}`,
          orientation: 'portrait',
          format: 'a4',
        };
        await this.$printReport(itemData, reportConfig);
      } catch (error) {
        this.$logError('Failed to print item details', error, { itemId: this.item.id });
        this.$toast.error('Failed to print item details');
      }
    },

    async exportItem() {
      try {
        const itemData = [
          {
            id: this.item.id,
            name: this.item.name,
            code: this.item.code,
            description: this.item.description,
            current_stock: this.item.current_stock,
            minimum_stock: this.item.minimum_stock,
            unit_price: this.item.unit_price,
            total_value: this.item.current_stock * this.item.unit_price,
            category: this.item.category?.name || 'N/A',
            subcategory: this.item.subcategory?.name || 'N/A',
            created_at: this.item.created_at,
          },
        ];

        const reportName = `Item_${this.item.code}_${new Date().toISOString().split('T')[0]}`;
        await this.$exportData(itemData, reportName, 'xlsx', {
          formatters: {
            current_stock: (value) => Number(value || 0),
            minimum_stock: (value) => Number(value || 0),
            unit_price: (value) => Number(value || 0).toFixed(2),
            total_value: (value) => Number(value || 0).toFixed(2),
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export item details', error, { itemId: this.item.id });
        this.$toast.error('Failed to export item details');
      }
    },
  },
};
</script>

<style scoped>
.item-details {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
}

.header-section h1 {
  color: white !important;
}

.header-section p {
  color: rgba(255, 255, 255, 0.8) !important;
}

.card-custom {
  border: 1px solid #e0f7fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0f7fa;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.form-label {
  margin-bottom: 0.5rem;
}

.form-control-static {
  margin: 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stock-overview {
  padding: 1rem 0;
}

.stock-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.stock-normal {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.stock-low {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.stock-empty {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.stock-number {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.stock-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.stock-details {
  padding: 1rem 0;
}

.stock-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-bar {
  margin: 1rem 0;
}

.stock-bar-bg {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.stock-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-bar-fill.stock-normal {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.stock-bar-fill.stock-low {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.stock-bar-fill.stock-empty {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.stock-alerts .alert {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.storage-details {
  padding: 1rem 0;
}

.storage-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.storage-item:last-child {
  border-bottom: none;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
}

.quick-actions .btn:last-child {
  margin-bottom: 0;
}

.movement-item {
  transition: background-color 0.2s ease;
}

.movement-item:hover {
  background-color: #f8f9fa;
}

.movement-icon i {
  font-size: 1.5rem;
}

.specifications-json {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #495057;
  max-height: 200px;
  overflow-y: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #495057;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close:hover {
  color: #343a40;
}

.modal-body {
  padding: 1.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section {
    padding: 1rem;
    text-align: center;
  }

  .header-section .text-right {
    text-align: center !important;
    margin-top: 1rem;
  }

  .stock-circle {
    width: 100px;
    height: 100px;
  }

  .stock-number {
    font-size: 1.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
