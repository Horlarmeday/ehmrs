<template>
  <div>
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Merge Accounts
        </h3>
      </div>
      <!--begin::Header-->
      <div class="card-header border-0">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark"></span>
        </h3>
      </div>
      <!--end::Header-->
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-2 col-form-label text-lg-right">Target Account:</label>
          <div class="col-lg-8">
            <v-select
              @search="searchPatients"
              label="fullname"
              v-model="patient"
              :options="patients"
              :reduce="
                patients => ({
                  fullname: patients.fullname,
                  id: patients.id,
                  hospital_id: patients.hospital_id,
                })
              "
            >
              <template #option="{ fullname, hospital_id }">
                <span>{{ fullname }} - </span>
                <em
                  ><strong> {{ hospital_id }}</strong></em
                >
              </template>
            </v-select>
            <span class="form-text text-muted">Please select target patient account</span>
          </div>
        </div>
        <div class="text-center mb-lg-5">
          <i class="fas fa-long-arrow-alt-up icon-10x icon-align-center" />
        </div>
        <div class="form-group row">
          <label class="col-lg-2 col-form-label text-lg-right">Source Accounts:</label>
          <div class="col-lg-8">
            <v-select
              @search="searchPatients"
              label="fullname"
              multiple
              v-model="sourcePatients"
              :options="patients"
              :reduce="
                patients => ({
                  fullname: patients.fullname,
                  id: patients.id,
                  hospital_id: patients.hospital_id,
                })
              "
            >
              <template #option="{ fullname, hospital_id }">
                <span>{{ fullname }} - </span>
                <em
                  ><strong> {{ hospital_id }}</strong></em
                >
              </template>
            </v-select>
            <span class="form-text text-muted">Please select the accounts to be merged</span>
          </div>
        </div>
        <div class="float-right">
          <button
            @click="showMergeAccountsPrompt"
            :disabled="isDisabled || disableButton"
            ref="kt_mergeAccount_submit"
            class="btn btn-primary"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';
import Swal from 'sweetalert2';
export default {
  name: 'MergeAccounts',
  components: {
    vSelect,
  },
  data() {
    return {
      patient: null,
      sourcePatients: null,
      isDisabled: false,
    };
  },
  computed: {
    patients() {
      return this.$store.state.patient.patients;
    },

    disableButton() {
      return !this.patient || !this.sourcePatients;
    },
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    searchPatients(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: 20,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    endRequest(submitButton, response) {
      this.removeSpinner(submitButton);
      this.handleSuccess(response);
      this.initValues();
    },

    mergePatientAccounts() {
      const submitButton = this.$refs['kt_mergeAccount_submit'];
      this.addSpinner(submitButton);

      const obj = {
        sourcePatientIds: this.sourcePatients.map(patient => patient.id),
        targetPatientId: this.patient.id,
      };
      this.$store
        .dispatch('model/mergePatientAccounts', obj)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    showMergeAccountsPrompt() {
      Swal.fire({
        title: 'Are you sure, you want to merge these accounts?',
        text: 'This is a permanent action and cannot be undone!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: '#c90505',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.mergePatientAccounts();
        },
      });
    },

    handleSuccess(response) {
      Swal.fire({
        title: 'Success!',
        html: `${response.data.message}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    initValues() {
      this.patient = null;
      this.sourcePatients = null;
    },
  },
};
</script>

<style scoped></style>
