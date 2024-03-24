<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Surgery Requests</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 130px">Patient ID</th>
              <th style="width: 250px">Patient Name</th>
              <th style="min-width: 150px">Surgery</th>
              <th style="min-width: 150px">Notes</th>
              <th style="min-width: 150px">Requested By</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 100px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="surgeryRequests.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="request in surgeryRequests" :key="request.id">
              <td class="pr-0">
                <span
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ request.patient.hospital_id }}</span
                >
              </td>
              <td>
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ request.patient.fullname }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request?.service?.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request?.notes }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request?.staff?.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ request.createdAt | dayjs('MMM D, YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <router-link
                  :to="`/surgery/requests/${request.visit_id}?surgery=${request.id}`"
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
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
import Search from '@/utils/Search.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    ArrowRightIcon,
    Search,
    Pagination,
  },
  computed: {
    surgeryRequests() {
      return this.$store.state.surgery.surgeries;
    },
    queriedItems() {
      return this.$store.state.surgery.total;
    },
    pages() {
      return this.$store.state.surgery.pages;
    },
    perPage() {
      return this.surgeryRequests.length;
    },
  },
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchSurgeryRequests({
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
      vm.fetchSurgeryRequests({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
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
      this.fetchSamplesCollected({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    fetchSurgeryRequests({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('surgery/fetchSurgeryRequests', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchSurgeryRequests({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
    });
  },
};
</script>

<style></style>
