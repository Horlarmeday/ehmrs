import {
  createFormTemplate,
  createFormTemplateVersion,
  deleteFormTemplate,
  getActiveFormTemplates,
  getFormTemplateById,
  getFormTemplateByCode,
  getFormTemplates,
  getFormTemplatesByCategory,
  getFormTemplateVersion,
  getFormTemplateVersions,
  permanentlyDeleteFormTemplate,
  templateCodeExists,
  updateFormTemplate,
} from './formTemplate.repository';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import Ajv from 'ajv';

// JSON Schema validator
const ajv = new Ajv({ allErrors: true });

class FormTemplateService {
  /**
   * Create a new form template
   * @param createDto - Form template data
   */
  static async createTemplate(createDto: CreateFormTemplateDto) {
    // Check if code already exists
    const codeExists = await templateCodeExists(createDto.code);
    if (codeExists) {
      throw new BadException(
        'DUPLICATE_CODE',
        StatusCodes.BAD_REQUEST,
        `Template with code '${createDto.code}' already exists`
      );
    }

    // Validate JSON schema structure
    this.validateFormSchema(createDto.schema_json);

    // Create template
    const data = {
      ...createDto,
      created_by: createDto.staff_id,
      updated_by: createDto.staff_id,
      version: createDto.version || '1.0',
      is_active: createDto.is_active !== undefined ? createDto.is_active : true,
    };

    const template = await createFormTemplate(data);

    // Create initial version record
    await createFormTemplateVersion({
      template_id: template.id,
      version: template.version,
      schema_json: template.schema_json,
      pdf_config: template.pdf_config,
      change_notes: 'Initial version',
      created_by: createDto.staff_id,
    });

    return template;
  }

  /**
   * Get form templates with pagination and filters
   * @param query - Query parameters
   */
  static async getTemplates(query: {
    currentPage?: number;
    pageLimit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }) {
    const { currentPage, pageLimit, search, category, isActive } = query;
    return getFormTemplates(
      currentPage ? +currentPage : undefined,
      pageLimit ? +pageLimit : undefined,
      search,
      category,
      isActive
    );
  }

  /**
   * Get a single form template by ID
   * @param id - Template ID
   */
  static async getTemplate(id: number) {
    const template = await getFormTemplateById(id);
    if (!template) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Template with ID ${id} not found`
      );
    }
    return template;
  }

  /**
   * Get a single form template by code
   * @param code - Template code
   */
  static async getTemplateByCode(code: string) {
    const template = await getFormTemplateByCode(code);
    if (!template) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Template with code '${code}' not found`
      );
    }
    return template;
  }

  /**
   * Update a form template
   * @param updateDto - Update data
   */
  static async updateTemplate(updateDto: UpdateFormTemplateDto) {
    const { id, schema_json, ...data } = updateDto;

    // Check if template exists
    const existingTemplate = await getFormTemplateById(id);
    if (!existingTemplate) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Template with ID ${id} not found`
      );
    }

    // Validate schema if provided
    if (schema_json) {
      this.validateFormSchema(schema_json);
    }

    // Update template
    const updateData = {
      ...data,
      ...(schema_json && { schema_json }),
      updated_by: updateDto.staff_id,
    };

    return updateFormTemplate(id, updateData);
  }

  /**
   * Soft delete a form template
   * @param id - Template ID
   */
  static async deleteTemplate(id: number) {
    return deleteFormTemplate(id);
  }

  /**
   * Permanently delete a form template
   * @param id - Template ID
   */
  static async permanentlyDeleteTemplate(id: number) {
    return permanentlyDeleteFormTemplate(id);
  }

  /**
   * Create a new version of a template
   * @param versionDto - Version data
   */
  static async createVersion(versionDto: CreateTemplateVersionDto) {
    // Check if template exists
    const template = await getFormTemplateById(versionDto.template_id);
    if (!template) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Template with ID ${versionDto.template_id} not found`
      );
    }

    // Check if version already exists
    const existingVersion = await getFormTemplateVersion(
      versionDto.template_id,
      versionDto.version
    );
    if (existingVersion) {
      throw new BadException(
        'DUPLICATE_VERSION',
        StatusCodes.BAD_REQUEST,
        `Version '${versionDto.version}' already exists for this template`
      );
    }

    // Validate schema
    this.validateFormSchema(versionDto.schema_json);

    // Create version record
    const versionData = {
      ...versionDto,
      created_by: versionDto.staff_id,
    };

    const version = await createFormTemplateVersion(versionData);

    // Update main template with new version
    await updateFormTemplate(versionDto.template_id, {
      version: versionDto.version,
      schema_json: versionDto.schema_json,
      pdf_config: versionDto.pdf_config,
      updated_by: versionDto.staff_id,
    });

    return version;
  }

  /**
   * Get all versions of a template
   * @param templateId - Template ID
   */
  static async getVersions(templateId: number) {
    return getFormTemplateVersions(templateId);
  }

  /**
   * Get active templates (for dropdowns)
   */
  static async getActiveTemplates() {
    return getActiveFormTemplates();
  }

  /**
   * Get templates by category
   * @param category - Category name
   */
  static async getTemplatesByCategory(category: string) {
    return getFormTemplatesByCategory(category);
  }

  /**
   * Validate form schema structure
   * @param schema - Form schema to validate
   */
  private static validateFormSchema(schema: any) {
    // Basic structure validation
    if (!schema.formId || !schema.formName || !schema.sections) {
      throw new BadException(
        'INVALID_SCHEMA',
        StatusCodes.BAD_REQUEST,
        'Form schema must contain formId, formName, and sections'
      );
    }

    if (!Array.isArray(schema.sections) || schema.sections.length === 0) {
      throw new BadException(
        'INVALID_SCHEMA',
        StatusCodes.BAD_REQUEST,
        'Form schema must have at least one section'
      );
    }

    // Validate each section has required fields
    schema.sections.forEach((section: any, index: number) => {
      if (!section.id) {
        throw new BadException(
          'INVALID_SCHEMA',
          StatusCodes.BAD_REQUEST,
          `Section at index ${index} must have an 'id' field`
        );
      }

      if (!section.fields || !Array.isArray(section.fields)) {
        throw new BadException(
          'INVALID_SCHEMA',
          StatusCodes.BAD_REQUEST,
          `Section '${section.id}' must have a 'fields' array`
        );
      }

      // Validate each field
      section.fields.forEach((field: any, fieldIndex: number) => {
        if (!field.id || !field.label || !field.type) {
          throw new BadException(
            'INVALID_SCHEMA',
            StatusCodes.BAD_REQUEST,
            `Field at index ${fieldIndex} in section '${section.id}' must have id, label, and type`
          );
        }
      });
    });

    return true;
  }

  /**
   * Clone a template
   * @param id - Template ID to clone
   * @param newName - Name for the cloned template
   * @param newCode - Code for the cloned template
   * @param staffId - Staff ID performing the clone
   */
  static async cloneTemplate(id: number, newName: string, newCode: string, staffId: number) {
    const template = await getFormTemplateById(id);
    if (!template) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        `Template with ID ${id} not found`
      );
    }

    // Check if new code already exists
    const codeExists = await templateCodeExists(newCode);
    if (codeExists) {
      throw new BadException(
        'DUPLICATE_CODE',
        StatusCodes.BAD_REQUEST,
        `Template with code '${newCode}' already exists`
      );
    }

    // Create cloned template
    const clonedData = {
      name: newName,
      code: newCode,
      description: template.description
        ? `Cloned from ${template.name}: ${template.description}`
        : `Cloned from ${template.name}`,
      category: template.category,
      schema_json: template.schema_json,
      pdf_config: template.pdf_config,
      version: '1.0',
      is_active: true,
      is_system_template: false, // Cloned templates are never system templates
      created_by: staffId,
      updated_by: staffId,
    };

    return createFormTemplate(clonedData);
  }
}

export default FormTemplateService;
