<template>
  <b-modal
    :id="modalId"
    :title="isEditing ? 'Edit POS Terminal' : 'Create New POS Terminal'"
    size="lg"
    :hide-header-close="true"
    :hide-footer="true"
    v-model="activePrompt"
    @hide="handleClose"
    @close="handleClose"
  >
    <div class="pos-terminal-form">
      <!-- Form Header -->
      <div class="form-header mb-4">
        <div class="d-flex align-items-center">
          <div class="form-icon mr-3">
            <i class="fas fa-credit-card fa-2x text-success"></i>
          </div>
          <div>
            <h5 class="mb-1">{{ isEditing ? 'Edit POS Terminal' : 'Create New POS Terminal' }}</h5>
            <p class="text-muted mb-0">
              {{
                isEditing
                  ? 'Update POS terminal information'
                  : 'Add a new POS terminal for the hospital'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <b-form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <!-- Terminal ID -->
          <div class="col-md-6">
            <b-form-group
              label="Terminal ID"
              label-for="terminal-id"
              :state="getFieldState('terminal_id')"
              :invalid-feedback="getFieldError('terminal_id')"
              required
            >
              <b-form-input
                id="terminal-id"
                v-model="form.terminal_id"
                type="text"
                placeholder="Enter terminal ID (e.g., POS001, MOBILE001)"
                :state="getFieldState('terminal_id')"
                @blur="validateField('terminal_id')"
                @input="validateField('terminal_id')"
                required
              ></b-form-input>
            </b-form-group>
          </div>

          <!-- Location -->
          <div class="col-md-6">
            <b-form-group
              label="Location"
              label-for="location"
              :state="getFieldState('location')"
              :invalid-feedback="getFieldError('location')"
              required
            >
              <b-form-input
                id="location"
                v-model="form.location"
                type="text"
                placeholder="Enter terminal location (e.g., Main Reception, Pharmacy)"
                :state="getFieldState('location')"
                @blur="validateField('location')"
                @input="validateField('location')"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Bank Account -->
          <div class="col-md-6">
            <b-form-group
              label="Bank Account"
              label-for="bank-account"
              :state="getFieldState('bank_account_id')"
              :invalid-feedback="getFieldError('bank_account_id')"
              required
            >
              <b-form-select
                id="bank-account"
                v-model="form.bank_account_id"
                :options="bankAccountOptions"
                :state="getFieldState('bank_account_id')"
                @change="validateField('bank_account_id')"
                @input="validateField('bank_account_id')"
                required
              >
                <template #first>
                  <option value="">Select Bank Account</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>

          <!-- Terminal Type -->
          <div class="col-md-6">
            <b-form-group
              label="Terminal Type"
              label-for="terminal-type"
              :state="getFieldState('terminal_type')"
              :invalid-feedback="getFieldError('terminal_type')"
              required
            >
              <b-form-select
                id="terminal-type"
                v-model="form.terminal_type"
                :options="terminalTypeOptions"
                :state="getFieldState('terminal_type')"
                @change="validateField('terminal_type')"
                @input="validateField('terminal_type')"
                required
              >
                <template #first>
                  <option value="">Select Terminal Type</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Merchant Name -->
          <div class="col-md-6">
            <b-form-group
              label="Merchant Name"
              label-for="merchant-name"
              :state="getFieldState('merchant_name')"
              :invalid-feedback="getFieldError('merchant_name')"
            >
              <b-form-input
                id="merchant-name"
                v-model="form.merchant_name"
                type="text"
                placeholder="Enter merchant name (optional)"
                :state="getFieldState('merchant_name')"
                @blur="validateField('merchant_name')"
                @input="validateField('merchant_name')"
              ></b-form-input>
            </b-form-group>
          </div>

          <!-- Merchant ID -->
          <div class="col-md-6">
            <b-form-group
              label="Merchant ID"
              label-for="merchant-id"
              :state="getFieldState('merchant_id')"
              :invalid-feedback="getFieldError('merchant_id')"
            >
              <b-form-input
                id="merchant-id"
                v-model="form.merchant_id"
                type="text"
                placeholder="Enter merchant ID (optional)"
                :state="getFieldState('merchant_id')"
                @blur="validateField('merchant_id')"
                @input="validateField('merchant_id')"
              ></b-form-input>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Daily Transaction Limit -->
          <div class="col-md-6">
            <b-form-group
              label="Daily Transaction Limit"
              label-for="daily-transaction-limit"
              :state="getFieldState('daily_transaction_limit')"
              :invalid-feedback="getFieldError('daily_transaction_limit')"
            >
              <b-form-input
                id="daily-transaction-limit"
                v-model.number="form.daily_transaction_limit"
                type="number"
                min="0"
                placeholder="Enter daily transaction limit (optional)"
                :state="getFieldState('daily_transaction_limit')"
                @blur="validateField('daily_transaction_limit')"
                @input="validateField('daily_transaction_limit')"
              ></b-form-input>
              <small class="form-text text-muted">
                Maximum number of transactions per day
              </small>
            </b-form-group>
          </div>

          <!-- Daily Amount Limit -->
          <div class="col-md-6">
            <b-form-group
              label="Daily Amount Limit"
              label-for="daily-amount-limit"
              :state="getFieldState('daily_amount_limit')"
              :invalid-feedback="getFieldError('daily_amount_limit')"
            >
              <b-input-group>
                <b-input-group-prepend>
                  <span class="input-group-text">₦</span>
                </b-input-group-prepend>
                <b-form-input
                  id="daily-amount-limit"
                  v-model.number="form.daily_amount_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  :state="getFieldState('daily_amount_limit')"
                  @blur="validateField('daily_amount_limit')"
                  @input="validateField('daily_amount_limit')"
                ></b-form-input>
              </b-input-group>
              <small class="form-text text-muted">
                Maximum amount per day in Nigerian Naira (NGN)
              </small>
            </b-form-group>
          </div>
        </div>

        <!-- Description -->
        <div class="row">
          <div class="col-12">
            <b-form-group
              label="Description"
              label-for="description"
              :state="getFieldState('description')"
              :invalid-feedback="getFieldError('description')"
            >
              <b-form-textarea
                id="description"
                v-model="form.description"
                rows="3"
                placeholder="Enter additional details about this POS terminal (optional)"
                :state="getFieldState('description')"
                @blur="validateField('description')"
                @input="validateField('description')"
              ></b-form-textarea>
              <small class="form-text text-muted">
                Optional: Add notes about the terminal purpose or special instructions
              </small>
            </b-form-group>
          </div>
        </div>

        <!-- Status -->
        <div class="row">
          <div class="col-12">
            <b-form-group
              label="Status"
              label-for="status"
              :state="getFieldState('is_active')"
              :invalid-feedback="getFieldError('is_active')"
              required
            >
              <div class="d-flex align-items-center">
                <b-form-checkbox
                  id="status"
                  v-model="form.is_active"
                  switch
                  size="lg"
                  @change="validateField('is_active')"
                  @input="validateField('is_active')"
                ></b-form-checkbox>
                <span class="ml-2">
                  {{ form.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <small class="form-text text-muted">
                Active terminals can be used for transactions
              </small>
            </b-form-group>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions mt-4 pt-3 border-top">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-info">
              <small class="text-muted">
                <i class="fas fa-info-circle mr-1"></i>
                All fields marked with * are required
              </small>
            </div>
            <div class="form-buttons">
              <b-button
                variant="outline-secondary"
                @click="handleClose"
                :disabled="submitting"
                class="mr-2"
              >
                Cancel
              </b-button>
              <b-button type="submit" variant="success" :disabled="submitting || !isFormValid">
                <span v-if="submitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  {{ isEditing ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  <i class="fas fa-save mr-2"></i>
                  {{ isEditing ? 'Update Terminal' : 'Create Terminal' }}
                </span>
              </b-button>
            </div>
          </div>
        </div>
      </b-form>

      <!-- Validation Summary -->
      <div v-if="validationErrors.length > 0" class="validation-summary mt-3">
        <div class="alert alert-danger">
          <h6 class="alert-heading">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Please fix the following errors:
          </h6>
          <ul class="mb-0">
            <li v-for="error in validationErrors" :key="error" class="text-danger">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'POSTerminalForm',
  props: {
    terminal: {
      type: Object,
      default: null,
    },
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    bankAccountOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      modalId: 'pos-terminal-form-modal',
      submitting: false,
      form: {
        terminal_id: '',
        location: '',
        bank_account_id: '',
        terminal_type: '',
        merchant_name: '',
        merchant_id: '',
        daily_transaction_limit: 0,
        daily_amount_limit: 0,
        description: '',
        is_active: true,
      },
      validation: {
        terminal_id: { valid: null, error: '' },
        location: { valid: null, error: '' },
        bank_account_id: { valid: null, error: '' },
        terminal_type: { valid: null, error: '' },
        merchant_name: { valid: null, error: '' },
        merchant_id: { valid: null, error: '' },
        daily_transaction_limit: { valid: null, error: '' },
        daily_amount_limit: { valid: null, error: '' },
        is_active: { valid: null, error: '' },
      },
    };
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    isEditing() {
      return !!this.terminal;
    },
    terminalTypeOptions() {
      return [
        { value: 'MOBILE', text: 'Mobile Terminal' },
        { value: 'FIXED', text: 'Fixed Terminal' },
        { value: 'KIOSK', text: 'Self-Service Kiosk' },
      ];
    },
    validationErrors() {
      const errors = [];
      Object.keys(this.validation).forEach(field => {
        if (this.validation[field]?.error) {
          errors.push(this.validation[field].error);
        }
      });
      return errors;
    },
    isFormValid() {
      // Check if all required fields have values and are valid
      const requiredFields = [
        'terminal_id',
        'location',
        'bank_account_id',
        'terminal_type',
        'is_active',
      ];

      return requiredFields.every(field => {
        const value = this.form[field];
        const validation = this.validation[field];

        // If field has been validated and is invalid, return false
        if (validation?.valid === false) {
          return false;
        }

        // Check if required field has a value
        if (field === 'is_active') {
          return value !== null && value !== undefined;
        } else if (field === 'bank_account_id') {
          // bank_account_id is a number, so check if it's not null/undefined and not empty string
          return value !== null && value !== undefined && value !== '';
        } else if (field === 'terminal_type') {
          // terminal_type is a string, so check if it's not null/undefined and not empty string
          return value !== null && value !== undefined && value !== '';
        } else {
          return value && value.trim().length > 0;
        }
      });
    },
  },
  created() {
    // Initialize validation object
    this.initializeForm();
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.terminal || {}).length === 0) {
        this.initializeForm();
      } else {
        this.initializeForm();
      }
    },
    terminal: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    initializeForm() {
      if (this.terminal) {
        // Edit mode - populate form with existing data
        this.form = {
          terminal_id: this.terminal.terminal_id || '',
          location: this.terminal.location || '',
          bank_account_id: this.terminal.bank_account_id || null,
          terminal_type: this.terminal.terminal_type || '',
          merchant_name: this.terminal.merchant_name || '',
          merchant_id: this.terminal.merchant_id || '',
          daily_transaction_limit: this.terminal.daily_transaction_limit || 0,
          daily_amount_limit: this.terminal.daily_amount_limit || 0,
          description: this.terminal.description || '',
          is_active: this.terminal.is_active !== undefined ? this.terminal.is_active : true,
        };
      } else {
        // Create mode - reset form to defaults
        this.form = {
          terminal_id: '',
          location: '',
          bank_account_id: null,
          terminal_type: '',
          merchant_name: '',
          merchant_id: '',
          daily_transaction_limit: 0,
          daily_amount_limit: 0,
          description: '',
          is_active: true,
        };
      }

      // Reset validation and set initial states
      const requiredFields = [
        'terminal_id',
        'location',
        'bank_account_id',
        'terminal_type',
        'is_active',
      ];

      requiredFields.forEach(field => {
        if (!this.validation[field]) {
          this.validation[field] = { valid: null, error: '' };
        }

        // Set initial validation state based on field value
        if (field === 'is_active') {
          // is_active has a default value of true, so it's valid initially
          this.validation[field] = { valid: true, error: '' };
        } else if (field === 'bank_account_id' || field === 'terminal_type') {
          // These fields start as null/empty, so they're not valid initially
          this.validation[field] = { valid: null, error: '' };
        } else {
          // Other fields start as null (not validated yet)
          this.validation[field] = { valid: null, error: '' };
        }
      });
    },

    validateField(fieldName) {
      const value = this.form[fieldName];
      let valid = true;
      let error = '';

      // Ensure validation object exists for this field
      if (!this.validation[fieldName]) {
        this.validation[fieldName] = { valid: null, error: '' };
      }

      switch (fieldName) {
        case 'terminal_id':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Terminal ID is required';
          } else if (value.trim().length < 3) {
            valid = false;
            error = 'Terminal ID must be at least 3 characters long';
          } else if (value.trim().length > 20) {
            valid = false;
            error = 'Terminal ID cannot exceed 20 characters';
          }
          break;

        case 'location':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Location is required';
          } else if (value.trim().length < 2) {
            valid = false;
            error = 'Location must be at least 2 characters long';
          } else if (value.trim().length > 100) {
            valid = false;
            error = 'Location cannot exceed 100 characters';
          }
          break;

        case 'bank_account_id':
          if (!value || value === null || value === undefined || value === '') {
            valid = false;
            error = 'Bank account is required';
          }
          break;

        case 'terminal_type':
          if (!value || value === null || value === undefined || value === '') {
            valid = false;
            error = 'Terminal type is required';
          }
          break;

        case 'merchant_name':
          if (value && value.trim().length > 0 && value.trim().length > 100) {
            valid = false;
            error = 'Merchant name cannot exceed 100 characters';
          }
          break;

        case 'merchant_id':
          if (value && value.trim().length > 0 && value.trim().length > 50) {
            valid = false;
            error = 'Merchant ID cannot exceed 50 characters';
          }
          break;

        case 'daily_transaction_limit':
          if (
            value !== null &&
            value !== '' &&
            value !== undefined &&
            (isNaN(value) || parseInt(value) < 0)
          ) {
            valid = false;
            error = 'Daily transaction limit must be a positive number';
          }
          break;

        case 'daily_amount_limit':
          if (
            value !== null &&
            value !== '' &&
            value !== undefined &&
            (isNaN(value) || parseFloat(value) < 0)
          ) {
            valid = false;
            error = 'Daily amount limit must be a positive number';
          }
          break;

        case 'is_active':
          if (value === null || value === undefined) {
            valid = false;
            error = 'Status is required';
          }
          break;
      }

      this.validation[fieldName] = { valid, error };
      return valid;
    },

    validateAllFields() {
      let allValid = true;
      const requiredFields = [
        'terminal_id',
        'location',
        'bank_account_id',
        'terminal_type',
        'is_active',
      ];

      requiredFields.forEach(field => {
        if (!this.validateField(field)) {
          allValid = false;
        }
      });
      return allValid;
    },

    getFieldState(fieldName) {
      return this.validation[fieldName]?.valid;
    },

    getFieldError(fieldName) {
      return this.validation[fieldName]?.error || '';
    },

    async handleSubmit() {
      if (!this.validateAllFields()) {
        this.$bvToast.toast('Please fix the validation errors', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        this.submitting = true;

        const formData = {
          ...this.form,
          terminal_id: this.form.terminal_id.trim(),
          location: this.form.location.trim(),
          bank_account_id: parseInt(this.form.bank_account_id) || null,
          terminal_type: this.form.terminal_type,
          merchant_name: this.form.merchant_name.trim(),
          merchant_id: this.form.merchant_id.trim(),
          description: this.form.description.trim(),
          daily_transaction_limit: this.form.daily_transaction_limit || 0,
          daily_amount_limit: this.form.daily_amount_limit || 0,
          is_active: this.form.is_active,
        };

        let response;
        if (this.isEditing) {
          // Update existing terminal
          response = await this.$store.dispatch('accounting/updatePOSTerminal', {
            id: this.terminal.id,
            data: formData,
          });
        } else {
          // Create new terminal
          response = await this.$store.dispatch('accounting/createPOSTerminal', formData);
        }

        if (response && response.success) {
          this.$emit('saved', response.data);
        } else {
          throw new Error(response?.error || 'Failed to save POS terminal');
        }
      } catch (error) {
        console.error('Failed to save POS terminal:', error);
        this.$bvToast.toast(error.message || 'Failed to save POS terminal', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },

    handleClose() {
      if (this.submitting) return; // Prevent closing while submitting

      this.$emit('closeModal');
    },
  },
};
</script>

<style scoped>
.pos-terminal-form {
  padding: 0.5rem;
}

.form-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.form-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.form-actions {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.form-info {
  color: #6c757d;
}

.form-buttons {
  display: flex;
  gap: 0.5rem;
}

.validation-summary {
  margin-top: 1rem;
}

.validation-summary ul {
  padding-left: 1.5rem;
}

.validation-summary li {
  margin-bottom: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .form-buttons {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .pos-terminal-form {
    padding: 0.25rem;
  }

  .form-header {
    text-align: center;
  }

  .form-icon {
    margin: 0 auto 1rem auto;
  }
}
</style>
