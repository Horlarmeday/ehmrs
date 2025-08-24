<template>
  <div class="categories-list">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-folder text-success mr-3"></i>
            Categories Management
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Organize items into logical categories and subcategories for better management
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showCreateModal = true"
              class="btn btn-success btn-lg mr-3"
            >
              <i class="flaticon2-plus mr-2"></i>
              Add Category
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
            <div class="col-lg-4 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Search Categories</label>
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
                  placeholder="Search by name or description..."
                  @input="handleSearch"
                />
              </div>
            </div>

            <div class="col-lg-3 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Parent Category</label>
              <select v-model="filters.parent_id" class="form-control" @change="handleFilterChange">
                <option value="">All Categories</option>
                <option
                  v-for="category in parentCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-lg-3 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Status</label>
              <select v-model="filters.is_active" class="form-control" @change="handleFilterChange">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="font-weight-bold text-dark mb-2">Type</label>
              <select v-model="filters.type" class="form-control" @change="handleFilterChange">
                <option value="">All Types</option>
                <option value="parent">Parent Categories</option>
                <option value="child">Subcategories</option>
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
                  <span v-if="filters.parent_id" class="badge badge-success mr-2">
                    Parent: {{ getParentCategoryName(filters.parent_id) }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('parent_id')"
                    ></i>
                  </span>
                  <span v-if="filters.is_active !== ''" class="badge badge-info mr-2">
                    Status: {{ filters.is_active === 'true' ? 'Active' : 'Inactive' }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('is_active')"
                    ></i>
                  </span>
                  <span v-if="filters.type" class="badge badge-warning mr-2">
                    Type: {{ filters.type === 'parent' ? 'Parent' : 'Subcategory' }}
                    <i
                      class="flaticon2-delete ml-1 cursor-pointer"
                      @click="clearFilter('type')"
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

    <!-- Categories Grid -->
    <div class="categories-grid mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="card-title">
              <i class="flaticon2-folder text-success mr-2"></i>
              Categories ({{ categoriesTotal }})
            </h3>
            <div class="view-options">
              <button
                @click="viewMode = 'grid'"
                class="btn btn-sm"
                :class="viewMode === 'grid' ? 'btn-success' : 'btn-outline-success'"
              >
                <i class="flaticon2-grid mr-1"></i>
                Grid
              </button>
              <button
                @click="viewMode = 'list'"
                class="btn btn-sm ml-2"
                :class="viewMode === 'list' ? 'btn-success' : 'btn-outline-success'"
              >
                <i class="flaticon2-list mr-1"></i>
                List
              </button>
            </div>
          </div>
        </div>

        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="spinner-border text-success" role="status">
              <span class="sr-only">Loading categories...</span>
            </div>
            <p class="text-muted mt-3">Loading categories...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="categories.length === 0" class="text-center py-8">
            <i class="flaticon2-folder text-muted icon-4x mb-3"></i>
            <h4 class="text-muted mb-2">No categories found</h4>
            <p class="text-muted mb-4">Try adjusting your filters or add a new category</p>
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showCreateModal = true"
              class="btn btn-success"
            >
              <i class="flaticon2-plus mr-2"></i>
              Add First Category
            </button>
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="categories-grid-view">
            <div class="row">
              <div
                v-for="category in paginatedCategories"
                :key="category.id"
                class="col-lg-4 col-md-6 mb-4"
              >
                <div class="category-card card card-custom h-100">
                  <div class="card-body text-center p-4">
                    <div class="category-icon mb-3">
                      <div class="icon-circle" :class="getCategoryIconClass(category)">
                        <i class="flaticon2-folder icon-3x"></i>
                      </div>
                    </div>

                    <h5 class="font-weight-bold text-dark mb-2">{{ category.name }}</h5>
                    <p class="text-muted mb-3">
                      {{ category.description || 'No description provided' }}
                    </p>

                    <div class="category-stats mb-3">
                      <div class="row text-center">
                        <div class="col-6">
                          <div class="stat-item">
                            <span class="stat-number">{{ category.subcategories_count || 0 }}</span>
                            <small class="stat-label d-block">Subcategories</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="stat-item">
                            <span class="stat-number">{{ category.items_count || 0 }}</span>
                            <small class="stat-label d-block">Items</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="category-meta mb-3">
                      <span v-if="category.parent" class="badge badge-light-info mr-2">
                        Parent: {{ category.parent.name }}
                      </span>
                      <span :class="getStatusBadgeClass(category.is_active)">
                        {{ category.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>

                    <div class="category-actions">
                      <button
                        @click="viewCategory(category)"
                        class="btn btn-sm btn-outline-primary mr-2"
                      >
                        <i class="flaticon2-eye"></i>
                        View
                      </button>
                      <button
                        v-if="ALLOWED_ROLES.includes(user.role)"
                        @click="editCategory(category)"
                        class="btn btn-sm btn-outline-warning mr-2"
                      >
                        <i class="flaticon2-edit"></i>
                        Edit
                      </button>
                      <button
                        v-if="ALLOWED_ROLES.includes(user.role)"
                        @click="deleteCategory(category)"
                        class="btn btn-sm btn-outline-danger"
                      >
                        <i class="flaticon2-delete"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="categories-list-view">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th class="cursor-pointer" @click="sortBy('name')">
                      Name
                      <i v-if="sortField === 'name'" :class="getSortIcon(sortDirection)"></i>
                    </th>
                    <th>Description</th>
                    <th>Parent Category</th>
                    <th class="cursor-pointer" @click="sortBy('subcategories_count')">
                      Subcategories
                      <i
                        v-if="sortField === 'subcategories_count'"
                        :class="getSortIcon(sortDirection)"
                      ></i>
                    </th>
                    <th class="cursor-pointer" @click="sortBy('items_count')">
                      Items
                      <i v-if="sortField === 'items_count'" :class="getSortIcon(sortDirection)"></i>
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="category in paginatedCategories"
                    :key="category.id"
                    class="category-row"
                  >
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="category-icon-sm mr-3">
                          <i class="flaticon2-folder text-success"></i>
                        </div>
                        <div>
                          <h6 class="font-weight-bold mb-1">{{ category.name }}</h6>
                          <small class="text-muted">{{ category.code || 'N/A' }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-muted">{{ category.description || 'No description' }}</span>
                    </td>
                    <td>
                      <span v-if="category.parent" class="badge badge-light-info">{{
                        category.parent.name
                      }}</span>
                      <span v-else class="text-muted">Root Category</span>
                    </td>
                    <td>
                      <span class="font-weight-bold">{{ category.subcategories_count || 0 }}</span>
                    </td>
                    <td>
                      <span class="font-weight-bold">{{ category.items_count || 0 }}</span>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(category.is_active)">
                        {{ category.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button
                          @click="viewCategory(category)"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="flaticon2-eye"></i>
                        </button>
                        <button
                          v-if="ALLOWED_ROLES.includes(user.role)"
                          @click="editCategory(category)"
                          class="btn btn-sm btn-outline-warning"
                        >
                          <i class="flaticon2-edit"></i>
                        </button>
                        <button
                          v-if="ALLOWED_ROLES.includes(user.role)"
                          @click="deleteCategory(category)"
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
    </div>

    <!-- Pagination -->
    <div v-if="categoriesTotal > pagination.limit" class="pagination-section">
      <div class="card card-custom">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div class="pagination-info">
              <span class="text-muted">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
                {{ Math.min(pagination.page * pagination.limit, categoriesTotal) }} of
                {{ categoriesTotal }} categories
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

    <!-- Create Category Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-plus text-success mr-2"></i>
            Create New Category
          </h4>
          <button @click="showCreateModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateCategoryForm
            @category-created="handleCategoryCreated"
            @cancel="showCreateModal = false"
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
import CreateCategoryForm from './CreateCategory.vue';

export default {
  name: 'CategoriesList',
  components: {
    CreateCategoryForm,
  },
  data() {
    return {
      loading: false,
      showCreateModal: false,
      viewMode: 'grid',
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'General Store Manager', 'General Store Staff'],
      filters: {
        search: '',
        parent_id: '',
        is_active: '',
        type: '',
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
    categories() {
      return this.$store.state.generalStore.categories;
    },
    categoriesTotal() {
      return this.$store.state.generalStore.categoriesTotal;
    },
    totalPages() {
      return Math.ceil(this.categoriesTotal / this.pagination.limit);
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
    paginatedCategories() {
      return this.categories;
    },
    parentCategories() {
      return this.categories.filter(cat => !cat.parent_id);
    },
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchCategories', this.getRequestParams());
      } catch (error) {
        console.error('Error loading categories:', error);
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
      if (this.filters.parent_id) params.parent_id = this.filters.parent_id;
      if (this.filters.is_active !== '') params.is_active = this.filters.is_active;
      if (this.filters.type) {
        if (this.filters.type === 'parent') {
          params.parent_id = null;
        } else if (this.filters.type === 'child') {
          params.has_parent = true;
        }
      }

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
        parent_id: '',
        is_active: '',
        type: '',
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

    getParentCategoryName(parentId) {
      const category = this.categories.find(c => c.id === parentId);
      return category ? category.name : 'Unknown';
    },

    getCategoryIconClass(category) {
      if (category.parent_id) {
        return 'icon-circle-subcategory';
      }
      return 'icon-circle-parent';
    },

    getStatusBadgeClass(isActive) {
      return isActive ? 'badge badge-success' : 'badge badge-warning';
    },

    viewCategory(category) {
      this.$router.push(`/general-store/categories/${category.id}`);
    },

    editCategory(category) {
      this.$router.push(`/general-store/categories/${category.id}/edit`);
    },

    async deleteCategory(category) {
      if (
        confirm(
          `Are you sure you want to delete "${category.name}"? This will also affect all subcategories and items.`
        )
      ) {
        try {
          await this.$store.dispatch('generalStore/deleteCategory', category.id);
          this.$toast.success('Category deleted successfully');
          this.loadData();
        } catch (error) {
          this.$toast.error('Failed to delete category');
        }
      }
    },

    handleCategoryCreated() {
      this.showCreateModal = false;
      this.loadData();
      this.$toast.success('Category created successfully');
    },

    async refreshData() {
      await this.loadData();
    },
  },
};
</script>

<style scoped>
.categories-list {
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

.filters-section .card {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-tags .badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
}

.category-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: #e1f0ff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.icon-circle-parent {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.icon-circle-subcategory {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.category-stats .stat-item {
  padding: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
}

.stat-label {
  color: #6c757d;
  font-size: 0.75rem;
}

.category-meta {
  margin-bottom: 1rem;
}

.category-actions .btn {
  margin-bottom: 0.25rem;
}

.category-row {
  transition: background-color 0.2s ease;
}

.category-row:hover {
  background-color: #f8f9fa;
}

.category-icon-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745, #20c997);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.pagination-section .card {
  border: 1px solid #e1f0ff;
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
  max-width: 600px;
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

  .category-card {
    margin-bottom: 1rem;
  }

  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
