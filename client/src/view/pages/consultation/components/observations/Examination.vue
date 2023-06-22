<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">History and Observation</span>
        </h3>
      </div>

      <div class="card-body py-2">
        <div class="form-group row mt-3" v-for="(complaint, index) in complaints" :key="index">
          <label class="col-lg-2 col-form-label">Chief Complaint:</label>
          <div class="col-lg-4">
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              name="complaint"
              v-model="complaint.complaint"
              type="text"
              class="form-control form-control-sm"
            />
            <span class="text-danger text-sm">{{ errors.first('complaint') }}</span>
          </div>
          <label class="col-lg-1 col-form-label">For</label>
          <div class="col-lg-2">
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              name="frequency_number"
              v-model="complaint.frequency_number"
              type="number"
              class="form-control form-control-sm"
            />
            <span class="text-danger text-sm">{{ errors.first('frequency_number') }}</span>
          </div>
          <div class="col-lg-2">
            <select
              v-validate="'required'"
              data-vv-validate-on="blur"
              name="frequency"
              v-model="complaint.frequency"
              class="form-control form-control-sm"
            >
              <option value="Minutes">Minutes</option>
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
              <option value="Weeks">Weeks</option>
              <option value="Months">Months</option>
              <option value="Years">Years</option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('frequency') }}</span>
          </div>
          <a href="#" class="col-lg-1 col-form-label">
            <i class="far fa-plus-square mr-3 text-primary icon-lg" @click="addNewComplaint" />
            <i
              class="far fa-trash-alt icon-md text-danger"
              v-if="index !== 0"
              @click="removeComplaints(index)"
            />
          </a>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Chief Complaint Notes</label>
          <div class="col-9">
            <textarea
              v-model="complaint_note"
              class="form-control form-control-sm"
              cols="10"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">History Notes</label>
          <div class="col-9">
            <textarea
              v-model="history_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Examination Notes</label>
          <div class="col-9">
            <textarea
              v-model="examination_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Smoking History</label>
          <div class="radio-inline col-9">
            <label class="radio radio-lg">
              <input type="radio" name="" v-model="has_smoking_history" :value="true" />
              <span></span>
              Yes
            </label>
            <label class="radio radio-lg">
              <input type="radio" name="" v-model="has_smoking_history" :value="false" />
              <span></span>
              No
            </label>
          </div>
        </div>
        <hr />
        <div class="form-group row" v-for="(diag, index) in diagnosis" :key="`${index}-d`">
          <div class="col-lg-5">
            <label class="font-weight-bold text-center">Diagnosis</label>
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              type="text"
              name="diagnosis"
              class="form-control form-control-sm"
              v-model="diag.diagnosis"
            />
            <span class="text-danger text-sm">{{ errors.first('diagnosis') }}</span>
          </div>
          <div class="col-lg-3">
            <label class="font-weight-bold">Order</label>
            <div class="radio-inline">
              <label class="radio radio-md radio-square">
                <input type="radio" name="" v-model="diag.order" value="Primary" />
                <span></span>
                Primary
              </label>
              <label class="radio radio-md radio-square">
                <input type="radio" name="" v-model="diag.order" value="Secondary" />
                <span></span>
                Secondary
              </label>
            </div>
          </div>
          <div class="col-lg-3">
            <label class="font-weight-bold">Certainty</label>
            <div class="radio-inline">
              <label class="radio radio-md radio-square">
                <input type="radio" name="" v-model="diag.certainty" value="Confirmed" />
                <span></span>
                Confirmed
              </label>
              <label class="radio radio-md radio-square">
                <input type="radio" name="" v-model="diag.certainty" value="Presumed" />
                <span></span>
                Presumed
              </label>
            </div>
          </div>
          <a href="#" class="col-lg-1 col-form-label">
            <i class="far fa-plus-square mr-3 mt-4 text-primary icon-lg" @click="() => {}" />
            <i
              class="far fa-trash-alt icon-md text-danger icon-lg"
              v-if="index !== 0"
              @click="() => {}"
            />
          </a>
        </div>
        <div>
          <button
            ref="kt_observation_submit"
            :disabled="isDisabled"
            class="btn btn-primary float-right"
            @click="createExamination"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Examination',
  data() {
    return {
      complaints: [
        {
          complaint: '',
          frequency_number: '',
          frequency: '',
          notes: '',
        },
      ],
      diagnosis: [
        {
          certainty: '',
          order: '',
          diagnosis: '',
        },
      ],
      complaint_note: '',
      history_note: '',
      examination_note: '',
      has_smoking_history: '',
      isDisabled: false,
    };
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

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    createExamination() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            complaints: this.complaints,
            has_smoking_history: this.has_smoking_history,
            examination_note: this.examination_note,
            history_note: this.history_note,
            complaint_note: this.complaint_note,
            diagnosis: this.diagnosis,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_observation_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('consultation/addObservation', {
              visit_id: this.$route.params.visitId,
              complaint: obj,
            })
            .then(() => this.initializeRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    addNewComplaint() {
      this.complaints.push({
        complaint: '',
        frequency_number: '',
        frequency: '',
        notes: '',
      });
    },

    removeComplaints(index) {
      this.complaints.splice(index, 1);
    },

    addNewDiagnosis() {
      this.diagnosis.push({
        certainty: '',
        order: '',
        diagnosis: '',
      });
    },
    removeDiagnosis(i) {
      this.diagnosis.splice(i, 1);
    },

    initValues() {
      this.complaints = [
        {
          complaint: '',
          frequency_number: '',
          frequency: '',
          notes: '',
        },
      ];
      this.diagnosis = [
        {
          diagnosis: '',
          certainty: '',
          order: '',
        },
      ];
      this.has_smoking_history = '';
      this.examination_note = '';
      this.history_note = '';
      this.complaint_note = '';
    },
  },
};
</script>

<style scoped></style>
