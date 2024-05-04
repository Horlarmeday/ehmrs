<template>
  <div>
    <div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Laboratory Number</label>
        <div class="col-3">
          <input v-model="accession_number" class="form-control form-control-sm" type="text" />
        </div>
        <div class="col-2">
          <button @click="generateAccessionNumber" class="btn btn-sm btn-outline-secondary">
            Generate
          </button>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Logged in time</label>
        <div class="col-3">
          <input
            class="form-control form-control-sm"
            type="text"
            readonly
            :placeholder="new Date().toLocaleDateString()"
          />
        </div>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Received By</label>
        <div class="col-3">
          <select v-model="receiver" class="form-control-sm form-control">
            <option v-for="(staff, i) in staffs" :value="staff.id" :key="i">{{
              staff.fullname
            }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div class="text-center">
      <button
        :disabled="!accession_number || !receiver || isDisabled"
        ref="kt-collectSamples-submit"
        @click="collectSamples"
        class="btn btn-lg btn-primary"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderSection',
  data: () => ({
    accession_number: '',
    receiver: '',
    isDisabled: false,
  }),
  computed: {
    staffs() {
      return this.$store.state.employee.employees;
    },
  },
  methods: {
    generateAccessionNumber() {
      this.$store.dispatch('laboratory/generateAccessionNumber').then(response => {
        this.accession_number = response.data.data;
      });
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    initValues() {
      this.accession_number = '';
    },

    collectSamples() {
      const submitButton = this.$refs['kt-collectSamples-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('laboratory/collectSamples', {
          accession_number: this.accession_number,
          staff_id: this.receiver,
          id: this.$route.params.id,
        })
        .then(() => {
          this.endRequest(submitButton);
          this.$router.push('/laboratory/samples-collected');
        })
        .catch(() => this.removeSpinner(submitButton));
    },

    fetchEmployees({ currentPage = 1, itemsPerPage = 15, search }) {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
      });
    },
  },

  created() {
    this.fetchEmployees({ search: 'Laboratory' });
  },
};
</script>

<style scoped></style>
