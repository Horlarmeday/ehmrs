/**
 * Export Plugin for Vue.js
 * Provides global export functionality
 */
import exportService from '../services/export.service';

export default {
  install(Vue) {
    // Add export service to Vue prototype
    Vue.prototype.$export = exportService;

    // Add global export methods
    Vue.prototype.$exportToCSV = exportService.exportToCSV.bind(exportService);
    Vue.prototype.$exportToExcel = exportService.exportToExcel.bind(exportService);
    Vue.prototype.$exportToPDF = exportService.exportToPDF.bind(exportService);
    Vue.prototype.$exportToJSON = exportService.exportToJSON.bind(exportService);
    Vue.prototype.$exportReport = exportService.exportReport.bind(exportService);

    // Add export mixin
    Vue.mixin({
      methods: {
        // Export data with error handling
        async $exportData(data, filename, format = 'xlsx', options = {}) {
          try {
            this.$logUserAction('Export data', { filename, format, recordCount: data.length });

            switch (format) {
              case 'csv':
                this.$exportToCSV(data, filename, options);
                break;
              case 'xlsx':
                this.$exportToExcel(data, filename, options);
                break;
              case 'pdf':
                this.$exportToPDF(data, filename, options);
                break;
              case 'json':
                this.$exportToJSON(data, filename, options);
                break;
              default:
                throw new Error(`Unsupported format: ${format}`);
            }

            this.$toast.success(`Data exported successfully as ${format.toUpperCase()}`);
          } catch (error) {
            this.$logError('Export failed', error, { filename, format });
            this.$toast.error(`Export failed: ${error.message}`);
            throw error;
          }
        },

        // Export table data
        $exportTable(tableElement, filename, format = 'xlsx', options = {}) {
          try {
            this.$logUserAction('Export table', { filename, format });

            switch (format) {
              case 'csv':
                this.$export.exportTableToCSV(tableElement, filename, options);
                break;
              case 'xlsx':
                this.$export.exportTableToExcel(tableElement, filename, options);
                break;
              default:
                throw new Error(`Table export not supported for format: ${format}`);
            }

            this.$toast.success(`Table exported successfully as ${format.toUpperCase()}`);
          } catch (error) {
            this.$logError('Table export failed', error, { filename, format });
            this.$toast.error(`Table export failed: ${error.message}`);
            throw error;
          }
        },

        // Export chart data
        $exportChart(chartData, filename, format = 'xlsx', options = {}) {
          try {
            this.$logUserAction('Export chart', { filename, format });

            this.$export.exportChartData(chartData, filename, format, options);
            this.$toast.success(`Chart data exported successfully as ${format.toUpperCase()}`);
          } catch (error) {
            this.$logError('Chart export failed', error, { filename, format });
            this.$toast.error(`Chart export failed: ${error.message}`);
            throw error;
          }
        },

        // Export filtered data
        $exportFilteredData(data, filters, reportName, format = 'xlsx', options = {}) {
          try {
            this.$logUserAction('Export filtered data', { reportName, format, filters });

            this.$export.exportFilteredData(data, filters, reportName, format, options);
            this.$toast.success(`Filtered data exported successfully as ${format.toUpperCase()}`);
          } catch (error) {
            this.$logError('Filtered data export failed', error, { reportName, format });
            this.$toast.error(`Filtered data export failed: ${error.message}`);
            throw error;
          }
        },

        // Export multiple formats
        $exportMultipleFormats(data, reportName, formats = ['xlsx', 'pdf'], options = {}) {
          try {
            this.$logUserAction('Export multiple formats', { reportName, formats });

            const results = this.$export.exportReport(data, reportName, formats, options);

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (successCount > 0) {
              this.$toast.success(`Exported ${successCount} format(s) successfully`);
            }

            if (failCount > 0) {
              this.$toast.warning(`${failCount} format(s) failed to export`);
            }

            return results;
          } catch (error) {
            this.$logError('Multiple format export failed', error, { reportName, formats });
            this.$toast.error(`Multiple format export failed: ${error.message}`);
            throw error;
          }
        },

        // Get supported export formats
        $getSupportedFormats() {
          return this.$export.getSupportedFormats();
        },

        // Validate data for export
        $validateExportData(data) {
          try {
            return this.$export.validateData(data);
          } catch (error) {
            this.$logError('Export data validation failed', error);
            this.$toast.error(`Export data validation failed: ${error.message}`);
            return false;
          }
        },

        // Format data for export
        $formatDataForExport(data, formatters = {}) {
          return this.$export.formatDataForExport(data, formatters);
        },
      },
    });
  },
};

