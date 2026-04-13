<template>
  <div class="settings">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-cog mr-2"></i>
              General Store Settings
            </h3>
            <p class="card-text">Configure general store system settings and preferences</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <!-- General Settings -->
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-sliders-h mr-2"></i>
                    General Settings
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="store_name">Store Name</label>
                        <input
                          id="store_name"
                          v-model="form.store_name"
                          type="text"
                          class="form-control"
                          :class="{ 'is-invalid': errors.store_name }"
                        />
                        <div v-if="errors.store_name" class="invalid-feedback">
                          {{ errors.store_name }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="store_code">Store Code</label>
                        <input
                          id="store_code"
                          v-model="form.store_code"
                          type="text"
                          class="form-control"
                          :class="{ 'is-invalid': errors.store_code }"
                        />
                        <div v-if="errors.store_code" class="invalid-feedback">
                          {{ errors.store_code }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="currency">Default Currency</label>
                        <select
                          id="currency"
                          v-model="form.currency"
                          class="form-control"
                          :class="{ 'is-invalid': errors.currency }"
                        >
                          <option value="NGN">Nigerian Naira (₦)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                        <div v-if="errors.currency" class="invalid-feedback">
                          {{ errors.currency }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <select
                          id="timezone"
                          v-model="form.timezone"
                          class="form-control"
                          :class="{ 'is-invalid': errors.timezone }"
                        >
                          <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                        <div v-if="errors.timezone" class="invalid-feedback">
                          {{ errors.timezone }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Management Settings -->
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-boxes mr-2"></i>
                    Stock Management Settings
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="low_stock_threshold">Low Stock Threshold (%)</label>
                        <input
                          id="low_stock_threshold"
                          v-model.number="form.low_stock_threshold"
                          type="number"
                          class="form-control"
                          :class="{ 'is-invalid': errors.low_stock_threshold }"
                          min="1"
                          max="100"
                        />
                        <div v-if="errors.low_stock_threshold" class="invalid-feedback">
                          {{ errors.low_stock_threshold }}
                        </div>
                        <small class="form-text text-muted">
                          Percentage of stock level to trigger low stock alerts
                        </small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="critical_stock_threshold">Critical Stock Threshold (%)</label>
                        <input
                          id="critical_stock_threshold"
                          v-model.number="form.critical_stock_threshold"
                          type="number"
                          class="form-control"
                          :class="{ 'is-invalid': errors.critical_stock_threshold }"
                          min="1"
                          max="100"
                        />
                        <div v-if="errors.critical_stock_threshold" class="invalid-feedback">
                          {{ errors.critical_stock_threshold }}
                        </div>
                        <small class="form-text text-muted">
                          Percentage of stock level to trigger critical stock alerts
                        </small>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="auto_reorder">Auto Reorder</label>
                        <select
                          id="auto_reorder"
                          v-model="form.auto_reorder"
                          class="form-control"
                          :class="{ 'is-invalid': errors.auto_reorder }"
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <div v-if="errors.auto_reorder" class="invalid-feedback">
                          {{ errors.auto_reorder }}
                        </div>
                        <small class="form-text text-muted">
                          Automatically create reorder requests when stock is low
                        </small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="reorder_quantity">Default Reorder Quantity</label>
                        <input
                          id="reorder_quantity"
                          v-model.number="form.reorder_quantity"
                          type="number"
                          class="form-control"
                          :class="{ 'is-invalid': errors.reorder_quantity }"
                          min="1"
                        />
                        <div v-if="errors.reorder_quantity" class="invalid-feedback">
                          {{ errors.reorder_quantity }}
                        </div>
                        <small class="form-text text-muted">
                          Default quantity to reorder when auto-reorder is triggered
                        </small>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="track_expiry_dates"
                        v-model="form.track_expiry_dates"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="track_expiry_dates">
                        Track Expiry Dates
                      </label>
                      <small class="form-text text-muted d-block">
                        Enable tracking of item expiry dates and send alerts
                      </small>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="track_batch_numbers"
                        v-model="form.track_batch_numbers"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="track_batch_numbers">
                        Track Batch Numbers
                      </label>
                      <small class="form-text text-muted d-block">
                        Enable tracking of item batch numbers for traceability
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Request Management Settings -->
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-clipboard-list mr-2"></i>
                    Request Management Settings
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="default_request_approval">Default Request Approval</label>
                        <select
                          id="default_request_approval"
                          v-model="form.default_request_approval"
                          class="form-control"
                          :class="{ 'is-invalid': errors.default_request_approval }"
                        >
                          <option value="required">Required</option>
                          <option value="optional">Optional</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <div v-if="errors.default_request_approval" class="invalid-feedback">
                          {{ errors.default_request_approval }}
                        </div>
                        <small class="form-text text-muted">
                          Default approval requirement for new requests
                        </small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="request_expiry_days">Request Expiry Days</label>
                        <input
                          id="request_expiry_days"
                          v-model.number="form.request_expiry_days"
                          type="number"
                          class="form-control"
                          :class="{ 'is-invalid': errors.request_expiry_days }"
                          min="1"
                        />
                        <div v-if="errors.request_expiry_days" class="invalid-feedback">
                          {{ errors.request_expiry_days }}
                        </div>
                        <small class="form-text text-muted">
                          Number of days before a request expires
                        </small>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="auto_approve_low_value"
                        v-model="form.auto_approve_low_value"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="auto_approve_low_value">
                        Auto-approve Low Value Requests
                      </label>
                      <small class="form-text text-muted d-block">
                        Automatically approve requests below a certain value threshold
                      </small>
                    </div>
                  </div>

                  <div class="form-group" v-if="form.auto_approve_low_value">
                    <label for="low_value_threshold">Low Value Threshold</label>
                    <input
                      id="low_value_threshold"
                      v-model.number="form.low_value_threshold"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.low_value_threshold }"
                      min="0"
                      step="0.01"
                    />
                    <div v-if="errors.low_value_threshold" class="invalid-feedback">
                      {{ errors.low_value_threshold }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notification Settings -->
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-bell mr-2"></i>
                    Notification Settings
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="email_notifications">Email Notifications</label>
                        <select
                          id="email_notifications"
                          v-model="form.email_notifications"
                          class="form-control"
                          :class="{ 'is-invalid': errors.email_notifications }"
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <div v-if="errors.email_notifications" class="invalid-feedback">
                          {{ errors.email_notifications }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="sms_notifications">SMS Notifications</label>
                        <select
                          id="sms_notifications"
                          v-model="form.sms_notifications"
                          class="form-control"
                          :class="{ 'is-invalid': errors.sms_notifications }"
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <div v-if="errors.sms_notifications" class="invalid-feedback">
                          {{ errors.sms_notifications }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="low_stock_alerts"
                        v-model="form.low_stock_alerts"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="low_stock_alerts">
                        Low Stock Alerts
                      </label>
                      <small class="form-text text-muted d-block">
                        Send notifications when items reach low stock levels
                      </small>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="expiry_alerts"
                        v-model="form.expiry_alerts"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="expiry_alerts">
                        Expiry Date Alerts
                      </label>
                      <small class="form-text text-muted d-block">
                        Send notifications before items expire
                      </small>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="custom-control custom-checkbox">
                      <input
                        id="request_status_updates"
                        v-model="form.request_status_updates"
                        type="checkbox"
                        class="custom-control-input"
                      />
                      <label class="custom-control-label" for="request_status_updates">
                        Request Status Updates
                      </label>
                      <small class="form-text text-muted d-block">
                        Send notifications when request status changes
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-save mr-2"></i>
                  {{ submitting ? 'Saving...' : 'Save Settings' }}
                </button>
                <button type="button" @click="resetToDefaults" class="btn btn-secondary ml-2">
                  <i class="fas fa-undo mr-2"></i>
                  Reset to Defaults
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Settings',
  data() {
    return {
      form: {
        store_name: '',
        store_code: '',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        low_stock_threshold: 20,
        critical_stock_threshold: 5,
        auto_reorder: 'disabled',
        reorder_quantity: 100,
        track_expiry_dates: false,
        track_batch_numbers: false,
        default_request_approval: 'required',
        request_expiry_days: 30,
        auto_approve_low_value: false,
        low_value_threshold: 1000,
        email_notifications: 'enabled',
        sms_notifications: 'disabled',
        low_stock_alerts: true,
        expiry_alerts: true,
        request_status_updates: true,
      },
      submitting: false,
      errors: {},
    };
  },
  async mounted() {
    await this.loadSettings();
  },
  methods: {
    ...mapActions('generalStore', ['fetchSettings', 'updateSettings']),
    async loadSettings() {
      try {
        const data = await this.fetchSettings();
        if (data) {
          this.form = { ...this.form, ...data };
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        this.$toast && this.$toast.error('Failed to load settings');
      }
    },
    validateForm() {
      this.errors = {};

      // Required fields
      if (!this.form.store_name || this.form.store_name.trim() === '') {
        this.errors.store_name = 'Store name is required';
      } else if (this.form.store_name.length > 100) {
        this.errors.store_name = 'Store name must be 100 characters or less';
      }

      if (!this.form.store_code || this.form.store_code.trim() === '') {
        this.errors.store_code = 'Store code is required';
      } else if (this.form.store_code.length > 20) {
        this.errors.store_code = 'Store code must be 20 characters or less';
      }

      // Threshold validations
      if (this.form.low_stock_threshold < 1 || this.form.low_stock_threshold > 100) {
        this.errors.low_stock_threshold = 'Low stock threshold must be between 1 and 100';
      }

      if (this.form.critical_stock_threshold < 1 || this.form.critical_stock_threshold > 100) {
        this.errors.critical_stock_threshold = 'Critical stock threshold must be between 1 and 100';
      }

      if (this.form.critical_stock_threshold >= this.form.low_stock_threshold) {
        this.errors.critical_stock_threshold =
          'Critical threshold must be less than low stock threshold';
      }

      // Reorder quantity validation
      if (this.form.reorder_quantity < 1) {
        this.errors.reorder_quantity = 'Reorder quantity must be at least 1';
      }

      // Request expiry days validation
      if (this.form.request_expiry_days < 1) {
        this.errors.request_expiry_days = 'Request expiry days must be at least 1';
      } else if (this.form.request_expiry_days > 365) {
        this.errors.request_expiry_days = 'Request expiry days cannot exceed 365';
      }

      // Low value threshold validation
      if (this.form.auto_approve_low_value && this.form.low_value_threshold < 0) {
        this.errors.low_value_threshold = 'Low value threshold must be 0 or greater';
      }

      return Object.keys(this.errors).length === 0;
    },

    hasError(field) {
      return !!this.errors[field];
    },

    getError(field) {
      return this.errors[field] || '';
    },

    async handleSubmit() {
      this.submitting = true;
      this.errors = {};

      if (!this.validateForm()) {
        this.submitting = false;
        this.$toast && this.$toast.error('Please fix the validation errors before saving.');
        return;
      }

      try {
        await this.updateSettings(this.form);
        this.$toast && this.$toast.success('Settings saved successfully!');
      } catch (error) {
        console.error('Error saving settings:', error);

        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          this.$toast && this.$toast.error('Failed to save settings. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
    resetToDefaults() {
      if (
        confirm(
          'Are you sure you want to reset all settings to defaults? This action cannot be undone.'
        )
      ) {
        this.form = {
          store_name: '',
          store_code: '',
          currency: 'NGN',
          timezone: 'Africa/Lagos',
          low_stock_threshold: 20,
          critical_stock_threshold: 5,
          auto_reorder: 'disabled',
          reorder_quantity: 100,
          track_expiry_dates: false,
          track_batch_numbers: false,
          default_request_approval: 'required',
          request_expiry_days: 30,
          auto_approve_low_value: false,
          low_value_threshold: 1000,
          email_notifications: 'enabled',
          sms_notifications: 'disabled',
          low_stock_alerts: true,
          expiry_alerts: true,
          request_status_updates: true,
        };
        this.$toast && this.$toast.info('Settings reset to defaults');
      }
    },
  },
};
</script>

<style scoped>
.settings {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
  border-bottom: none;
}

.form-actions {
  padding-top: 20px;
}

.custom-control-label {
  font-weight: 500;
}

.form-text {
  font-size: 0.875em;
}

.invalid-feedback {
  display: block;
}

.card .card-header {
  background: #f8f9fa;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

.card .card-header h5 {
  margin: 0;
  color: #495057;
}
</style>
