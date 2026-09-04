<template>
  <div class="d-none d-lg-flex align-items-center flex-grow-1">
    <ul v-if="patient" class="menu-nav">
      <li class="menu-item">
        <div class="symbol symbol-lg-50 symbol-circle mr-3">
          <img
            v-if="!imageError"
            alt="Pic"
            :src="imageUrl(patient.photo)"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <router-link
            :to="`/patient/profile/${patient.id}`"
            v-else
            class="symbol-label font-size-h4"
          >
            {{ patient?.firstname?.charAt(0)?.toUpperCase() }}
            {{ patient?.lastname?.charAt(0)?.toUpperCase() }}
          </router-link>
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <router-link :to="`/patient/profile/${patient.id}`" class="font-weight-bolder text-dark"
            >{{ patient.fullname }} ({{ patient.hospital_id }})</router-link
          >
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient.gender }}</span>
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{
            patient.date_of_birth | dayjs('from', 'now', true)
          }}</span>
        </div>
      </li>
      <li v-if="patient.has_insurance" class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient?.insurance?.name }}</span>
        </div>
      </li>
      <li v-if="patient.has_insurance" class="menu-item">
        <div class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">{{ patient?.hmo?.name }}</span>
        </div>
      </li>
      <li class="menu-item" v-if="patient.is_difficult_patient">
        <div class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">
            <span class="label label-danger label-pill label-inline mr-2 font-weight-boldest pulse">
              <i class="flaticon2-bell-alarm-symbol mr-2 text-white icon-nm"></i>
              <span class="font-weight-bold">Difficult Patient</span>
            </span>
          </span>
        </div>
      </li>
      <li class="menu-item" v-if="alerts.length">
        <div class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">
            <a
              href="#"
              class="label label-pill label-inline mr-2 font-weight-boldest pulse"
              :class="badgeClass"
              @click.prevent="showAlerts"
            >
              <i class="fas fa-exclamation-triangle mr-2 text-white icon-nm"></i>
              <span class="font-weight-bold">{{ alertLabel }}</span>
            </a>
          </span>
        </div>
      </li>
    </ul>
    <div v-if="patient && canCreateAlert" class="ml-auto">
      <a
        href="#"
        class="btn btn-sm btn-light-primary font-weight-bolder"
        title="Add an alert other staff will see"
        @click.prevent="showAddAlert"
      >
        <i class="fas fa-plus icon-sm mr-1"></i>Add Alert
      </a>
    </div>
    <patient-alerts-modal
      :display-prompt="displayAlertPrompt"
      :start-in-form="startInForm"
      @closeModal="hideAlerts"
    />
  </div>
</template>

<script>
import PatientAlertsModal from '@/view/components/alerts/PatientAlertsModal.vue';
import { ALERT_SEVERITY, canCreateAlerts, highestSeverity } from '@/core/plugins/alertPermissions';

export default {
  components: { PatientAlertsModal },
  data: () => ({
    imageError: false,
    displayAlertPrompt: false,
    startInForm: false,
  }),
  watch: {
    patientId: {
      immediate: true,
      handler(id) {
        if (!id) {
          this.$store.dispatch('alert/clearPatientAlerts');
          return;
        }
        this.$store.dispatch('alert/fetchPatientAlerts', id);
      },
    },
  },
  methods: {
    showAlerts() {
      this.startInForm = false;
      this.displayAlertPrompt = true;
    },
    showAddAlert() {
      this.startInForm = true;
      this.displayAlertPrompt = true;
    },

    hideAlerts() {
      this.displayAlertPrompt = false;
      this.startInForm = false;
    },

    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
    },
    handleImageLoad() {
      this.imageError = false;
    },
    handleImageError() {
      this.imageError = true;
    },
  },
  computed: {
    patient() {
      return this.$store.state.patient.currentPatient;
    },
    patientId() {
      return this.$store.state.patient.currentPatient?.id;
    },
    alerts() {
      return this.$store.state.alert.patientAlerts;
    },
    alertLabel() {
      return `${this.alerts.length} Alert${this.alerts.length === 1 ? '' : 's'}`;
    },
    canCreateAlert() {
      return canCreateAlerts();
    },
    badgeClass() {
      return highestSeverity(this.alerts) === ALERT_SEVERITY.CRITICAL
        ? 'label-danger'
        : 'label-warning';
    },
  },
};
</script>

<style scoped></style>
