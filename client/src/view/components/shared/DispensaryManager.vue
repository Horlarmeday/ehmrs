<template>
  <div class="dispensary-manager">
    <div class="row">
      <div class="col-12">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Dispensary Management</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">
                Manage {{ storeType }} dispensaries and stock distribution
              </span>
            </h3>
            <div class="card-toolbar">
              <button
                type="button"
                class="btn btn-primary font-weight-bolder"
                @click="showCreateDispensaryModal"
              >
                <i class="ki ki-plus icon-sm"></i>
                New Dispensary
              </button>
            </div>
          </div>

          <div class="card-body py-0">
            <!-- Summary Cards -->
            <div class="row mb-6">
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card card-custom bg-light-success">
                  <div class="card-body">
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40 symbol-light-success mr-3">
                        <div class="symbol-label">
                          <i class="ki ki-shop text-success font-size-h5"></i>
                        </div>
                      </div>
                      <div>
                        <div class="text-dark font-weight-bolder font-size-h4">
                          {{ activeDispensaries.length }}
                        </div>
                        <div class="text-muted font-weight-bold">Active Dispensaries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card card-custom bg-light-primary">
                  <div class="card-body">
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40 symbol-light-primary mr-3">
                        <div class="symbol-label">
                          <i class="ki ki-package text-primary font-size-h5"></i>
                        </div>
                      </div>
                      <div>
                        <div class="text-dark font-weight-bolder font-size-h4">
                          {{ totalStockItems }}
                        </div>
                        <div class="text-muted font-weight-bold">Total Stock Items</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card card-custom bg-light-warning">
                  <div class="card-body">
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40 symbol-light-warning mr-3">
                        <div class="symbol-label">
                          <i class="ki ki-warning text-warning font-size-h5"></i>
                        </div>
                      </div>
                      <div>
                        <div class="text-dark font-weight-bolder font-size-h4">
                          {{ lowStockCount }}
                        </div>
                        <div class="text-muted font-weight-bold">Low Stock Alerts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card card-custom bg-light-info">
                  <div class="card-body">
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40 symbol-light-info mr-3">
                        <div class="symbol-label">
                          <i class="ki ki-arrow-next text-info font-size-h5"></i>
                        </div>
                      </div>
                      <div>
                        <div class="text-dark font-weight-bolder font-size-h4">
                          {{ pendingTransfers }}
                        </div>
                        <div class="text-muted font-weight-bold">Pending Transfers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dispensaries Grid -->
            <div class="row">
              <div
                v-for="dispensary in dispensaries"
                :key="dispensary.id"
                class="col-lg-6 col-xl-4 mb-6"
              >
                <div class="card card-custom bg-light-primary">
                  <div class="card-body">
                    <!-- Header -->
                    <div class="d-flex align-items-center justify-content-between mb-4">
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-45 symbol-light-primary mr-3">
                          <div class="symbol-label">
                            <i class="ki ki-shop text-primary font-size-h5"></i>
                          </div>
                        </div>
                        <div>
                          <h5 class="text-dark font-weight-bolder mb-1">{{ dispensary.name }}</h5>
                          <span class="text-muted font-size-sm">{{ dispensary.description }}</span>
                        </div>
                      </div>
                      <div class="dropdown dropdown-inline">
                        <button
                          class="btn btn-clean btn-hover-light-primary btn-sm btn-icon"
                          type="button"
                          data-toggle="dropdown"
                        >
                          <i class="ki ki-bold-more-hor"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                          <button class="dropdown-item" @click="viewDispensaryDetails(dispensary)">
                            <i class="ki ki-eye text-primary"></i> View Details
                          </button>
                          <button class="dropdown-item" @click="editDispensary(dispensary)">
                            <i class="ki ki-edit text-warning"></i> Edit
                          </button>
                          <div class="dropdown-divider"></div>
                          <button class="dropdown-item" @click="toggleDispensaryStatus(dispensary)">
                            <i
                              :class="
                                dispensary.is_active
                                  ? 'ki ki-minus-circle text-danger'
                                  : 'ki ki-check-circle text-success'
                              "
                            ></i>
                            {{ dispensary.is_active ? 'Deactivate' : 'Activate' }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Status and Stats -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <span
                        :class="dispensary.is_active ? 'label-light-success' : 'label-light-danger'"
                        class="label label-inline font-weight-bold"
                      >
                        {{ dispensary.is_active ? 'Active' : 'Inactive' }}
                      </span>
                      <div class="text-right">
                        <div class="text-dark font-weight-bolder">
                          {{ getDispensaryItemCount(dispensary) }}
                        </div>
                        <div class="text-muted font-size-sm">Items</div>
                      </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="row mb-4">
                      <div class="col-4">
                        <div class="d-flex flex-column align-items-center">
                          <span class="text-dark font-weight-bold">{{
                            dispensary.total_value || 0 | currency
                          }}</span>
                          <span class="text-muted font-size-sm">Value</span>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="d-flex flex-column align-items-center">
                          <span class="text-warning font-weight-bold">{{
                            dispensary.low_stock_items || 0
                          }}</span>
                          <span class="text-muted font-size-sm">Low Stock</span>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="d-flex flex-column align-items-center">
                          <span class="text-info font-weight-bold">{{
                            dispensary.last_transfer || 'N/A'
                          }}</span>
                          <span class="text-muted font-size-sm">Last Transfer</span>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex flex-wrap">
                      <button
                        class="btn btn-primary btn-sm font-weight-bolder mr-2 mb-2"
                        @click="viewStock(dispensary)"
                      >
                        <i class="ki ki-eye icon-xs"></i>
                        View Stock
                      </button>
                      <button
                        class="btn btn-light-primary btn-sm font-weight-bolder mr-2 mb-2"
                        @click="transferItems(dispensary)"
                      >
                        <i class="ki ki-arrow-next icon-xs"></i>
                        Transfer
                      </button>
                      <button
                        class="btn btn-light-success btn-sm font-weight-bolder mb-2"
                        @click="autoReplenish(dispensary)"
                        :disabled="!dispensary.auto_replenish_enabled"
                      >
                        <i class="ki ki-refresh icon-xs"></i>
                        Replenish
                      </button>
                    </div>

                    <!-- Low Stock Alert -->
                    <div
                      v-if="dispensary.low_stock_items > 0"
                      class="alert alert-custom alert-light-warning mt-3 mb-0"
                    >
                      <div class="alert-text font-size-sm">
                        <strong>{{ dispensary.low_stock_items }}</strong> items need restocking
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Create New Dispensary Card -->
              <div class="col-lg-6 col-xl-4 mb-6">
                <div class="card card-custom bg-light-secondary h-100">
                  <div
                    class="card-body d-flex flex-column justify-content-center align-items-center"
                  >
                    <i class="ki ki-plus text-secondary font-size-h1 mb-4"></i>
                    <h5 class="text-secondary font-weight-bolder mb-3">Create New Dispensary</h5>
                    <button
                      class="btn btn-secondary font-weight-bolder"
                      @click="showCreateDispensaryModal"
                    >
                      Add Dispensary
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="dispensaries.length === 0" class="text-center py-10">
              <i class="ki ki-shop text-muted font-size-h1 mb-4"></i>
              <h4 class="text-muted font-weight-bolder mb-3">No Dispensaries Found</h4>
              <p class="text-muted mb-4">
                Create your first dispensary to start managing inventory distribution
              </p>
              <button class="btn btn-primary font-weight-bolder" @click="showCreateDispensaryModal">
                <i class="ki ki-plus icon-sm"></i>
                Create First Dispensary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dispensary Modal -->
    <DispensaryFormModal ref="dispensaryFormModal" @dispensary-saved="handleDispensarySaved" />

    <!-- Transfer Modal -->
    <TransferModal ref="transferModal" @transfer-completed="handleTransferCompleted" />

    <!-- Stock View Modal -->
    <DispensaryStockModal ref="stockModal" />
  </div>
</template>

<script>
import DispensaryFormModal from './DispensaryFormModal.vue';
import TransferModal from './TransferModal.vue';
import DispensaryStockModal from './DispensaryStockModal.vue';

export default {
  name: 'DispensaryManager',
  components: {
    DispensaryFormModal,
    TransferModal,
    DispensaryStockModal,
  },
  props: {
    storeType: {
      type: String,
      required: true,
      validator: value => ['pharmacy', 'general_store', 'laboratory'].includes(value),
    },
    dispensaries: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    activeDispensaries() {
      return this.dispensaries.filter(d => d.is_active);
    },
    totalStockItems() {
      return this.dispensaries.reduce((total, d) => total + (d.total_items || 0), 0);
    },
    lowStockCount() {
      return this.dispensaries.reduce((total, d) => total + (d.low_stock_items || 0), 0);
    },
    pendingTransfers() {
      return this.dispensaries.reduce((total, d) => total + (d.pending_transfers || 0), 0);
    },
  },
  filters: {
    currency(value) {
      if (!value || value === 0) return '₦0';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
  },
  methods: {
    showCreateDispensaryModal() {
      this.$refs.dispensaryFormModal.show();
    },

    editDispensary(dispensary) {
      this.$refs.dispensaryFormModal.show(dispensary);
    },

    viewDispensaryDetails(dispensary) {
      this.$emit('view-dispensary', dispensary);
    },

    viewStock(dispensary) {
      this.$refs.stockModal.show(dispensary);
    },

    transferItems(dispensary) {
      // Emit event to parent to handle transfer
      this.$emit('transfer-to-dispensary', dispensary);
    },

    async autoReplenish(dispensary) {
      try {
        await this.$store.dispatch('generalStore/autoReplenishDispensary', {
          dispensary_id: dispensary.id,
        });

        this.$toast.success('Auto-replenishment triggered successfully');
        this.$emit('dispensary-updated');
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to trigger auto-replenishment');
      }
    },

    async toggleDispensaryStatus(dispensary) {
      try {
        await this.$store.dispatch('generalStore/updateDispensary', {
          id: dispensary.id,
          data: { is_active: !dispensary.is_active },
        });

        this.$toast.success(
          `Dispensary ${dispensary.is_active ? 'deactivated' : 'activated'} successfully`
        );
        this.$emit('dispensary-updated');
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to update dispensary status');
      }
    },

    getDispensaryItemCount(dispensary) {
      return dispensary.items?.length || dispensary.total_items || 0;
    },

    handleDispensarySaved(dispensary) {
      this.$emit('dispensary-saved', dispensary);
      this.$toast.success(
        dispensary.id ? 'Dispensary updated successfully' : 'Dispensary created successfully'
      );
    },

    handleTransferCompleted(transferData) {
      this.$emit('transfer-completed', transferData);
      this.$toast.success('Items transferred successfully');
    },
  },
};
</script>

<style scoped>
.dispensary-manager {
  .card-custom {
    box-shadow: 0px 0px 30px 0px rgba(82, 63, 105, 0.05);
    transition: all 0.3s ease;
  }

  .card-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0px 0px 50px 0px rgba(82, 63, 105, 0.15);
  }

  .btn-sm {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .symbol-40,
  .symbol-45 {
    width: 40px;
    height: 40px;
  }

  .symbol-45 {
    width: 45px;
    height: 45px;
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

  .label-light-danger {
    color: #f64e60;
    background-color: #ffe2e5;
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
}
</style>
