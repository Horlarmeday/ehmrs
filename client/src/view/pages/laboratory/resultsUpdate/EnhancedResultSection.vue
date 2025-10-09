<template>
  <div class="enhanced-result-section">
    <!-- Tests Accordion -->
    <div class="tests-container">
      <DefaultSkeleton v-if="!tests?.length" />

      <div v-else class="accordion" id="enhancedAccordion">
        <div v-for="(test, i) in tests" :key="test.prescribed_test_id" class="test-card">
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
                <span
                  v-if="test.is_urgent"
                  class="urgent-indicator"
                  title="Urgent"
                  v-b-tooltip.hover
                >
                  <i class="fas fa-exclamation-circle text-warning"></i>
                </span>
                <span
                  v-if="test.status === REJECTED"
                  class="reject-indicator"
                  v-b-tooltip.hover
                  title="Result was rejected"
                >
                  <i class="flaticon2-warning text-warning icon-lg"></i>
                </span>
              </div>
              <i class="fas fa-chevron-down toggle-icon"></i>
            </button>
          </div>

          <!-- Test Content -->
          <b-collapse :visible="i === 0" :id="`collapse-${i}`">
            <div
              class="test-content"
              :class="
                test.payment_status === PENDING || test.test_status === APPROVED ? DISABLED : ''
              "
            >
              <!-- Result Form -->
              <div class="result-section">
                <label class="section-label">Result</label>
                <enhanced-result-form
                  @emitTestResult="testResultData"
                  :result-form="test?.result_form"
                  :result="test.result"
                  :test-id="test.prescribed_test_id"
                  :section="RESULT_SECTION"
                  :form-template-id="test.form_template_id"
                />
              </div>

              <!-- Referral Section -->
              <div class="referral-section">
                <div class="referral-header">
                  <label class="section-label">
                    <i class="fas fa-hospital mr-2"></i>
                    Referral Information
                  </label>
                  <div class="referral-toggle-switch">
                    <input
                      v-b-tooltip.hover
                      title="Enable if result is referred"
                      type="checkbox"
                      :id="`referral-toggle-${i}`"
                      :checked="!test.disabledReferral"
                      @change="toggleCheck($event, i)"
                    />
                    <label :for="`referral-toggle-${i}`" class="toggle-label">
                      Enable Referral
                    </label>
                  </div>
                </div>

                <div v-if="!test.disabledReferral" class="referral-fields">
                  <div class="row">
                    <div class="col-lg-6">
                      <label class="field-label">Referral Reason</label>
                      <input
                        v-model="test.referral_reason"
                        type="text"
                        placeholder="Enter reason for referral"
                        class="form-control"
                      />
                    </div>
                    <div class="col-lg-6">
                      <label class="field-label">Institute Referred</label>
                      <input
                        type="text"
                        v-model="test.institute_referred"
                        placeholder="Enter institute name"
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="footer-actions">
      <div class="tester-section">
        <label class="tester-label">Tester Name</label>
        <div class="tester-select">
          <select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="tester_id"
            v-model="tester_id"
            class="form-control"
            disabled
          >
            <option v-for="(staff, i) in staffs" :value="staff.id" :key="i">
              {{ staff.fullname }}
            </option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('tester_id') }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button
          :disabled="isDisabled"
          @click="addResult"
          ref="kt-addResult-submit"
          class="btn btn-lg btn-primary save-btn"
        >
          <i class="fas fa-save mr-2"></i>
          Save Results
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { getLabelDotStatus, parseJwt } from '@/common/common';
import EnhancedResultForm from './EnhancedResultForm.vue';

export default {
  name: 'EnhancedResultSection',
  components: { EnhancedResultForm, DefaultSkeleton },
  props: {
    prescriptions: {
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
  created() {
    this.fetchEmployees({ search: 'Laboratory' });
  },
  computed: {
    staffs() {
      return this.$store.state.employee.employees;
    },
  },
  data() {
    return {
      tests: this.prescriptions.map((test) => ({
        prescribed_test_id: test.id,
        test_prescription_id: this.$route.params.id,
        name: test.test.name,
        sample_name: test?.sample?.name,
        patient_id: this.patient_id,
        disabledReferral: true,
        result: test?.result?.result || {},
        valid_range: test?.test?.valid_range,
        institute_referred: test?.result?.institute_referred || '',
        referral_reason: test?.result?.referral_reason || '',
        comments: test?.result?.comments || '',
        status: test?.result?.status,
        payment_status: test?.payment_status,
        test_type: test?.test_type,
        is_urgent: test?.is_urgent,
        result_form: test?.test?.result_form,
        test_status: test?.status,
        form_template_id: test?.test?.form_template_id,
      })),
      tester_id:
        this.prescriptions[0]?.tester_id || parseJwt(localStorage.getItem('user_token'))?.sub,
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      DISABLED: 'disabledCard',
      RESULT_SECTION: 'ResultSection',
      APPROVED: 'Approved',
      currentUser: parseJwt(localStorage.getItem('user_token')),
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

    toggleCheck(event, index) {
      this.tests[index].disabledReferral = !event.target.checked;
    },

    addResult() {
      const results = this.tests
        .filter((test) => Object.values(test.result)?.length > 0)
        .map(
          ({
            result_unit,
            payment_status,
            test_type,
            is_urgent,
            result_form,
            sample_name,
            test_status,
            ...rest
          }) => rest
        );

      if (results.every(({ result }) => Object.values(result)?.length === 0)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Input at least one result',
          type: 'error',
        });
      }

      this.$validator.validateAll().then((result) => {
        if (result) {
          const submitButton = this.$refs['kt-addResult-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('laboratory/addTestResult', { results, tester_id: this.tester_id })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    testResultData(data, testId) {
      const test = this.tests.find((test) => test.prescribed_test_id === testId);
      this.$set(test, 'result', data);
    },

    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Paid') return 'label-success';
      if (status === 'Cleared') return 'label-info';
      return 'label-primary';
    },

    fetchEmployees({ currentPage = 1, itemsPerPage = 100, search }) {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
      });
    },
  },
};
</script>

<style scoped>
.enhanced-result-section {
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

.payment-badge .label {
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

.label-info {
  background: #e6e6fa;
  color: #000080;
  border: 1px solid #000080;
}

.urgent-indicator,
.reject-indicator {
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

/* Referral Section */
.referral-section {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 2px solid #e4e6ef;
  border-left: 4px solid #8b0000;
  margin-top: 20px;
  transition: all 0.2s ease;
}

.referral-section:hover {
  border-color: #8b0000;
  box-shadow: 0 2px 8px rgba(139, 0, 0, 0.08);
}

.referral-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e6ef;
}

.referral-toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.referral-toggle-switch input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #8b0000;
}

.toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: #7e8299;
  margin: 0;
  cursor: pointer;
  user-select: none;
}

.referral-fields {
  animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 8px;
  display: block;
}

.referral-fields .form-control {
  border: 2px solid #e4e6ef;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  color: #181c32;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.referral-fields .form-control:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
  background: #fffafa;
}

.referral-fields .form-control::placeholder {
  color: #b5b5c3;
  font-size: 13px;
}

.disabledCard {
  pointer-events: none;
  opacity: 0.5;
}

.footer-actions {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  border-top: 3px solid #8b0000;
}

.tester-section {
  flex: 0 0 400px;
}

.tester-label {
  font-size: 14px;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 10px;
  display: block;
}

.tester-select select {
  border: 2px solid #e4e6ef;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #181c32;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tester-select select:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(139, 0, 0, 0.35);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

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

  .referral-section {
    padding: 16px;
  }

  .referral-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .referral-toggle-switch {
    width: 100%;
    justify-content: flex-start;
  }

  .referral-fields .row {
    margin: 0;
  }

  .referral-fields .row > div {
    padding: 0;
    margin-bottom: 12px;
  }

  .footer-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }

  .tester-section {
    flex: 1;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
