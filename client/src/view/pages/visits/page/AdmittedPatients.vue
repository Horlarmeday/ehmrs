<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Admitted Patients</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 150px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
              <th style="min-width: 150px">Ward</th>
              <th style="min-width: 150px">Admitted By</th>
              <th style="min-width: 150px">Date</th>
              <th class="text-right pr-0" style="min-width: 130px">Action</th>
              <th style="min-width: 10px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admissions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="admission in admissions" :key="admission.id">
              <td class="pl-7 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ admission.patient.hospital_id }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.ward.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.examiner.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.date_admitted | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  :to="`/admission/operations/${admission.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ArrowRightIcon />
                </router-link>
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
        @pagechanged="handlePageChange"
        @changepagecount="onChangePageCount"
      />
    </div>
  </div>
</template>
<script>
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, ArrowRightIcon, Search },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    start: null,
    end: null,
  }),
  computed: {
    admissions() {
      return this.$store.state.admission.admissions;
    },
    queriedItems() {
      return this.$store.state.admission.total || 0;
    },
    pages() {
      return this.$store.state.admission.pages;
    },
    perPage() {
      return this.admissions.length;
    },
    filter() {
      return this.$route.query.occupantType || null;
    },
  },
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchAdmissions({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('admission/fetchAdmissions', {
          currentPage: 1,
          itemsPerPage: vm.$route.query.itemsPerPage || vm.itemsPerPage,
          search,
          ...(this.filter && { filter: { occupant_type: this.filter } }),
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.fetchAdmissions({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    onChangePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
      });
      this.fetchAdmissions({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: count,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    fetchAdmissions({ currentPage = 1, itemsPerPage = 10, search, start = null, end = null }) {
      return this.$store.dispatch('admission/fetchAdmissions', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
        ...(this.filter && { filter: { occupant_type: this.filter } }),
      });
    },
  },
  created() {
    this.fetchAdmissions({
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
