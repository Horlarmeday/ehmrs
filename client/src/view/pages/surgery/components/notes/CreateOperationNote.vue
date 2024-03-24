<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body">
        <div>
          <operation-note-accordion />
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Anaesthetist:</label>
            <select class="form-control form-control-sm" v-model="anaesthetist">
              <option
                :value="anaesthetist.id"
                v-for="(anaesthetist, i) in anaesthetists"
                :key="i"
                >{{ anaesthetist.fullname }}</option
              >
            </select>
          </div>
          <div class="col-lg-6">
            <label>Surgeon:</label>
            <select
              name="surgeon"
              v-validate="'required'"
              data-vv-validate-on="blur"
              class="form-control form-control-sm"
              v-model="surgeon"
            >
              <option :value="surgeon.id" v-for="(surgeon, i) in surgeons" :key="i">{{
                surgeon.fullname
              }}</option>
            </select>
            <span class="form-text text-danger">{{ errors.first('surgeon') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Scrub Nurse:</label>
            <select class="form-control form-control-sm" v-model="scrub_nurse">
              <option :value="nurse.id" v-for="(nurse, i) in anaesthetists" :key="i">{{
                nurse.fullname
              }}</option>
            </select>
          </div>
          <div class="col-lg-6">
            <label>Assistance:</label>
            <v-select
              name="assistance"
              v-model="assistance"
              label="fullname"
              :options="anaesthetists"
              multiple
              :reduce="
                anaesthetists => ({
                  id: anaesthetists.id,
                  name: anaesthetists.fullname,
                })
              "
            />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Surgery:</label>
            <textarea v-model="surgery" class="form-control-sm form-control" cols="30" rows="7" />
          </div>
          <div class="col-lg-6">
            <label>Indications:</label>
            <textarea
              v-model="indications"
              class="form-control-sm form-control"
              cols="30"
              rows="7"
            />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Anaesthesia:</label>
            <textarea
              v-model="anaesthesia"
              class="form-control-sm form-control"
              cols="30"
              rows="7"
            />
          </div>
          <div class="col-lg-6">
            <label>Procedure:</label>
            <textarea v-model="procedure" class="form-control-sm form-control" cols="30" rows="7" />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Findings:</label>
            <textarea v-model="findings" class="form-control-sm form-control" cols="30" rows="7" />
          </div>
          <div class="col-lg-6">
            <label>Post-Operation Order:</label>
            <textarea
              v-model="post_operation_order"
              class="form-control-sm form-control"
              cols="30"
              rows="7"
            />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Time In:</label>
            <b-form-timepicker
              name="time_in"
              v-validate="'required'"
              data-vv-validate-on="blur"
              v-model="time_in"
              locale="en"
              required
            />
            <span class="form-text text-danger">{{ errors.first('time_in') }}</span>
          </div>
          <div class="col-lg-6">
            <label>Time Out:</label>
            <b-form-timepicker
              name="time_out"
              v-validate="'required'"
              data-vv-validate-on="blur"
              v-model="time_out"
              locale="en"
              required
            />
            <span class="form-text text-danger">{{ errors.first('time_out') }}</span>
          </div>
        </div>
        <div class="float-right">
          <button
            ref="kt_operationNote_submit"
            @click="createOperationNote"
            :disabled="isDisabled"
            class="btn btn-primary"
            type="button"
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
import dayjs from 'dayjs';
import OperationNoteAccordion from '@/view/components/accordion/OperationNoteAccordion.vue';

export default {
  components: { OperationNoteAccordion, vSelect },
  data: () => ({
    assistance: '',
    anaesthetist: '',
    scrub_nurse: '',
    surgeon: '',
    time_in: '',
    time_out: '',
    post_operation_order: '',
    surgery: '',
    anaesthesia: '',
    procedure: '',
    findings: '',
    indications: '',
    isDisabled: false,
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
    NURSING: 'Nursing',
  }),
  computed: {
    employees() {
      return this.$store.state.employee.employees;
    },

    surgeons() {
      return this.employees.filter(employee => employee.department === this.MEDICAL_PRACTITIONER);
    },

    anaesthetists() {
      return this.employees.filter(employee => employee.department === this.NURSING);
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
      this.$store.dispatch('surgery/fetchOperationNotes', { id: this.$route.params.id });
    },

    initValues() {
      this.assistance = '';
      this.anaesthetist = '';
      this.scrub_nurse = '';
      this.surgeon = '';
      this.time_in = '';
      this.time_out = '';
      this.post_operation_order = '';
      this.surgery = '';
      this.anaesthesia = '';
      this.procedure = '';
      this.findings = '';
      this.indications = '';
    },

    createOperationNote() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            assistance: this.assistance,
            anaesthetist_id: this.anaesthetist,
            scrub_nurse_id: this.scrub_nurse,
            surgeon_id: this.surgeon,
            time_in: new Date(`${dayjs().format('YYYY-MM-DD')} ${this.time_in}`),
            time_out: new Date(`${dayjs().format('YYYY-MM-DD')} ${this.time_out}`),
            post_operation_order: this.post_operation_order,
            surgery: this.surgery,
            anaesthesia: this.anaesthesia,
            procedure: this.procedure,
            findings: this.findings,
            indications: this.indications,
          };
          const submitButton = this.$refs['kt_operationNote_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('surgery/createOperationNote', { data: obj, id: this.$route.params.id })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
  created() {
    this.$store.dispatch('employee/fetchEmployees', { itemsPerPage: 100 });
  },
};
</script>

<style scoped></style>
