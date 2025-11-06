<template>
  <div class="accounting-inventory-items">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="#" @click.prevent="navigateTo('dashboard')">
            <i class="fas fa-home"></i> Dashboard
          </a>
        </li>
        <li class="breadcrumb-item">
          <a href="#" @click.prevent="navigateTo('accounting-dashboard')">
            <i class="fas fa-chart-line"></i> Accounting & Finance
          </a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          <i class="fas fa-pills"></i> Inventory Items (Drugs)
        </li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="page-title">
        <i class="fas fa-pills text-primary mr-3"></i>
        Inventory Items Management
      </h2>
      <p class="text-muted">View drug inventory and pricing information</p>
    </div>

    <!-- Inventory Selector Card -->
    <div class="card card-custom gutter-b mb-4">
      <div class="card-body">
        <div class="form-group row mb-0">
          <label class="col-lg-2 col-form-label">Select Inventory:</label>
          <div class="col-lg-6">
            <select
              class="form-control form-control-lg"
              v-model="selectedInventoryId"
              @change="onInventoryChange"
            >
              <option value="">-- Select an inventory --</option>
              <option v-for="inventory in inventories" :key="inventory.id" :value="inventory.id">
                {{ inventory.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Container -->
    <div v-if="selectedInventoryId" class="card card-custom gutter-b">
      <!-- Header -->
      <div class="card-header border-0 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            {{ selectedInventoryName }}
          </span>
        </h3>
      </div>

      <!-- Search -->
      <search @search="onHandleSearch" />

      <!-- Body with Table -->
      <div class="card-body py-0">
        <div class="table-responsive">
          <table
            class="table table-head-custom table-vertical-center"
            id="kt_advance_table_widget_1"
          >
            <thead>
              <tr class="text-left">
                <th class="pr-0" style="width: 300px">Drug Name</th>
                <th class="pr-0" style="width: 150px">Quantity</th>
                <th class="pr-0" style="width: 150px">Selling Price (₦)</th>
                <th class="pr-0" style="width: 150px">Cost Price (₦)</th>
                <th class="pr-0" style="width: 150px">Dosage Form</th>
                <th class="pr-0" style="width: 150px">Strength</th>
                <th style="min-width: 150px">Expiration Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!items.length">
                <td colspan="7" align="center" class="text-muted">
                  {{ loading ? 'Loading...' : 'No inventory items found' }}
                </td>
              </tr>
              <tr v-for="item in items" :key="item.id">
                <td class="pr-0">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ item.drug.name }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ item.quantity_remaining }} {{ item.unit.name }}
                  </span>
                </td>
                <td>
                  <span class="text-success font-weight-bolder d-block font-size-lg">
                    {{ formatCurrency(item.selling_price) }}
                  </span>
                </td>
                <td>
                  <span class="text-info font-weight-bolder d-block font-size-lg">
                    {{ formatCurrency(item.cost_price) }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="item.dosage_form_id"
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ item.dosage_form.name || 'N/A' }}
                  </span>
                  <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >N/A</span
                  >
                </td>
                <td>
                  <span
                    v-if="item.measurement_id"
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ item.strength_input }} {{ item.strength.name || '' }}
                  </span>
                  <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >N/A</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ item.expiration | dayjs('ddd, MMM Do YYYY') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <pagination
          :total-pages="pages"
          :total="queriedItems"
          :per-page="perPage"
          :current-page="currentPage"
          @pagechanged="onPageChange"
          @changepagecount="onChangePageCount"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card card-custom gutter-b">
      <div class="card-body text-center py-10">
        <i class="fas fa-pills fa-5x text-muted mb-4"></i>
        <h3 class="text-muted">Select an inventory to view items</h3>
        <p class="text-muted">
          Choose an inventory from the dropdown above to see the drug list and pricing information.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';

export default {
  name: 'AccountingInventoryItems',
  components: {
    Pagination,
    Search,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      selectedInventoryId: '',
      loading: false,
    };
  },
  computed: {
    items() {
      return this.$store.state.inventory.items;
    },
    queriedItems() {
      return this.$store.state.inventory.total;
    },
    pages() {
      return this.$store.state.inventory.pages;
    },
    perPage() {
      return this.items.length;
    },
    inventories() {
      return this.$store.state.inventory.inventories;
    },
    selectedInventoryName() {
      const inventory = this.inventories.find(
        (inv) => inv.id === parseInt(this.selectedInventoryId)
      );
      return inventory ? inventory.name : '';
    },
  },
  methods: {
    onInventoryChange() {
      if (this.selectedInventoryId) {
        this.currentPage = 1;
        this.fetchInventoryItems({
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          search: null,
        });
      }
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        inventory: this.selectedInventoryId,
      });
      this.fetchInventoryItems({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: null,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
        inventory: this.selectedInventoryId,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchInventoryItems({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
      })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(pagecount) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
        inventory: this.selectedInventoryId,
      });
      this.fetchInventoryItems({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
        search: null,
      });
    },

    fetchInventoryItems({ currentPage, itemsPerPage, search }) {
      if (!this.selectedInventoryId) return Promise.resolve();

      this.loading = true;
      return this.$store
        .dispatch('inventory/fetchInventoryItems', {
          currentPage,
          itemsPerPage,
          inventory: this.selectedInventoryId,
          ...(search && { search }),
        })
        .finally(() => {
          this.loading = false;
        });
    },

    navigateTo(route) {
      if (route === 'dashboard') {
        this.$router.push('/dashboard');
      } else if (route === 'accounting-dashboard') {
        this.$router.push('/accounting/dashboard');
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },
  },
  created() {
    // Fetch the list of inventories
    this.$store.dispatch('inventory/fetchInventories');
  },
};
</script>

<style scoped>
.accounting-inventory-items {
  padding: 2rem;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '>';
  color: #6c757d;
  margin: 0 0.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.text-success {
  color: #28a745 !important;
}

.text-info {
  color: #17a2b8 !important;
}
</style>
