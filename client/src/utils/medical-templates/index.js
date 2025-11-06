/**
 * Medical Report Templates Index
 * Centralized export for all medical report templates
 */

import ctScanTemplate from './ct-scan-template';
import xrayTemplate from './xray-template';
import mriTemplate from './mri-template';
import ultrasoundTemplate from './ultrasound-template';
import genericTemplate from './generic-template';

// All available templates
export const templates = {
  'ct-scan': ctScanTemplate,
  xray: xrayTemplate,
  mri: mriTemplate,
  ultrasound: ultrasoundTemplate,
  generic: genericTemplate,
};

// Template list for dropdowns
export const templateList = [
  { value: 'ct-scan', text: 'CT Scan', icon: 'fas fa-brain' },
  { value: 'xray', text: 'X-Ray', icon: 'fas fa-x-ray' },
  { value: 'mri', text: 'MRI', icon: 'fas fa-magnet' },
  { value: 'ultrasound', text: 'Ultrasound', icon: 'fas fa-heartbeat' },
  { value: 'generic', text: 'Generic Investigation', icon: 'fas fa-file-medical' },
];

/**
 * Get template by ID
 * @param {string} templateId - Template identifier
 * @returns {object|null} Template object or null if not found
 */
export function getTemplate(templateId) {
  return templates[templateId] || null;
}

/**
 * Get template by investigation type or modality
 * @param {string} investigationType - Investigation type or modality
 * @returns {object} Template object (falls back to generic if no match)
 */
export function getTemplateByType(investigationType) {
  if (!investigationType) return templates.generic;

  const type = investigationType.toLowerCase();

  // Direct matches
  if (templates[type]) {
    return templates[type];
  }

  // CT variations
  if (type.includes('ct') || type.includes('computed tomography') || type.includes('cat scan')) {
    return templates['ct-scan'];
  }

  // X-Ray variations
  if (
    type.includes('x-ray') ||
    type.includes('xray') ||
    type.includes('radiograph') ||
    type.includes('plain film')
  ) {
    return templates.xray;
  }

  // MRI variations
  if (type.includes('mri') || type.includes('magnetic resonance')) {
    return templates.mri;
  }

  // Ultrasound variations
  if (
    type.includes('ultrasound') ||
    type.includes('sonography') ||
    type.includes('sono') ||
    type.includes('doppler')
  ) {
    return templates.ultrasound;
  }

  // Default to generic
  return templates.generic;
}

/**
 * Generate empty report structure from template
 * @param {string} templateId - Template identifier
 * @returns {object} Empty report structure
 */
export function generateEmptyReport(templateId) {
  const template = getTemplate(templateId) || templates.generic;

  const report = {
    templateId: template.id,
    templateName: template.name,
    sections: {},
  };

  // Initialize each section with empty content
  template.sections.forEach((section) => {
    report.sections[section.id] = {
      title: section.title,
      content: section.defaultContent || '',
      subsections: {},
    };

    // Initialize subsections if they exist
    if (section.subsections) {
      section.subsections.forEach((subsection) => {
        report.sections[section.id].subsections[subsection.id] = {
          title: subsection.title,
          content: '',
        };
      });
    }
  });

  return report;
}

/**
 * Format report to plain text
 * @param {object} report - Report structure
 * @returns {string} Formatted plain text report
 */
export function formatReportToText(report) {
  let text = '';

  Object.values(report.sections).forEach((section) => {
    text += `${section.title}\n`;
    text += `${'='.repeat(section.title.length)}\n`;

    if (section.content) {
      text += `${section.content}\n\n`;
    }

    if (section.subsections && Object.keys(section.subsections).length > 0) {
      Object.values(section.subsections).forEach((subsection) => {
        if (subsection.content) {
          text += `${subsection.title}:\n`;
          text += `${subsection.content}\n\n`;
        }
      });
    }

    text += '\n';
  });

  return text;
}

/**
 * Format report to HTML
 * @param {object} report - Report structure
 * @returns {string} Formatted HTML report
 */
export function formatReportToHTML(report) {
  let html = '<div class="medical-report">';

  Object.values(report.sections).forEach((section) => {
    html += `<div class="report-section">`;
    html += `<h3 class="section-title">${section.title}</h3>`;

    if (section.content) {
      html += `<div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>`;
    }

    if (section.subsections && Object.keys(section.subsections).length > 0) {
      Object.values(section.subsections).forEach((subsection) => {
        if (subsection.content) {
          html += `<div class="subsection">`;
          html += `<h4 class="subsection-title">${subsection.title}</h4>`;
          html += `<div class="subsection-content">${subsection.content.replace(
            /\n/g,
            '<br>'
          )}</div>`;
          html += `</div>`;
        }
      });
    }

    html += `</div>`;
  });

  html += '</div>';

  return html;
}

/**
 * Parse existing report text to structure
 * This is a basic implementation - enhance as needed
 * @param {string} reportText - Plain text report
 * @param {string} templateId - Template to use for parsing
 * @returns {object} Structured report
 */
export function parseReportText(reportText, templateId = 'generic') {
  const template = getTemplate(templateId) || templates.generic;
  const report = generateEmptyReport(templateId);

  // Basic parsing - split by section titles
  template.sections.forEach((section) => {
    const regex = new RegExp(`${section.title}[\\s\\S]*?(?=\\n[A-Z ]+:|$)`, 'i');
    const match = reportText.match(regex);

    if (match) {
      const content = match[0].replace(section.title, '').replace(/={3,}/g, '').trim();
      report.sections[section.id].content = content;
    }
  });

  return report;
}

export default {
  templates,
  templateList,
  getTemplate,
  getTemplateByType,
  generateEmptyReport,
  formatReportToText,
  formatReportToHTML,
  parseReportText,
};
