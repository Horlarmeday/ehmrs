<template>
  <div id="#diagnosis">
    <div class="flex-row-fluid ml-lg-8">
      <div class="card card-custom gutter-b">
        <div class="card-header pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark"
              >Diagnosis</span
            >
          </h3>
        </div>
        <div class="card-body">
          <div
            class="form-group row"
            v-for="(diag, index) in diagnosis"
            :key="index"
          >
            <div class="col-lg-4">
              <label class="font-weight-bold text-center">Diagnosis</label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                type="text"
                name="diagnosis"
                class="form-control form-control-sm"
                v-model="diag.diagnosis"
              />
              <span class="text-danger text-sm">{{
                errors.first("diagnosis")
              }}</span>
            </div>
            <div class="col-lg-3">
              <label class="font-weight-bold text-center">Order</label>
              <div class="radio-inline">
                <label class="radio radio-lg radio-square">
                  <input
                    type="radio"
                    name=""
                    v-model="diag.order"
                    value="Primary"
                  />
                  <span></span>
                  Primary
                </label>
                <label class="radio radio-lg radio-square">
                  <input
                    type="radio"
                    name=""
                    v-model="diag.order"
                    value="Secondary"
                  />
                  <span></span>
                  Secondary
                </label>
              </div>
            </div>
            <div class="col-lg-3">
              <label class="font-weight-bold">Certainty</label>
              <div class="radio-inline">
                <label class="radio radio-lg radio-square">
                  <input
                    type="radio"
                    name=""
                    v-model="diag.certainty"
                    value="Confirmed"
                  />
                  <span></span>
                  Confirmed
                </label>
                <label class="radio radio-lg radio-square">
                  <input
                    type="radio"
                    name=""
                    v-model="diag.certainty"
                    value="Presumed"
                  />
                  <span></span>
                  Presumed
                </label>
              </div>
            </div>
            <div class="col-lg-2">
              <br />
              <a href="#" class="col-lg-1 col-form-label">
                <i
                  class="far fa-plus-square mr-3 mt-4 text-primary icon-lg"
                  @click="addNewDiagnosis"
                />
                <i
                  class="far fa-trash-alt icon-md text-danger icon-lg"
                  v-if="index !== 0"
                  @click="removeDiagnosis(index)"
                />
              </a>
            </div>
          </div>
          <div>
            <button
              @click="createDiagnosis"
              ref="kt_diagnosis_submit"
              class="btn btn-primary"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Diagnosis",
  data() {
    return {
      diagnosis: [
        {
          certainty: "",
          order: "",
          diagnosis: ""
        }
      ]
    };
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    addNewDiagnosis() {
      this.diagnosis.push({
        certainty: "",
        order: "",
        diagnosis: ""
      });
    },
    removeDiagnosis(i) {
      this.diagnosis.splice(i, 1);
    },

    createDiagnosis() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            diagnosis: this.diagnosis
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_diagnosis_submit"];
          this.addSpinner(submitButton);

          this.$store
            .dispatch("consultation/addDiagnosis", {
              visit_id: this.$route.params.visitId,
              complaint: obj
            })
            .then(() => this.initializeRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.diagnosis = [
        {
          diagnosis: "",
          certainty: "",
          order: ""
        }
      ];
    }
  }
};
</script>

<style scoped></style>
