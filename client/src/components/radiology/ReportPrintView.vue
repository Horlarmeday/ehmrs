<template>
  <div class="report-print-view">
    <!-- Header -->
    <div class="report-header">
      <div class="hospital-logo">
        <!-- Add hospital logo here if available -->
        <div class="logo-placeholder">
          <i class="fas fa-hospital fa-3x"></i>
        </div>
      </div>
      <div class="hospital-info">
        <h2>{{ hospitalName }}</h2>
        <p>{{ hospitalAddress }}</p>
        <p>{{ hospitalContact }}</p>
      </div>
    </div>

    <div class="report-separator"></div>

    <!-- Report Title -->
    <div class="report-title-section">
      <h3>{{ reportTitle }}</h3>
      <p class="report-id">Report ID: #{{ reportId }}</p>
    </div>

    <!-- Patient Information -->
    <div class="section patient-info-section">
      <h4 class="section-title">Patient Information</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Patient Name:</span>
          <span class="value">{{ patient.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">Patient ID:</span>
          <span class="value">{{ patient.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">Date of Birth:</span>
          <span class="value">{{ formatDate(patient.date_of_birth) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Age/Gender:</span>
          <span class="value">{{ patient.age }} / {{ patient.gender }}</span>
        </div>
        <div v-if="patient.phone" class="info-item">
          <span class="label">Contact:</span>
          <span class="value">{{ patient.phone }}</span>
        </div>
        <div v-if="patient.address" class="info-item">
          <span class="label">Address:</span>
          <span class="value">{{ patient.address }}</span>
        </div>
      </div>
    </div>

    <!-- Investigation/Study Information -->
    <div class="section study-info-section">
      <h4 class="section-title">Study Information</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Study Date:</span>
          <span class="value">{{ formatDate(studyDate) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Modality:</span>
          <span class="value">{{ modality }}</span>
        </div>
        <div v-if="referringPhysician" class="info-item">
          <span class="label">Referring Physician:</span>
          <span class="value">{{ referringPhysician }}</span>
        </div>
        <div v-if="clinicalIndication" class="info-item full-width">
          <span class="label">Clinical Indication:</span>
          <span class="value">{{ clinicalIndication }}</span>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="section report-content-section">
      <h4 class="section-title">Report</h4>
      <div class="report-body" v-html="formatReportContent"></div>
    </div>

    <!-- Images Summary (if present) -->
    <div v-if="hasImages" class="section images-summary-section no-print">
      <h4 class="section-title">Attached Images</h4>
      <p>{{ imageCount }} image(s) attached to this report</p>
      <p class="text-muted small">Note: Images are not included in the printed version. Please use the digital report for full image access.</p>
    </div>

    <!-- Critical Findings Alert -->
    <div v-if="hasCriticalFindings" class="critical-findings-alert">
      <div class="alert-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="alert-content">
        <h5>⚠️ CRITICAL FINDINGS</h5>
        <p>This report contains critical findings that require immediate clinical attention.</p>
      </div>
    </div>

    <!-- Signature Section -->
    <div class="section signature-section">
      <div class="signature-grid">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p class="signature-label">Reported By</p>
          <p class="signature-name">{{ reportedBy || 'Radiologist' }}</p>
          <p class="signature-date">Date: {{ formatDate(reportedDate) }}</p>
        </div>
        <div v-if="approvedBy" class="signature-box">
          <div class="signature-line"></div>
          <p class="signature-label">Approved By</p>
          <p class="signature-name">{{ approvedBy }}</p>
          <p class="signature-date">Date: {{ formatDate(approvedDate) }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <div class="footer-content">
        <p class="footer-text">This is an official medical report. Unauthorized reproduction is prohibited.</p>
        <p class="footer-meta">
          <span>Printed on: {{ formatDate(new Date()) }}</span>
          <span class="ml-4">Page 1 of 1</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportPrintView',
  props: {
    reportId: {
      type: [String, Number],
      required: true,
    },
    reportTitle: {
      type: String,
      default: 'Radiology Investigation Report',
    },
    patient: {
      type: Object,
      required: true,
    },
    studyDate: {
      type: String,
      required: true,
    },
    modality: {
      type: String,
      default: 'Radiology',
    },
    referringPhysician: {
      type: String,
      default: '',
    },
    clinicalIndication: {
      type: String,
      default: '',
    },
    reportContent: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: String,
      default: '',
    },
    reportedDate: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: String,
      default: '',
    },
    approvedDate: {
      type: String,
      default: '',
    },
    hasCriticalFindings: {
      type: Boolean,
      default: false,
    },
    imageCount: {
      type: Number,
      default: 0,
    },
    hospitalName: {
      type: String,
      default: 'Medical Center',
    },
    hospitalAddress: {
      type: String,
      default: '',
    },
    hospitalContact: {
      type: String,
      default: '',
    },
  },
  computed: {
    formatReportContent() {
      // Convert line breaks to HTML
      return this.reportContent.replace(/\n/g, '<br>');
    },
    hasImages() {
      return this.imageCount > 0;
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },

    print() {
      window.print();
    },
  },
};
</script>

<style scoped>
.report-print-view {
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
  padding: 20mm;
  background: white;
  color: #000;
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 1.6;
}

.report-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.hospital-logo {
  margin-right: 20px;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #007bff;
}

.hospital-info h2 {
  margin: 0;
  font-size: 20pt;
  color: #2c3e50;
}

.hospital-info p {
  margin: 2px 0;
  font-size: 10pt;
  color: #666;
}

.report-separator {
  border-top: 3px solid #2c3e50;
  margin: 20px 0;
}

.report-title-section {
  text-align: center;
  margin-bottom: 30px;
}

.report-title-section h3 {
  margin: 0;
  font-size: 16pt;
  font-weight: bold;
  color: #2c3e50;
  text-transform: uppercase;
}

.report-id {
  margin: 5px 0 0;
  font-size: 10pt;
  color: #666;
}

.section {
  margin-bottom: 25px;
  page-break-inside: avoid;
}

.section-title {
  font-size: 13pt;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.info-item {
  display: flex;
  align-items: baseline;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
}

.info-item .label {
  font-weight: 600;
  color: #555;
  min-width: 140px;
}

.info-item .value {
  color: #000;
}

.report-body {
  line-height: 1.8;
  text-align: justify;
}

.images-summary-section {
  background: #f8f9fa;
  padding: 15px;
  border-left: 4px solid #007bff;
}

.critical-findings-alert {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 4px;
  margin-bottom: 25px;
  page-break-inside: avoid;
}

.alert-icon {
  font-size: 30pt;
  color: #ff6b6b;
  margin-right: 15px;
}

.alert-content h5 {
  margin: 0 0 5px;
  color: #d63031;
  font-size: 13pt;
}

.alert-content p {
  margin: 0;
  font-size: 11pt;
}

.signature-section {
  margin-top: 40px;
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.signature-box {
  text-align: center;
}

.signature-line {
  border-top: 2px solid #000;
  margin-bottom: 5px;
  margin-top: 60px;
}

.signature-label {
  font-size: 10pt;
  color: #666;
  margin: 0;
}

.signature-name {
  font-size: 12pt;
  font-weight: 600;
  margin: 5px 0;
}

.signature-date {
  font-size: 10pt;
  color: #666;
  margin: 0;
}

.report-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.footer-content {
  text-align: center;
}

.footer-text {
  font-size: 10pt;
  color: #666;
  margin-bottom: 5px;
}

.footer-meta {
  font-size: 9pt;
  color: #999;
}

/* Print Styles */
@media print {
  .report-print-view {
    padding: 0;
    max-width: 100%;
  }

  .no-print {
    display: none !important;
  }

  .section {
    page-break-inside: avoid;
  }

  .signature-section {
    page-break-before: avoid;
  }

  @page {
    margin: 20mm;
    size: A4;
  }
}

/* Screen View */
@media screen {
  .report-print-view {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
