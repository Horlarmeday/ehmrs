<template>
  <div class="emergency-visit-creator">
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-ambulance text-danger mr-3"></i>
            Create Emergency Visit
          </span>
        </h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="createEmergencyVisit">
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
                  :reduce="patient => patient.id"
                  placeholder="Select patient..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-exclamation-triangle text-danger mr-2"></i>
                  Emergency Priority
                </label>
                <select v-model="formData.priority" class="form-control form-control-lg" required>
                  <option value="">Select Priority</option>
                  <option value="Red">Red - Immediate</option>
                  <option value="Orange">Orange - Very Urgent</option>
                  <option value="Yellow">Yellow - Urgent</option>
                  <option value="Green">Green - Less Urgent</option>
                  <option value="Blue">Blue - Non-Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-phone text-info mr-2"></i>
                  Contact Number
                </label>
                <input
                  type="tel"
                  v-model="formData.contact_number"
                  class="form-control form-control-lg"
                  placeholder="Enter contact number"
                />
              </div>
            </div>
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
                  :reduce="doctor => doctor.id"
                  placeholder="Select doctor..."
                  class="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Chief Complaint
            </label>
            <textarea
              v-model="formData.chief_complaint"
              class="form-control"
              rows="3"
              placeholder="Describe the main complaint or reason for emergency visit..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-notes-medical text-warning mr-2"></i>
              Initial Assessment
            </label>
            <textarea
              v-model="formData.initial_assessment"
              class="form-control"
              rows="3"
              placeholder="Initial medical assessment and vital signs..."
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
            <button type="submit" class="btn btn-danger btn-lg" :disabled="isSubmitting">
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Creating...' : 'Create Emergency Visit' }}
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
  name: 'EmergencyVisitCreator',
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
  },
  data() {
    return {
      isSubmitting: false,
      formData: {
        patient_id: null,
        priority: '',
        contact_number: '',
        doctor_id: null,
        chief_complaint: '',
        initial_assessment: '',
      },
    };
  },
  methods: {
    async createEmergencyVisit() {
      this.isSubmitting = true;
      try {
        // First create a regular visit
        const visitData = {
          category: 'Emergency',
          type: 'New visit',
          date_of_visit: new Date(),
          priority:
            this.formData.priority === 'Red' || this.formData.priority === 'Orange'
              ? 'Emergency'
              : 'Urgent',
          department: 'Emergency Medicine',
          professional: 'Emergency Physician',
          patient_id: this.formData.patient_id,
          service_id: null,
        };

        // Create the visit first
        const visitResponse = await this.$store.dispatch('visit/addVisit', visitData);

        if (visitResponse && visitResponse.data && visitResponse.data.data) {
          const visitId = visitResponse.data.data.id;

          // Now create the emergency record with the visit_id
          const emergencyData = {
            visit_id: visitId,
            patient_id: this.formData.patient_id,
            priority: this.formData.priority,
            chief_complaint: this.formData.chief_complaint,
            initial_assessment: this.formData.initial_assessment,
            contact_number: this.formData.contact_number,
            doctor_id: this.formData.doctor_id,
            arrival_time: new Date().toISOString(),
            status: 'Active',
          };

          await this.$store.dispatch('emergency/createEmergencyVisit', emergencyData);

          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Emergency visit created successfully',
            type: 'success',
          });

          // Emit success event
          this.$emit('visit-created', { visitId, emergencyData });

          // Reset form
          this.resetForm();
        }
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to create emergency visit',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.formData = {
        patient_id: null,
        priority: '',
        contact_number: '',
        doctor_id: null,
        chief_complaint: '',
        initial_assessment: '',
      };
    },
  },
};
</script>

<style scoped>
.emergency-visit-creator {
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
  border-color: #3699ff;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}
</style>
