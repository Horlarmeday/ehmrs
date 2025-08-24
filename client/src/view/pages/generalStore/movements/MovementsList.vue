<template>
  <div class="movements-list">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Stock Movements</h3>
                <p class="card-text">Track all stock movements and transactions</p>
              </div>
              <div class="col-auto">
                <router-link
                  :to="{ name: 'general-store-create-movement' }"
                  class="btn btn-primary"
                >
                  <i class="fas fa-plus"></i> New Movement
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Search and Filters -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="input-group">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control"
                    placeholder="Search movements..."
                    @input="handleSearch"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-2">
                <select v-model="typeFilter" class="form-control" @change="handleTypeFilter">
                  <option value="">All Types</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="itemFilter" class="form-control" @change="handleItemFilter">
                  <option value="">All Items</option>
                  <option v-for="item in items" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <input
                  v-model="dateFrom"
                  type="date"
                  class="form-control"
                  @change="handleDateFilter"
                />
              </div>
              <div class="col-md-2">
                <input
                  v-model="dateTo"
                  type="date"
                  class="form-control"
                  @change="handleDateFilter"
                />
              </div>
            </div>

            <!-- Movements Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Reference</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="movement in filteredMovements" :key="movement.id">
                    <td>{{ formatDate(movement.created_at) }}</td>
                    <td>
                      <span :class="getMovementTypeClass(movement.type)">
                        {{ formatMovementType(movement.type) }}
                      </span>
                    </td>
                    <td>
                      <strong>{{ movement.item_name }}</strong>
                      <br />
                      <small class="text-muted">{{ movement.item_code }}</small>
                    </td>
                    <td>
                      <span :class="getQuantityClass(movement.type, movement.quantity)">
                        {{ movement.type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                      </span>
                    </td>
                    <td>
                      <span class="badge badge-secondary">{{ movement.reference_number }}</span>
                      <br />
                      <small class="text-muted">{{ movement.reference_type }}</small>
                    </td>
                    <td>{{ movement.staff_name }}</td>
                    <td>
                      <span :class="getStatusClass(movement.status)">
                        {{ movement.status }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <router-link
                          :to="{
                            name: 'general-store-movement-details',
                            params: { id: movement.id },
                          }"
                          class="btn btn-sm btn-info"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </router-link>
                        <button
                          v-if="movement.status === 'pending'"
                          @click="approveMovement(movement)"
                          class="btn btn-sm btn-success"
                          title="Approve"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button
                          v-if="movement.status === 'pending'"
                          @click="rejectMovement(movement)"
                          class="btn btn-sm btn-danger"
                          title="Reject"
                        >
                          <i class="fas fa-times"></i>
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
                <nav aria-label="Movements pagination">
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
  name: 'MovementsList',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      itemFilter: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      itemsPerPage: 15,
      loading: false,
    };
  },
  computed: {
    movements() {
      return this.$store.state.generalStore.movements;
    },
    items() {
      return this.$store.state.generalStore.items;
    },
    totalItems() {
      return this.$store.state.generalStore.movementsTotal;
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    error() {
      return this.$store.state.generalStore.error;
    },
    filteredMovements() {
      let filtered = [...this.movements];

      if (this.searchQuery) {
        filtered = filtered.filter(
          movement =>
            movement.item_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            movement.reference_number.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            movement.staff_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.typeFilter) {
        filtered = filtered.filter(movement => movement.type === this.typeFilter);
      }

      if (this.itemFilter) {
        filtered = filtered.filter(movement => movement.item_id === this.itemFilter);
      }

      if (this.dateFrom) {
        filtered = filtered.filter(
          movement => new Date(movement.created_at) >= new Date(this.dateFrom)
        );
      }

      if (this.dateTo) {
        filtered = filtered.filter(
          movement => new Date(movement.created_at) <= new Date(this.dateTo)
        );
      }

      return filtered;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
    await this.loadItems();
    await this.loadMovements();
  },
  methods: {
    async loadItems() {
      try {
        await this.$store.dispatch('generalStore/fetchItems', { limit: 100 });
      } catch (error) {
        console.error('Error loading items:', error);
        this.$toast.error('Failed to load items');
      }
    },
    async loadMovements() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchMovements', {
          page: this.currentPage,
          limit: this.itemsPerPage,
        });
      } catch (error) {
        console.error('Error loading movements:', error);
        this.$toast.error('Failed to load movements');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.currentPage = 1;
    },
    handleTypeFilter() {
      this.currentPage = 1;
    },
    handleItemFilter() {
      this.currentPage = 1;
    },
    handleDateFilter() {
      this.currentPage = 1;
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.loadMovements();
      }
    },
    getMovementTypeClass(type) {
      const classes = {
        in: 'badge badge-success',
        out: 'badge badge-danger',
        transfer: 'badge badge-info',
        adjustment: 'badge badge-warning',
        return: 'badge badge-secondary',
      };
      return classes[type] || 'badge badge-secondary';
    },
    formatMovementType(type) {
      const types = {
        in: 'Stock In',
        out: 'Stock Out',
        transfer: 'Transfer',
        adjustment: 'Adjustment',
        return: 'Return',
      };
      return types[type] || type;
    },
    getQuantityClass(type) {
      if (type === 'out') return 'text-danger';
      if (type === 'in') return 'text-success';
      return 'text-info';
    },
    getStatusClass(status) {
      const classes = {
        pending: 'badge badge-warning',
        approved: 'badge badge-success',
        rejected: 'badge badge-danger',
        completed: 'badge badge-info',
      };
      return classes[status] || 'badge badge-secondary';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
    async approveMovement(movement) {
      try {
        // Note: This might need a separate action for movement approval
        // For now, using placeholder until approval action is implemented
        movement.status = 'approved';
        this.$toast.success('Movement approved successfully');
      } catch (error) {
        console.error('Error approving movement:', error);
        this.$toast.error('Failed to approve movement');
      }
    },
    async rejectMovement(movement) {
      try {
        // Note: This might need a separate action for movement rejection
        // For now, using placeholder until rejection action is implemented
        movement.status = 'rejected';
        this.$toast.success('Movement rejected successfully');
      } catch (error) {
        console.error('Error rejecting movement:', error);
        this.$toast.error('Failed to reject movement');
      }
    },
  },
};
</script>

<style scoped>
.movements-list {
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
  color: #667eea;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #667eea;
  border-color: #667eea;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}
</style>
