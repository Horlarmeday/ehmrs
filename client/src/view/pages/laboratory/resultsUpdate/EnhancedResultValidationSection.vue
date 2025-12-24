<template>
  <div class="enhanced-validation-section">
    <!-- Tests Accordion -->
    <div class="tests-container">
      <DefaultSkeleton v-if="!results?.length" />

      <div v-else class="accordion" id="validationAccordion">
        <div v-for="(test, i) in sortedResults" :key="test.prescribed_test_id" class="test-card">
          <!-- Test Header -->
          <div class="test-header" :id="`heading-${i}`">
            <button class="test-header-btn" type="button" v-b-toggle="`collapse-${i}`">
              <div class="test-info">
                <span class="lab-number">
                  <i class="fas fa-flask mr-2"></i>
                  Lab No.: <strong>{{ accession_number }}{{ `-${i + 1}` }}</strong>
                </span>
                <span class="test-name">
                  <span
                    :title="`${test.test_type}`"
                    v-b-tooltip.hover
                    :class="getLabelDotStatus(test.test_type)"
                    class="label label-dot label-lg mr-2"
                  ></span>
                  {{ test?.name }}
                </span>
                <span class="sample-type">
                  <i class="fas fa-vial mr-1"></i>
                  {{ test?.sample_name }}
                </span>
                <span class="payment-badge">
                  <span
                    :class="getPaymentStatus(test?.payment_status)"
                    class="label label-md label-inline"
                  >
                    {{ test?.payment_status }}
                  </span>
                </span>
                <span class="status-badge">
                  <span :class="getResultStatus(test?.status)" class="label label-md label-inline">
                    {{ test?.status }}
                  </span>
                </span>
                <span
                  v-if="test.is_urgent"
                  class="urgent-indicator"
                  title="Urgent"
                  v-b-tooltip.hover
                >
                  <i class="fas fa-exclamation-circle text-warning"></i>
                </span>
              </div>
              <i class="fas fa-chevron-down toggle-icon"></i>
            </button>
          </div>

          <!-- Test Content -->
          <b-collapse :visible="i === 0" :id="`collapse-${i}`">
            <div class="test-content" :class="test.shouldDisable ? DISABLED : ''">
              <!-- Result Display -->
              <div class="result-section">
                <label class="section-label">
                  <i class="fas fa-clipboard-check mr-2"></i>
                  Result
                </label>
                <enhanced-result-form
                  @emitTestResult="testResultData"
                  :result-form="test?.result_form"
                  :result="test.result"
                  :test-id="test.prescribed_test_id"
                  :section="VALIDATION_SECTION"
                  :form-template-id="test.form_template_id"
                />
              </div>

              <!-- Validation Controls -->
              <div class="validation-controls">
                <label class="section-label">
                  <i class="fas fa-check-double mr-2"></i>
                  Validation Decision
                </label>
                <div class="validation-options">
                  <div class="validation-option accept-option">
                    <label class="radio-container">
                      <input
                        type="radio"
                        v-model="test.status"
                        :value="ACCEPTED"
                        class="radio-input"
                      />
                      <span class="radio-custom"></span>
                      <span class="radio-label">
                        <i class="fas fa-check-circle mr-2"></i>
                        Accept Result
                      </span>
                    </label>
                  </div>
                  <div class="validation-option reject-option">
                    <label class="radio-container">
                      <input
                        type="radio"
                        v-model="test.status"
                        :value="REJECTED"
                        class="radio-input"
                      />
                      <span class="radio-custom"></span>
                      <span class="radio-label">
                        <i class="fas fa-times-circle mr-2"></i>
                        Reject Result
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>

    <!-- Result Notes -->
    <div class="notes-section">
      <label class="notes-label">
        <i class="fas fa-comment-medical mr-2"></i>
        Lab Result Notes
      </label>
      <textarea
        name="notes"
        v-model="result_notes"
        class="notes-textarea"
        placeholder="Enter any notes or observations about the validation..."
        rows="5"
      />
    </div>

    <!-- Submit Button -->
    <div class="submit-section">
      <button
        @click="validateTests"
        :disabled="shouldDisable"
        ref="kt-validateResult-submit"
        class="btn btn-lg submit-btn"
      >
        <i class="fas fa-paper-plane mr-2"></i>
        Submit Validation
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { getLabelDotStatus } from '@/common/common';
import EnhancedResultForm from './EnhancedResultForm.vue';

export default {
  name: 'EnhancedResultValidationSection',
  components: { EnhancedResultForm, DefaultSkeleton },
  props: {
    tests: {
      type: Array,
      required: true,
    },
    accession_number: {
      type: String,
      required: true,
    },
    patient_id: {
      type: Number,
      required: true,
    },
  },
  computed: {
    shouldDisable() {
      return this.results.every((result) => !result.result);
    },
    sortedResults() {
      return [...this.results].sort((a, b) => {
        const aIsPending = a.testStatus === this.RESULT_ADDED;
        const bIsPending = b.testStatus === this.RESULT_ADDED;
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;
        return 0; // Maintain original order within same status group
      });
    },
  },
  data() {
    return {
      results: this.tests
        .filter((test) => test?.result)
        .map((test) => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          sample_name: test?.sample?.name,
          patient_id: this.patient_id,
          result: test?.result?.result || {},
          comments: test?.result?.comments || '',
          status: test?.result?.status,
          payment_status: test?.payment_status,
          test_type: test?.test_type,
          is_urgent: test?.is_urgent,
          result_form: test?.test?.result_form,
          testStatus: test.status,
          shouldDisable: !test?.result?.result || test.status === 'Approved',
          form_template_id: test?.test?.form_template_id,
        })),
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      RESULT_ADDED: 'Result Added',
      DISABLED: 'disabledCard',
      VALIDATION_SECTION: 'ValidationSection',
      result_notes: '',
    };
  },
  methods: {
    getLabelDotStatus,
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.$router.push(`/laboratory/result-approval/${this.$route.params.id}`);
    },

    validateTests() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          const results = this.results
            .filter(
              ({ result, testStatus }) =>
                Object.values(result)?.length && testStatus !== this.APPROVED
            )
            .map(
              ({
                result_unit,
                test_type,
                shouldDisable,
                is_urgent,
                result_form,
                sample_name,
                payment_status,
                form_template_id,
                ...rest
              }) => rest
            );

          if (!results?.length || results.every((result) => result.status === this.PENDING)) {
            return this.$notify({
              group: 'foo',
              title: 'Error message',
              text: 'Validate at least one result',
              type: 'error',
            });
          }
          const submitButton = this.$refs['kt-validateResult-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('laboratory/validateTestResults', {
              result_notes: this.result_notes,
              results,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    testResultData(data, testId) {
      const test = this.results.find((test) => test.prescribed_test_id === testId);
      this.$set(test, 'result', data);
    },

    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Paid') return 'label-success';
      if (status === 'Cleared') return 'label-info';
      return 'label-primary';
    },

    getResultStatus(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Accepted') return 'label-success';
      if (status === 'Rejected') return 'label-danger';
      return 'label-primary';
    },
  },
};
</script>

<style scoped>
.enhanced-validation-section {
  width: 100%;
}

.tests-container {
  margin-bottom: 32px;
}

.test-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;
  overflow: hidden;
  transition: all 0.15s ease;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
}

.test-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left-width: 6px;
}

.test-header {
  background: #fff;
}

.test-header-btn {
  width: 100%;
  padding: 18px 24px;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-header-btn:hover {
  background: #f3f6f9;
}

.test-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.lab-number {
  font-size: 13px;
  color: #7e8299;
  background: #e6e6fa;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-family: monospace;
}

.lab-number strong {
  color: #000080;
}

.test-name {
  font-size: 15px;
  font-weight: 600;
  color: #181c32;
  display: flex;
  align-items: center;
}

.sample-type {
  font-size: 14px;
  color: #7e8299;
  display: flex;
  align-items: center;
}

.payment-badge .label,
.status-badge .label {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.label-success {
  background: #f0fff0;
  color: #006400;
  border: 1px solid #006400;
}

.label-warning {
  background: #fff5ee;
  color: #cd5c5c;
  border: 1px solid #cd5c5c;
}

.label-danger {
  background: #ffe6e6;
  color: #8b0000;
  border: 1px solid #8b0000;
}

.label-info {
  background: #e6e6fa;
  color: #000080;
  border: 1px solid #000080;
}

.label-primary {
  background: #e6f2ff;
  color: #0056b3;
  border: 1px solid #0056b3;
}

.urgent-indicator {
  font-size: 18px;
}

.toggle-icon {
  color: #8b0000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
}

.test-card .collapsed .toggle-icon {
  transform: rotate(-180deg);
}

.test-content {
  padding: 24px;
  background: #fafbfc;
  border-top: 1px solid #e4e6ef;
}

.result-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.section-label i {
  color: #8b0000;
}

/* Validation Controls */
.validation-controls {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
  margin-top: 20px;
}

.validation-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.validation-option {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 2px solid #e4e6ef;
  transition: all 0.2s ease;
}

.validation-option:hover {
  border-color: #8b0000;
  box-shadow: 0 2px 8px rgba(139, 0, 0, 0.08);
}

.accept-option:has(.radio-input:checked) {
  background: #f0fff0;
  border-color: #006400;
}

.reject-option:has(.radio-input:checked) {
  background: #ffe6e6;
  border-color: #8b0000;
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
  user-select: none;
}

.radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  width: 22px;
  height: 22px;
  border: 2px solid #7e8299;
  border-radius: 50%;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.radio-input:checked ~ .radio-custom {
  border-color: #8b0000;
  background: #8b0000;
}

.radio-input:checked ~ .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-label {
  font-size: 14px;
  font-weight: 600;
  color: #3f4254;
  display: flex;
  align-items: center;
}

.accept-option .radio-input:checked ~ .radio-label {
  color: #006400;
}

.reject-option .radio-input:checked ~ .radio-label {
  color: #8b0000;
}

.disabledCard {
  pointer-events: none;
  opacity: 0.5;
}

/* Notes Section */
.notes-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
}

.notes-label {
  font-size: 14px;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.notes-label i {
  color: #8b0000;
}

.notes-textarea {
  width: 100%;
  border: 2px solid #e4e6ef;
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  color: #181c32;
  resize: vertical;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.notes-textarea:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
  background: #fffafa;
}

.notes-textarea::placeholder {
  color: #b5b5c3;
  font-size: 13px;
}

/* Submit Section */
.submit-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.submit-btn {
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(139, 0, 0, 0.35);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .test-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .test-card {
    border-radius: 10px;
  }

  .test-header-btn {
    padding: 16px 18px;
  }

  .test-content {
    padding: 18px;
  }

  .validation-options {
    grid-template-columns: 1fr;
  }

  .notes-section {
    padding: 18px;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
