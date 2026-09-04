<template>
  <b-modal v-model="activePrompt" hide-footer size="lg" :title="title" @hidden="resetForm">
    <div>
      <div v-if="!alerts.length && !showForm" class="text-muted text-center py-5">
        No active alerts for this patient
      </div>

      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="border rounded p-4 mb-3"
        :class="borderClass(alert)"
      >
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="label label-inline font-weight-bolder" :class="severityClass(alert)">
            {{ alert.severity }}
          </span>
          <div class="d-flex align-items-center">
            <span class="text-muted font-size-sm mr-3">{{ relativeAge(alert) }}</span>
            <a
              v-if="canCreate"
              href="#"
              class="text-muted"
              title="Deactivate this alert"
              @click.prevent="confirmDeactivate(alert)"
            >
              <i class="fas fa-times-circle"></i>
            </a>
          </div>
        </div>

        <div class="font-weight-bold text-dark mb-2 alert-content">{{ alert.alert }}</div>

        <div class="text-muted font-size-sm">
          By {{ authorName(alert) }} &middot; {{ alert.createdAt | dayjs('DD/MM/YYYY, h:mma') }}
        </div>
      </div>

      <div v-if="canCreate && showForm" class="" :class="{ 'border-top': alerts.length }">
        <div>
          <div class="form-group">
            <label class="font-weight-bold">Alert</label>
            <textarea
              v-model="content"
              class="form-control"
              rows="4"
              placeholder="Describe the alert other staff should see"
            />
            <span v-if="validationError" class="text-danger font-size-sm">{{
              validationError
            }}</span>
          </div>

          <div class="form-group">
            <label class="font-weight-bold">Severity</label>
            <select v-model="severity" class="form-control">
              <option v-for="option in severities" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-secondary mr-2" :disabled="submitting" @click="cancelForm">
              Cancel
            </button>
            <button class="btn btn-primary" :disabled="submitting" @click="submit">
              {{ submitting ? 'Saving...' : 'Submit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import Swal from 'sweetalert2';
import { ALERT_SEVERITY, ALERT_SEVERITIES, canCreateAlerts } from '@/core/plugins/alertPermissions';

export default {
  name: 'PatientAlertsModal',
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    startInForm: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showForm: false,
    submitting: false,
    content: '',
    severity: ALERT_SEVERITY.WARNING,
    validationError: '',
    severities: ALERT_SEVERITIES,
  }),
  watch: {
    displayPrompt(open) {
      if (open && this.startInForm && this.canCreate) this.showForm = true;
    },
  },
  computed: {
    title() {
      return this.showForm ? 'Add Alert' : 'Patient Alerts';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    alerts() {
      return this.$store.state.alert.patientAlerts;
    },
    patient() {
      return this.$store.state.patient.currentPatient;
    },
    canCreate() {
      return canCreateAlerts();
    },
  },
  methods: {
    // staff_id is nullable and legacy imported rows may not resolve to a
    // staff record, so never assume the association is present.
    authorName(alert) {
      return alert.staff?.fullname?.trim() || 'Unknown';
    },

    relativeAge(alert) {
      return this.$dayjs(alert.createdAt).fromNow();
    },

    severityClass(alert) {
      if (alert.severity === ALERT_SEVERITY.CRITICAL) return 'label-danger';
      if (alert.severity === ALERT_SEVERITY.WARNING) return 'label-warning';
      return 'label-info';
    },

    borderClass(alert) {
      if (alert.severity === ALERT_SEVERITY.CRITICAL) return 'border-danger';
      if (alert.severity === ALERT_SEVERITY.WARNING) return 'border-warning';
      return 'border-info';
    },

    // Deactivating hides the alert from every surface (all read paths filter
    // status = 'Active'). There is no UI to reactivate, so confirm first —
    // matching the existing toggle in AlertsTable.
    confirmDeactivate(alert) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This alert will no longer be shown to any staff',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Deactivate!',
      }).then((result) => {
        if (result.value) this.deactivate(alert);
      });
    },

    deactivate(alert) {
      this.$store
        .dispatch('alert/updateAlert', { id: alert.id, status: 'Inactive' })
        .then(() => this.$store.dispatch('alert/fetchPatientAlerts', this.patient.id))
        .catch(() => {
          Swal.fire({
            title: 'Could not deactivate',
            text: 'Please try again',
            icon: 'error',
          });
        });
    },

    resetForm() {
      this.showForm = false;
      this.content = '';
      this.severity = ALERT_SEVERITY.WARNING;
      this.validationError = '';
    },

    cancelForm() {
      this.resetForm();
      this.activePrompt = false;
    },

    submit() {
      if (!this.content.trim()) {
        this.validationError = 'Alert content is required';
        return;
      }
      if (!this.patient?.id) return;

      this.validationError = '';
      this.submitting = true;

      this.$store
        .dispatch('alert/addAlert', {
          alert: this.content.trim(),
          severity: this.severity,
          patient_id: this.patient.id,
        })
        .then(() => this.$store.dispatch('alert/fetchPatientAlerts', this.patient.id))
        .then(() => {
          this.submitting = false;
          // Close on success. The refetch above has already landed, so the header
          // badge and the banner reflect the new alert as the modal closes.
          this.activePrompt = false;
        })
        .catch(() => {
          this.submitting = false;
          this.validationError = 'Could not save the alert, please try again';
        });
    },
  },
};
</script>

<style scoped>
.alert-content {
  white-space: pre-wrap;
}
</style>
