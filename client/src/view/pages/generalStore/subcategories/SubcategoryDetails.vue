<template>
  <div class="subcategory-details">
    <div class="row">
      <div class="col-12">
        <!-- Header Card -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">
                  <span
                    class="color-indicator"
                    :style="{ backgroundColor: subcategory.color || '#667eea' }"
                  ></span>
                  {{ subcategory.name }}
                </h3>
                <p class="card-text text-muted">
                  {{ subcategory.description || 'No description available' }}
                </p>
              </div>
              <div class="col-auto">
                <div class="btn-group" role="group">
                  <router-link
                    :to="{ name: 'general-store-edit-subcategory', params: { id: subcategory.id } }"
                    class="btn btn-warning"
                  >
                    <i class="fas fa-edit"></i> Edit
                  </router-link>
                  <router-link
                    :to="{ name: 'general-store-subcategories' }"
                    class="btn btn-secondary"
                  >
                    <i class="fas fa-arrow-left"></i> Back to List
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row">
          <!-- Basic Information -->
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-info-circle mr-2"></i>
                  Basic Information
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Name:</label>
                      <span class="info-value">{{ subcategory.name }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Code:</label>
                      <span class="info-value">{{ subcategory.code || 'Not specified' }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Parent Category:</label>
                      <span class="info-value">
                        <span class="badge badge-info">{{ subcategory.category_name }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Status:</label>
                      <span class="info-value">
                        <span
                          :class="
                            subcategory.status === 'active'
                              ? 'badge badge-success'
                              : 'badge badge-warning'
                          "
                        >
                          {{ subcategory.status }}
                        </span>
                      </span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Sort Order:</label>
                      <span class="info-value">{{ subcategory.sort_order || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Color Tag:</label>
                      <span class="info-value">
                        <span
                          class="color-preview"
                          :style="{ backgroundColor: subcategory.color || '#667eea' }"
                        ></span>
                        {{ subcategory.color || '#667eea' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="info-item mt-3">
                  <label class="info-label">Description:</label>
                  <p class="info-value">
                    {{ subcategory.description || 'No description available' }}
                  </p>
                </div>

                <div class="row mt-3">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Featured:</label>
                      <span class="info-value">
                        <i
                          :class="
                            subcategory.is_featured
                              ? 'fas fa-star text-warning'
                              : 'fas fa-star text-muted'
                          "
                        ></i>
                        {{ subcategory.is_featured ? 'Yes' : 'No' }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Requires Approval:</label>
                      <span class="info-value">
                        <i
                          :class="
                            subcategory.requires_approval
                              ? 'fas fa-lock text-danger'
                              : 'fas fa-unlock text-success'
                          "
                        ></i>
                        {{ subcategory.requires_approval ? 'Yes' : 'No' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items in this Subcategory -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-boxes mr-2"></i>
                  Items in this Subcategory
                  <span class="badge badge-secondary ml-2">{{ items.length }}</span>
                </h5>
              </div>
              <div class="card-body">
                <div v-if="items.length === 0" class="text-center py-4">
                  <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No items found in this subcategory</p>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Stock Level</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in items" :key="item.id">
                        <td>
                          <strong>{{ item.name }}</strong>
                          <br />
                          <small class="text-muted">{{ item.code }}</small>
                        </td>
                        <td>
                          <span :class="getStockLevelClass(item.current_stock, item.min_stock)">
                            {{ item.current_stock }}
                          </span>
                        </td>
                        <td>{{ formatCurrency(item.unit_price) }}</td>
                        <td>
                          <span
                            :class="
                              item.status === 'active'
                                ? 'badge badge-success'
                                : 'badge badge-warning'
                            "
                          >
                            {{ item.status }}
                          </span>
                        </td>
                        <td>
                          <router-link
                            :to="{ name: 'general-store-item-details', params: { id: item.id } }"
                            class="btn btn-sm btn-info"
                            title="View Item Details"
                          >
                            <i class="fas fa-eye"></i>
                          </router-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-md-4">
            <!-- Statistics Card -->
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-bar mr-2"></i>
                  Statistics
                </h5>
              </div>
              <div class="card-body">
                <div class="stat-item">
                  <div class="stat-value">{{ subcategory.items_count || 0 }}</div>
                  <div class="stat-label">Total Items</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ activeItemsCount }}</div>
                  <div class="stat-label">Active Items</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ lowStockItemsCount }}</div>
                  <div class="stat-label">Low Stock Items</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
                  <div class="stat-label">Total Value</div>
                </div>
              </div>
            </div>

            <!-- Timeline Card -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-history mr-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div class="card-body">
                <div v-if="recentActivity.length === 0" class="text-center py-3">
                  <p class="text-muted">No recent activity</p>
                </div>
                <div v-else class="timeline">
                  <div v-for="activity in recentActivity" :key="activity.id" class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">{{ activity.action }}</div>
                      <div class="timeline-time">{{ formatDate(activity.created_at) }}</div>
                      <div class="timeline-description">{{ activity.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-bolt mr-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <router-link
                    :to="{ name: 'general-store-create-item' }"
                    class="btn btn-primary btn-sm"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    Add New Item
                  </router-link>
                  <button @click="exportSubcategoryData" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-download mr-2"></i>
                    Export Data
                  </button>
                  <button @click="printSubcategoryDetails" class="btn btn-outline-info btn-sm">
                    <i class="fas fa-print mr-2"></i>
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubcategoryDetails',
  data() {
    return {
      recentActivity: [],
      loading: true,
    };
  },
  computed: {
    subcategory() {
      return this.$store.state.generalStore.currentSubcategory;
    },
    items() {
      return this.$store.state.generalStore.items;
    },
    error() {
      return this.$store.state.generalStore.error;
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    activeItemsCount() {
      return this.items.filter((item) => item.status === 'active').length;
    },
    lowStockItemsCount() {
      return this.items.filter((item) => item.current_stock <= item.min_stock).length;
    },
    totalValue() {
      return this.items.reduce((total, item) => {
        return total + item.current_stock * item.unit_price;
      }, 0);
    },
  },
  async mounted() {
    await this.loadSubcategoryDetails();
    await this.loadItems();
    await this.loadRecentActivity();
  },
  methods: {
    async loadSubcategoryDetails() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchSubcategoryById', this.$route.params.id);
      } catch (error) {
        this.$toast.error('Failed to load subcategory details');
      } finally {
        this.loading = false;
      }
    },
    async loadItems() {
      try {
        await this.$store.dispatch('generalStore/fetchItems', {
          subcategory_id: this.$route.params.id,
          limit: 50,
        });
      } catch (error) {
        this.$toast.error('Failed to load items');
      }
    },
    async loadRecentActivity() {
      try {
        // Load recent activity from audit logs
        await this.$store.dispatch('generalStore/fetchAuditLogs', {
          entity_type: 'SUBCATEGORY',
          entity_id: this.subcategory.id,
          limit: 10,
        });
        this.recentActivity = this.$store.state.generalStore.auditLogs || [];
      } catch (error) {
        this.$logError('Failed to load recent activity', error, {
          subcategoryId: this.subcategory.id,
        });
        this.recentActivity = [];
      }
    },
    getStockLevelClass(currentStock, minStock) {
      if (currentStock <= 0) return 'text-danger';
      if (currentStock <= minStock) return 'text-warning';
      return 'text-success';
    },
    formatCurrency(amount) {
      if (!amount) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount);
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
    async exportSubcategoryData() {
      try {
        const subcategoryData = [
          {
            id: this.subcategory.id,
            name: this.subcategory.name,
            code: this.subcategory.code,
            description: this.subcategory.description,
            category_name: this.subcategory.category?.name || 'N/A',
            items_count: this.subcategory.items_count || 0,
            is_active: this.subcategory.is_active,
            created_at: this.subcategory.created_at,
          },
        ];

        const reportName = `Subcategory_${this.subcategory.code || this.subcategory.name}_${
          new Date().toISOString().split('T')[0]
        }`;
        await this.$exportData(subcategoryData, reportName, 'xlsx', {
          formatters: {
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export subcategory data', error, {
          subcategoryId: this.subcategory.id,
        });
        this.$toast.error('Failed to export subcategory data');
      }
    },
    printSubcategoryDetails() {
      window.print();
    },
  },
};
</script>

<style scoped>
.subcategory-details {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.color-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  vertical-align: middle;
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 8px;
  vertical-align: middle;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  font-weight: 600;
  color: #6c757d;
  display: block;
  margin-bottom: 5px;
}

.info-value {
  color: #495057;
  font-size: 1.1em;
}

.stat-item {
  text-align: center;
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-value {
  font-size: 2em;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: 30px;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #667eea;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content {
  padding-left: 15px;
}

.timeline-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.timeline-time {
  font-size: 0.8em;
  color: #6c757d;
  margin-bottom: 5px;
}

.timeline-description {
  font-size: 0.9em;
  color: #6c757d;
}

.btn-group .btn {
  margin-right: 5px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

@media print {
  .btn-group,
  .card-header .col-auto {
    display: none !important;
  }
}
</style>
