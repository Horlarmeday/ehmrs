<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <update-pharmacy-item
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="itemToEdit"
    />

    <dispense-modal
      :displayPrompt="displayDispenseModal"
      @closeModal="hideDispenseModal"
      :items-to-dispense="itemsToDispense"
    />

    <reorder-item-modal
      :display-prompt="displayReorderModal"
      @closeModal="hideReorderModal"
      :items-to-reorder="itemsToReorder"
    />

    <export-modal
      :data="itemsToExport"
      action="store/exportData"
      :display-prompt="displayExportModal"
      @closeModal="hideExportModal"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Store Items</span>
      </h3>
      <div class="card-toolbar">
        <router-link
          to="/store/pharmacy/add-item"
          class="btn btn-success font-weight-bolder font-size-sm"
        >
          <add-icon /> Add New
        </router-link>
      </div>
    </div>
    <!--end::Header-->
    <search-and-filter
      place-holder="Search Items"
      @search="onHandleSearch"
      @sort="onHandleSort"
      @filter="onFilter"
    />

    <!--begin::Body-->
    <div class="card-body py-0">
      <button-group
        @openDispenseModal="openDispenseModal"
        @openReorderModal="openReorderModal"
        @openExportModal="openExportModal"
        v-if="selectedItems.length"
        :count="selectedItems.length"
      />
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pl-0" style="width: 20px">
                <label class="checkbox checkbox-md checkbox-inline">
                  <input type="checkbox" v-model="isAllSelected" />
                  <span></span>
                </label>
              </th>
              <th class="pr-0" style="width: 300px">Name</th>
              <th style="min-width: 150px">Quantity Remaining</th>
              <th style="min-width: 50px">Shelf</th>
              <th style="min-width: 100px">Dosage Form</th>
              <th style="min-width: 50px">Strength/Volume</th>
              <th style="min-width: 150px">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!items.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="item in items" :key="item.id">
              <td class="pl-0">
                <label class="checkbox checkbox-md checkbox-inline">
                  <input type="checkbox" :checked="isSelected(item)" @change="toggleItem(item)" />
                  <span></span>
                </label>
              </td>
              <td class="pr-0">
                <router-link
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :to="`/store/pharmacy/items/${item.id}`"
                  >{{ item.drug.name }}</router-link
                >
                <span v-if="item.drug_type === 'NHIS'" class="label label-inline label-success ml-2"
                  >NHIS</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ item.quantity_remaining }} {{ item.unit.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ item.shelf || 'None' }}
                </span>
              </td>
              <td>
                <span
                  v-if="item.dosage_form_id"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.dosage_form.name || 'None' }}
                </span>
                <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">Nil</span>
              </td>
              <td>
                <span
                  v-if="item.measurement_id"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.strength_input }} {{ item.strength.name || 'None' }}
                </span>
                <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">Nil</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ item.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--end::Table-->
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="itemsPerPage"
        :current-page="+$route.query.currentPage || currentPage"
        @pagechanged="onPageChange"
        @changepagecount="onChangePageCount"
      />
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import UpdatePharmacyItem from './update/UpdateStoreItem.vue';
import Pagination from '@/utils/Pagination.vue';
import AddIcon from '../../../../assets/icons/AddIcon.vue';
import SearchAndFilter from '../../../../utils/SearchAndFilter';
import { setUrlQueryParams } from '@/common/common';
import ButtonGroup from '../../../../utils/ButtonGroup';
import DispenseModal from '@/view/pages/store/pharmacy/components/DispenseModal.vue';
import ReorderItemModal from '@/view/pages/store/pharmacy/components/ReorderItemModal.vue';
import ExportModal from '@/utils/ExportModal.vue';
export default {
  data() {
    return {
      displayPrompt: false,
      displayDispenseModal: false,
      itemToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
      selected: [],
      loading: false,
      itemsToDispense: [],
      itemsToReorder: [],
      itemsToExport: {},
      displayReorderModal: false,
      displayExportModal: false,
    };
  },
  components: {
    ExportModal,
    ReorderItemModal,
    DispenseModal,
    ButtonGroup,
    SearchAndFilter,
    UpdatePharmacyItem,
    Pagination,
    AddIcon,
  },
  computed: {
    items() {
      return this.$store.state.store.items;
    },
    queriedItems() {
      return this.$store.state.store.totalItems;
    },
    pages() {
      return this.$store.state.store.itemPages;
    },
    perPage() {
      return this.items.length;
    },
    selectedItems() {
      return this.$store.state.store.selectedItems;
    },
    isAllSelected: {
      get() {
        return this.selectedItems.length === this.items.length;
      },
      set(value) {
        // Update the selected items based on the new value of isAllSelected
        if (value) {
          // Set all items as selected
          this.$store.dispatch('store/addAllAsSelectedItems', this.items);
        } else {
          // Clear all selected items
          this.$store.dispatch('store/removeAllSelectedItems');
        }
      },
    },
  },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    hideDispenseModal() {
      this.displayDispenseModal = false;
    },

    openDispenseModal(value) {
      this.mapDispenseItems();
      if (this.itemsToDispense.length > 10) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You cannot dispense more than 10 items at a time',
          type: 'error',
        });
      }
      this.displayDispenseModal = value;
    },

    openReorderModal(value) {
      this.mapReorderItems();
      if (this.itemsToReorder.length > 10) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You cannot reorder more than 10 items at a time',
          type: 'error',
        });
      }
      this.displayReorderModal = value;
    },

    openExportModal(value) {
      const selectedItemsId = this.selectedItems.map(({ id }) => id);
      this.itemsToExport = { selectedItemsId };
      this.displayExportModal = value;
    },

    hideReorderModal() {
      this.displayReorderModal = false;
    },

    hideExportModal() {
      this.displayExportModal = false;
    },

    editData(item) {
      this.itemToEdit = item;
      this.displayPrompt = true;
    },

    queryParams({ search = null, sort = null, filter = null, pagecount = null }) {
      setUrlQueryParams({
        pathName: 'pharmacy-items',
        currentPage: this.currentPage,
        itemsPerPage: pagecount || this.itemsPerPage,
        ...(search && { search }),
        ...(sort && { sort }),
        ...(filter && { filter }),
      });
    },

    fetchPharmacyItems({ sort = null, filter = null, search = null, currentPage = null }) {
      this.$store.dispatch('store/fetchPharmacyItems', {
        currentPage: currentPage || this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        ...(search && { search }),
        ...(sort && { sort }),
        ...(filter && { filter }),
      });
    },

    handlePageChange() {
      this.queryParams({});
      this.fetchPharmacyItems({});
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(search) {
      this.queryParams({ search });
      this.fetchPharmacyItems({ search, currentPage: 1 });
    },

    onChangePageCount(pagecount) {
      this.queryParams({ pagecount });
      this.$store.dispatch('store/fetchPharmacyItems', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
      });
    },

    onHandleSort(sort) {
      this.queryParams({ sort });
      this.fetchPharmacyItems({
        sort,
        currentPage: this.$route.query.currentPage || this.currentPage,
      });
    },

    onFilter(filter) {
      this.queryParams({ filter });
      this.fetchPharmacyItems({
        filter,
        currentPage: this.$route.query.currentPage || this.currentPage,
      });
    },

    isSelected(item) {
      return this.selectedItems.includes(item);
    },

    toggleItem(item) {
      if (this.isSelected(item)) {
        // If the item is already selected, remove it from selectedItems
        this.$store.dispatch('store/removeSelectedItem', item);
      } else {
        // If the item is not selected, add it to selectedItems
        this.$store.dispatch('store/addSelectedItem', item);
      }
    },

    mapDispenseItems() {
      this.itemsToDispense = this.selectedItems.map(
        ({ id, drug, unit, quantity_remaining, drug_type }) => ({
          receiver: null,
          id,
          quantity_to_dispense: null,
          dispensary: null,
          drug_name: drug.name,
          quantity_left: quantity_remaining,
          unit_name: unit.name,
          unit_id: unit.id,
          drug_type,
          isInvalid: false,
        })
      );
    },

    mapReorderItems() {
      this.itemsToReorder = this.selectedItems.map(
        ({
          id,
          drug,
          unit,
          drug_type,
          unit_price,
          selling_price,
          voucher,
          batch,
          expiration,
          date_received,
        }) => ({
          quantity_received: null,
          id,
          selling_price,
          unit_price,
          drug_name: drug.name,
          unit_name: unit.name,
          drug_type,
          voucher,
          batch,
          expiration,
          date_received,
          isInvalid: false,
        })
      );
    },
  },

  created() {
    this.fetchPharmacyItems({
      currentPage: this.$route.query.currentPage || this.currentPage,
    });
  },
};
</script>

<style></style>
