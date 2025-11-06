<template>
  <div class="enhanced-approval-section">
    <!-- Tests Accordion -->
    <div class="tests-container">
      <DefaultSkeleton v-if="!results?.length" />

      <div v-else class="accordion" id="approvalAccordion">
        <div v-for="(test, i) in results" :key="test.prescribed_test_id" class="test-card">
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
                  :section="APPROVAL_SECTION"
                  :form-template-id="test.form_template_id"
                />
              </div>

              <!-- Approval Controls -->
              <div class="approval-controls">
                <label class="section-label">
                  <i class="fas fa-user-check mr-2"></i>
                  Approval Decision
                </label>
                <div class="approval-options">
                  <div class="approval-option approve-option" :class="{ active: test.test_status }">
                    <label class="checkbox-container">
                      <input
                        type="checkbox"
                        v-model="test.test_status"
                        class="checkbox-input"
                        v-b-tooltip.hover
                        title="Check to approve this result"
                      />
                      <span class="checkbox-custom"></span>
                      <span class="checkbox-label">
                        <i class="fas fa-check-circle mr-2"></i>
                        Approve Result
                      </span>
                    </label>
                  </div>
                  <div
                    class="approval-option reject-option"
                    :class="{ active: test.rejected_status }"
                  >
                    <label class="checkbox-container">
                      <input
                        type="checkbox"
                        v-model="test.rejected_status"
                        class="checkbox-input"
                        v-b-tooltip.hover
                        title="Check to reject this result"
                      />
                      <span class="checkbox-custom"></span>
                      <span class="checkbox-label">
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

    <!-- Validation Notes (Read-Only) -->
    <div v-if="result_notes" class="validation-notes-section">
      <label class="notes-label">
        <i class="fas fa-clipboard-list mr-2"></i>
        Validation Notes from Verifier
      </label>
      <div class="notes-display">
        <div class="notes-content">{{ result_notes }}</div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="submit-section">
      <button
        @click="approveTests"
        :disabled="shouldDisable"
        ref="kt-approveResult-submit"
        class="btn btn-lg submit-btn"
      >
        <i class="fas fa-check-double mr-2"></i>
        Submit Approval
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
  name: 'EnhancedResultApprovalSection',
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
    result_notes: {
      type: String,
      required: true,
    },
  },
  computed: {
    shouldDisable() {
      return this.results.every((result) => !result.result);
    },
  },
  data() {
    return {
      results: this.tests
        .filter((test) => test?.result?.status === 'Accepted')
        .map((test) => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          sample_name: test?.sample?.name,
          patient_id: this.patient_id,
          result: test?.result?.result,
          comments: test?.result?.comments,
          status: test?.result?.status,
          test_type: test?.test_type,
          is_urgent: test?.is_urgent,
          result_form: test?.test?.result_form,
          shouldDisable: test.status === 'Approved',
          test_status: test.status === 'Approved',
          rejected_status: test.result_status === 'Rejected',
          form_template_id: test?.test?.form_template_id,
        })),
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      DISABLED: 'disabledCard',
      APPROVAL_SECTION: 'ApprovalSection',
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
      this.$router.push(`/laboratory/test-result/${this.$route.params.id}`);
    },

    notifyToast(text) {
      this.$notify({
        group: 'foo',
        title: 'Error message',
        text,
        type: 'error',
      });
    },

    approveTests() {
      let results = this.results.filter(({ status }) => status === 'Accepted');

      // Validation: At least one must be approved or rejected
      if (results.every(({ test_status, rejected_status }) => !test_status && !rejected_status)) {
        return this.notifyToast('Approve or reject at least one result');
      }

      // Validation: Cannot approve AND reject the same result
      if (results.some(({ rejected_status, test_status }) => rejected_status && test_status)) {
        return this.notifyToast('You cannot approve and reject a result at the same time');
      }

      const submitButton = this.$refs['kt-approveResult-submit'];
      this.addSpinner(submitButton);

      // Map results for submission
      results = results.map(
        ({
          result_unit,
          test_type,
          shouldDisable,
          is_urgent,
          result_form,
          sample_name,
          payment_status,
          testStatus,
          rejected_status,
          form_template_id,
          ...rest
        }) => ({
          ...rest,
          status: rejected_status ? this.REJECTED : this.ACCEPTED,
        })
      );

      this.$store
        .dispatch('laboratory/approveTestResults', results)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },

    testResultData(data, testId) {
      const test = this.results.find((test) => test.prescribed_test_id === testId);
      this.$set(test, 'result', data);
    },

    getResultStatus(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Accepted') return 'label-success';
      if (status === 'Rejected') return 'label-danger';
      if (status === 'Approved') return 'label-info';
      return 'label-primary';
    },
  },
};
</script>

<style scoped>
.enhanced-approval-section {
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
  background: #e6f2ff;
  color: #0056b3;
  border: 1px solid #0056b3;
}

.label-primary {
  background: #e6e6fa;
  color: #000080;
  border: 1px solid #000080;
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

/* Approval Controls */
.approval-controls {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
  margin-top: 20px;
}

.approval-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.approval-option {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 2px solid #e4e6ef;
  transition: all 0.2s ease;
}

.approval-option:hover {
  border-color: #8b0000;
  box-shadow: 0 2px 8px rgba(139, 0, 0, 0.08);
}

.approve-option.active {
  background: #f0fff0;
  border-color: #006400;
}

.reject-option.active {
  background: #ffe6e6;
  border-color: #8b0000;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid #7e8299;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: #fff;
}

.checkbox-input:checked ~ .checkbox-custom {
  border-color: #8b0000;
  background: #8b0000;
}

.checkbox-input:checked ~ .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
}

.checkbox-label {
  font-size: 14px;
  font-weight: 600;
  color: #3f4254;
  display: flex;
  align-items: center;
}

.approve-option.active .checkbox-label {
  color: #006400;
}

.reject-option.active .checkbox-label {
  color: #8b0000;
}

.disabledCard {
  pointer-events: none;
  opacity: 0.5;
}

/* Validation Notes Section (Read-Only) */
.validation-notes-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #000080;
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
  color: #000080;
}

.notes-display {
  background: #f3f6f9;
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid #000080;
}

.notes-content {
  font-size: 14px;
  color: #3f4254;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
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

  .approval-options {
    grid-template-columns: 1fr;
  }

  .validation-notes-section {
    padding: 18px;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
