<template>
  <div class="dropdown">
    <button
      class="btn btn-primary dropdown-toggle"
      type="button"
      id="exportDropdown"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
      :disabled="loading"
    >
      <i class="fas fa-download mr-2"></i>
      <span v-if="loading">
        <div class="spinner-border spinner-border-sm mr-2" role="status"></div>
        Exporting...
      </span>
      <span v-else>Export</span>
    </button>
    <div class="dropdown-menu" aria-labelledby="exportDropdown">
      <h6 class="dropdown-header">Export Format</h6>
      <button 
        class="dropdown-item" 
        @click="exportData('csv')"
        :disabled="loading"
      >
        <i class="fas fa-file-csv mr-2 text-success"></i>
        Export as CSV
      </button>
      <button 
        class="dropdown-item" 
        @click="exportData('pdf')"
        :disabled="loading"
      >
        <i class="fas fa-file-pdf mr-2 text-danger"></i>
        Export as PDF
      </button>
      <button 
        class="dropdown-item" 
        @click="exportData('excel')"
        :disabled="loading"
      >
        <i class="fas fa-file-excel mr-2 text-primary"></i>
        Export as Excel
      </button>
      <div class="dropdown-divider"></div>
      <h6 class="dropdown-header">Report Type</h6>
      <button 
        v-for="report in reports" 
        :key="report.type"
        class="dropdown-item"
        @click="exportSpecificReport(report.type)"
        :disabled="loading"
      >
        <i class="fas fa-chart-bar mr-2 text-info"></i>
        {{ report.name }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from '@/axios';

export default {
  name: 'ExportButton',
  props: {
    reports: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async exportData(format) {
      this.loading = true;
      try {
        const response = await axios.get('/store/reports/export', {
          params: {
            format,
            ...this.filters,
          },
          responseType: 'blob',
        });

        this.downloadFile(response.data, `pharmacy-reports.${format}`, format);
        this.$toast.success(`Report exported successfully as ${format.toUpperCase()}`);
      } catch (error) {
        console.error('Export error:', error);
        this.$toast.error('Failed to export report');
      } finally {
        this.loading = false;
      }
    },
    async exportSpecificReport(reportType) {
      this.loading = true;
      try {
        const response = await axios.get(`/store/reports/${reportType}/export`, {
          params: this.filters,
          responseType: 'blob',
        });

        const reportName = this.reports.find(r => r.type === reportType)?.name || reportType;
        this.downloadFile(response.data, `${reportType}-report.csv`, 'csv');
        this.$toast.success(`${reportName} exported successfully`);
      } catch (error) {
        console.error('Export error:', error);
        this.$toast.error('Failed to export report');
      } finally {
        this.loading = false;
      }
    },
    downloadFile(data, filename, format) {
      const blob = new Blob([data], {
        type: this.getMimeType(format),
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    getMimeType(format) {
      const mimeTypes = {
        csv: 'text/csv',
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      return mimeTypes[format] || 'application/octet-stream';
    },
  },
};
</script>

<style scoped>
.dropdown-menu {
  min-width: 200px;
}

.dropdown-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}
</style>