<template>
  <!--begin::Card-->
  <div class="border card-custom card-stretch card-stretch-fourth gutter-b">
    <!-- <div class="card-body"> -->
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-1'">
            <div class="card-label">Create Clinical Note</div>
          </div>
        </div>
        <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel" :visible="isVisible">
          <div class="card-body">
            <div class="form-group row mt-4">
              <label class="col-lg-3 col-form-label">Note:</label>
              <div class="col-lg-8">
                <textarea
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="notes"
                  class="form-control"
                  cols="30"
                  rows="10"
                  v-model="notes"
                />
                <span class="text-danger text-sm">{{ errors.first('notes') }}</span>
              </div>
            </div>
            <div>
              <button
                @click="createClinicalNote"
                ref="kt_clinicalNote_submit"
                class="btn btn-primary mb-2 float-right"
              >
                Submit
              </button>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
    <!-- </div> -->
  </div>
  <!--end::Card-->
</template>

<script>
export default {
  data: () => ({
    notes: '',
    clinical_note_id: '',
    isVisible: false,
  }),

  props: {
    clinicalNote: {
      type: Object,
      default: () => {},
    },
  },

  watch: {
    clinicalNote(data) {
      this.notes = data.notes;
      this.isVisible = true;
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

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.isVisible = false;
    },

    initValues() {
      this.notes = '';
      this.clinical_note_id = '';
    },

    createClinicalNote() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            notes: this.notes,
            visit_id: this.$route.params.id,
            clinical_note_id: this.clinicalNote?.id,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_clinicalNote_submit'];
          this.addSpinner(submitButton);

          if (obj.clinical_note_id && obj.clinical_note_id >= 0) {
            this.dispatchClinicalNote('antenatal/updateClinicalNote', submitButton, obj);
          } else {
            delete obj.clinical_note_id;
            this.dispatchClinicalNote('antenatal/createClinicalNote', submitButton, obj);
          }
        }
      });
    },

    dispatchClinicalNote(type, submitButton, data) {
      this.$store
        .dispatch(type, {
          id: this.$route.query.antenatal,
          data,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
