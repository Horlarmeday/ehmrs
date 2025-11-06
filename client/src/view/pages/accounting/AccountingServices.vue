<template>
  <div class="accounting-services">
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
          <i class="fas fa-concierge-bell"></i> Services
        </li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="page-title">
        <i class="fas fa-concierge-bell text-primary mr-3"></i>
        Services Management
      </h2>
      <p class="text-muted">Manage service pricing and billing information</p>
    </div>

    <!-- Card Container -->
    <div class="card card-custom gutter-b example example-compact">
      <create-service
        :displayPrompt="displayPrompt"
        @closeModal="hideModal"
        :data="serviceToEdit"
      />

      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">Service List</h3>
      </div>

      <!-- Header with Search -->
      <div class="card-header border-0">
        <search @search="onHandleSearch" />
        <div class="card-toolbar">
          <a href="#" class="btn btn-primary font-weight-bolder font-size-sm" @click="addNewData">
            <add-icon /> Add New Service
          </a>
        </div>
      </div>

      <!-- Body with Table -->
      <div class="card-body pt-0 pb-3">
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 150px">Name</th>
                <th style="min-width: 100px">Price (₦)</th>
                <th style="min-width: 100px">Code</th>
                <th style="min-width: 100px">Type</th>
                <th style="min-width: 160px">Date Created</th>
                <th class="pr-0" style="min-width: 150px">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="services.length === 0">
                <td colspan="6" align="center" class="text-muted">No services found</td>
              </tr>
              <tr v-for="service in services" :key="service.id">
                <td class="pl-5">
                  <p>
                    <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ service.name }}
                    </span>
                  </p>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg text-success">
                    {{ formatCurrency(service.price) }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ service.code || 'N/A' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-info">
                    {{ service.type || 'N/A' }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ service.createdAt | dayjs('ddd, MMM Do YYYY') }}
                  </span>
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(service)"
                  >
                    <edit-icon />
                  </a>
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
          @changepagecount="onHandlePageCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import CreateService from '@/view/pages/admin/services/CreateService.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';

export default {
  name: 'AccountingServices',
  components: {
    Search,
    Pagination,
    CreateService,
    EditIcon,
    AddIcon,
  },
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      serviceToEdit: {},
    };
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },
    queriedItems() {
      return this.$store.state.model.serviceTotal;
    },
    pages() {
      return this.$store.state.model.servicePages;
    },
    perPage() {
      return this.services.length;
    },
  },
  methods: {
    addNewData() {
      this.serviceToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(service) {
      this.serviceToEdit = service;
      this.displayPrompt = true;
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search: search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    handlePageChange() {
      this.$store.dispatch('model/fetchServices', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandlePageCount(count) {
      this.$store.dispatch('model/fetchServices', {
        currentPage: this.currentPage,
        itemsPerPage: count,
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
    this.$store.dispatch('model/fetchServices', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style scoped>
.accounting-services {
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
  font-weight: 600;
}
</style>
