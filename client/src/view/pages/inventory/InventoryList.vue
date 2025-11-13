<template>
  <div class="inventory-list-page">
    <return-items-modal
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :items-to-return="itemsToReturn"
    />
    <transfer-item-modal
      :display-prompt="displayTransferModal"
      @closeModal="hideTransferModal"
      :selected-item="selectedItemForTransfer"
      @transfer-success="onTransferSuccess"
    />
    <bulk-transfer-modal
      :display-prompt="displayBulkTransferModal"
      @closeModal="hideBulkTransferModal"
      :selected-items="selectedItems"
      @transfer-success="onTransferSuccess"
    />

    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-box text-primary mr-3"></i>
            {{ inventoryName }}
          </h1>
          <p class="text-muted font-size-lg mb-0">Manage inventory items and track stock levels</p>
        </div>
        <div class="col-lg-4 text-right">
          <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
            <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="summary" class="row mb-6">
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-primary h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.total_items || 0 }}</h3>
                <p class="text-muted mb-0">Total Items</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-box text-primary icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-warning h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.low_stock_count || 0 }}</h3>
                <p class="text-muted mb-0">Low Stock</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-warning text-warning icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-danger h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.critical_stock_count || 0 }}</h3>
                <p class="text-muted mb-0">Critical Stock</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-danger text-danger icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-success h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">₦{{ formatCurrency(summary.total_valuation) }}</h3>
                <p class="text-muted mb-0">Total Valuation</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-dollar text-success icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Statistics Row -->
    <div v-if="summary" class="row mb-6">
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-info h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.expiring_soon_count || 0 }}</h3>
                <p class="text-muted mb-0">Expiring Soon</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-calendar text-info icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-danger h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.expired_count || 0 }}</h3>
                <p class="text-muted mb-0">Expired Items</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-delete text-danger icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-primary h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ summary.total_quantity_remaining || 0 }}</h3>
                <p class="text-muted mb-0">Total Quantity</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-list text-primary icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card card-custom gutter-b mb-6">
      <div class="card-header border-0 py-4">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h3 class="card-title mb-0">Inventory Items</h3>
          </div>
          <div class="col-lg-6 text-right">
            <b-button-group class="mr-3">
              <b-button
                :variant="filterType === 'low_stock' ? 'warning' : 'outline-warning'"
                @click="applyFilter('low_stock')"
                size="sm"
              >
                Low Stock
              </b-button>
              <b-button
                :variant="filterType === 'critical' ? 'danger' : 'outline-danger'"
                @click="applyFilter('critical')"
                size="sm"
              >
                Critical
              </b-button>
              <b-button
                :variant="filterType === 'expiring' ? 'info' : 'outline-info'"
                @click="applyFilter('expiring')"
                size="sm"
              >
                Expiring Soon
              </b-button>
              <b-button
                v-if="filterType"
                variant="outline-secondary"
                @click="clearFilter"
                size="sm"
              >
                Clear
              </b-button>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="card-body">
        <search @search="onHandleSearch" />
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="card card-custom gutter-b">
      <inventory-table
        :items="items"
        :pagination-params="{
          queriedItems,
          pages,
          perPage: +$route.query.currentPage || perPage,
          currentPage: +$route.query.currentPage || currentPage,
        }"
        @changePage="onPageChange"
        @changePageCount="onChangePageCount"
        @deactivateItem="displayDeactivatePrompt"
        @openReturnModal="openReturnModal"
        @transferItem="openTransferModal"
        @openBulkTransferModal="openBulkTransferModal"
      />
    </div>
  </div>
</template>

<script>
import InventoryTable from './components/InventoryTable';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Swal from 'sweetalert2';
import ReturnItemsModal from '@/view/pages/inventory/components/ReturnItemsModal.vue';
import TransferItemModal from '@/view/pages/inventory/components/TransferItemModal.vue';
import BulkTransferModal from '@/view/pages/inventory/components/BulkTransferModal.vue';

export default {
  name: 'InventoryList',
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      itemsToReturn: [],
      filterType: null,
      loading: false,
      displayTransferModal: false,
      selectedItemForTransfer: null,
      displayBulkTransferModal: false,
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
    inventoryName() {
      return this.$route.query.name;
    },
    selectedItems() {
      return this.$store.state.inventory.selectedItems;
    },
    summary() {
      return this.$store.state.inventory.summary;
    },
  },
  components: { ReturnItemsModal, TransferItemModal, BulkTransferModal, InventoryTable, Search },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    formatCurrency(value) {
      if (!value) return '0';
      return parseFloat(value).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    refreshData() {
      this.loading = true;
      Promise.all([
        this.fetchInventoryItems({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          search: this.$route.query.search || null,
        }),
        this.$store.dispatch('inventory/fetchInventorySummary', this.$route.params.id),
      ])
        .finally(() => {
          this.loading = false;
        });
    },

    applyFilter(type) {
      this.filterType = type;
      // TODO: Implement filter logic in fetchInventoryItems
      this.fetchInventoryItems({
        currentPage: 1,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        filter: type,
      });
    },

    clearFilter() {
      this.filterType = null;
      this.fetchInventoryItems({
        currentPage: 1,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
      });
    },

    openTransferModal(item) {
      this.selectedItemForTransfer = item;
      this.displayTransferModal = true;
    },

    hideTransferModal() {
      this.displayTransferModal = false;
      this.selectedItemForTransfer = null;
    },

    onTransferSuccess() {
      this.refreshData();
    },

    openBulkTransferModal() {
      if (this.selectedItems.length === 0) {
        this.$bvToast.toast('Please select items to transfer', {
          title: 'No Selection',
          variant: 'warning',
          solid: true,
        });
        return;
      }
      this.displayBulkTransferModal = true;
    },

    hideBulkTransferModal() {
      this.displayBulkTransferModal = false;
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        name: this.inventoryName,
      });
      this.fetchInventoryItems({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search,
        name: this.inventoryName,
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
        search: this.$route.query.search || null,
        name: this.inventoryName,
      });
      this.fetchInventoryItems({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search || null,
      });
    },

    fetchInventoryItems({ currentPage, itemsPerPage, search }) {
      return this.$store.dispatch('inventory/fetchInventoryItems', {
        currentPage,
        itemsPerPage,
        inventory: this.$route.params.id,
        ...(search && { search }),
      });
    },

    displayDeactivatePrompt(item) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to deactivate this item, this action cannot be reversed',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.deactivateItem(item);
        },
      });
    },

    deactivateItem(item) {
      const data = {
        id: item.id,
        status: 'Inactive',
      };
      this.$store.dispatch('inventory/updateInventoryItem', data).then(() => {
        this.fetchInventoryItems({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        });
      });
    },

    openReturnModal(value) {
      this.mapReturnItems();
      if (this.itemsToReturn.length > 10) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You cannot return more than 10 items at a time',
          type: 'error',
        });
      }
      this.displayPrompt = value;
    },

    mapReturnItems() {
      this.itemsToReturn = this.selectedItems.map(({ id, drug, unit, quantity_remaining }) => ({
        receiver: null,
        inventory_item_id: id,
        quantity: null,
        drug_name: drug.name,
        quantity_left: quantity_remaining,
        unit_name: unit.name,
        unit_id: unit.id,
        isInvalid: false,
      }));
    },
  },
  created() {
    this.fetchInventoryItems({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
    });
    this.$store.dispatch('inventory/fetchInventorySummary', this.$route.params.id);
  },
};
</script>

<style scoped></style>
