<template>
  <div class="card card-custom gutter-b">
    <request-modal
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :items-to-request="itemsToRequest"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Requests</span>
      </h3>
    </div>
    <div class="card-header border-0">
      <search @search="onHandleSearch" :show-date-filter="true" />
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
      itemsPerPage: 10,
      start: null,
      end: null,
      displayPrompt: false,
      itemsToRequest: [],
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
        pathName: 'request-list',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store
        .dispatch('request/fetchRequests', {
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
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('request/fetchRequests', {
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
        .dispatch('request/fetchRequests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
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
    });
  },
};
</script>

<style scoped></style>
