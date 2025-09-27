<template>
  <div class="dispensary-stock">
    <div class="row">
      <div class="col-12">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">
                {{ dispensary.name || 'Dispensary' }} - Stock Management
              </span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">
                View and manage dispensary inventory
              </span>
            </h3>
            <div class="card-toolbar">
              <button class="btn btn-primary font-weight-bolder mr-3" @click="showTransferModal">
                <i class="ki ki-arrow-next icon-sm"></i>
                Transfer Items
              </button>
              <router-link
                :to="`/general-store/dispensaries/${dispensaryId}`"
                class="btn btn-light font-weight-bolder"
              >
                <i class="ki ki-arrow-left icon-sm"></i>
                Back to Details
              </router-link>
            </div>
          </div>

          <div class="card-body py-0">
            <div v-if="loading" class="text-center py-10">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>

            <div v-else>
              <!-- Stock Summary -->
              <div class="row mb-6">
                <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card card-custom bg-light-primary">
                    <div class="card-body text-center">
                      <i class="ki ki-package text-primary icon-3x mb-3"></i>
                      <div class="text-dark font-weight-bolder font-size-h2">
                        {{ stockSummary.totalItems }}
                      </div>
                      <div class="text-muted font-weight-bold">Total Items</div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card card-custom bg-light-success">
                    <div class="card-body text-center">
                      <i class="ki ki-dollar text-success icon-3x mb-3"></i>
                      <div class="text-dark font-weight-bolder font-size-h2">
                        {{ formatCurrency(stockSummary.totalValue) }}
                      </div>
                      <div class="text-muted font-weight-bold">Total Value</div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card card-custom bg-light-warning">
                    <div class="card-body text-center">
                      <i class="ki ki-warning text-warning icon-3x mb-3"></i>
                      <div class="text-dark font-weight-bolder font-size-h2">
                        {{ stockSummary.lowStockItems }}
                      </div>
                      <div class="text-muted font-weight-bold">Low Stock</div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card card-custom bg-light-info">
                    <div class="card-body text-center">
                      <i class="ki ki-clock text-info icon-3x mb-3"></i>
                      <div class="text-dark font-weight-bolder font-size-h2">
                        {{ stockSummary.expiringItems }}
                      </div>
                      <div class="text-muted font-weight-bold">Expiring Soon</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Items Table -->
              <div class="card card-custom">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="ki ki-list text-primary mr-2"></i>
                    Stock Items
                  </h3>
                  <div class="card-toolbar">
                    <!-- Filters -->
                    <div class="d-flex align-items-center mr-3">
                      <label class="text-muted mr-2">Filter:</label>
                      <select
                        v-model="filter"
                        class="form-control form-control-sm"
                        style="width: 150px"
                      >
                        <option value="">All Items</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="expiring">Expiring Soon</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>

                    <!-- Search -->
                    <div class="input-group" style="width: 200px">
                      <input
                        type="text"
                        v-model="searchTerm"
                        class="form-control form-control-sm"
                      />
                      <div class="input-group-append">
                        <button class="btn btn-sm btn-primary" type="button">
                          <i class="ki ki-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-head-custom table-vertical-center">
                      <thead>
                        <tr class="text-left">
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
                          <td colspan="8" class="text-center py-6">
                            <i class="ki ki-information text-muted icon-3x mb-3"></i>
                            <p class="text-muted mb-0">No stock items found</p>
                          </td>
                        </tr>

                        <tr v-for="stockItem in filteredStockItems" :key="stockItem.id">
                          <td>
                            <span class="font-weight-bold">{{ stockItem.item_code }}</span>
                          </td>
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="symbol symbol-40 symbol-light-primary mr-3">
                                <div class="symbol-label">
                                  <i class="ki ki-package text-primary font-size-h5"></i>
                                </div>
                              </div>
                              <div>
                                <div class="font-weight-bold">{{ stockItem.name }}</div>
                                <div class="text-muted font-size-sm">
                                  {{ stockItem.generic_name || '' }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="font-weight-bold">{{ stockItem.category_name }}</span>
                          </td>
                          <td>
                            <div class="d-flex align-items-center">
                              <span
                                :class="getStockLevelClass(stockItem)"
                                class="font-weight-bold mr-2"
                              >
                                {{ stockItem.quantity }}
                              </span>
                              <span class="text-muted">{{
                                stockItem.unit_of_measurement || 'units'
                              }}</span>
                            </div>
                            <div v-if="isLowStock(stockItem)" class="text-warning font-size-sm">
                              <i class="ki ki-warning"></i> Low Stock
                            </div>
                          </td>
                          <td>
                            <span class="font-weight-bold">{{
                              formatCurrency(stockItem.unit_price)
                            }}</span>
                          </td>
                          <td>
                            <span class="font-weight-bold">{{
                              formatCurrency(stockItem.quantity * stockItem.unit_price)
                            }}</span>
                          </td>
                          <td>
                            <span :class="getStatusClass(stockItem)" class="label label-inline">
                              {{ getStatusText(stockItem) }}
                            </span>
                          </td>
                          <td>
                            <div class="dropdown dropdown-inline">
                              <button
                                class="btn btn-clean btn-hover-light-primary btn-sm btn-icon"
                                type="button"
                                data-toggle="dropdown"
                              >
                                <i class="ki ki-bold-more-hor"></i>
                              </button>

                              <div class="dropdown-menu dropdown-menu-right">
                                <button
                                  class="dropdown-item"
                                  @click="dispenseItem(stockItem)"
                                  :disabled="stockItem.quantity <= 0"
                                >
                                  <i class="ki ki-check text-success"></i>
                                  Dispense
                                </button>
                                <button class="dropdown-item" @click="adjustStock(stockItem)">
                                  <i class="ki ki-edit text-primary"></i>
                                  Adjust Stock
                                </button>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item" @click="viewItemHistory(stockItem)">
                                  <i class="ki ki-clock text-info"></i>
                                  View History
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <TransferModal ref="transferModal" @transfer-completed="handleTransferCompleted" />

    <!-- Dispense Modal -->
    <DispenseModal ref="dispenseModal" @dispense-completed="handleDispenseCompleted" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TransferModal from '@/view/components/shared/TransferModal.vue';
import DispenseModal from '@/view/components/shared/DispenseModal.vue';

export default {
  name: 'DispensaryStock',
  components: {
    TransferModal,
    DispenseModal,
  },
  data() {
    return {
      loading: false,
      stockItems: [],
      filter: '',
      searchTerm: '',
    };
  },
  computed: {
    ...mapState('generalStore', ['currentDispensary', 'dispensaryStock', 'items']),
    dispensaryId() {
      return this.$route.params.id;
    },
    dispensary() {
      return this.currentDispensary || {};
    },
    stockSummary() {
      const items = this.stockItems;
      return {
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
        lowStockItems: items.filter((item) => this.isLowStock(item)).length,
        expiringItems: items.filter((item) => this.isExpiringSoon(item)).length,
      };
    },
    filteredStockItems() {
      let filtered = [...this.stockItems];

      // Apply filter
      if (this.filter) {
        switch (this.filter) {
          case 'low_stock':
            filtered = filtered.filter((item) => this.isLowStock(item));
            break;
          case 'expiring':
            filtered = filtered.filter((item) => this.isExpiringSoon(item));
            break;
          case 'out_of_stock':
            filtered = filtered.filter((item) => item.quantity <= 0);
            break;
        }
      }

      // Apply search
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.item_code.toLowerCase().includes(term) ||
            (item.generic_name && item.generic_name.toLowerCase().includes(term))
        );
      }

      return filtered;
    },
  },
  async created() {
    await this.loadDispensaryStock();
  },
  methods: {
    async loadDispensaryStock() {
      this.loading = true;
      try {
        await Promise.all([
          this.$store.dispatch('generalStore/fetchDispensaryById', this.dispensaryId),
          this.$store.dispatch('generalStore/fetchDispensaryStock', this.dispensaryId),
          this.$store.dispatch('generalStore/fetchItems', { limit: 100 }),
        ]);

        this.stockItems = this.dispensaryStock || [];
      } catch (error) {
        this.$toast.error('Failed to load dispensary stock');
      } finally {
        this.loading = false;
      }
    },

    isLowStock(item) {
      return item.quantity <= (item.minimum_stock_level || 10);
    },

    isExpiringSoon(item) {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    },

    getStockLevelClass(item) {
      if (item.quantity <= 0) return 'text-danger';
      if (this.isLowStock(item)) return 'text-warning';
      return 'text-success';
    },

    getStatusText(item) {
      if (item.quantity <= 0) return 'Out of Stock';
      if (this.isLowStock(item)) return 'Low Stock';
      if (this.isExpiringSoon(item)) return 'Expiring Soon';
      return 'In Stock';
    },

    getStatusClass(item) {
      if (item.quantity <= 0) return 'label-light-danger';
      if (this.isLowStock(item)) return 'label-light-warning';
      if (this.isExpiringSoon(item)) return 'label-light-warning';
      return 'label-light-success';
    },

    showTransferModal() {
      this.$refs.transferModal.show(this.dispensary, this.items);
    },

    dispenseItem(stockItem) {
      this.$refs.dispenseModal.show(stockItem, this.dispensary);
    },

    adjustStock(stockItem) {
      this.$emit('adjust-stock', stockItem);
    },

    viewItemHistory(stockItem) {
      this.$emit('view-item-history', stockItem);
    },

    handleTransferCompleted() {
      this.$toast.success('Items transferred successfully');
      this.loadDispensaryStock();
    },

    handleDispenseCompleted() {
      this.$toast.success('Item dispensed successfully');
      this.loadDispensaryStock();
    },

    formatCurrency(amount) {
      if (!amount || amount === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount);
    },
  },
};
</script>

<style scoped>
.card-custom {
  box-shadow: 0px 0px 30px 0px rgba(82, 63, 105, 0.05);
}

.symbol-40 {
  width: 40px;
  height: 40px;
}

.table-head-custom thead th {
  border: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  color: #b5b5c3;
  font-size: 0.9rem;
  font-weight: 500;
}

.label {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.42rem;
}

.label-light-success {
  color: #1bc5bd;
  background-color: #c9f7f5;
}

.label-light-warning {
  color: #ffa800;
  background-color: #fff4de;
}

.label-light-danger {
  color: #f64e60;
  background-color: #ffe2e5;
}

.dropdown-menu {
  min-width: 150px;
}

.dropdown-item {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.dropdown-item i {
  width: 16px;
  margin-right: 0.5rem;
}
</style>
