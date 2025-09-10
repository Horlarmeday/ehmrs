/**
 * Print Service
 * Provides comprehensive print functionality for views and data
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class PrintService {
  constructor() {
    this.defaultOptions = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margin: 10,
      fontSize: 10,
      fontFamily: 'helvetica',
    };
  }

  /**
   * Print HTML element
   */
  printElement(element, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    if (!element) {
      throw new Error('Element is required for printing');
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the element's HTML content
    const elementHTML = element.outerHTML;
    
    // Create the print document
    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write(this.createPrintDocument(elementHTML, config));
    printDocument.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  /**
   * Print table data
   */
  printTable(data, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
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

    // Add title
    if (config.title) {
      doc.setFontSize(16);
      doc.setFont(config.fontFamily, 'bold');
      doc.text(config.title, config.margin, 20);
    }

    // Add subtitle
    if (config.subtitle) {
      doc.setFontSize(12);
      doc.setFont(config.fontFamily, 'normal');
      doc.text(config.subtitle, config.margin, 30);
    }

    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: config.title ? 35 : 20,
      margin: { top: config.margin, left: config.margin, right: config.margin },
      styles: {
        fontSize: config.fontSize,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageSize.width - 20,
          pageHeight - 10
        );
      },
    });

    // Open print dialog
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  /**
   * Print report with header and footer
   */
  printReport(data, reportConfig = {}) {
    const config = {
      ...this.defaultOptions,
      ...reportConfig,
    };

    const doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });

    // Add header
    this.addReportHeader(doc, config);
    
    // Add content
    this.addReportContent(doc, data, config);
    
    // Add footer
    this.addReportFooter(doc, config);

    // Open print dialog
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  /**
   * Print chart as image
   */
  printChart(chartElement, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    if (!chartElement) {
      throw new Error('Chart element is required for printing');
    }

    // Get chart as image
    const canvas = chartElement.querySelector('canvas');
    if (!canvas) {
      throw new Error('Chart canvas not found');
    }

    const imgData = canvas.toDataURL('image/png');
    
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });

    // Add title
    if (config.title) {
      doc.setFontSize(16);
      doc.setFont(config.fontFamily, 'bold');
      doc.text(config.title, config.margin, 20);
    }

    // Add chart image
    const imgWidth = doc.internal.pageSize.width - (config.margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    doc.addImage(imgData, 'PNG', config.margin, config.title ? 30 : 20, imgWidth, imgHeight);

    // Open print dialog
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  /**
   * Print multiple pages
   */
  printMultiplePages(pages, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    if (!Array.isArray(pages) || pages.length === 0) {
      throw new Error('Pages must be a non-empty array');
    }

    const doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });

    pages.forEach((page, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      this.addPageContent(doc, page, config);
    });

    // Open print dialog
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  /**
   * Print with custom CSS
   */
  printWithCSS(element, css = '', options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    if (!element) {
      throw new Error('Element is required for printing');
    }

    const printWindow = window.open('', '_blank');
    const elementHTML = element.outerHTML;
    
    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write(this.createPrintDocumentWithCSS(elementHTML, css, config));
    printDocument.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  /**
   * Create print document HTML
   */
  createPrintDocument(html, config) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
            }
            @media screen {
              .print-only { display: none !important; }
            }
            body {
              font-family: ${config.fontFamily}, Arial, sans-serif;
              font-size: ${config.fontSize}px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: ${config.margin}mm;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .print-footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  /**
   * Create print document with custom CSS
   */
  createPrintDocumentWithCSS(html, css, config) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            ${css}
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
            }
            @media screen {
              .print-only { display: none !important; }
            }
            body {
              font-family: ${config.fontFamily}, Arial, sans-serif;
              font-size: ${config.fontSize}px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: ${config.margin}mm;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  /**
   * Add report header
   */
  addReportHeader(doc, config) {
    if (config.title) {
      doc.setFontSize(18);
      doc.setFont(config.fontFamily, 'bold');
      doc.text(config.title, config.margin, 20);
    }

    if (config.subtitle) {
      doc.setFontSize(12);
      doc.setFont(config.fontFamily, 'normal');
      doc.text(config.subtitle, config.margin, 30);
    }

    if (config.date) {
      doc.setFontSize(10);
      doc.text(`Generated: ${config.date}`, config.margin, 40);
    }
  }

  /**
   * Add report content
   */
  addReportContent(doc, data, config) {
    if (Array.isArray(data)) {
      // Table data
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(header => row[header]));

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: config.title ? 50 : 30,
        margin: { top: config.margin, left: config.margin, right: config.margin },
        styles: {
          fontSize: config.fontSize,
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
    } else if (typeof data === 'string') {
      // Text content
      doc.setFontSize(config.fontSize);
      doc.setFont(config.fontFamily, 'normal');
      const lines = doc.splitTextToSize(data, doc.internal.pageSize.width - (config.margin * 2));
      doc.text(lines, config.margin, config.title ? 50 : 30);
    }
  }

  /**
   * Add report footer
   */
  addReportFooter(doc, config) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.text(
      `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
      pageSize.width - 20,
      pageHeight - 10
    );

    if (config.footer) {
      doc.text(config.footer, config.margin, pageHeight - 10);
    }
  }

  /**
   * Add page content
   */
  addPageContent(doc, page, config) {
    if (page.title) {
      doc.setFontSize(16);
      doc.setFont(config.fontFamily, 'bold');
      doc.text(page.title, config.margin, 20);
    }

    if (page.content) {
      if (Array.isArray(page.content)) {
        // Table content
        const headers = Object.keys(page.content[0]);
        const rows = page.content.map(row => headers.map(header => row[header]));

        doc.autoTable({
          head: [headers],
          body: rows,
          startY: page.title ? 30 : 20,
          margin: { top: config.margin, left: config.margin, right: config.margin },
          styles: {
            fontSize: config.fontSize,
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
      } else {
        // Text content
        doc.setFontSize(config.fontSize);
        doc.setFont(config.fontFamily, 'normal');
        const lines = doc.splitTextToSize(page.content, doc.internal.pageSize.width - (config.margin * 2));
        doc.text(lines, config.margin, page.title ? 30 : 20);
      }
    }
  }

  /**
   * Get print options
   */
  getPrintOptions() {
    return { ...this.defaultOptions };
  }

  /**
   * Set print options
   */
  setPrintOptions(options) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}

// Create singleton instance
const printService = new PrintService();

// Export both the class and the instance
export { PrintService };
export default printService;



