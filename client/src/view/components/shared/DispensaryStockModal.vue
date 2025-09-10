<template>
  <b-modal
    ref="modal"
    id="dispensary-stock-modal"
    :title="modalTitle"
    size="xl"
    ok-title="Close"
    ok-only
    @hidden="resetData"
  >
    <div v-if="selectedDispensary">
      <!-- Dispensary Info Header -->
      <div class="card card-custom bg-light-primary mb-4">
        <div class="card-body py-3">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-40 symbol-light-primary mr-3">
                <div class="symbol-label">
                  <i class="ki ki-shop text-primary font-size-h5"></i>
                </div>
              </div>
              <div>
                <h5 class="text-dark font-weight-bolder mb-1">{{ selectedDispensary.name }}</h5>
                <span class="text-muted">{{ selectedDispensary.location }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-dark font-weight-bolder">{{ stockItems.length }} Items</div>
              <div class="text-muted font-size-sm">Total Stock</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Summary Cards -->
      <div class="row mb-5">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card card-custom bg-light-success">
            <div class="card-body text-center py-4">
              <div class="text-success font-weight-bolder font-size-h3">
                {{ stockSummary.totalValue | currency }}
              </div>
              <div class="text-muted font-weight-bold">Total Value</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card card-custom bg-light-info">
            <div class="card-body text-center py-4">
              <div class="text-info font-weight-bolder font-size-h3">
                {{ stockSummary.totalItems }}
              </div>
              <div class="text-muted font-weight-bold">Total Items</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card card-custom bg-light-warning">
            <div class="card-body text-center py-4">
              <div class="text-warning font-weight-bolder font-size-h3">
                {{ stockSummary.lowStock }}
              </div>
              <div class="text-muted font-weight-bold">Low Stock</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card card-custom bg-light-danger">
            <div class="card-body text-center py-4">
              <div class="text-danger font-weight-bolder font-size-h3">
                {{ stockSummary.outOfStock }}
              </div>
              <div class="text-muted font-weight-bold">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="row mb-4">
        <div class="col-md-4">
          <select v-model="filter" class="form-control">
            <option value="">All Items</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
        <div class="col-md-8">
          <div class="input-group">
            <input
              type="text"
              v-model="searchTerm"
              class="form-control"
              placeholder="Search items by name or code..."
            />
            <div class="input-group-append">
              <button class="btn btn-primary" type="button">
                <i class="ki ki-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Items Table -->
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="table table-bordered table-hover">
          <thead class="thead-light">
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStockItems.length === 0">
              <td colspan="8" class="text-center py-4">
                <i class="ki ki-information text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No stock items found</p>
              </td>
            </tr>

            <tr v-for="item in filteredStockItems" :key="item.id">
              <td>
                <span class="font-weight-bold">{{ item.item_code }}</span>
              </td>
              <td>
                <div>
                  <div class="font-weight-bold">{{ item.name }}</div>
                  <div class="text-muted font-size-sm">{{ item.generic_name || '' }}</div>
                </div>
              </td>
              <td>
                <span class="font-weight-bold">{{ item.category_name }}</span>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <span :class="getStockLevelClass(item)" class="font-weight-bold mr-2">
                    {{ item.quantity }}
                  </span>
                  <span class="text-muted">{{ item.unit_of_measurement || 'units' }}</span>
                </div>
              </td>
              <td>
                <span class="font-weight-bold">{{ item.unit_price | currency }}</span>
              </td>
              <td>
                <span class="font-weight-bold">{{
                  (item.quantity * item.unit_price) | currency
                }}</span>
              </td>
              <td>
                <span :class="getStatusClass(item)" class="badge">
                  {{ getStatusText(item) }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-primary mr-1"
                  @click="dispenseItem(item)"
                  :disabled="item.quantity <= 0"
                >
                  <i class="ki ki-check icon-xs"></i>
                </button>
                <button class="btn btn-sm btn-info" @click="viewItemDetails(item)">
                  <i class="ki ki-eye icon-xs"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dispense Modal -->
    <DispenseModal ref="dispenseModal" @dispense-completed="handleDispenseCompleted" />
  </b-modal>
</template>

<script>
import DispenseModal from './DispenseModal.vue';

export default {
  name: 'DispensaryStockModal',
  components: {
    DispenseModal,
  },
  data() {
    return {
      selectedDispensary: null,
      stockItems: [],
      filter: '',
      searchTerm: '',
      loading: false,
    };
  },
  computed: {
    modalTitle() {
      return this.selectedDispensary
        ? `${this.selectedDispensary.name} - Stock Overview`
        : 'Dispensary Stock';
    },
    stockSummary() {
      const items = this.stockItems;
      return {
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
        lowStock: items.filter(item => this.isLowStock(item)).length,
        outOfStock: items.filter(item => item.quantity <= 0).length,
      };
    },
    filteredStockItems() {
      let filtered = [...this.stockItems];

      // Apply filter
      if (this.filter) {
        switch (this.filter) {
          case 'low_stock':
            filtered = filtered.filter(item => this.isLowStock(item));
            break;
          case 'out_of_stock':
            filtered = filtered.filter(item => item.quantity <= 0);
            break;
          case 'expiring':
            filtered = filtered.filter(item => this.isExpiringSoon(item));
            break;
        }
      }

      // Apply search
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(term) ||
            item.item_code.toLowerCase().includes(term) ||
            (item.generic_name && item.generic_name.toLowerCase().includes(term))
        );
      }

      return filtered;
    },
  },
  filters: {
    currency(value) {
      if (!value || value === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(value);
    },
  },
  methods: {
    async show(dispensary) {
      this.selectedDispensary = dispensary;
      await this.loadDispensaryStock(dispensary.id);
      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    resetData() {
      this.selectedDispensary = null;
      this.stockItems = [];
      this.filter = '';
      this.searchTerm = '';
      this.loading = false;
    },

    async loadDispensaryStock(dispensaryId) {
      this.loading = true;
      try {
        const response = await this.$store.dispatch(
          'generalStore/fetchDispensaryStock',
          dispensaryId
        );
        this.stockItems = response || [];
      } catch (error) {
        this.$toast.error('Failed to load dispensary stock');
        this.stockItems = [];
      } finally {
        this.loading = false;
      }
    },

    isLowStock(item) {
      if (!item || typeof item.quantity !== 'number') return false;
      return item.quantity > 0 && item.quantity <= (item.minimum_stock_level || 10);
    },

    isExpiringSoon(item) {
      if (!item || !item.expiry_date) return false;
      try {
        const expiryDate = new Date(item.expiry_date);
        if (isNaN(expiryDate.getTime())) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      } catch (error) {
        return false;
      }
    },

    getStockLevelClass(item) {
      if (!item || typeof item.quantity !== 'number') return 'text-muted';
      if (item.quantity <= 0) return 'text-danger';
      if (this.isLowStock(item)) return 'text-warning';
      return 'text-success';
    },

    getStatusText(item) {
      if (!item || typeof item.quantity !== 'number') return 'Unknown';
      if (item.quantity <= 0) return 'Out of Stock';
      if (this.isLowStock(item)) return 'Low Stock';
      if (this.isExpiringSoon(item)) return 'Expiring Soon';
      return 'In Stock';
    },

    getStatusClass(item) {
      if (!item || typeof item.quantity !== 'number') return 'badge-secondary';
      if (item.quantity <= 0) return 'badge-danger';
      if (this.isLowStock(item)) return 'badge-warning';
      if (this.isExpiringSoon(item)) return 'badge-warning';
      return 'badge-success';
    },

    dispenseItem(item) {
      this.$refs.dispenseModal.show(item, this.selectedDispensary);
    },

    viewItemDetails(item) {
      this.$emit('view-item-details', item);
    },

    handleDispenseCompleted() {
      this.$toast.success('Item dispensed successfully');
      this.loadDispensaryStock(this.selectedDispensary.id);
    },
  },
};
</script>

<style scoped>
.card-custom {
  box-shadow: 0px 0px 20px 0px rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
}

.symbol-40 {
  width: 40px;
  height: 40px;
}

.table th {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5e6278;
  border-top: none;
}

.table td {
  font-size: 0.9rem;
  vertical-align: middle;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
</style>
