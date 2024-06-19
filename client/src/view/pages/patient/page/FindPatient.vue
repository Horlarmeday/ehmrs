<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Find Patient Record
        </h3>
      </div>
      <!--begin::Form-->
      <div class="card-body" style="padding: 1rem 2.25rem">
        <div class="row">
          <div class="col-lg-6">
            <div class="form-group">
              <label>Enter Patient Name</label>
              <div class="input-group input-group-solid">
                <input
                  type="text"
                  class="form-control"
                  v-model="patient_name"
                  @keypress.enter="searchByName"
                />
                <div class="input-group-append">
                  <button type="button" class="btn btn-primary" @click="searchByName">
                    Search
                  </button>
                </div>
              </div>
              <span class="form-text text-muted">Find Patient by name</span>
            </div>
          </div>
          <div class="col-lg-6">
            <date-filter @filterbydate="searchByDate" label="Patient" />
          </div>
        </div>
      </div>

      <!--begin::Body-->
      <div v-if="patients.length" class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 100px">Hospital Number</th>
                <th style="min-width: 150px">Name</th>
                <th style="min-width: 100px">
                  <span class="text-primary">Gender</span>
                </th>
                <th style="min-width: 100px">Age</th>
                <th style="min-width: 100px">account type</th>
                <th style="min-width: 160px">Registration Date</th>
                <th style="min-width: 160px">Registered By</th>
                <th class="pr-0 " style="min-width: 70px">Action</th>
              </tr>
            </thead>
            <tbody>
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
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    patient?.staff?.fullname
                  }}</span>
                </td>
                <td class="pr-0">
                  <router-link
                    title="Start a Visit"
                    :to="`/visit/new/${patient.id}`"
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
        <!--end::Table-->
        <pagination
          :total-pages="pages"
          :total="queriedItems"
          :per-page="perPage"
          :current-page="+$route.query.currentPage || currentPage"
          @pagechanged="onPageChange"
          @changepagecount="handlePageCount"
        />
      </div>
      <p v-if="queriedItems === 0" class="card-body pt-0 pb-3 text-center">
        No Results
      </p>
      <!--end::Body-->
    </div>
    <create-visit :displayPrompt="displayPrompt" @closeModal="hideModal" :patient="patient" />
    <!--end::Card-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import DateFilter from '@/utils/DateFilter.vue';
import CreateVisit from '../../visits/create/CreateVisit-Deprecated.vue';
import { setUrlQueryParams } from '@/common/common';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import dayjs from 'dayjs';
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
    };
  },
  components: {
    ArrowRightIcon,
    CreateVisit,
    Pagination,
    DateFilter,
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
    addNewData(patient) {
      this.patient = patient;
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

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

    searchByDate(start, end) {
      (this.start = start), (this.end = end);
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
      });
    },

    searchByName() {
      if (!this.patient_name) return this.notifyEmptyField();
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.patient_name,
      });
      this.fetchPatients({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        search: this.$route.query.search,
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.patient_name,
      });
      this.fetchPatients({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.patient_name,
      });
      this.fetchPatients({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
      });
    },

    fetchPatients({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('patient/fetchPatients', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchPatients({
      currentPage: this.$route.query.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage,
      search: this.$route.query.search,
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
