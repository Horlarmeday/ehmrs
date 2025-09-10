/**
 * Export Service
 * Provides comprehensive data export functionality for reports and data
 */
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class ExportService {
  constructor() {
    this.supportedFormats = ['csv', 'xlsx', 'pdf', 'json'];
    this.defaultOptions = {
      csv: {
        delimiter: ',',
        encoding: 'utf-8',
      },
      xlsx: {
        bookType: 'xlsx',
        compression: true,
      },
      pdf: {
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        margin: 10,
      },
      json: {
        pretty: true,
      },
    };
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data, filename, options = {}) {
    const config = { ...this.defaultOptions.csv, ...options };

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(config.delimiter),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            // Escape values that contain delimiter or quotes
            if (
              typeof value === 'string' &&
              (value.includes(config.delimiter) || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(config.delimiter)
      ),
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(data, filename, options = {}) {
    const config = { ...this.defaultOptions.xlsx, ...options };

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const excelBuffer = XLSX.write(workbook, {
      bookType: config.bookType,
      type: 'array',
      compression: config.compression,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    this.downloadBlob(blob, filename);
  }

  /**
   * Export data to PDF format
   */
  exportToPDF(data, filename, options = {}) {
    const config = { ...this.defaultOptions.pdf, ...options };

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(filename);
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data, filename, options = {}) {
    const config = { ...this.defaultOptions.json, ...options };

    const jsonContent = config.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Export report with multiple formats
   */
  exportReport(data, reportName, formats = ['xlsx', 'pdf'], options = {}) {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `${reportName}_${timestamp}`;

    const results = [];

    formats.forEach(format => {
      try {
        const filename = `${baseFilename}.${format}`;

        switch (format) {
          case 'csv':
            this.exportToCSV(data, filename, options.csv);
            break;
          case 'xlsx':
            this.exportToExcel(data, filename, options.xlsx);
            break;
          case 'pdf':
            this.exportToPDF(data, filename, options.pdf);
            break;
          case 'json':
            this.exportToJSON(data, filename, options.json);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        results.push({ format, filename, success: true });
      } catch (error) {
        results.push({ format, filename: null, success: false, error: error.message });
      }
    });

    return results;
  }

  /**
   * Export table data from HTML table
   */
  exportTableToCSV(tableElement, filename, options = {}) {
    const config = { ...this.defaultOptions.csv, ...options };

    const rows = Array.from(tableElement.querySelectorAll('tr'));
    const csvContent = rows
      .map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells
          .map(cell => {
            const text = cell.textContent.trim();
            if (text.includes(config.delimiter) || text.includes('"')) {
              return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
          })
          .join(config.delimiter);
      })
      .join('\n');

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export table data to Excel
   */
  exportTableToExcel(tableElement, filename, options = {}) {
    const config = { ...this.defaultOptions.xlsx, ...options };

    const rows = Array.from(tableElement.querySelectorAll('tr'));
    const data = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.reduce((obj, cell, index) => {
        obj[`Column_${index + 1}`] = cell.textContent.trim();
        return obj;
      }, {});
    });

    this.exportToExcel(data, filename, config);
  }

  /**
   * Export chart data
   */
  exportChartData(chartData, filename, format = 'xlsx', options = {}) {
    if (!chartData || !chartData.labels || !chartData.datasets) {
      throw new Error('Invalid chart data format');
    }

    const data = chartData.labels.map((label, index) => {
      const row = { Label: label };
      chartData.datasets.forEach((dataset, datasetIndex) => {
        row[dataset.label || `Dataset_${datasetIndex + 1}`] = dataset.data[index] || 0;
      });
      return row;
    });

    switch (format) {
      case 'csv':
        this.exportToCSV(data, filename, options);
        break;
      case 'xlsx':
        this.exportToExcel(data, filename, options);
        break;
      case 'pdf':
        this.exportToPDF(data, filename, options);
        break;
      case 'json':
        this.exportToJSON(data, filename, options);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export filtered data with metadata
   */
  exportFilteredData(data, filters, reportName, format = 'xlsx', options = {}) {
    const metadata = {
      reportName,
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      filters: filters,
      generatedBy: 'EHMRS System',
    };

    const exportData = {
      metadata,
      data,
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName}_filtered_${timestamp}.${format}`;

    switch (format) {
      case 'json':
        this.exportToJSON(exportData, filename, options);
        break;
      default: {
        // For other formats, export just the data with metadata in filename
        this.exportReport(data, reportName, [format], options);
        break;
      }
    }
  }

  /**
   * Download file
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Download blob
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get supported formats
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }

  /**
   * Validate data for export
   */
  validateData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    if (data.length === 0) {
      throw new Error('Data cannot be empty');
    }

    if (!data.every(item => typeof item === 'object' && item !== null)) {
      throw new Error('All data items must be objects');
    }

    return true;
  }

  /**
   * Format data for export
   */
  formatDataForExport(data, formatters = {}) {
    return data.map(item => {
      const formattedItem = { ...item };

      Object.keys(formatters).forEach(key => {
        if (formattedItem[key] !== undefined && formatters[key]) {
          formattedItem[key] = formatters[key](formattedItem[key]);
        }
      });

      return formattedItem;
    });
  }
}

// Create singleton instance
const exportService = new ExportService();

// Export both the class and the instance
export { ExportService };
export default exportService;

