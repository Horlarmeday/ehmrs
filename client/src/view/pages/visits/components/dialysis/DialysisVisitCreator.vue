<template>
  <div class="dialysis-visit-creator">
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-kidney text-info mr-3"></i>
            Create Dialysis Visit
          </span>
        </h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="createDialysisVisit">
          <div class="row">
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user text-primary mr-2"></i>
                  Patient
                </label>
                <v-select
                  v-model="formData.patient_id"
                  :options="availablePatients"
                  label="fullname"
                  :reduce="(patient) => patient.id"
                  placeholder="Select patient..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-kidney text-info mr-2"></i>
                  Dialysis Type
                </label>
                <select
                  v-model="formData.dialysis_type"
                  class="form-control form-control-lg"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Hemodialysis">Hemodialysis</option>
                  <option value="Peritoneal">Peritoneal Dialysis</option>
                  <option value="CRRT">Continuous Renal Replacement Therapy</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-calendar text-success mr-2"></i>
                  Visit Date
                </label>
                <b-form-datepicker v-model="formData.visit_date" class="form-control" required />
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-clock text-warning mr-2"></i>
                  Time Slot
                </label>
                <select v-model="formData.time_slot" class="form-control form-control-lg" required>
                  <option value="">Select Time</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-hourglass-half text-primary mr-2"></i>
                  Treatment Duration (minutes)
                </label>
                <input
                  type="number"
                  v-model="formData.duration"
                  class="form-control form-control-lg"
                  placeholder="240"
                  min="60"
                  max="480"
                  required
                />
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-tint text-danger mr-2"></i>
                  Expected Blood Flow Rate (ml/min)
                </label>
                <input
                  type="number"
                  v-model="formData.blood_flow"
                  class="form-control form-control-lg"
                  placeholder="300"
                  min="200"
                  max="500"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user-md text-success mr-2"></i>
                  Attending Doctor
                </label>
                <v-select
                  v-model="formData.doctor_id"
                  :options="availableDoctors"
                  label="fullname"
                  :reduce="(doctor) => doctor.id"
                  placeholder="Select doctor..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user-nurse text-info mr-2"></i>
                  Dialysis Nurse (Optional)
                </label>
                <v-select
                  v-model="formData.nurse_id"
                  :options="availableNurses"
                  label="fullname"
                  :reduce="(nurse) => nurse.id"
                  placeholder="Select nurse..."
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Clinical Notes
            </label>
            <textarea
              v-model="formData.notes"
              class="form-control"
              rows="3"
              placeholder="Add any clinical notes, special instructions, or patient-specific requirements..."
            ></textarea>
          </div>

          <div class="text-right mt-4">
            <button
              type="button"
              class="btn btn-light-secondary btn-lg mr-3"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-info btn-lg" :disabled="isSubmitting">
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Creating...' : 'Create Dialysis Visit' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'DialysisVisitCreator',
  components: { vSelect },
  props: {
    availablePatients: {
      type: Array,
      default: () => [],
    },
    availableDoctors: {
      type: Array,
      default: () => [],
    },
    availableNurses: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isSubmitting: false,
      formData: {
        patient_id: null,
        dialysis_type: '',
        visit_date: new Date().toISOString().split('T')[0],
        time_slot: '',
        duration: 240,
        blood_flow: 300,
        doctor_id: null,
        nurse_id: null,
        notes: '',
      },
    };
  },
  methods: {
    async createDialysisVisit() {
      this.isSubmitting = true;
      try {
        // First create a regular visit
        const visitData = {
          category: 'Dialysis',
          type: 'New visit',
          date_of_visit: new Date(this.formData.visit_date + ' ' + this.formData.time_slot),
          priority: 'Not Urgent',
          department: 'Nephrology',
          professional: 'Nephrologist',
          patient_id: this.formData.patient_id,
          service_id: null,
        };

        // Create the visit first
        const visitResponse = await this.$store.dispatch('visit/addVisit', visitData);

        if (visitResponse && visitResponse.data && visitResponse.data.data) {
          const visitId = visitResponse.data.data.id;

          // Now create the dialysis record with the visit_id
          const dialysisData = {
            visit_id: visitId,
            patient_id: this.formData.patient_id,
            dialysis_type: this.formData.dialysis_type,
            visit_date: this.formData.visit_date,
            time_slot: this.formData.time_slot,
            duration: this.formData.duration,
            blood_flow: this.formData.blood_flow,
            doctor_id: this.formData.doctor_id,
            nurse_id: this.formData.nurse_id,
            notes: this.formData.notes,
            status: 'Scheduled',
          };

          await this.$store.dispatch('dialysis/createDialysisVisit', dialysisData);

          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Dialysis visit created successfully',
            type: 'success',
          });

          // Emit success event
          this.$emit('visit-created', { visitId, dialysisData });

          // Reset form
          this.resetForm();
        }
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to create dialysis visit',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.formData = {
        patient_id: null,
        dialysis_type: '',
        visit_date: new Date().toISOString().split('T')[0],
        time_slot: '',
        duration: 240,
        blood_flow: 300,
        doctor_id: null,
        nurse_id: null,
        notes: '',
      };
    },
  },
};
</script>

<style scoped>
.dialysis-visit-creator {
  background: #fff;
  border-radius: 0.75rem;
}

.form-label {
  color: #3f4254;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #e1e3ea;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}
</style>
