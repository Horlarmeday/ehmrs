<template>
  <div class="card card-custom bg-light-primary">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div class="mr-3 pb-2">
              <div class="d-flex align-items-center">
                <span class="symbol symbol-45 symbol-light mr-2">
                  <span class="symbol-label">
                    <i class="ki ki-shop text-primary font-size-h5"></i>
                  </span>
                </span>
                <div>
                  <h4 class="text-dark font-weight-bolder font-size-h6 m-0">
                    {{ dispensary.name }}
                  </h4>
                  <span class="text-muted font-weight-bold font-size-sm">
                    {{ dispensary.description }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column align-items-end">
              <span :class="statusClass" class="font-weight-bolder font-size-sm py-1 px-2 rounded">
                {{ dispensary.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-muted font-size-sm mt-1"> {{ itemsCount }} items </span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="row mt-3">
            <div class="col-4">
              <div class="d-flex flex-column">
                <span class="text-dark font-weight-bold font-size-h6">
                  {{ dispensary.total_items || 0 }}
                </span>
                <span class="text-muted font-size-sm">Total Items</span>
              </div>
            </div>
            <div class="col-4">
              <div class="d-flex flex-column">
                <span class="text-dark font-weight-bold font-size-h6">
                  {{ dispensary.low_stock_items || 0 }}
                </span>
                <span class="text-muted font-size-sm">Low Stock</span>
              </div>
            </div>
            <div class="col-4">
              <div class="d-flex flex-column">
                <span class="text-dark font-weight-bold font-size-h6">
                  {{ formatValue(dispensary.total_value) }}
                </span>
                <span class="text-muted font-size-sm">Value</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex flex-wrap pt-5">
            <button
              class="btn btn-primary btn-sm font-weight-bolder mr-3 mb-2"
              @click="$emit('view-stock', dispensary)"
            >
              <i class="ki ki-eye icon-xs"></i>
              View Stock
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bolder mr-3 mb-2"
              @click="$emit('transfer-stock', dispensary)"
            >
              <i class="ki ki-arrow-next icon-xs"></i>
              Transfer
            </button>
            <button
              class="btn btn-light-success btn-sm font-weight-bolder mb-2"
              @click="$emit('dispense-item', null, dispensary)"
            >
              <i class="ki ki-check icon-xs"></i>
              Dispense
            </button>
          </div>

          <!-- Low Stock Alert -->
          <div
            v-if="dispensary.low_stock_items > 0"
            class="alert alert-custom alert-light-warning fade show mt-3 mb-0"
          >
            <div class="alert-icon">
              <i class="ki ki-warning text-warning"></i>
            </div>
            <div class="alert-text font-size-sm">
              <strong>{{ dispensary.low_stock_items }}</strong> items are running low on stock
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DispensaryCard',
  props: {
    dispensary: {
      type: Object,
      required: true,
    },
  },
  computed: {
    statusClass() {
      return this.dispensary.is_active
        ? 'text-success bg-light-success'
        : 'text-danger bg-light-danger';
    },
    itemsCount() {
      return this.dispensary.items?.length || this.dispensary.total_items || 0;
    },
  },
  methods: {
    formatValue(value) {
      if (!value || value === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.card-custom {
  transition: all 0.3s ease;
}

.card-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0px 0px 50px 0px rgba(82, 63, 105, 0.15);
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
}

.symbol-45 {
  width: 45px;
  height: 45px;
}

.alert-custom {
  border: 1px solid transparent;
  border-radius: 0.42rem;
}

.alert-light-warning {
  color: #663c00;
  background-color: #fff8dd;
  border-color: #ffeed2;
}
</style>
