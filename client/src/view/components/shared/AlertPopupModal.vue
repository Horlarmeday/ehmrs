<template>
  <b-modal
    ref="modal"
    id="alert-popup-modal"
    :title="modalTitle"
    size="lg"
    :no-close-on-backdrop="isCriticalAlert"
    :no-close-on-esc="isCriticalAlert"
    :hide-header-close="isCriticalAlert"
    modal-class="alert-popup-modal"
    @show="onModalShow"
    @hidden="onModalHidden"
  >
    <div v-if="currentAlert" class="alert-popup-content">
      <!-- Alert Severity Banner -->
      <div
        :class="[
          'alert',
          'alert-custom',
          'mb-4',
          severityClass,
          { 'alert-critical-pulse': isCriticalAlert },
        ]"
      >
        <div class="alert-icon">
          <i :class="severityIcon" class="font-size-h1"></i>
        </div>
        <div class="alert-text flex-grow-1">
          <h4 class="alert-heading mb-2">
            {{ currentAlert.title }}
            <span class="badge badge-pill ml-2" :class="severityBadgeClass">
              {{ currentAlert.severity.toUpperCase() }}
            </span>
          </h4>
          <p class="mb-0">{{ currentAlert.message }}</p>
        </div>
      </div>

      <!-- Alert Details -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="d-flex align-items-center mb-2">
            <i class="ki ki-calendar text-muted mr-2"></i>
            <span class="text-muted">Created:</span>
            <span class="ml-2 font-weight-bold">{{ formatDateTime(currentAlert.created_at) }}</span>
          </div>
          <div class="d-flex align-items-center mb-2">
            <i class="ki ki-folder text-muted mr-2"></i>
            <span class="text-muted">Category:</span>
            <span class="ml-2">
              <span class="badge badge-light-info">{{
                formatCategory(currentAlert.category)
              }}</span>
            </span>
          </div>
          <div v-if="currentAlert.store_type" class="d-flex align-items-center mb-2">
            <i class="ki ki-shop text-muted mr-2"></i>
            <span class="text-muted">Store:</span>
            <span class="ml-2">
              <span class="badge badge-light-primary">{{
                formatStoreType(currentAlert.store_type)
              }}</span>
            </span>
          </div>
        </div>
        <div class="col-md-6">
          <div v-if="currentAlert.item_name" class="d-flex align-items-center mb-2">
            <i class="ki ki-package text-muted mr-2"></i>
            <span class="text-muted">Item:</span>
            <span class="ml-2 font-weight-bold">{{ currentAlert.item_name }}</span>
          </div>
          <div v-if="currentAlert.current_value !== null" class="d-flex align-items-center mb-2">
            <i class="ki ki-graph text-muted mr-2"></i>
            <span class="text-muted">Current Value:</span>
            <span class="ml-2 font-weight-bold text-danger">{{ formatCurrentValue() }}</span>
          </div>
          <div v-if="currentAlert.threshold_value !== null" class="d-flex align-items-center mb-2">
            <i class="ki ki-target text-muted mr-2"></i>
            <span class="text-muted">Threshold:</span>
            <span class="ml-2">{{ formatThresholdValue() }}</span>
          </div>
        </div>
      </div>

      <!-- Additional Context -->
      <div v-if="currentAlert.context" class="card card-custom card-flush mb-4">
        <div class="card-header py-3">
          <div class="card-title">
            <i class="ki ki-information-circle text-info mr-2"></i>
            Additional Information
          </div>
        </div>
        <div class="card-body py-3">
          <pre class="text-wrap mb-0">{{ currentAlert.context }}</pre>
        </div>
      </div>

      <!-- Critical Alert Actions Warning -->
      <div v-if="isCriticalAlert" class="alert alert-warning d-flex align-items-center mb-4">
        <i class="ki ki-warning text-warning font-size-h3 mr-3"></i>
        <div>
          <strong>Critical Alert:</strong> This alert requires immediate acknowledgment. Please
          review the information above and take appropriate action before dismissing.
        </div>
      </div>

      <!-- Acknowledgment Form -->
      <div v-if="showAcknowledgmentForm" class="card card-custom mb-4">
        <div class="card-header py-3">
          <div class="card-title">
            <i class="ki ki-check-circle text-success mr-2"></i>
            Acknowledge Alert
          </div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="ack-notes">Notes (Optional):</label>
            <textarea
              id="ack-notes"
              v-model="acknowledgmentNotes"
              class="form-control"
              rows="3"
              placeholder="Add any notes about your acknowledgment or action taken..."
            ></textarea>
          </div>
          <div v-if="isCriticalAlert" class="custom-control custom-checkbox mb-3">
            <input
              type="checkbox"
              class="custom-control-input"
              id="confirm-critical"
              v-model="confirmCriticalAcknowledgment"
            />
            <label class="custom-control-label font-weight-bold text-danger" for="confirm-critical">
              I understand this is a critical alert and have taken appropriate action
            </label>
          </div>
        </div>
      </div>

      <!-- Queue Information -->
      <div v-if="queueCount > 1" class="alert alert-info d-flex align-items-center">
        <i class="ki ki-stack text-info mr-2"></i>
        <span>{{ queueCount - 1 }} more alert{{ queueCount - 1 > 1 ? 's' : '' }} waiting</span>
      </div>
    </div>

    <template #modal-footer="{ cancel }">
      <div class="w-100 d-flex justify-content-between align-items-center">
        <!-- Queue Navigation -->
        <div v-if="queueCount > 1" class="d-flex align-items-center text-muted">
          <small>Alert {{ queuePosition }} of {{ queueCount }}</small>
        </div>
        <div v-else></div>

        <!-- Action Buttons -->
        <div class="d-flex">
          <!-- Snooze Button (non-critical only) -->
          <button
            v-if="!isCriticalAlert"
            type="button"
            class="btn btn-light-warning btn-sm mr-2"
            @click="showSnoozeOptions = !showSnoozeOptions"
          >
            <i class="ki ki-time mr-1"></i>
            Snooze
          </button>

          <!-- Acknowledge Button -->
          <button
            type="button"
            class="btn btn-light-success mr-2"
            :disabled="isAcknowledging || (isCriticalAlert && !confirmCriticalAcknowledgment)"
            @click="acknowledgeAlert"
          >
            <span v-if="isAcknowledging" class="spinner-border spinner-border-sm mr-2"></span>
            <i v-else class="ki ki-check mr-1"></i>
            Acknowledge
          </button>

          <!-- Resolve Button -->
          <button type="button" class="btn btn-success mr-2" @click="showResolveForm = true">
            <i class="ki ki-double-check mr-1"></i>
            Resolve
          </button>

          <!-- Close Button (non-critical only) -->
          <button v-if="!isCriticalAlert" type="button" class="btn btn-light" @click="closeModal">
            <i class="ki ki-close mr-1"></i>
            Close
          </button>
        </div>
      </div>

      <!-- Snooze Options -->
      <div v-if="showSnoozeOptions" class="w-100 mt-3 pt-3 border-top">
        <div class="d-flex flex-wrap">
          <button
            v-for="option in snoozeOptions"
            :key="option.value"
            type="button"
            class="btn btn-light-warning btn-sm mr-2 mb-2"
            @click="snoozeAlert(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- Resolve Modal -->
    <b-modal
      ref="resolveModal"
      title="Resolve Alert"
      size="md"
      ok-title="Resolve"
      :ok-disabled="!resolutionNotes.trim()"
      @ok="resolveAlert"
      @hidden="resetResolveForm"
      v-model="showResolveForm"
    >
      <div class="form-group">
        <label for="resolution-notes">Resolution Notes (Required):</label>
        <textarea
          id="resolution-notes"
          v-model="resolutionNotes"
          class="form-control"
          rows="4"
          placeholder="Describe the action taken to resolve this alert..."
          required
        ></textarea>
      </div>
      <div class="form-group">
        <label for="action-taken">Action Taken:</label>
        <select v-model="actionTaken" class="form-control" id="action-taken">
          <option value="">Select an action...</option>
          <option value="restocked">Restocked Item</option>
          <option value="procured">Initiated Procurement</option>
          <option value="transferred">Transferred Stock</option>
          <option value="disposed">Disposed Expired Items</option>
          <option value="updated_threshold">Updated Alert Threshold</option>
          <option value="other">Other</option>
        </select>
      </div>
    </b-modal>
  </b-modal>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'AlertPopupModal',
  data() {
    return {
      // Acknowledgment form
      showAcknowledgmentForm: false,
      acknowledgmentNotes: '',
      confirmCriticalAcknowledgment: false,
      isAcknowledging: false,

      // Resolve form
      showResolveForm: false,
      resolutionNotes: '',
      actionTaken: '',
      isResolving: false,

      // Snooze options
      showSnoozeOptions: false,
      snoozeOptions: [
        { label: '15 minutes', value: 15 },
        { label: '1 hour', value: 60 },
        { label: '4 hours', value: 240 },
        { label: '1 day', value: 1440 },
      ],

      // Audio
      audioPlayed: false,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['popupQueue', 'showPopup', 'configuration']),
    ...mapGetters('inventoryAlerts', ['nextPopupAlert', 'hasActivePopupQueue']),

    currentAlert() {
      return this.nextPopupAlert;
    },

    queueCount() {
      return this.popupQueue.length;
    },

    queuePosition() {
      return this.queueCount > 0 ? 1 : 0;
    },

    isCriticalAlert() {
      return this.currentAlert?.severity === 'critical';
    },

    modalTitle() {
      if (!this.currentAlert) return 'Alert';
      return `${this.formatCategory(this.currentAlert.category)} Alert`;
    },

    severityClass() {
      if (!this.currentAlert) return 'alert-light-info';
      const classes = {
        critical: 'alert-light-danger',
        warning: 'alert-light-warning',
        info: 'alert-light-info',
      };
      return classes[this.currentAlert.severity] || 'alert-light-info';
    },

    severityIcon() {
      if (!this.currentAlert) return 'ki ki-information-circle text-info';
      const icons = {
        critical: 'ki ki-warning text-danger',
        warning: 'ki ki-warning text-warning',
        info: 'ki ki-information-circle text-info',
      };
      return icons[this.currentAlert.severity] || 'ki ki-information-circle text-info';
    },

    severityBadgeClass() {
      if (!this.currentAlert) return 'badge-light-info';
      const classes = {
        critical: 'badge-light-danger',
        warning: 'badge-light-warning',
        info: 'badge-light-info',
      };
      return classes[this.currentAlert.severity] || 'badge-light-info';
    },
  },
  watch: {
    showPopup(newVal) {
      if (newVal && this.hasActivePopupQueue) {
        this.showModal();
      } else if (!newVal) {
        this.hideModal();
      }
    },

    nextPopupAlert(newAlert) {
      if (newAlert && !this.audioPlayed) {
        this.playAlertSound();
      }
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'acknowledgeAlert',
      'resolveAlert',
      'snoozeAlert',
      'removeFromPopupQueue',
      'hidePopup',
      'playAlertSound',
    ]),

    showModal() {
      if (this.currentAlert) {
        this.$refs.modal.show();
      }
    },

    hideModal() {
      this.$refs.modal.hide();
    },

    closeModal() {
      if (this.currentAlert) {
        this.removeFromPopupQueue(this.currentAlert.id);
      }

      // Show next alert if available
      if (this.popupQueue.length > 1) {
        this.$nextTick(() => {
          if (this.nextPopupAlert) {
            this.showModal();
          }
        });
      } else {
        this.hidePopup();
      }
    },

    onModalShow() {
      this.resetForm();
      this.playAlertSound();

      // Auto-show acknowledgment form for critical alerts
      if (this.isCriticalAlert) {
        this.showAcknowledgmentForm = true;
      }
    },

    onModalHidden() {
      this.audioPlayed = false;
      this.resetForm();
    },

    resetForm() {
      this.showAcknowledgmentForm = false;
      this.acknowledgmentNotes = '';
      this.confirmCriticalAcknowledgment = false;
      this.isAcknowledging = false;
      this.showSnoozeOptions = false;
    },

    resetResolveForm() {
      this.resolutionNotes = '';
      this.actionTaken = '';
      this.isResolving = false;
    },

    async acknowledgeAlert() {
      if (!this.currentAlert) return;

      this.isAcknowledging = true;
      try {
        await this.acknowledgeAlert({
          alertId: this.currentAlert.id,
          notes: this.acknowledgmentNotes || null,
        });

        this.$toast.success('Alert acknowledged successfully');
        this.closeModal();
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to acknowledge alert');
      } finally {
        this.isAcknowledging = false;
      }
    },

    async resolveAlert() {
      if (!this.currentAlert || !this.resolutionNotes.trim()) return;

      this.isResolving = true;
      try {
        await this.resolveAlert({
          alertId: this.currentAlert.id,
          resolution_notes: this.resolutionNotes,
          action_taken: this.actionTaken || null,
        });

        this.$toast.success('Alert resolved successfully');
        this.showResolveForm = false;
        this.closeModal();
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to resolve alert');
      } finally {
        this.isResolving = false;
      }
    },

    async snoozeAlert(minutes) {
      if (!this.currentAlert) return;

      const snoozeUntil = new Date(Date.now() + minutes * 60000);

      try {
        await this.snoozeAlert({
          alertId: this.currentAlert.id,
          snooze_until: snoozeUntil.toISOString(),
          reason: `Snoozed for ${minutes} minutes from popup`,
        });

        this.$toast.success(`Alert snoozed for ${minutes} minutes`);
        this.closeModal();
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to snooze alert');
      }
    },

    playAlertSound() {
      if (!this.currentAlert || this.audioPlayed || !this.configuration.sound_enabled) {
        return;
      }

      this.playAlertSound({
        severity: this.currentAlert.severity,
        duration: this.isCriticalAlert ? 300 : 200,
      });

      this.audioPlayed = true;
    },

    formatDateTime(dateString) {
      return new Date(dateString).toLocaleString();
    },

    formatCategory(category) {
      const categories = {
        expiry: 'Expiry',
        stock_level: 'Stock Level',
        procurement: 'Procurement',
        financial: 'Financial',
      };
      return categories[category] || category;
    },

    formatStoreType(storeType) {
      const types = {
        pharmacy: 'Pharmacy',
        general_store: 'General Store',
      };
      return types[storeType] || storeType;
    },

    formatCurrentValue() {
      if (this.currentAlert.category === 'stock_level') {
        return `${this.currentAlert.current_value} units`;
      } else if (this.currentAlert.category === 'expiry') {
        return `${this.currentAlert.current_value} days until expiry`;
      } else if (this.currentAlert.category === 'financial') {
        return this.formatCurrency(this.currentAlert.current_value);
      }
      return this.currentAlert.current_value;
    },

    formatThresholdValue() {
      if (this.currentAlert.category === 'stock_level') {
        return `${this.currentAlert.threshold_value} units`;
      } else if (this.currentAlert.category === 'expiry') {
        return `${this.currentAlert.threshold_value} days`;
      } else if (this.currentAlert.category === 'financial') {
        return this.formatCurrency(this.currentAlert.threshold_value);
      }
      return this.currentAlert.threshold_value;
    },

    formatCurrency(amount) {
      if (!amount) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount);
    },
  },
};
</script>

<style scoped>
.alert-popup-modal .modal-dialog {
  margin-top: 10vh;
}

.alert-critical-pulse {
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 67, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(244, 67, 67, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 67, 0); }
}

.alert-custom {
  border: 1px solid transparent;
  border-radius: 0.42rem;
  display: flex;
  align-items-start;
}

.alert-icon {
  flex-shrink: 0;
  margin-right: 1rem;
}

.alert-text {
  flex-grow: 1;
}

.alert-heading {
  font-size: 1.1rem;
  font-weight: 600;
}

.card-custom {
  box-shadow: 0px 0px 20px 0px rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
  border: none;
}

.text-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.custom-control-label {
  cursor: pointer;
}

.badge-pill {
  font-size: 0.7em;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
