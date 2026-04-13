<template>
  <div class="items-list">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-box text-primary mr-3"></i>
            Inventory Items
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Manage all general store items, track stock levels, and maintain item information
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="createNewItem"
              class="btn btn-primary btn-lg mr-3"
            >
              <i class="flaticon2-plus mr-2"></i>
              Add New Item
            </button>
            <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section mb-6">
      <div class="card card-custom">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Search Items</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">
                    <i class="flaticon2-search"></i>
                  </span>
                </div>
                <input
                  v-model="filters.search"
                  type="text"
                  class="form-control"
                  @input="handleSearch"
                />
              </div>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Category</label>
              <select
                v-model="filters.category_id"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Subcategory</label>
              <select
                v-model="filters.subcategory_id"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Subcategories</option>
                <option
                  v-for="subcategory in filteredSubcategories"
                  :key="subcategory.id"
                  :value="subcategory.id"
                >
                  {{ subcategory.name }}
                </option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Status</label>
              <select v-model="filters.status" class="form-control" @change="handleFilterChange">
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>

            <div class="col-lg-3 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Stock Level</label>
              <select
                v-model="filters.stockLevel"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="normal">Normal Stock</option>
              </select>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center">
                <div class="filter-tags">
                  <span v-if="filters.search" class="badge badge-primary mr-2">
                    Search: {{ filters.search }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('search')"
                    ></i>
                  </span>
                  <span v-if="filters.category_id" class="badge badge-success mr-2">
                    Category: {{ getCategoryName(filters.category_id) }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('category_id')"
                    ></i>
                  </span>
                  <span v-if="filters.subcategory_id" class="badge badge-info mr-2">
                    Subcategory: {{ getSubcategoryName(filters.subcategory_id) }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('subcategory_id')"
                    ></i>
                  </span>
                  <span v-if="filters.status" class="badge badge-warning mr-2">
                    Status: {{ filters.status }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('status')"
                    ></i>
                  </span>
                  <span v-if="filters.stockLevel" class="badge badge-danger mr-2">
                    Stock: {{ filters.stockLevel }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('stockLevel')"
                    ></i>
                  </span>
                </div>

                <button @click="clearAllFilters" class="btn btn-sm btn-outline-secondary">
                  <i class="flaticon2-delete mr-1"></i>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-table mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="card-title">
              <i class="flaticon2-box text-primary mr-2"></i>
              Items ({{ itemsTotal }})
            </h3>
            <div class="table-actions">
              <button @click="exportData" class="btn btn-sm btn-outline-primary mr-2">
                <i class="flaticon2-download mr-1"></i>
                Export
              </button>
              <button @click="printData" class="btn btn-sm btn-outline-secondary">
                <i class="flaticon2-printer mr-1"></i>
                Print
              </button>
            </div>
          </div>
        </div>

        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading items...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="items.length === 0" class="text-center py-8">
            <i class="flaticon2-box text-muted icon-4x mb-3"></i>
            <h4 class="text-muted mb-2">No items found</h4>
            <p class="text-muted mb-4">Try adjusting your filters or add a new item</p>
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <i class="flaticon2-plus mr-2"></i>
              Add First Item
            </button>
          </div>

          <!-- Items Table -->
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th class="cursor-pointer" @click="sortBy('item_code')">
                    Item Code
                    <i v-if="sortField === 'item_code'" :class="getSortIcon(sortDirection)"></i>
                  </th>
                  <th class="cursor-pointer" @click="sortBy('name')">
                    Name
                    <i v-if="sortField === 'name'" :class="getSortIcon(sortDirection)"></i>
                  </th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th class="cursor-pointer" @click="sortBy('current_stock')">
                    Stock
                    <i v-if="sortField === 'current_stock'" :class="getSortIcon(sortDirection)"></i>
                  </th>
                  <th class="cursor-pointer" @click="sortBy('unit_cost')">
                    Unit Cost
                    <i v-if="sortField === 'unit_cost'" :class="getSortIcon(sortDirection)"></i>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item.id" class="item-row">
                  <td>
                    <span class="font-weight-bold text-primary">{{ item.item_code }}</span>
                  </td>
                  <td>
                    <div class="item-info">
                      <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                      <small class="text-muted">{{ item.description }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-light-primary">{{
                      item.category?.name || 'N/A'
                    }}</span>
                  </td>
                  <td>
                    <span class="badge badge-light-info">{{
                      item.subcategory?.name || 'N/A'
                    }}</span>
                  </td>
                  <td>
                    <div class="stock-info">
                      <span class="font-weight-bold">{{ item.current_stock }}</span>
                      <small class="text-muted d-block">Min: {{ item.minimum_stock }}</small>
                      <div class="stock-bar mt-1">
                        <div
                          class="stock-fill"
                          :class="getStockLevelClass(item)"
                          :style="{ width: getStockPercentage(item) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="font-weight-bold text-success"
                      >₦{{ formatCurrency(item.unit_cost) }}</span
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
                        <i class="flaticon-eye"></i>
                      </button>
                      <button
                        v-if="ALLOWED_ROLES.includes(user.role)"
                        @click="editItem(item)"
                        class="btn btn-sm btn-outline-warning"
                      >
                        <i class="flaticon2-edit"></i>
                      </button>
                      <button
                        v-if="ALLOWED_ROLES.includes(user.role)"
                        @click="deleteItem(item)"
                        class="btn btn-sm btn-outline-danger"
                      >
                        <i class="flaticon2-delete"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="itemsTotal > pagination.limit" class="pagination-section">
      <div class="card card-custom">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div class="pagination-info">
              <span class="text-muted">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
                {{ Math.min(pagination.page * pagination.limit, itemsTotal) }} of
                {{ itemsTotal }} items
              </span>
            </div>

            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(pagination.page - 1)">
                    <i class="flaticon2-arrow-left"></i>
                  </a>
                </li>

                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.page }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(page)">
                    {{ page }}
                  </a>
                </li>

                <li class="page-item" :class="{ disabled: pagination.page === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(pagination.page + 1)">
                    <i class="flaticon2-arrow-right"></i>
                  </a>
                </li>
              </ul>
            </nav>

            <div class="page-size-selector">
              <select
                v-model="pagination.limit"
                class="form-control form-control-sm"
                @change="handlePageSizeChange"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Item Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-plus text-primary mr-2"></i>
            Create New Item
          </h4>
          <button @click="showCreateModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateItemForm @item-created="handleItemCreated" @cancel="showCreateModal = false" />
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
import CreateItemForm from './CreateItem.vue';

export default {
  name: 'ItemsList',
  components: {
    CreateItemForm,
  },
  data() {
    return {
      loading: false,
      showCreateModal: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'Store Admin', 'General Store Staff'],
      filters: {
        search: '',
        category_id: '',
        subcategory_id: '',
        status: '',
        stockLevel: '',
      },
      sortField: 'name',
      sortDirection: 'asc',
      pagination: {
        page: 1,
        limit: 20,
      },
      searchTimeout: null,
    };
  },
  computed: {
    // Get data from Vuex store
    items() {
      return this.$store.state.generalStore.items;
    },
    itemsTotal() {
      return this.$store.state.generalStore.itemsTotal;
    },
    totalPages() {
      return Math.ceil(this.itemsTotal / this.pagination.limit);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.pagination.page - 2);
      const end = Math.min(this.totalPages, this.pagination.page + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    paginatedItems() {
      return this.items;
    },
    categories() {
      return this.$store.state.generalStore.categories;
    },
    subcategories() {
      return this.$store.state.generalStore.subcategories;
    },
    filteredSubcategories() {
      if (!this.filters.category_id) return this.subcategories;
      return this.subcategories.filter((sub) => sub.category_id === this.filters.category_id);
    },
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.$store.dispatch('generalStore/fetchItems', this.getRequestParams()),
          this.$store.dispatch('generalStore/fetchCategories'),
          this.$store.dispatch('generalStore/fetchSubcategories'),
        ]);
      } catch (error) {
        this.$toast.error('Failed to load items');
      } finally {
        this.loading = false;
      }
    },

    getRequestParams() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit,
      };

      if (this.filters.search) params.search = this.filters.search;
      if (this.filters.category_id) params.category_id = this.filters.category_id;
      if (this.filters.subcategory_id) params.subcategory_id = this.filters.subcategory_id;
      if (this.filters.status) params.status = this.filters.status;

      return params;
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadData();
      }, 500);
    },

    handleFilterChange() {
      this.pagination.page = 1;
      this.loadData();
    },

    clearFilter(filterName) {
      this.filters[filterName] = '';
      this.handleFilterChange();
    },

    clearAllFilters() {
      this.filters = {
        search: '',
        category_id: '',
        subcategory_id: '',
        status: '',
        stockLevel: '',
      };
      this.handleFilterChange();
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.loadData();
    },

    getSortIcon(direction) {
      return direction === 'asc' ? 'flaticon2-arrow-up' : 'flaticon2-arrow-down';
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.page = page;
        this.loadData();
      }
    },

    handlePageSizeChange() {
      this.pagination.page = 1;
      this.loadData();
    },

    getCategoryName(categoryId) {
      const category = this.categories.find((c) => c.id === categoryId);
      return category ? category.name : 'Unknown';
    },

    getSubcategoryName(subcategoryId) {
      const subcategory = this.subcategories.find((s) => s.id === subcategoryId);
      return subcategory ? subcategory.name : 'Unknown';
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

    getStatusBadgeClass(status) {
      const classes = {
        ACTIVE: 'badge badge-success',
        INACTIVE: 'badge badge-warning',
        DISCONTINUED: 'badge badge-danger',
      };
      return classes[status] || 'badge badge-secondary';
    },

    formatCurrency(amount) {
      return parseFloat(amount).toFixed(2);
    },

    viewItem(item) {
      this.$router.push(`/general-store/items/${item.id}`);
    },

    editItem(item) {
      this.$router.push(`/general-store/items/${item.id}/edit`);
    },

    createNewItem() {
      this.$router.push('/general-store/items/create');
    },

    async deleteItem(item) {
      if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        try {
          await this.$store.dispatch('generalStore/deleteItem', item.id);
          this.$toast.success('Item deleted successfully');
          this.loadData();
        } catch (error) {
          this.$toast.error('Failed to delete item');
        }
      }
    },

    handleItemCreated() {
      this.showCreateModal = false;
      this.loadData();
      this.$toast.success('Item created successfully');
    },

    async refreshData() {
      await this.loadData();
    },

    async exportData() {
      try {
        const reportName = `Items_List_${new Date().toISOString().split('T')[0]}`;
        await this.$exportData(this.items, reportName, 'xlsx', {
          formatters: {
            current_stock: (value) => Number(value || 0),
            minimum_stock: (value) => Number(value || 0),
            unit_price: (value) => Number(value || 0).toFixed(2),
            total_value: (value) => Number(value || 0).toFixed(2),
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export items data', error);
        this.$toast.error('Failed to export data');
      }
    },

    async printData() {
      try {
        const reportConfig = {
          title: 'Items List',
          subtitle: `Generated on ${new Date().toLocaleDateString()}`,
          orientation: 'landscape',
          format: 'a4',
        };
        await this.$printReport(this.items, reportConfig);
      } catch (error) {
        this.$logError('Failed to print items data', error);
        this.$toast.error('Failed to print data');
      }
    },
  },
};
</script>

<style scoped>
.items-list {
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

.filters-section .card {
  border: 1px solid #e0f7fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-tags .badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
}

.item-row {
  transition: background-color 0.2s ease;
}

.item-row:hover {
  background-color: #f8f9fa;
}

.item-info h6 {
  margin-bottom: 0.25rem;
}

.stock-info {
  min-width: 120px;
}

.stock-bar {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-normal {
  background-color: #28a745;
}

.stock-low {
  background-color: #ffc107;
}

.stock-empty {
  background-color: #dc3545;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.pagination-section .card {
  border: 1px solid #e0f7fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  max-width: 800px;
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

  .filters-section .row > div {
    margin-bottom: 1rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
