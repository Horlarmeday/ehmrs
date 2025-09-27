<template>
  <div class="category-details">
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
                <i class="flaticon2-folder text-success mr-3"></i>
                {{ category?.name || 'Category Details' }}
              </h1>
              <p class="text-muted font-size-lg mb-0">
                {{ category?.description || 'View detailed information about this category' }}
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
              Edit Category
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
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Loading category details...</span>
      </div>
      <p class="text-muted mt-3">Loading category details...</p>
    </div>

    <!-- Category Details Content -->
    <div v-else-if="category" class="category-content">
      <div class="row">
        <!-- Main Information -->
        <div class="col-lg-8">
          <!-- Basic Information Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-folder text-success mr-2"></i>
                Basic Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Category Name</label>
                  <p class="form-control-static">
                    <span class="badge badge-success badge-lg">{{ category.name }}</span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Status</label>
                  <p class="form-control-static">
                    <span :class="getStatusBadgeClass(category.is_active)">
                      {{ category.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label font-weight-bold text-muted">Description</label>
                  <p class="form-control-static">
                    {{ category.description || 'No description provided' }}
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Category Type</label>
                  <p class="form-control-static">
                    <span v-if="category.parent_id" class="badge badge-light-info">
                      Subcategory
                    </span>
                    <span v-else class="badge badge-light-success"> Root Category </span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Parent Category</label>
                  <p class="form-control-static">
                    <span v-if="category.parent" class="badge badge-light-primary">
                      {{ category.parent.name }}
                    </span>
                    <span v-else class="text-muted">No parent (Root category)</span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Category Code</label>
                  <p class="form-control-static">
                    <span class="badge badge-light-secondary">{{ category.code || 'N/A' }}</span>
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label font-weight-bold text-muted">Sort Order</label>
                  <p class="form-control-static">
                    <span class="font-weight-bold">{{ category.sort_order || 0 }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Subcategories Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-folder text-info mr-2"></i>
                Subcategories
                <span class="badge badge-info ml-2">{{ subcategories.length }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div v-if="subcategories.length === 0" class="text-center py-4">
                <i class="flaticon2-folder text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No subcategories found</p>
                <button
                  v-if="ALLOWED_ROLES.includes(user.role)"
                  @click="showCreateSubcategoryModal = true"
                  class="btn btn-info btn-sm mt-2"
                >
                  <i class="flaticon2-plus mr-1"></i>
                  Add Subcategory
                </button>
              </div>
              <div v-else>
                <div class="row">
                  <div
                    v-for="subcategory in subcategories"
                    :key="subcategory.id"
                    class="col-lg-6 col-md-12 mb-3"
                  >
                    <div class="subcategory-item card card-custom h-100">
                      <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1">
                            <h6 class="font-weight-bold mb-1">{{ subcategory.name }}</h6>
                            <p class="text-muted mb-2 small">
                              {{ subcategory.description || 'No description' }}
                            </p>
                            <div class="subcategory-meta">
                              <span class="badge badge-light-info mr-2">
                                {{ subcategory.items_count || 0 }} Items
                              </span>
                              <span :class="getStatusBadgeClass(subcategory.is_active)">
                                {{ subcategory.is_active ? 'Active' : 'Inactive' }}
                              </span>
                            </div>
                          </div>
                          <div class="subcategory-actions">
                            <button
                              @click="viewSubcategory(subcategory)"
                              class="btn btn-sm btn-outline-primary mr-1"
                            >
                              <i class="flaticon2-eye"></i>
                            </button>
                            <button
                              v-if="ALLOWED_ROLES.includes(user.role)"
                              @click="editSubcategory(subcategory)"
                              class="btn btn-sm btn-outline-warning mr-1"
                            >
                              <i class="flaticon2-edit"></i>
                            </button>
                            <button
                              v-if="ALLOWED_ROLES.includes(user.role)"
                              @click="deleteSubcategory(subcategory)"
                              class="btn btn-sm btn-outline-danger"
                            >
                              <i class="flaticon2-delete"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-center pt-3">
                  <button
                    v-if="ALLOWED_ROLES.includes(user.role)"
                    @click="showCreateSubcategoryModal = true"
                    class="btn btn-info"
                  >
                    <i class="flaticon2-plus mr-2"></i>
                    Add More Subcategories
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Items in Category Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-warning mr-2"></i>
                Items in Category
                <span class="badge badge-warning ml-2">{{ categoryItems.length }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div v-if="categoryItems.length === 0" class="text-center py-4">
                <i class="flaticon2-box text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No items found in this category</p>
                <button
                  v-if="ALLOWED_ROLES.includes(user.role)"
                  @click="showCreateItemModal = true"
                  class="btn btn-warning btn-sm mt-2"
                >
                  <i class="flaticon2-plus mr-1"></i>
                  Add Item
                </button>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="thead-light">
                      <tr>
                        <th>Item</th>
                        <th>Stock Level</th>
                        <th>Unit Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in categoryItems.slice(0, 5)" :key="item.id" class="item-row">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="item-icon-sm mr-3">
                              <i class="flaticon2-box text-warning"></i>
                            </div>
                            <div>
                              <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                              <small class="text-muted">{{ item.item_code }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="stock-indicator">
                            <span class="font-weight-bold">{{ item.current_stock }}</span>
                            <div class="stock-bar-mini">
                              <div
                                class="stock-bar-fill-mini"
                                :class="getStockLevelClass(item)"
                                :style="{ width: getStockPercentage(item) + '%' }"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="font-weight-bold text-success"
                            >${{ formatCurrency(item.unit_cost) }}</span
                          >
                        </td>
                        <td>
                          <span :class="getStatusBadgeClass(item.status)">
                            {{ item.status }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group">
                            <button @click="viewItem(item)" class="btn btn-sm btn-outline-primary">
                              <i class="flaticon2-eye"></i>
                            </button>
                            <button
                              v-if="ALLOWED_ROLES.includes(user.role)"
                              @click="editItem(item)"
                              class="btn btn-sm btn-outline-warning"
                            >
                              <i class="flaticon2-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="text-center pt-3">
                  <button @click="viewAllItems" class="btn btn-outline-warning mr-2">
                    View All Items
                  </button>
                  <button
                    v-if="ALLOWED_ROLES.includes(user.role)"
                    @click="showCreateItemModal = true"
                    class="btn btn-warning"
                  >
                    <i class="flaticon2-plus mr-2"></i>
                    Add New Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Category Overview Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-graph text-success mr-2"></i>
                Category Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="category-overview text-center mb-4">
                <div class="category-circle" :class="getCategoryIconClass(category)">
                  <i :class="category.icon_class || 'flaticon2-folder'" class="icon-2x"></i>
                </div>
              </div>

              <div class="category-stats">
                <div class="stat-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Subcategories:</span>
                  <span class="font-weight-bold">{{ subcategories.length }}</span>
                </div>

                <div class="stat-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Total Items:</span>
                  <span class="font-weight-bold">{{ categoryItems.length }}</span>
                </div>

                <div class="stat-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Active Items:</span>
                  <span class="font-weight-bold text-success">{{ activeItemsCount }}</span>
                </div>

                <div class="stat-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Total Value:</span>
                  <span class="font-weight-bold text-primary"
                    >${{ formatCurrency(totalCategoryValue) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Category Settings Card -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-settings text-success mr-2"></i>
                Category Settings
              </h5>
            </div>
            <div class="card-body">
              <div class="category-settings">
                <div class="setting-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Icon Class:</span>
                  <span class="font-weight-bold">{{ category.icon_class || 'Default' }}</span>
                </div>

                <div class="setting-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Color Theme:</span>
                  <span class="font-weight-bold">{{ category.color_theme || 'Default' }}</span>
                </div>

                <div class="setting-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Featured:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        category.is_featured
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ category.is_featured ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div class="setting-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Requires Approval:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        category.requires_approval
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ category.requires_approval ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div class="setting-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Restricted Access:</span>
                  <span class="font-weight-bold">
                    <i
                      :class="
                        category.is_restricted
                          ? 'flaticon2-check text-success'
                          : 'flaticon2-close text-muted'
                      "
                    ></i>
                    {{ category.is_restricted ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-gear text-success mr-2"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button
                  @click="showCreateSubcategoryModal = true"
                  class="btn btn-info btn-block mb-2"
                >
                  <i class="flaticon2-plus mr-2"></i>
                  Add Subcategory
                </button>

                <button @click="showCreateItemModal = true" class="btn btn-warning btn-block mb-2">
                  <i class="flaticon2-box mr-2"></i>
                  Add Item
                </button>

                <button @click="exportCategory" class="btn btn-secondary btn-block mb-2">
                  <i class="flaticon2-download mr-2"></i>
                  Export Data
                </button>

                <button @click="printCategory" class="btn btn-light btn-block">
                  <i class="flaticon2-printer mr-2"></i>
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-edit text-warning mr-2"></i>
            Edit Category
          </h4>
          <button @click="showEditModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <EditCategoryForm
            :category="category"
            @category-updated="handleCategoryUpdated"
            @cancel="showEditModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Create Subcategory Modal -->
    <div
      v-if="showCreateSubcategoryModal"
      class="modal-overlay"
      @click="showCreateSubcategoryModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-plus text-info mr-2"></i>
            Create Subcategory
          </h4>
          <button @click="showCreateSubcategoryModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateSubcategoryForm
            :parent-category="category"
            @subcategory-created="handleSubcategoryCreated"
            @cancel="showCreateSubcategoryModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Create Item Modal -->
    <div v-if="showCreateItemModal" class="modal-overlay" @click="showCreateItemModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-plus text-warning mr-2"></i>
            Create Item
          </h4>
          <button @click="showCreateItemModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateItemForm
            :category="category"
            @item-created="handleItemCreated"
            @cancel="showCreateItemModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';
import EditCategoryForm from './EditCategory.vue';
import CreateSubcategoryForm from '../subcategories/CreateSubcategory.vue';
import CreateItemForm from '../items/CreateItem.vue';

export default {
  name: 'CategoryDetails',
  components: {
    EditCategoryForm,
    CreateSubcategoryForm,
    CreateItemForm,
  },
  data() {
    return {
      loading: false,
      showEditModal: false,
      showCreateSubcategoryModal: false,
      showCreateItemModal: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'General Store Manager', 'General Store Staff'],
      category: null,
      subcategories: [],
      categoryItems: [],
    };
  },
  computed: {
    activeItemsCount() {
      return this.categoryItems.filter((item) => item.status === 'ACTIVE').length;
    },
    totalCategoryValue() {
      return this.categoryItems.reduce((total, item) => {
        return total + item.current_stock * item.unit_cost;
      }, 0);
    },
  },
  async created() {
    await this.loadCategoryDetails();
  },
  methods: {
    async loadCategoryDetails() {
      this.loading = true;
      try {
        const categoryId = this.$route.params.id;
        await Promise.all([
          this.$store.dispatch('generalStore/fetchCategoryById', categoryId),
          this.$store.dispatch('generalStore/fetchSubcategories', { category_id: categoryId }),
          this.$store.dispatch('generalStore/fetchItems', { category_id: categoryId }),
        ]);

        this.category = this.$store.state.generalStore.currentCategory;
        this.subcategories = this.$store.state.generalStore.subcategories;
        this.categoryItems = this.$store.state.generalStore.items;

        if (!this.category) {
          this.$router.push('/general-store/categories');
        }
      } catch (error) {
        this.$toast.error('Failed to load category details');
      } finally {
        this.loading = false;
      }
    },

    getStatusBadgeClass(isActive) {
      return isActive ? 'badge badge-success' : 'badge badge-warning';
    },

    getCategoryIconClass(category) {
      if (category.parent_id) {
        return 'category-circle-subcategory';
      }
      return 'category-circle-parent';
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

    formatCurrency(amount) {
      return parseFloat(amount).toFixed(2);
    },

    viewSubcategory(subcategory) {
      this.$router.push(`/general-store/subcategories/${subcategory.id}`);
    },

    editSubcategory(subcategory) {
      this.$router.push(`/general-store/subcategories/${subcategory.id}/edit`);
    },

    async deleteSubcategory(subcategory) {
      if (
        confirm(
          `Are you sure you want to delete "${subcategory.name}"? This will also affect all items in this subcategory.`
        )
      ) {
        try {
          await this.$store.dispatch('generalStore/deleteSubcategory', subcategory.id);
          this.$toast.success('Subcategory deleted successfully');
          this.loadCategoryDetails();
        } catch (error) {
          this.$toast.error('Failed to delete subcategory');
        }
      }
    },

    viewItem(item) {
      this.$router.push(`/general-store/items/${item.id}`);
    },

    editItem(item) {
      this.$router.push(`/general-store/items/${item.id}/edit`);
    },

    viewAllItems() {
      this.$router.push(`/general-store/items?category_id=${this.category.id}`);
    },

    handleCategoryUpdated() {
      this.showEditModal = false;
      this.loadCategoryDetails();
      this.$toast.success('Category updated successfully');
    },

    handleSubcategoryCreated() {
      this.showCreateSubcategoryModal = false;
      this.loadCategoryDetails();
      this.$toast.success('Subcategory created successfully');
    },

    handleItemCreated() {
      this.showCreateItemModal = false;
      this.loadCategoryDetails();
      this.$toast.success('Item created successfully');
    },

    async refreshData() {
      await this.loadCategoryDetails();
    },

    async printCategory() {
      try {
        const categoryData = [
          {
            id: this.category.id,
            name: this.category.name,
            code: this.category.code,
            description: this.category.description,
            parent_category: this.category.parent?.name || 'Root Category',
            subcategories_count: this.subcategories.length,
            items_count: this.categoryItems.length,
            is_active: this.category.is_active,
            icon_class: this.category.icon_class,
            color_theme: this.category.color_theme,
            created_at: this.category.created_at,
          },
        ];

        const reportConfig = {
          title: `Category Details - ${this.category.name}`,
          subtitle: `Category Code: ${this.category.code}`,
          orientation: 'portrait',
          format: 'a4',
        };
        await this.$printReport(categoryData, reportConfig);
      } catch (error) {
        this.$logError('Failed to print category details', error, { categoryId: this.category.id });
        this.$toast.error('Failed to print category details');
      }
    },

    async exportCategory() {
      try {
        const categoryData = [
          {
            id: this.category.id,
            name: this.category.name,
            code: this.category.code,
            description: this.category.description,
            parent_category: this.category.parent?.name || 'Root Category',
            subcategories_count: this.subcategories.length,
            items_count: this.categoryItems.length,
            is_active: this.category.is_active,
            icon_class: this.category.icon_class,
            color_theme: this.category.color_theme,
            created_at: this.category.created_at,
          },
        ];

        const reportName = `Category_${this.category.code || this.category.name}_${
          new Date().toISOString().split('T')[0]
        }`;
        await this.$exportData(categoryData, reportName, 'xlsx', {
          formatters: {
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export category details', error, {
          categoryId: this.category.id,
        });
        this.$toast.error('Failed to export category details');
      }
    },
  },
};
</script>

<style scoped>
.category-details {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1f0ff;
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

.category-overview {
  padding: 1rem 0;
}

.category-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.category-circle-parent {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.category-circle-subcategory {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.category-stats {
  padding: 1rem 0;
}

.stat-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item:last-child {
  border-bottom: none;
}

.subcategory-item {
  transition: all 0.3s ease;
  border: 1px solid #e1f0ff;
}

.subcategory-item:hover {
  border-color: #28a745;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.1);
}

.subcategory-meta {
  margin-top: 0.5rem;
}

.subcategory-actions {
  display: flex;
  flex-direction: column;
}

.subcategory-actions .btn {
  margin-bottom: 0.25rem;
}

.item-row {
  transition: background-color 0.2s ease;
}

.item-row:hover {
  background-color: #f8f9fa;
}

.item-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffc107, #fd7e14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stock-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stock-bar-mini {
  width: 60px;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.25rem;
}

.stock-bar-fill-mini {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-bar-fill-mini.stock-normal {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.stock-bar-fill-mini.stock-low {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.stock-bar-fill-mini.stock-empty {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.category-settings {
  padding: 1rem 0;
}

.setting-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
}

.quick-actions .btn:last-child {
  margin-bottom: 0;
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

  .subcategory-item {
    margin-bottom: 1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
