<template>
  <div class="enhanced-result-display">
    <!-- Tests Display -->
    <div class="tests-container">
      <div v-for="test in results" :key="test.prescribed_test_id" class="test-card">
        <!-- Test Header -->
        <div class="test-header">
          <div class="test-info">
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
              Sample: {{ test?.sample_name }}
            </span>
            <span v-if="test.is_urgent" class="urgent-badge" title="Urgent" v-b-tooltip.hover>
              <i class="fas fa-exclamation-circle mr-1"></i>
              URGENT
            </span>
          </div>
        </div>

        <!-- Test Content (Result Display) -->
        <div class="test-content">
          <enhanced-result-form
            :result-form="test?.result_form"
            :result="test.result"
            :test-id="test.prescribed_test_id"
            :section="DISPLAY_SECTION"
            :form-template-id="test.form_template_id"
          />
        </div>
      </div>
    </div>

    <!-- Validation Notes (Read-Only) -->
    <div v-if="result_notes" class="validation-notes-section">
      <label class="section-label">
        <i class="fas fa-clipboard-list mr-2"></i>
        Validation Notes
      </label>
      <div class="notes-display">
        <div class="notes-content">{{ result_notes }}</div>
      </div>
    </div>

    <!-- Audit Trail Section -->
    <div v-if="test_verifier && test_approver" class="audit-trail-section">
      <label class="section-label">
        <i class="fas fa-history mr-2"></i>
        Test Audit Trail
      </label>
      <div class="audit-trail-table">
        <table class="audit-table">
          <thead>
            <tr>
              <th class="role-column">ROLE</th>
              <th class="name-column">NAME</th>
              <th class="date-column">DATE & TIME</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sample_collector" class="audit-row">
              <td class="role-cell">
                <span class="role-badge collector">
                  <i class="fas fa-hand-holding-medical mr-1"></i>
                  Sample Collector
                </span>
              </td>
              <td class="name-cell">{{ sample_collector?.fullname }}</td>
              <td class="date-cell">
                {{ date_sample_collected | dayjs('MMMM D, YYYY, h:mm A') }}
              </td>
            </tr>
            <tr v-if="tester" class="audit-row">
              <td class="role-cell">
                <span class="role-badge tester">
                  <i class="fas fa-microscope mr-1"></i>
                  Tester
                </span>
              </td>
              <td class="name-cell">{{ tester }}</td>
              <td class="date-cell">
                {{ test_conducted_date | dayjs('MMMM D, YYYY, h:mm A') }}
              </td>
            </tr>
            <tr class="audit-row">
              <td class="role-cell">
                <span class="role-badge verifier">
                  <i class="fas fa-user-check mr-1"></i>
                  Test Verifier
                </span>
              </td>
              <td class="name-cell">{{ test_verifier }}</td>
              <td class="date-cell">
                {{ test_verified_date | dayjs('MMMM D, YYYY, h:mm A') }}
              </td>
            </tr>
            <tr class="audit-row">
              <td class="role-cell">
                <span class="role-badge approver">
                  <i class="fas fa-user-md mr-1"></i>
                  Test Approver
                </span>
              </td>
              <td class="name-cell">{{ test_approver }}</td>
              <td class="date-cell">
                {{ test_approved_date | dayjs('MMMM D, YYYY, h:mm A') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Download Button -->
    <div class="download-section" v-if="allowedDepartments.includes(currentUser.department)">
      <button
        @click="downloadTestResult"
        ref="kt-downloadResult-submit"
        class="btn btn-lg download-btn"
      >
        <i class="fas fa-download mr-2"></i>
        Download Test Result
      </button>
    </div>
  </div>
</template>

<script>
import { getLabelDotStatus, parseJwt } from '@/common/common';
import EnhancedResultForm from './EnhancedResultForm.vue';

export default {
  name: 'EnhancedTestResultSection',
  components: { EnhancedResultForm },
  props: {
    tests: {
      type: Array,
      required: true,
    },
    accession_number: {
      type: String,
      required: true,
    },
    result_notes: {
      type: String,
      required: false,
    },
    date_sample_collected: {
      type: String,
      required: false,
    },
    sample_collector: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      results: this.tests.map((test) => ({
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
        form_template_id: test?.test?.form_template_id,
      })),
      DISPLAY_SECTION: 'ApprovalSection',
      test_verifier: this.tests?.[0]?.test_verifier?.fullname,
      test_approver: this.tests?.[0]?.test_approver?.fullname,
      tester: this.tests?.[0]?.tester?.fullname,
      test_approved_date: this.tests?.[0]?.test_approved_date,
      test_verified_date: this.tests?.[0]?.test_verified_date,
      test_conducted_date: this.tests?.[0]?.test_conducted_date,
      allowedDepartments: ['Administrator', 'Laboratory'],
      currentUser: parseJwt(localStorage.getItem('user_token')),
      isDisabled: false,
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
    },

    downloadTestResult() {
      const submitButton = this.$refs['kt-downloadResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('laboratory/downloadTestResult', { id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },
  },
};
</script>

<style scoped>
.enhanced-result-display {
  width: 100%;
}

.tests-container {
  margin-bottom: 32px;
}

.test-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
}

.test-header {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  padding: 18px 24px;
  border-bottom: 1px solid #e4e6ef;
}

.test-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.test-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
}

.sample-type {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

.urgent-badge {
  background: #ffc107;
  color: #000;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  animation: pulse-urgent 2s ease-in-out infinite;
}

@keyframes pulse-urgent {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.test-content {
  padding: 24px;
  background: #fafbfc;
}

/* Validation Notes Section */
.validation-notes-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #000080;
}

.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.validation-notes-section .section-label i {
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

/* Audit Trail Section */
.audit-trail-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
}

.audit-trail-section .section-label i {
  color: #8b0000;
}

.audit-trail-table {
  overflow-x: auto;
  margin-top: 16px;
}

.audit-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.audit-table thead {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
}

.audit-table thead th {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  text-align: left;
  border-bottom: 2px solid #8b0000;
}

.role-column {
  width: 35%;
}

.name-column {
  width: 30%;
}

.date-column {
  width: 35%;
}

.audit-row {
  border-bottom: 1px solid #e4e6ef;
  transition: all 0.2s ease;
}

.audit-row:hover {
  background: #f8f9fa;
}

.audit-row:last-child {
  border-bottom: none;
}

.audit-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #3f4254;
}

.role-cell {
  font-weight: 500;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.role-badge.collector {
  background: #e6f2ff;
  color: #0056b3;
}

.role-badge.tester {
  background: #fff3e0;
  color: #e65100;
}

.role-badge.verifier {
  background: #f0fff0;
  color: #006400;
}

.role-badge.approver {
  background: #f3e5f5;
  color: #6a1b9a;
}

.name-cell {
  font-weight: 500;
  color: #181c32;
}

.date-cell {
  color: #7e8299;
  font-family: monospace;
  font-size: 13px;
}

/* Download Section */
.download-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.download-btn {
  padding: 14px 40px;
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

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(139, 0, 0, 0.35);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Print Styles */
@media print {
  .download-section {
    display: none;
  }

  .test-card,
  .validation-notes-section,
  .audit-trail-section {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }

  .test-header {
    background: #f8f9fa !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
  }

  .test-name,
  .sample-type {
    color: #000 !important;
  }
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

  .test-header {
    padding: 16px 18px;
  }

  .test-content {
    padding: 18px;
  }

  .audit-trail-section,
  .validation-notes-section {
    padding: 18px;
  }

  .audit-table thead th {
    font-size: 11px;
    padding: 10px 12px;
  }

  .audit-table td {
    font-size: 13px;
    padding: 10px 12px;
  }

  .role-badge {
    font-size: 11px;
    padding: 4px 8px;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
