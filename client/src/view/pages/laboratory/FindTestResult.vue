<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Find Test Results
        </h3>
      </div>
      <!--begin::Form-->
      <div class="card-body" style="padding: 1rem 2.25rem">
        <div class="row">
          <div class="col-lg-6">
            <div class="form-group">
              <label>Enter Text</label>
              <div class="input-group input-group-solid">
                <input
                  type="text"
                  class="form-control"
                  v-model="search"
                  @keypress.enter="searchTestResults"
                />
                <div class="input-group-append">
                  <button type="button" class="btn btn-primary" @click="searchTestResults">
                    Search
                  </button>
                </div>
              </div>
              <span class="form-text text-muted"
                >Find result by name, accession number or hospital ID</span
              >
            </div>
          </div>
          <div class="col-lg-6">
            <date-filter @filterbydate="searchByDate" label="Result" />
          </div>
        </div>
      </div>

      <!--begin::Body-->
      <div v-if="results.length" class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 100px">Accession Number</th>
                <th class="pl-5" style="min-width: 100px">Patient ID</th>
                <th style="min-width: 150px">Patient Name</th>
                <th style="min-width: 100px">Source</th>
                <th class="pr-0" style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in results" :key="result.id">
                <td class="pl-5">
                  <span class="text-dark-75 font-weight-bolder text-hover-primary font-size-lg">{{
                    result?.accession_number
                  }}</span>
                </td>
                <td class="pl-5">
                  <a
                    href="#"
                    class="text-dark-75 font-weight-bolder text-hover-primary font-size-lg"
                    >{{ result?.patient.hospital_id || 'No Hospital Number' }}</a
                  >
                </td>
                <td>
                  <router-link :to="`/patient/profile/${result.patient.id}`"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ result?.patient.fullname }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ result.source }}
                  </span>
                </td>
                <td class="pr-0">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    result.date_sample_received | dayjs('ddd, MMM Do YYYY, h:mma')
                  }}</span>
                </td>
                <td class="pr-0">
                  <router-link
                    :to="`/laboratory/test-result/${result.id}`"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  >
                    <arrow-right-icon />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--end::Table-->
        <pagination
          :total-pages="pages"
          :total="queriedItems"
          :per-page="perPage"
          :current-page="+$route.query.currentPage || currentPage"
          @pagechanged="onPageChange"
        />
      </div>
      <p
        v-if="!queriedItems"
        class="font-weight-bolder card-body pt-0 pb-3 text-center text-dark-40"
      >
        No Results
      </p>
      <!--end::Body-->
    </div>
  </div>
</template>
<script>
import DateFilter from '@/utils/DateFilter.vue';
import Pagination from '@/utils/Pagination.vue';
import { setUrlQueryParams } from '@/common/common';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import dayjs from 'dayjs';
export default {
  name: 'FindResult',
  components: { ArrowRightIcon, Pagination, DateFilter },
  data: () => ({
    search: '',
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    results() {
      return this.$store.state.laboratory.results;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalTestResults;
    },
    pages() {
      return this.$store.state.laboratory.totalTestResultsPages;
    },
    perPage() {
      return this.results.length;
    },
  },
  methods: {
    notifyEmptyField() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Search field cannot be empty',
        type: 'error',
      });
    },

    searchTestResults() {
      if (!this.search) return this.notifyEmptyField();
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.search,
      });
      this.$store.dispatch('laboratory/fetchTestResults', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        search: this.$route.query.search,
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('laboratory/fetchTestResults', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    searchByDate(start, end) {
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store.dispatch('laboratory/fetchTestResults', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },
  },
};
</script>
