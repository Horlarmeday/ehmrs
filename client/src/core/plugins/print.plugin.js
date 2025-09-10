/**
 * Print Plugin for Vue.js
 * Provides global print functionality
 */
import printService from '../services/print.service';

export default {
  install(Vue) {
    // Add print service to Vue prototype (for direct access if needed)
    Vue.prototype.$printService = printService;
    
    // Note: Print methods are provided through mixin below with enhanced error handling
    // Removed duplicate prototype methods to avoid conflicts

    // Add print mixin
    Vue.mixin({
      methods: {
        // Print element with error handling
        async $printElement(element, options = {}) {
          try {
            this.$logUserAction('Print element', { element: element.tagName });
            this.$printService.printElement(element, options);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print element failed', error, { element: element.tagName });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print table data
        async $printTable(data, options = {}) {
          try {
            this.$logUserAction('Print table', { recordCount: data.length });
            this.$printService.printTable(data, options);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print table failed', error, { recordCount: data.length });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print report
        async $printReport(data, reportConfig = {}) {
          try {
            this.$logUserAction('Print report', {
              reportName: reportConfig.title,
              recordCount: Array.isArray(data) ? data.length : 0,
            });
            this.$printService.printReport(data, reportConfig);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print report failed', error, { reportName: reportConfig.title });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print chart
        async $printChart(chartElement, options = {}) {
          try {
            this.$logUserAction('Print chart', { chartType: chartElement.tagName });
            this.$printService.printChart(chartElement, options);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print chart failed', error, { chartType: chartElement.tagName });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print multiple pages
        async $printMultiplePages(pages, options = {}) {
          try {
            this.$logUserAction('Print multiple pages', { pageCount: pages.length });
            this.$printService.printMultiplePages(pages, options);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print multiple pages failed', error, { pageCount: pages.length });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print with custom CSS
        async $printWithCSS(element, css = '', options = {}) {
          try {
            this.$logUserAction('Print with CSS', { element: element.tagName });
            this.$printService.printWithCSS(element, css, options);
            this.$toast.success('Print dialog opened');
          } catch (error) {
            this.$logError('Print with CSS failed', error, { element: element.tagName });
            this.$toast.error(`Print failed: ${error.message}`);
            throw error;
          }
        },

        // Print current page
        $printCurrentPage() {
          window.print();
        },

        // Print with custom options
        $printWithOptions(element, options = {}) {
          const defaultOptions = {
            title: this.$route?.meta?.title || 'Document',
            subtitle: new Date().toLocaleDateString(),
            date: new Date().toLocaleString(),
            orientation: 'portrait',
            format: 'a4',
          };

          const printOptions = { ...defaultOptions, ...options };
          this.$printElement(element, printOptions);
        },

        // Print table with formatting
        $printFormattedTable(data, tableConfig = {}) {
          const options = {
            title: tableConfig.title || 'Table Report',
            subtitle: tableConfig.subtitle || `Generated on ${new Date().toLocaleDateString()}`,
            orientation: tableConfig.orientation || 'landscape',
            ...tableConfig,
          };

          this.$printTable(data, options);
        },

        // Print report with header and footer
        $printFormattedReport(data, reportConfig = {}) {
          const options = {
            title: reportConfig.title || 'Report',
            subtitle: reportConfig.subtitle || `Generated on ${new Date().toLocaleDateString()}`,
            date: new Date().toLocaleString(),
            footer: reportConfig.footer || 'Generated by EHMRS System',
            ...reportConfig,
          };

          this.$printReport(data, options);
        },

        // Print chart with title
        $printFormattedChart(chartElement, chartConfig = {}) {
          const options = {
            title: chartConfig.title || 'Chart',
            subtitle: chartConfig.subtitle || `Generated on ${new Date().toLocaleDateString()}`,
            ...chartConfig,
          };

          this.$printChart(chartElement, options);
        },
      },
    });
  },
};


