<template>
  <div class="universal-items-table">
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center overflow-hidden">
        <thead>
          <tr class="text-left">
            <th style="min-width: 120px">Item Code</th>
            <th style="min-width: 200px">Item Name</th>
            <th style="min-width: 120px">Category</th>
            <th style="min-width: 100px" v-if="showStock">Stock</th>
            <th style="min-width: 100px" v-if="showPrice">Unit Price</th>
            <th style="min-width: 120px" v-if="showValue">Total Value</th>
            <th style="min-width: 80px">Status</th>
            <th style="min-width: 80px" v-if="showExpiry">Expiry</th>
            <th class="text-center" style="min-width: 130px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columnCount" class="text-center py-5">
              <div class="spinner-border spinner-border-lg text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="items.length === 0">
            <td :colspan="columnCount" class="text-center py-5">
              <div class="d-flex flex-column align-items-center">
                <i class="ki ki-information text-muted font-size-h1"></i>
                <span class="text-muted font-weight-bold mt-3">No items found</span>
              </div>
            </td>
          </tr>

          <tr v-else v-for="item in items" :key="item.id">
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.item_code || item.code }}
              </span>
            </td>

            <td>
              <div class="d-flex align-items-center">
                <div class="symbol symbol-40 symbol-light-primary mr-3">
                  <div class="symbol-label">
                    <i :class="itemIcon(item)" class="text-primary font-size-h5"></i>
                  </div>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    {{ item.name }}
                  </span>
                  <span class="text-muted font-weight-bold font-size-sm" v-if="item.generic_name">
                    {{ item.generic_name }}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <span class="text-dark-75 font-weight-bolder d-block">
                {{ getCategoryName(item) }}
              </span>
              <span
                class="text-muted font-weight-bold font-size-sm"
                v-if="getSubcategoryName(item)"
              >
                {{ getSubcategoryName(item) }}
              </span>
            </td>

            <td v-if="showStock">
              <div class="d-flex align-items-center">
                <span :class="stockClass(item)" class="font-weight-bolder font-size-lg">
                  {{ getStockQuantity(item) }}
                </span>
                <span class="text-muted font-size-sm ml-1">
                  {{ item.unit_of_measurement || 'units' }}
                </span>
              </div>
              <div v-if="isLowStock(item)" class="text-danger font-size-sm">
                <i class="ki ki-warning text-danger"></i>
                Low Stock
              </div>
            </td>

            <td v-if="showPrice">
              <span class="text-dark-75 font-weight-bolder font-size-lg">
                {{ formatCurrency(item.unit_price || item.selling_price) }}
              </span>
            </td>

            <td v-if="showValue">
              <span class="text-dark-75 font-weight-bolder font-size-lg">
                {{ formatCurrency(getTotalValue(item)) }}
              </span>
            </td>

            <td>
              <span :class="getStatusClass(item)" class="label label-inline font-weight-bold">
                {{ getStatusText(item) }}
              </span>
            </td>

            <td v-if="showExpiry">
              <div v-if="item.expiry_date">
                <span :class="expiryClass(item)" class="font-weight-bolder font-size-sm">
                  {{ formatDate(item.expiry_date) }}
                </span>
                <div v-if="isExpiringSoon(item)" class="text-warning font-size-sm">
                  <i class="ki ki-clock text-warning"></i>
                  Expiring Soon
                </div>
              </div>
              <span v-else class="text-muted">N/A</span>
            </td>

            <td class="text-center">
              <div class="dropdown dropdown-inline">
                <button
                  class="btn btn-clean btn-hover-light-primary btn-sm btn-icon"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i class="ki ki-bold-more-hor"></i>
                </button>

                <div class="dropdown-menu dropdown-menu-right">
                  <button class="dropdown-item" type="button" @click="$emit('view-item', item)">
                    <i class="ki ki-eye text-primary"></i>
                    View Details
                  </button>

                  <button class="dropdown-item" type="button" @click="$emit('edit-item', item)">
                    <i class="ki ki-edit text-warning"></i>
                    Edit Item
                  </button>

                  <div class="dropdown-divider"></div>

                  <button
                    class="dropdown-item"
                    type="button"
                    @click="$emit('dispense-item', item)"
                    v-if="canDispense(item)"
                  >
                    <i class="ki ki-check text-success"></i>
                    Dispense
                  </button>

                  <button
                    class="dropdown-item"
                    type="button"
                    @click="$emit('transfer-item', item)"
                    v-if="canTransfer(item)"
                  >
                    <i class="ki ki-arrow-next text-info"></i>
                    Transfer
                  </button>

                  <div class="dropdown-divider"></div>

                  <button
                    class="dropdown-item text-danger"
                    type="button"
                    @click="$emit('delete-item', item)"
                  >
                    <i class="ki ki-trash text-danger"></i>
                    Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UniversalItemsTable',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    storeType: {
      type: String,
      default: 'general_store',
      validator: (value) => ['pharmacy', 'general_store', 'laboratory'].includes(value),
    },
    showStock: {
      type: Boolean,
      default: true,
    },
    showPrice: {
      type: Boolean,
      default: true,
    },
    showValue: {
      type: Boolean,
      default: true,
    },
    showExpiry: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    columnCount() {
      let count = 5; // Base columns: Code, Name, Category, Status, Actions
      if (this.showStock) count++;
      if (this.showPrice) count++;
      if (this.showValue) count++;
      if (this.showExpiry) count++;
      return count;
    },
  },
  methods: {
    itemIcon(item) {
      const category = this.getCategoryName(item).toLowerCase();
      if (category.includes('drug') || category.includes('medicine')) {
        return 'ki ki-capsules';
      } else if (category.includes('equipment') || category.includes('device')) {
        return 'ki ki-cog';
      } else if (category.includes('laboratory') || category.includes('test')) {
        return 'ki ki-test-tube';
      } else if (category.includes('surgical') || category.includes('disposable')) {
        return 'ki ki-cut';
      }
      return 'ki ki-package';
    },

    getCategoryName(item) {
      return item.category?.name || item.GeneralStoreCategory?.name || 'Uncategorized';
    },

    getSubcategoryName(item) {
      return item.subcategory?.name || item.GeneralStoreSubcategory?.name || '';
    },

    getStockQuantity(item) {
      return item.quantity_available || item.current_stock || item.stock_quantity || 0;
    },

    getTotalValue(item) {
      const quantity = this.getStockQuantity(item);
      const price = item.unit_price || item.selling_price || 0;
      return quantity * price;
    },

    getStatusText(item) {
      if (!item.is_active) return 'Inactive';
      if (this.isLowStock(item)) return 'Low Stock';
      if (this.isExpiringSoon(item)) return 'Expiring';
      return 'Active';
    },

    getStatusClass(item) {
      if (!item.is_active) return 'label-light-danger';
      if (this.isLowStock(item)) return 'label-light-warning';
      if (this.isExpiringSoon(item)) return 'label-light-warning';
      return 'label-light-success';
    },

    stockClass(item) {
      if (this.isLowStock(item)) return 'text-danger';
      return 'text-dark-75';
    },

    expiryClass(item) {
      if (this.isExpiringSoon(item)) return 'text-warning';
      if (this.isExpired(item)) return 'text-danger';
      return 'text-dark-75';
    },

    isLowStock(item) {
      const quantity = this.getStockQuantity(item);
      const threshold = item.reorder_level || item.minimum_stock_level || 10;
      return quantity <= threshold;
    },

    isExpiringSoon(item) {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow && expiryDate > now;
    },

    isExpired(item) {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const now = new Date();
      return expiryDate <= now;
    },

    canDispense(item) {
      return this.getStockQuantity(item) > 0 && item.is_active;
    },

    canTransfer(item) {
      return this.getStockQuantity(item) > 0 && item.is_active;
    },

    formatCurrency(amount) {
      if (!amount || amount === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount);
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.table-head-custom thead th {
  border: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  color: #b5b5c3;
  font-size: 0.9rem;
  font-weight: 500;
}

.table-vertical-center td {
  vertical-align: middle;
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

.symbol-40 {
  width: 40px;
  height: 40px;
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
