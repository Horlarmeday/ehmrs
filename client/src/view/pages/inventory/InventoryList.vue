<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">{{ inventoryName }}</span>
      </h3>
    </div>
    <!--end::Header-->

    <search @search="onHandleSearch" />

    <!--begin::Body-->
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
      @deactivateItem="displayPrompt"
    />
    <!--end::Body-->
  </div>
</template>

<script>
import InventoryTable from './components/InventoryTable';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Swal from 'sweetalert2';
export default {
  name: 'InventoryList',
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
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
  },
  components: { InventoryTable, Search },
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
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
        itemsPerPage: this.itemsPerPage,
        search,
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
        pathName: 'generic-drugs',
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search || null,
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

    displayPrompt(item) {
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
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
        });
      });
    },
  },
  created() {
    this.fetchInventoryItems({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
    });
  },
};
</script>

<style scoped></style>
