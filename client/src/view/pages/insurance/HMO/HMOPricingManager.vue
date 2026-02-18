<template>
  <div class="container-fluid">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-shield-alt text-primary mr-3"></i>
            HMO Pricing Management
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Manage pricing for drugs, tests, services, and investigations across all HMO providers
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'drugs' }"
              @click="setActiveTab('drugs')"
            >
              <i class="fas fa-pills mr-2"></i>Drugs
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'tests' }"
              @click="setActiveTab('tests')"
            >
              <i class="fas fa-flask mr-2"></i>Tests
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'services' }"
              @click="setActiveTab('services')"
            >
              <i class="fas fa-stethoscope mr-2"></i>Services
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'investigations' }"
              @click="setActiveTab('investigations')"
            >
              <i class="fas fa-x-ray mr-2"></i>Investigations
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Tabs -->
    <div class="tab-content">
      <!-- Drugs Tab -->
      <div v-if="activeTab === 'drugs'">
        <DrugPricingTab
          ref="drugPricingTab"
          :pricing="drugPricing"
          :hmo-providers="hmoProviders"
          @open-create-modal="handleOpenCreateModal"
          @edit-pricing="editPricing"
          @delete-pricing="deletePricing"
        />
      </div>

      <!-- Tests Tab -->
      <div v-if="activeTab === 'tests'">
        <TestPricingTab
          :pricing="testPricing"
          :hmo-providers="hmoProviders"
          @open-create-modal="handleOpenCreateModal"
          @edit-pricing="editPricing"
          @delete-pricing="deletePricing"
        />
      </div>

      <!-- Services Tab -->
      <div v-if="activeTab === 'services'">
        <ServicePricingTab
          :pricing="servicePricing"
          :hmo-providers="hmoProviders"
          @open-create-modal="handleOpenCreateModal"
          @edit-pricing="editPricing"
          @delete-pricing="deletePricing"
        />
      </div>

      <!-- Investigations Tab -->
      <div v-if="activeTab === 'investigations'">
        <InvestigationPricingTab
          :pricing="investigationPricing"
          :hmo-providers="hmoProviders"
          @open-create-modal="handleOpenCreateModal"
          @edit-pricing="editPricing"
          @delete-pricing="deletePricing"
        />
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="card card-custom gutter-b mt-5" v-if="currentPagination.total > 0">
      <div class="card-body">
        <Pagination
          :total-pages="currentPagination.pages"
          :total="currentPagination.total"
          :current-page="currentPagination.currentPage"
          :per-page="currentPagination.perPage"
          @pagechanged="changePage"
          @changepagecount="changePerPage"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <PricingModal
      ref="pricingModal"
      :key="modalKey"
      :show-modal="showModal"
      :active-tab="activeTab"
      :editing-pricing="editingPricing"
      :available-items="availableItems"
      :hmo-providers="hmoProviders"
      :is-submitting="isSubmitting"
      @close-modal="closeModal"
      @save-pricing="savePricing"
      @searchHMOs="searchHMOs"
      @searchAvailableItems="searchAvailableItems"
    />
  </div>
</template>

<script>
import DrugPricingTab from './components/DrugPricingTab.vue';
import TestPricingTab from './components/TestPricingTab.vue';
import ServicePricingTab from './components/ServicePricingTab.vue';
import InvestigationPricingTab from './components/InvestigationPricingTab.vue';
import PricingModal from './components/PricingModal.vue';
import Pagination from '@/utils/Pagination.vue';
import { debounce } from '@/common/common';

export default {
  name: 'HMOPricingManager',
  components: {
    DrugPricingTab,
    TestPricingTab,
    ServicePricingTab,
    InvestigationPricingTab,
    PricingModal,
    Pagination,
  },
  data() {
    return {
      activeTab: 'drugs',
      showModal: false,
      isSubmitting: false,
      editingPricing: null,
      availableItems: [],
      // Pagination
      currentPage: 1,
      perPage: 20, // Matches Pagination component's default
      // Modal state tracking
      modalKey: 0,
      itemsPerPage: 100,
    };
  },
  computed: {
    drugPricing() {
      return this.$store.getters['hmoPricing/getDrugPricing'] || [];
    },
    testPricing() {
      return this.$store.getters['hmoPricing/getTestPricing'] || [];
    },
    servicePricing() {
      return this.$store.getters['hmoPricing/getServicePricing'] || [];
    },
    investigationPricing() {
      return this.$store.getters['hmoPricing/getInvestigationPricing'] || [];
    },
    // Pagination computed properties
    drugPricingPagination() {
      return this.$store.getters['hmoPricing/getDrugPricingPagination'];
    },
    testPricingPagination() {
      return this.$store.getters['hmoPricing/getTestPricingPagination'];
    },
    servicePricingPagination() {
      return this.$store.getters['hmoPricing/getServicePricingPagination'];
    },
    investigationPricingPagination() {
      return this.$store.getters['hmoPricing/getInvestigationPricingPagination'];
    },
    // Current pagination based on active tab
    currentPagination() {
      switch (this.activeTab) {
        case 'drugs':
          return this.drugPricingPagination;
        case 'tests':
          return this.testPricingPagination;
        case 'services':
          return this.servicePricingPagination;
        case 'investigations':
          return this.investigationPricingPagination;
        default:
          return { total: 0, pages: 0, currentPage: 1, perPage: 10 };
      }
    },
    hmoProviders() {
      return this.$store.state.insurance.hmos;
    },
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      this.currentPage = 1; // Reset to first page when switching tabs
      this.loadPricingData();
      this.loadAvailableItems();
    },

    async changePage(page) {
      this.currentPage = page;
      await this.loadPricingData();
    },

    async changePerPage(pageCount) {
      this.perPage = pageCount;
      this.currentPage = 1; // Reset to first page when changing page size
      await this.loadPricingData();
    },

    async loadPricingData() {
      try {
        const params = {
          page: this.currentPage,
          limit: this.perPage,
        };

        switch (this.activeTab) {
          case 'drugs':
            await this.$store.dispatch('hmoPricing/fetchDrugPricing', params);
            break;
          case 'tests':
            await this.$store.dispatch('hmoPricing/fetchTestPricing', params);
            break;
          case 'services':
            await this.$store.dispatch('hmoPricing/fetchServicePricing', params);
            break;
          case 'investigations':
            await this.$store.dispatch('hmoPricing/fetchInvestigationPricing', params);
            break;
        }
      } catch (error) {
        console.error('Failed to load pricing data:', error);
      }
    },

    async loadAvailableItems() {
      try {
        switch (this.activeTab) {
          case 'drugs': {
            const response = await this.$store.dispatch('pharmacy/fetchGenericDrugs', {
              page: 1,
              limit: 100,
            });
            const drugs = response.data.data.docs;
            this.availableItems = drugs.map((drug) => ({
              id: drug.id,
              name: drug.name,
              code: drug.code,
            }));
            break;
          }
          case 'tests': {
            const response = await this.$store.dispatch('laboratory/fetchTests', {
              page: 1,
              limit: 100,
            });
            const tests = response.data.data.docs;
            this.availableItems = tests.map((test) => ({
              id: test.id,
              name: test.name,
              code: test.code,
            }));
            break;
          }
          case 'services': {
            const response = await this.$store.dispatch('model/fetchServices', {
              page: 1,
              limit: 100,
            });
            const services = response.data.data.docs;
            this.availableItems = services.map((service) => ({
              id: service.id,
              name: service.name,
              code: service.code,
            }));
            break;
          }
          case 'investigations': {
            const response = await this.$store.dispatch('radiology/fetchInvestigations', {
              page: 1,
              limit: 100,
            });
            const investigations = response.data.data.docs;
            this.availableItems = investigations.map((investigation) => ({
              id: investigation.id,
              name: investigation.name,
              code: investigation.code,
            }));
            break;
          }
        }
      } catch (error) {
        console.error('Failed to load available items:', error);
      }
    },

    loadHMOProviders() {
      try {
        this.$store.dispatch('insurance/fetchHMOs', {
          currentPage: 1,
          itemsPerPage: 100,
        });
      } catch (error) {
        console.error('Failed to load HMO providers:', error);
      }
    },

    searchHMOs(search, loading) {
      if (search && search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      } else {
        // Load initial HMOs when search is empty
        this.$store.dispatch('insurance/fetchHMOs', {
          currentPage: 1,
          itemsPerPage: this.itemsPerPage,
        });
        loading(false);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('insurance/fetchHMOs', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    searchAvailableItems(search, loading) {
      if (search && search.length > 2) {
        loading(true);
        this.debounceSearchAvailableItems(search, this, loading);
      } else {
        // Load initial items when search is empty
        this.loadAvailableItems();
        loading(false);
      }
    },

    debounceSearchAvailableItems: debounce(async (search, vm, loading) => {
      try {
        let response;
        switch (vm.activeTab) {
          case 'drugs':
            response = await vm.$store.dispatch('pharmacy/fetchGenericDrugs', {
              page: 1,
              limit: 100,
              search,
            });
            if (response && response.data && response.data.data && response.data.data.docs) {
              const drugs = response.data.data.docs;
              vm.availableItems = drugs.map((drug) => ({
                id: drug.id,
                name: drug.name,
                code: drug.code,
              }));
            }
            break;
          case 'tests':
            response = await vm.$store.dispatch('laboratory/fetchTests', {
              page: 1,
              limit: 100,
              search,
            });
            if (response && response.data && response.data.data && response.data.data.docs) {
              const tests = response.data.data.docs;
              vm.availableItems = tests.map((test) => ({
                id: test.id,
                name: test.name,
                code: test.code,
              }));
            }
            break;
          case 'services':
            response = await vm.$store.dispatch('model/fetchServices', {
              page: 1,
              limit: 100,
              search,
            });
            if (response && response.data && response.data.data && response.data.data.docs) {
              const services = response.data.data.docs;
              vm.availableItems = services.map((service) => ({
                id: service.id,
                name: service.name,
                code: service.code,
              }));
            }
            break;
          case 'investigations':
            response = await vm.$store.dispatch('radiology/fetchInvestigations', {
              page: 1,
              limit: 100,
              search,
            });
            if (response && response.data && response.data.data && response.data.data.docs) {
              const investigations = response.data.data.docs;
              vm.availableItems = investigations.map((investigation) => ({
                id: investigation.id,
                name: investigation.name,
                code: investigation.code,
              }));
            }
            break;
        }
      } catch (error) {
        console.error('Failed to search available items:', error);
        vm.availableItems = [];
      } finally {
        loading(false);
      }
    }, 500),

    openCreateModal(tab) {
      this.activeTab = tab;
      this.editingPricing = null;
      // Increment modal key to ensure fresh modal
      this.modalKey++;
      // Ensure modal is closed first, then open
      this.showModal = false;
      this.$nextTick(() => {
        this.showModal = true;
        // Load initial data for the modal
        this.loadAvailableItems();
        this.$store.dispatch('insurance/fetchHMOs', {
          currentPage: 1,
          itemsPerPage: this.itemsPerPage,
        });
      });
    },

    handleOpenCreateModal(tab) {
      this.openCreateModal(tab);
    },

    editPricing(pricing) {
      this.editingPricing = pricing;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editingPricing = null;
      // Increment modal key to force re-render
      this.modalKey++;
      // Force update to ensure reactivity
      this.$nextTick(() => {
        console.log('Modal state after nextTick:', this.showModal);
      });
    },

    async savePricing(payload) {
      this.isSubmitting = true;
      try {
        let actionName = '';

        if (this.editingPricing) {
          // Update existing pricing
          switch (this.activeTab) {
            case 'drugs':
              actionName = 'hmoPricing/updateDrugPricing';
              break;
            case 'tests':
              actionName = 'hmoPricing/updateTestPricing';
              break;
            case 'services':
              actionName = 'hmoPricing/updateServicePricing';
              break;
            case 'investigations':
              actionName = 'hmoPricing/updateInvestigationPricing';
              break;
          }
        } else {
          // Create new pricing
          switch (this.activeTab) {
            case 'drugs':
              actionName = 'hmoPricing/createDrugPricing';
              break;
            case 'tests':
              actionName = 'hmoPricing/createTestPricing';
              break;
            case 'services':
              actionName = 'hmoPricing/createServicePricing';
              break;
            case 'investigations':
              actionName = 'hmoPricing/createInvestigationPricing';
              break;
          }
        }

        await this.$store.dispatch(actionName, payload);

        // Close modal properly
        this.closeModal();
        await this.loadPricingData();

        console.log('🎉 Pricing saved successfully!');
      } catch (error) {
        console.error('Failed to save pricing:', error);
      } finally {
        this.isSubmitting = false;
      }
    },

    async deletePricing(id) {
      if (confirm('Are you sure you want to delete this pricing?')) {
        try {
          let actionName = '';
          switch (this.activeTab) {
            case 'drugs':
              actionName = 'hmoPricing/deleteDrugPricing';
              break;
            case 'tests':
              actionName = 'hmoPricing/deleteTestPricing';
              break;
            case 'services':
              actionName = 'hmoPricing/deleteServicePricing';
              break;
            case 'investigations':
              actionName = 'hmoPricing/deleteInvestigationPricing';
              break;
          }

          await this.$store.dispatch(actionName, id);
          await this.loadPricingData();
        } catch (error) {
          console.error('Failed to delete pricing:', error);
        }
      }
    },
  },

  async created() {
    // Load initial HMOs for the modal
    await this.loadHMOProviders();
    await this.loadPricingData();
    await this.loadAvailableItems();
  },
};
</script>

<style scoped>
.hmo-pricing-manager {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.tab-content {
  margin-top: 1rem;
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

.btn-group .btn.active {
  background-color: #00acc1;
  border-color: #00acc1;
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
