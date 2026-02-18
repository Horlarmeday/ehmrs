<template>
  <b-modal
    ref="modal"
    id="alert-configuration-modal"
    title="Alert Preferences"
    size="lg"
    ok-title="Save Changes"
    :ok-disabled="!hasChanges || isSaving"
    @ok="saveConfiguration"
    @hidden="resetForm"
  >
    <div class="alert-configuration-content">
      <!-- General Settings -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-notification-circle text-primary mr-2"></i>
            General Notification Settings
          </h6>
          <p class="section-description text-muted">
            Configure how you want to receive inventory alerts
          </p>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="sound-enabled"
                  v-model="formData.sound_enabled"
                />
                <label class="custom-control-label" for="sound-enabled">
                  <strong>Sound Notifications</strong>
                  <br />
                  <small class="text-muted">Play audio alerts for new notifications</small>
                </label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="popup-enabled"
                  v-model="formData.popup_enabled"
                />
                <label class="custom-control-label" for="popup-enabled">
                  <strong>Popup Alerts</strong>
                  <br />
                  <small class="text-muted">Show popup modals for critical alerts</small>
                </label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="banner-enabled"
                  v-model="formData.banner_enabled"
                />
                <label class="custom-control-label" for="banner-enabled">
                  <strong>Banner Notifications</strong>
                  <br />
                  <small class="text-muted">Show persistent banner for active alerts</small>
                </label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="auto-acknowledge"
                  v-model="formData.auto_acknowledge"
                />
                <label class="custom-control-label" for="auto-acknowledge">
                  <strong>Auto Acknowledge</strong>
                  <br />
                  <small class="text-muted">Auto-acknowledge info alerts after viewing</small>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="escalation-minutes">Escalation Time (minutes)</label>
          <input
            type="number"
            class="form-control"
            id="escalation-minutes"
            v-model.number="formData.escalation_minutes"
            :min="5"
            :max="1440"
          />
          <small class="form-text text-muted">
            How long to wait before escalating unacknowledged alerts (5-1440 minutes)
          </small>
        </div>
      </div>

      <!-- Alert Thresholds -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-target text-warning mr-2"></i>
            Alert Thresholds
          </h6>
          <p class="section-description text-muted">
            Configure when alerts should be triggered based on inventory levels
          </p>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="critical-stock-level">Critical Stock Level</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="critical-stock-level"
                  v-model.number="formData.thresholds.critical_stock_level"
                  :min="1"
                />
                <div class="input-group-append">
                  <span class="input-group-text">units</span>
                </div>
              </div>
              <small class="form-text text-muted">
                Trigger critical alert when stock falls below this level
              </small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="warning-stock-level">Warning Stock Level</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="warning-stock-level"
                  v-model.number="formData.thresholds.warning_stock_level"
                  :min="formData.thresholds.critical_stock_level + 1"
                />
                <div class="input-group-append">
                  <span class="input-group-text">units</span>
                </div>
              </div>
              <small class="form-text text-muted">
                Trigger warning alert when stock falls below this level
              </small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="critical-expiry-days">Critical Expiry Alert</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="critical-expiry-days"
                  v-model.number="formData.thresholds.expiry_days_critical"
                  :min="1"
                  :max="30"
                />
                <div class="input-group-append">
                  <span class="input-group-text">days</span>
                </div>
              </div>
              <small class="form-text text-muted">
                Critical alert when items expire within this many days
              </small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="warning-expiry-days">Warning Expiry Alert</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="warning-expiry-days"
                  v-model.number="formData.thresholds.expiry_days_warning"
                  :min="formData.thresholds.expiry_days_critical + 1"
                  :max="365"
                />
                <div class="input-group-append">
                  <span class="input-group-text">days</span>
                </div>
              </div>
              <small class="form-text text-muted">
                Warning alert when items expire within this many days
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Categories -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-folder text-info mr-2"></i>
            Alert Categories
          </h6>
          <p class="section-description text-muted">
            Enable or disable specific types of inventory alerts
          </p>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-calendar text-danger mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">Expiry Alerts</div>
                    <small class="text-muted">Items approaching expiration</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="expiry-category"
                    v-model="formData.enabled_categories.expiry"
                  />
                  <label class="custom-control-label" for="expiry-category"></label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-graph text-warning mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">Stock Level Alerts</div>
                    <small class="text-muted">Low inventory warnings</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="stock-level-category"
                    v-model="formData.enabled_categories.stock_level"
                  />
                  <label class="custom-control-label" for="stock-level-category"></label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-delivery text-primary mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">Procurement Alerts</div>
                    <small class="text-muted">Purchase and supplier notifications</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="procurement-category"
                    v-model="formData.enabled_categories.procurement"
                  />
                  <label class="custom-control-label" for="procurement-category"></label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-dollar text-success mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">Financial Alerts</div>
                    <small class="text-muted">Cost and budget notifications</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="financial-category"
                    v-model="formData.enabled_categories.financial"
                  />
                  <label class="custom-control-label" for="financial-category"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Preferences -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-shop text-success mr-2"></i>
            Store Preferences
          </h6>
          <p class="section-description text-muted">
            Choose which store types you want to receive alerts for
          </p>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-medicine text-primary mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">Pharmacy Store</div>
                    <small class="text-muted">Drug and medication inventory</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="pharmacy-store"
                    v-model="formData.enabled_stores.pharmacy"
                  />
                  <label class="custom-control-label" for="pharmacy-store"></label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-custom card-body p-3 mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <i class="ki ki-package text-info mr-3 font-size-h4"></i>
                  <div>
                    <div class="font-weight-bold">General Store</div>
                    <small class="text-muted">Medical supplies and equipment</small>
                  </div>
                </div>
                <div class="custom-control custom-switch">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="general-store"
                    v-model="formData.enabled_stores.general_store"
                  />
                  <label class="custom-control-label" for="general-store"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-cog text-dark mr-2"></i>
            Advanced Settings
          </h6>
          <p class="section-description text-muted">
            Additional configuration options for power users
          </p>
        </div>

        <div class="form-group">
          <label for="digest-frequency">Alert Digest Frequency</label>
          <select class="form-control" id="digest-frequency" v-model="formData.digest_frequency">
            <option value="none">No Digest Emails</option>
            <option value="daily">Daily Summary</option>
            <option value="weekly">Weekly Summary</option>
            <option value="monthly">Monthly Summary</option>
          </select>
          <small class="form-text text-muted">
            Receive periodic email summaries of inventory alerts
          </small>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="max-daily-alerts">Max Daily Alerts</label>
              <input
                type="number"
                class="form-control"
                id="max-daily-alerts"
                v-model.number="formData.max_daily_alerts"
                :min="1"
                :max="100"
              />
              <small class="form-text text-muted">
                Limit the number of alerts per day (prevents spam)
              </small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="snooze-default">Default Snooze Duration</label>
              <select
                class="form-control"
                id="snooze-default"
                v-model.number="formData.default_snooze_minutes"
              >
                <option :value="15">15 minutes</option>
                <option :value="30">30 minutes</option>
                <option :value="60">1 hour</option>
                <option :value="240">4 hours</option>
                <option :value="1440">1 day</option>
              </select>
              <small class="form-text text-muted"> Default duration when snoozing alerts </small>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="custom-control custom-switch">
            <input
              type="checkbox"
              class="custom-control-input"
              id="developer-mode"
              v-model="formData.developer_mode"
            />
            <label class="custom-control-label" for="developer-mode">
              <strong>Developer Mode</strong>
              <br />
              <small class="text-muted">Enable detailed logging and debug information</small>
            </label>
          </div>
        </div>
      </div>

      <!-- Test Alert -->
      <div class="configuration-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="ki ki-flask text-purple mr-2"></i>
            Test Notifications
          </h6>
          <p class="section-description text-muted">
            Test your alert settings to make sure they work as expected
          </p>
        </div>

        <div class="d-flex flex-wrap">
          <button
            type="button"
            class="btn btn-light-danger btn-sm mr-2 mb-2"
            @click="sendTestAlert('critical')"
            :disabled="isTesting"
          >
            <span
              v-if="isTesting && testType === 'critical'"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            <i v-else class="ki ki-warning mr-1"></i>
            Test Critical Alert
          </button>
          <button
            type="button"
            class="btn btn-light-warning btn-sm mr-2 mb-2"
            @click="sendTestAlert('warning')"
            :disabled="isTesting"
          >
            <span
              v-if="isTesting && testType === 'warning'"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            <i v-else class="ki ki-warning mr-1"></i>
            Test Warning Alert
          </button>
          <button
            type="button"
            class="btn btn-light-info btn-sm mr-2 mb-2"
            @click="sendTestAlert('info')"
            :disabled="isTesting"
          >
            <span
              v-if="isTesting && testType === 'info'"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            <i v-else class="ki ki-information-circle mr-1"></i>
            Test Info Alert
          </button>
          <button
            type="button"
            class="btn btn-light-primary btn-sm mb-2"
            @click="sendTestAlert('sound')"
            :disabled="isTesting || !formData.sound_enabled"
          >
            <span
              v-if="isTesting && testType === 'sound'"
              class="spinner-border spinner-border-sm mr-1"
            ></span>
            <i v-else class="ki ki-music mr-1"></i>
            Test Sound
          </button>
        </div>
      </div>
    </div>

    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-between">
        <button type="button" class="btn btn-light-danger" @click="resetToDefaults">
          <i class="ki ki-refresh mr-1"></i>
          Reset to Defaults
        </button>
        <div>
          <button type="button" class="btn btn-light mr-2" @click="cancel()">Cancel</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!hasChanges || isSaving"
            @click="ok()"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm mr-2"></span>
            Save Changes
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AlertConfiguration',
  data() {
    return {
      formData: {
        sound_enabled: true,
        popup_enabled: true,
        banner_enabled: true,
        auto_acknowledge: false,
        escalation_minutes: 30,
        thresholds: {
          critical_stock_level: 5,
          warning_stock_level: 20,
          expiry_days_critical: 7,
          expiry_days_warning: 30,
        },
        enabled_categories: {
          expiry: true,
          stock_level: true,
          procurement: true,
          financial: true,
        },
        enabled_stores: {
          pharmacy: true,
          general_store: true,
        },
        digest_frequency: 'weekly',
        max_daily_alerts: 20,
        default_snooze_minutes: 60,
        developer_mode: false,
      },
      originalData: {},
      isSaving: false,
      isTesting: false,
      testType: null,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['configuration']),

    hasChanges() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'fetchConfiguration',
      'updateConfiguration',
      'createManualAlert',
      'playAlertSound',
    ]),

    show() {
      this.loadConfiguration();
      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    async loadConfiguration() {
      try {
        await this.fetchConfiguration();
        this.formData = JSON.parse(JSON.stringify(this.configuration));
        this.originalData = JSON.parse(JSON.stringify(this.configuration));
      } catch (error) {
        console.error('Failed to load configuration:', error);
        this.$toast?.error('Failed to load alert preferences');
      }
    },

    async saveConfiguration() {
      this.isSaving = true;
      try {
        await this.updateConfiguration(this.formData);
        this.originalData = JSON.parse(JSON.stringify(this.formData));
        this.$toast?.success('Alert preferences saved successfully');
        this.hide();
      } catch (error) {
        this.$toast?.error('Failed to save alert preferences');
        console.error('Failed to save configuration:', error);
      } finally {
        this.isSaving = false;
      }
    },

    resetForm() {
      this.formData = JSON.parse(JSON.stringify(this.originalData));
      this.isSaving = false;
      this.isTesting = false;
      this.testType = null;
    },

    resetToDefaults() {
      this.formData = {
        sound_enabled: true,
        popup_enabled: true,
        banner_enabled: true,
        auto_acknowledge: false,
        escalation_minutes: 30,
        thresholds: {
          critical_stock_level: 5,
          warning_stock_level: 20,
          expiry_days_critical: 7,
          expiry_days_warning: 30,
        },
        enabled_categories: {
          expiry: true,
          stock_level: true,
          procurement: true,
          financial: true,
        },
        enabled_stores: {
          pharmacy: true,
          general_store: true,
        },
        digest_frequency: 'weekly',
        max_daily_alerts: 20,
        default_snooze_minutes: 60,
        developer_mode: false,
      };
    },

    async sendTestAlert(type) {
      this.isTesting = true;
      this.testType = type;

      try {
        if (type === 'sound') {
          // Just play the sound
          this.playAlertSound({ severity: 'info', duration: 300 });
          this.$toast?.success('Test sound played');
        } else {
          // Create a test alert
          const testAlerts = {
            critical: {
              title: 'Test Critical Alert',
              message:
                'This is a test critical inventory alert to verify your notification settings.',
              severity: 'critical',
              category: 'stock_level',
              store_type: 'pharmacy',
              item_name: 'Test Item',
              current_value: 2,
              threshold_value: 5,
            },
            warning: {
              title: 'Test Warning Alert',
              message:
                'This is a test warning inventory alert to verify your notification settings.',
              severity: 'warning',
              category: 'expiry',
              store_type: 'general_store',
              item_name: 'Test Item',
              current_value: 15,
              threshold_value: 30,
            },
            info: {
              title: 'Test Info Alert',
              message: 'This is a test informational alert to verify your notification settings.',
              severity: 'info',
              category: 'procurement',
              store_type: 'pharmacy',
              item_name: 'Test Item',
            },
          };

          await this.createManualAlert({
            ...testAlerts[type],
            context: 'Generated from alert configuration test',
          });

          this.$toast?.success(`Test ${type} alert sent successfully`);
        }
      } catch (error) {
        this.$toast?.error(`Failed to send test ${type} alert`);
        console.error('Failed to send test alert:', error);
      } finally {
        this.isTesting = false;
        this.testType = null;
      }
    },
  },

  watch: {
    'formData.thresholds.critical_stock_level'(newValue) {
      // Ensure warning level is always higher than critical level
      if (this.formData.thresholds.warning_stock_level <= newValue) {
        this.formData.thresholds.warning_stock_level = newValue + 1;
      }
    },

    'formData.thresholds.expiry_days_critical'(newValue) {
      // Ensure warning expiry is always higher than critical
      if (this.formData.thresholds.expiry_days_warning <= newValue) {
        this.formData.thresholds.expiry_days_warning = newValue + 1;
      }
    },
  },
};
</script>

<style scoped>
.alert-configuration-content {
  max-height: 70vh;
  overflow-y: auto;
}

.configuration-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f4f4f4;
}

.configuration-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #181c32;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.section-description {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0;
}

.card-custom {
  box-shadow: 0px 0px 20px 0px rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
  border: 1px solid #e2e5ec;
  transition: all 0.2s ease;
}

.card-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0px 2px 20px 0px rgba(82, 63, 105, 0.1);
}

.custom-control-label {
  cursor: pointer;
  line-height: 1.4;
}

.custom-switch .custom-control-label::before {
  border-radius: 1rem;
}

.custom-switch .custom-control-label::after {
  border-radius: 50%;
}

.input-group-text {
  background: #f8f9fa;
  border-color: #e2e5ec;
  color: #5e6278;
  font-size: 0.9rem;
}

.form-control {
  border-color: #e2e5ec;
  font-size: 0.9rem;
}

.form-control:focus {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-text {
  font-size: 0.8rem;
}

/* Alert category cards specific styling */
.card-body.p-3 {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

/* Custom scrollbar */
.alert-configuration-content::-webkit-scrollbar {
  width: 6px;
}

.alert-configuration-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.alert-configuration-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.alert-configuration-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .section-title {
    font-size: 0.95rem;
  }

  .section-description {
    font-size: 0.85rem;
  }

  .card-body.p-3 {
    padding: 1rem !important;
  }

  .form-control,
  .input-group-text {
    font-size: 0.85rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

/* Focus states for accessibility */
.custom-control-input:focus ~ .custom-control-label::before {
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}

.btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}

/* Animation for test buttons */
.btn:active {
  transform: translateY(1px);
}

/* Validation styling */
.form-control:invalid {
  border-color: #f44434;
}

.form-control:invalid:focus {
  border-color: #f44434;
  box-shadow: 0 0 0 0.2rem rgba(244, 67, 52, 0.25);
}
</style>
