<template>
  <b-modal
    :id="modalId"
    :title="isEditing ? 'Edit Bank Account' : 'Create New Bank Account'"
    size="lg"
    :hide-header-close="true"
    :hide-footer="true"
    v-model="activePrompt"
    @hide="handleClose"
    @close="handleClose"
  >
    <div class="bank-account-form">
      <!-- Form Header -->
      <div class="form-header mb-4">
        <div class="d-flex align-items-center">
          <div class="form-icon mr-3">
            <i class="fas fa-university fa-2x text-primary"></i>
          </div>
          <div>
            <h5 class="mb-1">{{ isEditing ? 'Edit Bank Account' : 'Create New Bank Account' }}</h5>
            <p class="text-muted mb-0">
              {{
                isEditing
                  ? 'Update bank account information'
                  : 'Add a new bank account for the hospital'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <b-form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <!-- Bank Name -->
          <div class="col-md-6">
            <b-form-group
              label="Bank Name"
              label-for="bank-name"
              :state="getFieldState('bank_name')"
              :invalid-feedback="getFieldError('bank_name')"
              required
            >
              <b-form-input
                id="bank-name"
                v-model="form.bank_name"
                type="text"
                placeholder="Enter bank name (e.g., First Bank, GT Bank)"
                :state="getFieldState('bank_name')"
                @blur="validateField('bank_name')"
                @input="validateField('bank_name')"
                required
              ></b-form-input>
            </b-form-group>
          </div>

          <!-- Account Number -->
          <div class="col-md-6">
            <b-form-group
              label="Account Number"
              label-for="account-number"
              :state="getFieldState('account_number')"
              :invalid-feedback="getFieldError('account_number')"
              required
            >
              <b-form-input
                id="account-number"
                v-model="form.account_number"
                type="text"
                placeholder="Enter account number"
                :state="getFieldState('account_number')"
                @blur="validateField('account_number')"
                @input="validateField('account_number')"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Account Name -->
          <div class="col-md-6">
            <b-form-group
              label="Account Name"
              label-for="account-name"
              :state="getFieldState('account_name')"
              :invalid-feedback="getFieldError('account_name')"
              required
            >
              <b-form-input
                id="account-name"
                v-model="form.account_name"
                type="text"
                placeholder="Enter account name (e.g., Caroline Hospital Main Account)"
                :state="getFieldState('account_name')"
                @blur="validateField('account_name')"
                @input="validateField('account_name')"
                required
              ></b-form-input>
            </b-form-group>
          </div>

          <!-- Account Type -->
          <div class="col-md-6">
            <b-form-group
              label="Account Type"
              label-for="account-type"
              :state="getFieldState('account_type')"
              :invalid-feedback="getFieldError('account_type')"
              required
            >
              <b-form-select
                id="account-type"
                v-model="form.account_type"
                :options="accountTypeOptions"
                :state="getFieldState('account_type')"
                @change="validateField('account_type')"
                @input="validateField('account_type')"
                required
              >
                <template #first>
                  <option value="">Select Account Type</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Current Balance -->
          <div class="col-md-6">
            <b-form-group
              label="Current Balance"
              label-for="current-balance"
              :state="getFieldState('current_balance')"
              :invalid-feedback="getFieldError('current_balance')"
              required
            >
              <b-input-group>
                <b-input-group-prepend>
                  <span class="input-group-text">₦</span>
                </b-input-group-prepend>
                <b-form-input
                  id="current-balance"
                  v-model.number="form.current_balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  :state="getFieldState('current_balance')"
                  @blur="validateField('current_balance')"
                  @input="validateField('current_balance')"
                  required
                ></b-form-input>
              </b-input-group>
              <small class="form-text text-muted">
                Enter the current balance in Nigerian Naira (NGN)
              </small>
            </b-form-group>
          </div>

          <!-- Status -->
          <div class="col-md-6">
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
                ></b-form-checkbox>
                <span class="ml-2">
                  {{ form.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <small class="form-text text-muted">
                Active accounts can be used for transactions
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
                placeholder="Enter additional details about this bank account (optional)"
                :state="getFieldState('description')"
                @blur="validateField('description')"
              ></b-form-textarea>
              <small class="form-text text-muted">
                Optional: Add notes about the account purpose or special instructions
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
              <b-button type="submit" variant="primary" :disabled="submitting || !isFormValid">
                <span v-if="submitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  {{ isEditing ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  <i class="fas fa-save mr-2"></i>
                  {{ isEditing ? 'Update Account' : 'Create Account' }}
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
  name: 'BankAccountForm',
  props: {
    account: {
      type: Object,
      default: null,
    },
    displayPrompt: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      modalId: 'bank-account-form-modal',
      submitting: false,
      form: {
        bank_name: '',
        account_number: '',
        account_name: '',
        account_type: '',
        current_balance: 0,
        description: '',
        is_active: true,
      },
      validation: {
        bank_name: { valid: null, error: '' },
        account_number: { valid: null, error: '' },
        account_name: { valid: null, error: '' },
        account_type: { valid: null, error: '' },
        current_balance: { valid: null, error: '' },
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
      return !!this.account;
    },
    accountTypeOptions() {
      return [
        { value: 'CURRENT', text: 'Current Account' },
        { value: 'SAVINGS', text: 'Savings Account' },
        { value: 'FIXED_DEPOSIT', text: 'Fixed Deposit' },
        { value: 'DOMICILIARY', text: 'Domiciliary Account' },
      ];
    },
    validationErrors() {
      const errors = [];
      Object.keys(this.validation).forEach((field) => {
        if (this.validation[field]?.error) {
          errors.push(this.validation[field].error);
        }
      });
      return errors;
    },
    isFormValid() {
      // Check if all required fields have values and are valid
      const requiredFields = [
        'bank_name',
        'account_number',
        'account_name',
        'account_type',
        'current_balance',
        'is_active',
      ];

      return requiredFields.every((field) => {
        const value = this.form[field];
        const validation = this.validation[field];

        // If field has been validated and is invalid, return false
        if (validation?.valid === false) {
          return false;
        }

        // Check if required field has a value
        if (field === 'current_balance') {
          return (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !isNaN(value) &&
            parseFloat(value) >= 0
          );
        } else if (field === 'is_active') {
          return value !== null && value !== undefined;
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
      if (Object.entries(this.account || {}).length === 0) {
        this.initializeForm();
      } else {
        this.initializeForm();
      }
    },
    account: {
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
      if (this.account) {
        // Edit mode - populate form with existing data
        this.form = {
          bank_name: this.account.bank_name || '',
          account_number: this.account.account_number || '',
          account_name: this.account.account_name || '',
          account_type: this.account.account_type || '',
          current_balance: this.account.current_balance || 0,
          description: this.account.description || '',
          is_active: this.account.is_active !== undefined ? this.account.is_active : true,
        };
      } else {
        // Create mode - reset form to defaults
        this.form = {
          bank_name: '',
          account_number: '',
          account_name: '',
          account_type: '',
          current_balance: 0,
          description: '',
          is_active: true,
        };
      }

      // Reset validation
      Object.keys(this.validation).forEach((field) => {
        this.validation[field] = { valid: null, error: '' };
      });

      // Ensure all validation fields exist and set initial states
      const requiredFields = [
        'bank_name',
        'account_number',
        'account_name',
        'account_type',
        'current_balance',
        'is_active',
      ];
      requiredFields.forEach((field) => {
        if (!this.validation[field]) {
          this.validation[field] = { valid: null, error: '' };
        }

        // Set initial validation state based on field value
        if (field === 'is_active') {
          // is_active has a default value of true, so it's valid initially
          this.validation[field] = { valid: true, error: '' };
        } else if (field === 'current_balance') {
          // current_balance has a default value of 0, so it's valid initially
          this.validation[field] = { valid: true, error: '' };
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
        case 'bank_name':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Bank name is required';
          } else if (value.trim().length < 2) {
            valid = false;
            error = 'Bank name must be at least 2 characters long';
          } else if (value.trim().length > 100) {
            valid = false;
            error = 'Bank name cannot exceed 100 characters';
          }
          break;

        case 'account_number':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Account number is required';
          } else if (value.trim().length < 5) {
            valid = false;
            error = 'Account number must be at least 5 characters long';
          } else if (value.trim().length > 20) {
            valid = false;
            error = 'Account number cannot exceed 20 characters';
          }
          break;

        case 'account_name':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Account name is required';
          } else if (value.trim().length < 2) {
            valid = false;
            error = 'Account name must be at least 2 characters long';
          } else if (value.trim().length > 100) {
            valid = false;
            error = 'Account name cannot exceed 100 characters';
          }
          break;

        case 'account_type':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Account type is required';
          }
          break;

        case 'current_balance':
          if (value === null || value === undefined || value === '') {
            valid = false;
            error = 'Current balance is required';
          } else if (isNaN(value) || parseFloat(value) < 0) {
            valid = false;
            error = 'Current balance must be a positive number';
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
        'bank_name',
        'account_number',
        'account_name',
        'account_type',
        'current_balance',
        'is_active',
      ];

      requiredFields.forEach((field) => {
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
          bank_name: this.form.bank_name.trim(),
          account_number: this.form.account_number.trim(),
          account_name: this.form.account_name.trim(),
          description: this.form.description.trim(),
          current_balance: parseFloat(this.form.current_balance),
        };

        let response;
        if (this.isEditing) {
          // Update existing account
          response = await this.$store.dispatch('accounting/updateBankAccount', {
            id: this.account.id,
            data: formData,
          });
        } else {
          // Create new account
          response = await this.$store.dispatch('accounting/createBankAccount', formData);
        }

        if (response && response.success) {
          this.$emit('saved', response.data);
        } else {
          throw new Error(response?.error || 'Failed to save bank account');
        }
      } catch (error) {
        console.error('Failed to save bank account:', error);
        this.$bvToast.toast(error.message || 'Failed to save bank account', {
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
.bank-account-form {
  padding: 0.5rem;
}

.form-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.form-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  .bank-account-form {
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
