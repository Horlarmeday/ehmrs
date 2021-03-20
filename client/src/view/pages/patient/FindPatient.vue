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
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="searchByName"
                  >
                    Search
                  </button>
                </div>
              </div>
              <span class="form-text text-muted">Find Patient by name</span>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label>Find Patient By Date</label>
              <div class="input-daterange input-group">
                <datepicker
                  v-model="start"
                  input-class="form-control"
                  placeholder="Start"
                ></datepicker>
                <div class="input-group-append">
                  <span class="input-group-text"
                    ><i class="la la-ellipsis-h"></i
                  ></span>
                </div>
                <datepicker
                  v-model="end"
                  input-class="form-control"
                  placeholder="End"
                ></datepicker>
                <div class="input-group-append">
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="searchByDate"
                  >
                    Filter
                  </button>
                </div>
              </div>
              <span class="form-text text-muted">Select Date Range</span>
            </div>
          </div>
        </div>
      </div>

      <!--begin::Body-->
      <div v-if="patients.length" class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table
            class="table table-head-custom table-vertical-center table-head-bg"
          >
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 100px">Hospital Number</th>
                <th style="min-width: 150px">Name</th>
                <th style="min-width: 100px">
                  <span class="text-primary">Gender</span>
                </th>
                <th style="min-width: 100px">Age</th>
                <th style="min-width: 100px">status</th>
                <th class="pr-0" style="min-width: 160px">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in patients" :key="patient.id">
                <td class="pl-5">
                  <a
                    href="#"
                    class="text-dark-75 font-weight-bolder text-hover-primary font-size-lg"
                    >{{ patient.hospital_id || "No Hospital Number" }}</a
                  >
                </td>
                <td>
                  <router-link to="/patient/profile/1234"
                    ><span
                      class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >
                      {{ patient.fullname }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ patient.gender }}
                  </span>
                </td>
                <td>
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ patient.date_of_birth | moment("from", "now", true) }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="patient.has_insurance"
                    class="label label-lg label-light-primary label-inline"
                    >NHIS</span
                  >
                  <span
                    v-else
                    class="label label-lg label-light-warning label-inline"
                    >Cash</span
                  >
                </td>
                <td class="pr-0">
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >{{ patient.createdAt | moment("ddd, MMM Do YYYY") }}</span
                  >
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
      <p v-if="queriedItems === 0" class="card-body pt-0 pb-3 text-center">
        No Results
      </p>
      <!--end::Body-->
    </div>
    <!--end::Card-->
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import Pagination from "@/utils/Pagination.vue";
export default {
  data() {
    return {
      patient_name: "",
      start: null,
      end: null,
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  components: {
    Datepicker,
    Pagination
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
    }
  },

  methods: {
    notifyEmptyField() {
      return this.$notify({
        group: "foo",
        title: "Error message",
        text: "Field cannot be left empty",
        type: "error"
      });
    },

    searchByDate() {
      if (!this.start || !this.end) return this.notifyEmptyField();
      this.currentPage = 1;
      this.$store.dispatch("patient/fetchPatients", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.start,
        end: this.end
      });
    },

    searchByName() {
      if (!this.patient_name) return this.notifyEmptyField();
      this.currentPage = 1;
      this.$store.dispatch("patient/fetchPatients", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.patient_name
      });
    },

    handlePageChange() {
      this.$store.dispatch("patient/fetchPatients", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    }
  }
};
</script>

<style></style>
