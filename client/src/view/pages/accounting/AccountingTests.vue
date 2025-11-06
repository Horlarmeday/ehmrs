<template>
  <div class="accounting-tests">
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
          <i class="fas fa-flask"></i> Laboratory Tests
        </li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="page-title">
        <i class="fas fa-flask text-success mr-3"></i>
        Laboratory Tests Management
      </h2>
      <p class="text-muted">Manage test pricing and billing information</p>
    </div>

    <!-- Card Container -->
    <div class="card card-custom gutter-b">
      <create-test :displayPrompt="displayPrompt" @closeModal="hideModal" :data="testToEdit" />

      <!-- Header -->
      <div class="card-header border-0 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Laboratory Tests</span>
        </h3>
        <div class="card-toolbar">
          <a href="#" class="btn btn-success font-weight-bolder font-size-sm" @click="addNewData">
            <add-icon /> Add New Test
          </a>
        </div>
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
                <th class="pr-0" style="width: 250px">Name</th>
                <th class="pr-0" style="width: 150px">Code</th>
                <th class="pr-0" style="width: 150px">Price (₦)</th>
                <th class="pr-0" style="width: 250px">Result Form</th>
                <th style="min-width: 150px">Date Created</th>
                <th class="pr-0 text-right" style="min-width: 150px">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tests.length === 0">
                <td colspan="6" align="center" class="text-muted">No tests found</td>
              </tr>
              <tr v-for="test in tests" :key="test.id">
                <td class="pr-0">
                  <a
                    href="#"
                    class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >
                    {{ test.name }}
                  </a>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ test.code }}
                  </span>
                </td>
                <td>
                  <span class="text-success font-weight-bolder d-block font-size-lg">
                    {{ formatCurrency(test.price) }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ test?.formTemplate?.name || 'No Result Form' }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ test.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                  </span>
                </td>
                <td class="pr-0 text-right">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(test)"
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
          @changepagecount="onChangePageCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CreateTest from '@/view/pages/laboratory/create/CreateTest.vue';
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner } from '@/common/common';

export default {
  name: 'AccountingTests',
  components: {
    CreateTest,
    Pagination,
    Search,
    EditIcon,
    AddIcon,
  },
  data() {
    return {
      displayPrompt: false,
      testToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.tests;
    },
    queriedItems() {
      return this.$store.state.laboratory.total;
    },
    pages() {
      return this.$store.state.laboratory.pages;
    },
    perPage() {
      return this.tests.length;
    },
  },
  methods: {
    addNewData() {
      this.testToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(test) {
      this.testToEdit = test;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('laboratory/fetchTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          vSelect: false,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(pagecount) {
      this.$store.dispatch('laboratory/fetchTests', {
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
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
    this.$store.dispatch('laboratory/fetchTests', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style scoped>
.accounting-tests {
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
