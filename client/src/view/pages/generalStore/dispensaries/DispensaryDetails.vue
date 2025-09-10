<template>
  <div class="dispensary-details">
    <div class="row">
      <div class="col-12">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">
                {{ dispensary.name || 'Dispensary Details' }}
              </span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">
                {{ dispensary.description || 'View dispensary information and manage stock' }}
              </span>
            </h3>
            <div class="card-toolbar">
              <router-link
                :to="`/general-store/dispensaries/${dispensaryId}/edit`"
                class="btn btn-primary font-weight-bolder mr-3"
              >
                <i class="ki ki-edit icon-sm"></i>
                Edit Dispensary
              </router-link>
              <router-link
                to="/general-store/dispensaries"
                class="btn btn-light font-weight-bolder"
              >
                <i class="ki ki-arrow-left icon-sm"></i>
                Back to Dispensaries
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
              <!-- Summary Cards -->
              <div class="row mb-8">
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
                            {{ dispensary.total_items || 0 }}
                          </div>
                          <div class="text-muted font-weight-bold">Total Items</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card card-custom bg-light-success">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-40 symbol-light-success mr-3">
                          <div class="symbol-label">
                            <i class="ki ki-dollar text-success font-size-h5"></i>
                          </div>
                        </div>
                        <div>
                          <div class="text-dark font-weight-bolder font-size-h4">
                            {{ formatCurrency(dispensary.total_value) }}
                          </div>
                          <div class="text-muted font-weight-bold">Total Value</div>
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
                            {{ dispensary.low_stock_items || 0 }}
                          </div>
                          <div class="text-muted font-weight-bold">Low Stock Items</div>
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
                            <i :class="`${statusIcon} ${statusColor}`" class="font-size-h5"></i>
                          </div>
                        </div>
                        <div>
                          <div :class="statusColor" class="font-weight-bolder font-size-h4">
                            {{ dispensary.is_active ? 'ACTIVE' : 'INACTIVE' }}
                          </div>
                          <div class="text-muted font-weight-bold">Status</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dispensary Information -->
              <div class="row mb-8">
                <div class="col-lg-6">
                  <div class="card card-custom">
                    <div class="card-header">
                      <h3 class="card-title">
                        <i class="ki ki-information text-primary mr-2"></i>
                        Basic Information
                      </h3>
                    </div>
                    <div class="card-body">
                      <div class="row mb-3">
                        <div class="col-4 text-muted">Name:</div>
                        <div class="col-8 font-weight-bold">{{ dispensary.name || 'N/A' }}</div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-4 text-muted">Location:</div>
                        <div class="col-8 font-weight-bold">{{ dispensary.location || 'N/A' }}</div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-4 text-muted">Manager:</div>
                        <div class="col-8 font-weight-bold">
                          {{ dispensary.manager_name || 'N/A' }}
                        </div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-4 text-muted">Description:</div>
                        <div class="col-8">
                          {{ dispensary.description || 'No description provided' }}
                        </div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-4 text-muted">Created:</div>
                        <div class="col-8">{{ formatDate(dispensary.created_at) }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-6">
                  <div class="card card-custom">
                    <div class="card-header">
                      <h3 class="card-title">
                        <i class="ki ki-settings text-primary mr-2"></i>
                        Configuration
                      </h3>
                    </div>
                    <div class="card-body">
                      <div class="row mb-3">
                        <div class="col-6 text-muted">Auto Replenish:</div>
                        <div class="col-6">
                          <span
                            :class="
                              dispensary.auto_replenish_enabled ? 'text-success' : 'text-muted'
                            "
                          >
                            {{ dispensary.auto_replenish_enabled ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>
                      <div v-if="dispensary.auto_replenish_enabled" class="row mb-3">
                        <div class="col-6 text-muted">Replenish Threshold:</div>
                        <div class="col-6 font-weight-bold">
                          {{ dispensary.replenish_threshold || 30 }}%
                        </div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-6 text-muted">Max Capacity:</div>
                        <div class="col-6 font-weight-bold">
                          {{ dispensary.max_capacity || 'Unlimited' }}
                        </div>
                      </div>
                      <div class="row mb-3">
                        <div class="col-6 text-muted">Current Utilization:</div>
                        <div class="col-6">
                          <div class="d-flex align-items-center">
                            <div class="progress progress-xs flex-grow-1 mr-2">
                              <div
                                class="progress-bar bg-primary"
                                :style="{ width: utilizationPercentage + '%' }"
                              ></div>
                            </div>
                            <span class="font-size-sm">{{ utilizationPercentage }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="row mb-8">
                <div class="col-12">
                  <div class="card card-custom">
                    <div class="card-header">
                      <h3 class="card-title">
                        <i class="ki ki-cursor text-primary mr-2"></i>
                        Quick Actions
                      </h3>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-lg-3 col-md-6 mb-4">
                          <router-link
                            :to="`/general-store/dispensaries/${dispensaryId}/stock`"
                            class="btn btn-light-primary btn-block btn-lg"
                          >
                            <i class="ki ki-eye icon-lg d-block mb-2"></i>
                            View Stock
                          </router-link>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                          <button
                            class="btn btn-light-success btn-block btn-lg"
                            @click="showTransferModal"
                          >
                            <i class="ki ki-arrow-next icon-lg d-block mb-2"></i>
                            Transfer Items
                          </button>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                          <button
                            class="btn btn-light-info btn-block btn-lg"
                            @click="triggerAutoReplenish"
                            :disabled="!dispensary.auto_replenish_enabled"
                          >
                            <i class="ki ki-refresh icon-lg d-block mb-2"></i>
                            Auto Replenish
                          </button>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-4">
                          <button
                            class="btn btn-light-warning btn-block btn-lg"
                            @click="toggleStatus"
                          >
                            <i
                              :class="
                                dispensary.is_active ? 'ki ki-minus-circle' : 'ki ki-check-circle'
                              "
                              class="icon-lg d-block mb-2"
                            ></i>
                            {{ dispensary.is_active ? 'Deactivate' : 'Activate' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="row">
                <div class="col-12">
                  <div class="card card-custom">
                    <div class="card-header">
                      <h3 class="card-title">
                        <i class="ki ki-clock text-primary mr-2"></i>
                        Recent Activity
                      </h3>
                    </div>
                    <div class="card-body">
                      <div v-if="recentActivity.length === 0" class="text-center py-6">
                        <i class="ki ki-information text-muted icon-3x mb-3"></i>
                        <p class="text-muted">No recent activity</p>
                      </div>
                      <div v-else>
                        <div
                          v-for="activity in recentActivity"
                          :key="activity.id"
                          class="d-flex align-items-center py-3 border-bottom"
                        >
                          <div class="symbol symbol-35 mr-3">
                            <div class="symbol-label bg-light-primary">
                              <i class="ki ki-arrow text-primary font-size-h6"></i>
                            </div>
                          </div>
                          <div class="flex-grow-1">
                            <div class="font-weight-bold">{{ activity.description }}</div>
                            <div class="text-muted font-size-sm">
                              {{ formatDate(activity.created_at) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TransferModal from '@/view/components/shared/TransferModal.vue';

export default {
  name: 'DispensaryDetails',
  components: {
    TransferModal,
  },
  data() {
    return {
      loading: false,
      recentActivity: [],
    };
  },
  computed: {
    ...mapState('generalStore', ['currentDispensary', 'items']),
    dispensaryId() {
      return this.$route.params.id;
    },
    dispensary() {
      return this.currentDispensary || {};
    },
    statusIcon() {
      return this.dispensary.is_active ? 'ki ki-check-circle' : 'ki ki-minus-circle';
    },
    statusColor() {
      return this.dispensary.is_active ? 'text-success' : 'text-danger';
    },
    utilizationPercentage() {
      if (!this.dispensary.max_capacity || this.dispensary.max_capacity === 0) {
        return 0;
      }
      const current = this.dispensary.total_items || 0;
      const max = this.dispensary.max_capacity;
      return Math.round((current / max) * 100);
    },
  },
  async created() {
    await this.loadDispensaryDetails();
  },
  methods: {
    async loadDispensaryDetails() {
      this.loading = true;
      try {
        await Promise.all([
          this.$store.dispatch('generalStore/fetchDispensaryById', this.dispensaryId),
          this.$store.dispatch('generalStore/fetchItems', { limit: 50 }),
        ]);

        const activityResponse = await this.$store.dispatch(
          'generalStore/fetchDispensaryActivity',
          this.dispensaryId
        );
        this.recentActivity = activityResponse || [];
      } catch (error) {
        this.$toast.error('Failed to load dispensary details');
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus() {
      try {
        await this.$store.dispatch('generalStore/updateDispensary', {
          id: this.dispensaryId,
          data: { is_active: !this.dispensary.is_active },
        });

        this.$toast.success(
          `Dispensary ${this.dispensary.is_active ? 'activated' : 'deactivated'} successfully`
        );

        // Reload to get updated data
        await this.loadDispensaryDetails();
      } catch (error) {
        this.$toast.error('Failed to update dispensary status');
      }
    },

    async triggerAutoReplenish() {
      if (!this.dispensary.auto_replenish_enabled) {
        this.$toast.warning('Auto-replenishment is not enabled for this dispensary');
        return;
      }

      try {
        await this.$store.dispatch('generalStore/autoReplenishDispensary', {
          dispensary_id: this.dispensaryId,
        });

        this.$toast.success('Auto-replenishment triggered successfully');
      } catch (error) {
        this.$toast.error('Failed to trigger auto-replenishment');
      }
    },

    showTransferModal() {
      this.$refs.transferModal.show(this.dispensary, this.items);
    },

    handleTransferCompleted() {
      this.$toast.success('Items transferred successfully');
      this.loadDispensaryDetails();
    },

    formatCurrency(amount) {
      if (!amount || amount === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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

.symbol-35 {
  width: 35px;
  height: 35px;
}

.progress-xs {
  height: 4px;
}

.btn-lg {
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
}
</style>
