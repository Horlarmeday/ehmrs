<template>
  <div v-if="visibleAlerts.length" class="patient-alerts-banner mb-4">
    <div
      v-for="alert in visibleAlerts"
      :key="alert.id"
      class="alert alert-custom d-flex align-items-start mb-2"
      :class="alertClass(alert)"
    >
      <div class="alert-icon mr-3">
        <i class="fas fa-exclamation-triangle" :class="iconClass(alert)"></i>
      </div>

      <div class="alert-text flex-grow-1">
        <div class="font-weight-bolder text-dark alert-content">{{ alert.alert }}</div>
        <div class="text-dark-50 font-size-sm mt-1">
          {{ alert.severity }} &middot; By {{ authorName(alert) }} &middot;
          {{ alert.createdAt | dayjs('DD/MM/YYYY, h:mma') }} ({{ relativeAge(alert) }})
        </div>
      </div>

      <button type="button" class="close ml-3" aria-label="Dismiss" @click="dismiss">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ALERT_SEVERITY, BANNER_SEVERITIES, getCurrentUser } from '@/core/plugins/alertPermissions';

export default {
  name: 'PatientAlertsBanner',
  data: () => ({
    dismissedKey: null,
  }),
  computed: {
    patientId() {
      return this.$store.state.patient.currentPatient?.id;
    },
    alerts() {
      return this.$store.state.alert.patientAlerts;
    },
    // Alerts worth interrupting for, before dismissal is considered.
    bannerAlerts() {
      if (!this.patientId) return [];
      return this.alerts.filter((alert) => BANNER_SEVERITIES.includes(alert.severity));
    },
    visibleAlerts() {
      return this.isDismissed ? [] : this.bannerAlerts;
    },
    // The key includes the ids being shown, so dismissing {5,9} does NOT
    // silence {5,9,12}: a newly created alert changes the key and the banner
    // returns. Sorted so ordering changes alone do not resurface it.
    storageKey() {
      const user = getCurrentUser();
      if (!user?.sub || !this.patientId || !this.bannerAlerts.length) return null;
      const ids = this.bannerAlerts
        .map((alert) => alert.id)
        .sort((a, b) => a - b)
        .join(',');
      return `alertsDismissed:${user.sub}:${this.patientId}:${ids}`;
    },
    isDismissed() {
      return !!this.storageKey && this.dismissedKey === this.storageKey;
    },
  },
  watch: {
    storageKey: {
      immediate: true,
      handler(key) {
        this.dismissedKey = key && this.readDismissed(key) ? key : null;
      },
    },
  },
  methods: {
    authorName(alert) {
      return alert.staff?.fullname?.trim() || 'Unknown';
    },

    relativeAge(alert) {
      return this.$dayjs(alert.createdAt).fromNow();
    },

    alertClass(alert) {
      return alert.severity === ALERT_SEVERITY.CRITICAL
        ? 'alert-light-danger border-danger'
        : 'alert-light-warning border-warning';
    },

    iconClass(alert) {
      return alert.severity === ALERT_SEVERITY.CRITICAL ? 'text-danger' : 'text-warning';
    },
    readDismissed(key) {
      try {
        return sessionStorage.getItem(key) === 'true';
      } catch (error) {
        return false;
      }
    },

    dismiss() {
      const key = this.storageKey;
      if (!key) return;

      try {
        sessionStorage.setItem(key, 'true');
      } catch (error) {
        // Dismissal simply will not persist across navigation.
      }
      this.dismissedKey = key;
    },
  },
};
</script>

<style scoped>
.alert-content {
  white-space: pre-wrap;
}
</style>
