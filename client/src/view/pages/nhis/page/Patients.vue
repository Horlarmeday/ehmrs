<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Insurance Paying Patients
        </h3>
      </div>
      <!--begin::Body-->
      <div class="card-body pt-0 pb-3">
        <div class="mt-3">
          <search
            @search="onHandleSearch"
            @filterByDateRange="searchByDate"
            :show-date-filter="true"
          />
        </div>
        <!--begin::Table-->
        <div v-if="patients?.length" class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 100px">Hospital Number</th>
                <th style="min-width: 150px">Name</th>
                <th style="min-width: 100px">
                  <span class="text-primary">Gender</span>
                </th>
                <th style="min-width: 100px">Age</th>
                <th style="min-width: 100px">status</th>
                <th style="min-width: 160px">Registration Date</th>
                <th class="pr-0 " style="min-width: 150px">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!patients.length">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="patient in patients" :key="patient.id">
                <td class="pl-5">
                  <a
                    href="#"
                    class="text-dark-75 font-weight-bolder text-hover-primary font-size-lg"
                    >{{ patient.hospital_id || 'No Hospital Number' }}</a
                  >
                </td>
                <td>
                  <router-link :to="`/patient/profile/${patient.id}`"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ patient.fullname }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ patient.gender }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ patient.date_of_birth | dayjs('from', 'now', true) }}
                  </span>
                </td>
                <td>
                  <span
                    :class="displayLabel(patient.patient_type)"
                    class="label label-lg label-inline"
                    >{{ displayPatientType(patient.patient_type) }}</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    patient.createdAt | dayjs('ddd, MMM Do YYYY')
                  }}</span>
                </td>
                <td class="pr-0">
                  <router-link
                    :to="`/patient/profile/${patient.id}`"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    v-b-tooltip.hover
                  >
                    <arrow-right-icon />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <table-skeleton v-else :columns="7" />
        <!--end::Table-->
        <pagination
          :total-pages="pages"
          :total="queriedItems"
          :per-page="perPage"
          :current-page="+$route.query.currentPage || currentPage"
          @pagechanged="onPageChange"
          @changepagecount="onChangePageCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import dayjs from 'dayjs';
import Search from '@/utils/Search.vue';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';
export default {
  data() {
    return {
      patient_name: '',
      displayPrompt: false,
      patient: {},
      start: null,
      end: null,
      currentPage: 1,
      itemsPerPage: 10,
      isDisabled: false,
      filter: { has_insurance: true },
    };
  },
  components: {
    TableSkeleton,
    Search,
    ArrowRightIcon,
    Pagination,
  },

  computed: {
    patients() {
      return this.$store.state.patient.patients;
    },
    queriedItems() {
      return this.$store.state.patient.total;
    },
    pages() {
      return this.$store.state.patient.pages;
    },
    perPage() {
      return this.patients.length;
    },
  },

  methods: {
    displayLabel(type) {
      if (type === 'Principal') return 'label-light-primary';
      if (type === 'Dependant') return 'label-light-danger';
      return 'label-light-dark';
    },

    displayPatientType(type) {
      if (type === 'Dependant') return 'DEPENDANT';
      if (type === 'Principal') return 'PATIENT';
      return 'PATIENT';
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
      this.fetchPatients({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        filter: this.filter,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
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
        .dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: vm.$route.query.itemsPerPage || vm.itemsPerPage,
          search,
          filter: vm.filter,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search,
      });
      this.fetchPatients({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        filter: this.filter,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: count,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
        filter: this.filter,
      });
    },

    fetchPatients({
      currentPage = 1,
      itemsPerPage = 10,
      search = null,
      start = null,
      end = null,
      filter = null,
    }) {
      return this.$store.dispatch('patient/fetchPatients', {
        currentPage,
        itemsPerPage,
        filter,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchPatients({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate,
      end: this.$route.query.endDate,
      filter: this.filter,
    });
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
