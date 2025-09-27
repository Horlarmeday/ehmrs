<template>
  <div class="certificate-verification">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Certificate Verification</h4>
        <p class="text-muted mb-0">Verify the authenticity of death certificates</p>
      </div>
      <div>
        <b-button variant="primary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i>
          Refresh
        </b-button>
      </div>
    </div>

    <!-- Verification Form -->
    <b-card class="mb-4">
      <b-card-header>
        <h6 class="mb-0">Verify Certificate</h6>
      </b-card-header>
      <b-card-body>
        <b-row>
          <b-col md="8">
            <label>Certificate ID</label>
            <b-input-group>
              <b-form-input
                v-model="certificateId"
                placeholder="Enter certificate ID (e.g., DC-123-1234567890)"
                @keyup.enter="verifyCertificateAction"
              ></b-form-input>
              <b-input-group-append>
                <b-button
                  variant="primary"
                  @click="verifyCertificateAction"
                  :disabled="!certificateId || loading"
                >
                  <i class="fas fa-search mr-1"></i>
                  Verify
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col md="4">
            <label>Quick Status Check</label>
            <b-button
              variant="outline-info"
              @click="checkStatus"
              :disabled="!certificateId || loading"
              block
            >
              <i class="fas fa-info-circle mr-1"></i>
              Check Status
            </b-button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-3"></b-spinner>
      <p>Verifying certificate...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Verification Results -->
    <div v-else-if="verificationResult">
      <b-card>
        <b-card-header>
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Verification Results</h6>
            <b-badge
              :variant="getStatusVariant(verificationResult.verificationStatus)"
              class="text-uppercase"
            >
              {{ verificationResult.verificationStatus }}
            </b-badge>
          </div>
        </b-card-header>
        <b-card-body>
          <!-- Certificate Information -->
          <b-row class="mb-4">
            <b-col md="6">
              <h6 class="text-primary mb-3">Certificate Information</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Certificate ID:</strong></td>
                    <td>{{ verificationResult.certificateId }}</td>
                  </tr>
                  <tr>
                    <td><strong>Patient Name:</strong></td>
                    <td>{{ verificationResult.patientName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Patient ID:</strong></td>
                    <td>{{ verificationResult.patientId }}</td>
                  </tr>
                  <tr>
                    <td><strong>Hospital ID:</strong></td>
                    <td>{{ verificationResult.hospitalId }}</td>
                  </tr>
                  <tr>
                    <td><strong>Date of Death:</strong></td>
                    <td>{{ formatDate(verificationResult.dateOfDeath) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Cause of Death:</strong></td>
                    <td>{{ verificationResult.causeOfDeath || 'Not specified' }}</td>
                  </tr>
                </tbody>
              </table>
            </b-col>
            <b-col md="6">
              <h6 class="text-info mb-3">Signature Information</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Signed By:</strong></td>
                    <td>Staff ID {{ verificationResult.signedBy }}</td>
                  </tr>
                  <tr>
                    <td><strong>Signature Date:</strong></td>
                    <td>{{ formatDate(verificationResult.signatureTimestamp) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Algorithm:</strong></td>
                    <td>{{ verificationResult.signatureAlgorithm }}</td>
                  </tr>
                  <tr>
                    <td><strong>Signature Valid:</strong></td>
                    <td>
                      <b-badge :variant="verificationResult.signatureValid ? 'success' : 'danger'">
                        {{ verificationResult.signatureValid ? 'Valid' : 'Invalid' }}
                      </b-badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Generated At:</strong></td>
                    <td>{{ formatDate(verificationResult.generatedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>

          <!-- Certificate Hash -->
          <div class="mb-4">
            <h6 class="text-warning mb-3">Certificate Hash</h6>
            <div class="bg-light p-3 rounded">
              <code class="text-break">{{ verificationResult.certificateHash }}</code>
            </div>
            <small class="text-muted">This hash can be used to verify certificate integrity</small>
          </div>

          <!-- Verification Summary -->
          <div class="alert" :class="getAlertClass(verificationResult.verificationStatus)">
            <h6 class="mb-2">
              <i :class="getStatusIcon(verificationResult.verificationStatus)" class="mr-2"></i>
              Verification Summary
            </h6>
            <p class="mb-0">{{ getVerificationMessage(verificationResult) }}</p>
          </div>

          <!-- Actions -->
          <div class="text-right">
            <b-button
              variant="outline-primary"
              @click="downloadCertificate"
              :disabled="!verificationResult.signatureValid"
              class="mr-2"
            >
              <i class="fas fa-download mr-1"></i>
              Download Certificate
            </b-button>
            <b-button variant="outline-info" @click="printVerification">
              <i class="fas fa-print mr-1"></i>
              Print Verification
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </div>

    <!-- All Signatures Table -->
    <b-card v-if="allSignatures.length > 0">
      <b-card-header>
        <h6 class="mb-0">All Certificate Signatures</h6>
      </b-card-header>
      <b-card-body>
        <b-table
          :items="allSignatures"
          :fields="signatureFields"
          striped
          hover
          responsive
          :per-page="10"
          :current-page="currentPage"
        >
          <template #cell(timestamp)="row">
            {{ formatDate(row.item.timestamp) }}
          </template>
          <template #cell(actions)="row">
            <b-button-group size="sm">
              <b-button
                variant="outline-primary"
                @click="verifySpecificCertificate(row.item.certificateId)"
                title="Verify Certificate"
              >
                <i class="fas fa-search"></i>
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <b-pagination
          v-model="currentPage"
          :total-rows="allSignatures.length"
          :per-page="10"
          class="mt-3"
        ></b-pagination>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'CertificateVerification',
  data() {
    return {
      loading: false,
      error: null,
      certificateId: '',
      verificationResult: null,
      allSignatures: [],
      currentPage: 1,
      signatureFields: [
        { key: 'certificateId', label: 'Certificate ID', sortable: true },
        { key: 'patientId', label: 'Patient ID', sortable: true },
        { key: 'signedBy', label: 'Signed By', sortable: true },
        { key: 'timestamp', label: 'Signature Date', sortable: true },
        { key: 'algorithm', label: 'Algorithm', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
      ],
    };
  },
  async mounted() {
    await this.loadAllSignatures();
  },
  methods: {
    ...mapActions('patient', ['verifyCertificate', 'getCertificateStatus', 'getAllSignatures']),

    async verifyCertificateAction() {
      if (!this.certificateId.trim()) {
        this.error = 'Please enter a certificate ID';
        return;
      }

      this.loading = true;
      this.error = null;
      this.verificationResult = null;

      try {
        const response = await this.verifyCertificate(this.certificateId);
        this.verificationResult = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to verify certificate';
        console.error('Certificate verification error:', error);
      } finally {
        this.loading = false;
      }
    },

    async checkStatus() {
      if (!this.certificateId.trim()) {
        this.error = 'Please enter a certificate ID';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await this.getCertificateStatus(this.certificateId);
        this.verificationResult = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check certificate status';
        console.error('Certificate status check error:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadAllSignatures() {
      try {
        const response = await this.getAllSignatures();
        this.allSignatures = response?.data?.data?.signatures || response?.data?.signatures || [];
      } catch (error) {
        console.error('Failed to load signatures:', error);
        this.allSignatures = [];
      }
    },

    async refreshData() {
      await this.loadAllSignatures();
    },

    async verifySpecificCertificate(certificateId) {
      this.certificateId = certificateId;
      await this.verifyCertificateAction();
    },

    downloadCertificate() {
      if (this.verificationResult && this.verificationResult.patientId) {
        const url = `/api/patients/death-certificate-pdf/${this.verificationResult.patientId}?digital_signature=true`;
        window.open(url, '_blank');
      }
    },

    printVerification() {
      window.print();
    },

    getStatusVariant(status) {
      const variants = {
        VERIFIED: 'success',
        INVALID: 'danger',
        NOT_FOUND: 'warning',
        PATIENT_NOT_FOUND: 'warning',
      };
      return variants[status] || 'secondary';
    },

    getStatusIcon(status) {
      const icons = {
        VERIFIED: 'fas fa-check-circle text-success',
        INVALID: 'fas fa-times-circle text-danger',
        NOT_FOUND: 'fas fa-question-circle text-warning',
        PATIENT_NOT_FOUND: 'fas fa-user-times text-warning',
      };
      return icons[status] || 'fas fa-info-circle text-info';
    },

    getAlertClass(status) {
      const classes = {
        VERIFIED: 'alert-success',
        INVALID: 'alert-danger',
        NOT_FOUND: 'alert-warning',
        PATIENT_NOT_FOUND: 'alert-warning',
      };
      return classes[status] || 'alert-info';
    },

    getVerificationMessage(result) {
      if (result.verificationStatus === 'VERIFIED') {
        return 'This certificate is authentic and has been verified. The digital signature is valid and the certificate has not been tampered with.';
      } else if (result.verificationStatus === 'INVALID') {
        return 'This certificate signature is invalid. The certificate may have been tampered with or the signature is corrupted.';
      } else if (result.verificationStatus === 'NOT_FOUND') {
        return 'Certificate signature not found. This certificate may not have been digitally signed or the signature data is missing.';
      } else if (result.verificationStatus === 'PATIENT_NOT_FOUND') {
        return 'Patient not found. The certificate references a patient that no longer exists in the system.';
      }
      return 'Certificate verification completed.';
    },

    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>

<style scoped>
.certificate-verification {
  padding: 20px;
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.badge {
  font-size: 0.75em;
}

.table td {
  border-top: none;
  padding: 0.5rem 0.75rem;
}

.table td:first-child {
  width: 40%;
}

code {
  font-size: 0.875em;
  word-break: break-all;
}

@media print {
  .btn,
  .input-group,
  .pagination {
    display: none !important;
  }
}
</style>
