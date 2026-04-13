<template>
  <div class="subcategories-list">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Subcategories</h3>
                <p class="card-text">Manage item subcategories for better organization</p>
              </div>
              <div class="col-auto">
                <router-link
                  :to="{ name: 'general-store-create-subcategory' }"
                  class="btn btn-primary"
                >
                  <i class="fas fa-plus"></i> New Subcategory
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Search and Filters -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="input-group">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control"
                    @input="handleSearch"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <select
                  v-model="selectedCategory"
                  class="form-control"
                  @change="handleCategoryFilter"
                >
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="selectedStatus" class="form-control" @change="handleStatusFilter">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Subcategories Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Items Count</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="subcategory in filteredSubcategories" :key="subcategory.id">
                    <td>
                      <strong>{{ subcategory.name }}</strong>
                    </td>
                    <td>
                      <span class="badge badge-info">{{ subcategory.category_name }}</span>
                    </td>
                    <td>{{ subcategory.description || 'No description' }}</td>
                    <td>
                      <span class="badge badge-secondary">{{ subcategory.items_count || 0 }}</span>
                    </td>
                    <td>
                      <span
                        :class="
                          subcategory.status === 'active'
                            ? 'badge badge-success'
                            : 'badge badge-warning'
                        "
                      >
                        {{ subcategory.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(subcategory.created_at) }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <router-link
                          :to="{
                            name: 'general-store-subcategory-details',
                            params: { id: subcategory.id },
                          }"
                          class="btn btn-sm btn-info"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </router-link>
                        <router-link
                          :to="{
                            name: 'general-store-edit-subcategory',
                            params: { id: subcategory.id },
                          }"
                          class="btn btn-sm btn-warning"
                          title="Edit"
                        >
                          <i class="fas fa-edit"></i>
                        </router-link>
                        <button
                          @click="toggleStatus(subcategory)"
                          :class="
                            subcategory.status === 'active'
                              ? 'btn btn-sm btn-danger'
                              : 'btn btn-sm btn-success'
                          "
                          :title="subcategory.status === 'active' ? 'Deactivate' : 'Activate'"
                        >
                          <i
                            :class="
                              subcategory.status === 'active' ? 'fas fa-times' : 'fas fa-check'
                            "
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="row mt-4">
              <div class="col-md-6">
                <p class="text-muted">
                  Showing {{ paginationInfo.start }} to {{ paginationInfo.end }} of
                  {{ paginationInfo.total }} entries
                </p>
              </div>
              <div class="col-md-6">
                <nav aria-label="Subcategories pagination">
                  <ul class="pagination justify-content-end">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"
                        >Previous</a
                      >
                    </li>
                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-item"
                      :class="{ active: page === currentPage }"
                    >
                      <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)"
                        >Next</a
                      >
                    </li>
                  </ul>
                </nav>
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
  name: 'SubcategoriesList',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedStatus: '',
      currentPage: 1,
      itemsPerPage: 10,
      loading: false,
    };
  },
  computed: {
    filteredSubcategories() {
      let filtered = [...this.subcategories];

      if (this.searchQuery) {
        filtered = filtered.filter(
          (sub) =>
            sub.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            sub.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.selectedCategory) {
        filtered = filtered.filter((sub) => sub.category_id === this.selectedCategory);
      }

      if (this.selectedStatus) {
        filtered = filtered.filter((sub) => sub.status === this.selectedStatus);
      }

      return filtered;
    },
    subcategories() {
      return this.$store.state.generalStore.subcategories;
    },
    categories() {
      return this.$store.state.generalStore.categories;
    },
    totalItems() {
      return this.$store.state.generalStore.subcategoriesTotal;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    error() {
      return this.$store.state.generalStore.error;
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
      return { start, end, total: this.totalItems };
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  async mounted() {
    await this.loadCategories();
    await this.loadSubcategories();
  },
  methods: {
    async loadCategories() {
      try {
        await this.$store.dispatch('generalStore/fetchCategories');
      } catch (error) {
        this.$toast.error('Failed to load categories');
      }
    },
    async loadSubcategories() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchSubcategories', {
          page: this.currentPage,
          limit: this.itemsPerPage,
          category_id: this.selectedCategory || undefined,
          is_active: this.selectedStatus ? this.selectedStatus === 'active' : undefined,
        });
      } catch (error) {
        this.$toast.error('Failed to load subcategories');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.currentPage = 1;
      // Debounce search if needed
    },
    handleCategoryFilter() {
      this.currentPage = 1;
    },
    handleStatusFilter() {
      this.currentPage = 1;
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.loadSubcategories();
      }
    },
    async toggleStatus(subcategory) {
      try {
        const newStatus = subcategory.status === 'active' ? 'inactive' : 'active';
        await this.$store.dispatch('generalStore/updateSubcategory', {
          id: subcategory.id,
          data: { status: newStatus },
        });

        this.$toast.success(`Subcategory ${newStatus} successfully`);
        await this.loadSubcategories();
      } catch (error) {
        console.error('Error updating subcategory status:', error);
        this.$toast.error('Failed to update subcategory status');
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.subcategories-list {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
  border-bottom: none;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.pagination .page-link {
  color: #00acc1;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #00acc1;
  border-color: #00acc1;
}
</style>
