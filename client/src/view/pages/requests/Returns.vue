<template>
  <div class="card card-custom gutter-b">
    <returns-modal
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :items-to-return="itemsToReturn"
    />
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Inventory Returns</span>
      </h3>
    </div>

    <div class="card-header border-0">
      <search @search="onHandleSearch" :show-date-filter="true" />
    </div>

    <div class="card-body py-0">
      <b-button-group v-if="selectedItems?.length" size="md" class="mt-5">
        <b-button variant="outline-secondary">
          <label class="checkbox-md checkbox-inline">
            <span class="mr-2" />
            {{ selectedItems?.length ? selectedItems?.length : null }} Selected
          </label>
        </b-button>
        <b-button @click="openModal" variant="outline-secondary">Process Return Request</b-button>
      </b-button-group>

      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr>
              <th></th>
              <th class="pr-0" style="width: 250px">Item</th>
              <th class="pr-0" style="width: 100px">Quantity</th>
              <th class="pr-0" style="width: 100px">Dosage Form</th>
              <th class="pr-0" style="width: 100px">Status</th>
              <th class="pr-0" style="width: 150px">Requester</th>
              <th class="pr-0" style="width: 200px">Reason for Return</th>
              <th class="pr-0" style="min-width: 150px">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!returns.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="request in returns" :key="request.id">
              <td class="pl-0">
                <label
                  v-if="
                    allowedRole.includes(currentUser.role) ||
                      allowedSubRole.includes(currentUser.sub_role)
                  "
                  class="checkbox checkbox-md checkbox-inline"
                >
                  <input
                    :disabled="request.status !== 'Pending'"
                    type="checkbox"
                    :checked="isSelected(request)"
                    @change="toggleRequest(request)"
                  />
                  <span></span>
                </label>
              </td>
              <td class="pr-0">
                <router-link
                  :to="`/inventory/items/${request.inventory_item_id}`"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ request?.item?.drug?.name }}</router-link
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request?.quantity }} {{ request?.item?.unit?.name }}
                </span>
              </td>
              <td>
                <span
                  v-if="request?.item?.dosage_form_id"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ request?.item?.dosage_form.name || 'None' }}
                </span>
                <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">Nil</span>
              </td>
              <td>
                <span
                  :class="getRequestStatus(request.status)"
                  class="label label-lg label-inline"
                  >{{ request.status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request.staff.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  request.reason_for_return || 'None'
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request.date_received | dayjs('DD/MM/YYYY, h:mma') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
</template>

<script>
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import { debounce, parseJwt, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
import ReturnsModal from '@/view/pages/requests/components/ReturnsModal.vue';
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      start: null,
      end: null,
      displayPrompt: false,
      itemsToReturn: [],
      allowedSubRole: ['HOD'],
      allowedRole: ['Super Admin'],
      currentUser: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    returns() {
      return this.$store.state.inventory.returnRequests;
    },
    queriedItems() {
      return this.$store.state.inventory.totalReturnRequests || 0;
    },
    pages() {
      return this.$store.state.inventory.returnRequestsPages;
    },
    perPage() {
      return this.returns.length;
    },
    selectedItems: {
      get() {
        return this.$store.state.inventory.selectedItems;
      },
      set() {
        this.$store.commit('inventory/REMOVE_ALL_SELECTED_ITEMS', []);
      },
    },
  },
  components: { ReturnsModal, Pagination, Search },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store
        .dispatch('inventory/fetchReturnRequests', {
          currentPage: this.$route.query.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
      });
      this.$store.dispatch('inventory/fetchReturnRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(pagecount) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search || null,
      });
      this.$store.dispatch('inventory/fetchReturnRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
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
      vm.$store
        .dispatch('inventory/fetchReturnRequests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    openModal() {
      this.mapReturnRequests();
      this.displayPrompt = true;
    },

    mapReturnRequests() {
      this.itemsToReturn = this.selectedItems.map(({ id, item, quantity, inventory_item_id }) => ({
        id,
        status: null,
        drug_name: item.drug.name,
        unit_name: item.unit.name,
        quantity,
        inventory_item_id,
      }));
    },

    getRequestStatus(type) {
      if (type === 'Pending') return 'label-light-warning';
      if (type === 'Granted') return 'label-light-success';
      if (type === 'Declined') return 'label-light-danger';
      return 'label-light-info';
    },

    isSelected(request) {
      return this.selectedItems.includes(request);
    },

    toggleRequest(request) {
      if (this.isSelected(request)) {
        // If the request is already selected, remove it from selectedRequests
        this.$store.dispatch('inventory/removeSelectedItem', request);
      } else {
        // If the request is not selected, add it to selectedRequests
        this.$store.dispatch('inventory/addSelectedItem', request);
      }
    },
  },
  watch: {
    selectedRequests() {},
  },
  created() {
    this.$store.dispatch('inventory/fetchReturnRequests', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
    });
  },
};
</script>

<style scoped></style>
