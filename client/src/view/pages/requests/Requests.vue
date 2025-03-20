<template>
  <div class="card card-custom gutter-b">
    <request-modal
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :items-to-request="itemsToRequest"
      @updateItemsToRequest="value => (itemsToRequest = value)"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Requests</span>
      </h3>
    </div>

    <div class="card-header border-0">
      <search @search="onHandleSearch" :show-date-filter="true" @filterByDateRange="searchByDate" />
    </div>
    <div class="card-header border-0">
      <div class="col-3">
        <label class="text-dark">Status</label>
        <select @change="onFilterByStatus" v-model="status" class="form-control">
          <option :value="status" v-for="(status, i) in statuses" :key="i">{{ status }}</option>
        </select>
      </div>
    </div>

    <div class="card-body py-0">
      <selected-group
        @openModal="openModal"
        :count="selectedRequests.length"
        v-if="selectedRequests.length"
      />

      <requests-table :requests="requests" :should-select-request="true" />

      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
        @changepagecount="handlePageCount"
      />
    </div>
  </div>
</template>

<script>
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import RequestModal from '@/view/pages/requests/components/RequestModal.vue';
import SelectedGroup from '@/view/pages/requests/components/SelectedGroup.vue';
import RequestsTable from '@/view/pages/requests/components/RequestsTable.vue';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 20,
      start: null,
      end: null,
      displayPrompt: false,
      itemsToRequest: [],
      statuses: ['All', 'Pending', 'Granted', 'Declined'],
      status: this.$route.query.filter || 'Pending',
    };
  },
  computed: {
    requests() {
      return this.$store.state.request.requests;
    },
    queriedItems() {
      return this.$store.state.request.total || 0;
    },
    pages() {
      return this.$store.state.request.pages;
    },
    perPage() {
      return this.requests.length;
    },
    selectedRequests: {
      get() {
        return this.$store.state.request.selectedRequests;
      },
      set() {
        this.$store.commit('request/EMPTY_SELECTED_REQUESTS', []);
      },
    },
  },
  components: { RequestsTable, SelectedGroup, RequestModal, Pagination, Search },
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
        filter: this.$route.query.filter || this.status,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store
        .dispatch('request/fetchRequests', {
          currentPage: this.$route.query.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
          filter: this.$route.query.filter,
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        filter: this.$route.query.filter || this.status,
      });
      this.$store.dispatch('request/fetchRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
        filter: this.$route.query.filter,
      });
    },

    onFilterByStatus() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        filter: this.status,
      });
      this.$store.dispatch('request/fetchRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
        filter: this.$route.query.filter,
      });
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        filter: this.$route.query.filter || this.status,
      });
      this.$store.dispatch('request/fetchRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
        filter: this.$route.query.filter,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
        filter: this.$route.query.filter || this.status,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('request/fetchRequests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          filter: this.$route.query.filter,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    openModal(value) {
      this.mapRequests();
      this.displayPrompt = value;
    },

    mapRequests() {
      this.itemsToRequest = this.selectedRequests.map(({ id, item, quantity }) => ({
        id,
        status: null,
        drug_name: item.drug.name,
        unit_name: item.unit.name,
        quantity,
      }));
    },
  },
  watch: {
    selectedRequests() {},
  },
  created() {
    this.$store.dispatch('request/fetchRequests', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
      filter: this.$route.query.filter || this.status,
    });
  },
};
</script>

<style scoped></style>
