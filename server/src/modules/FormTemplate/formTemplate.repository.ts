import { LabFormTemplate } from '../../database/models/labFormTemplate';
import { LabFormTemplateVersion } from '../../database/models/labFormTemplateVersion';
import { Staff } from '../../database/models/staff';
import { Op } from 'sequelize';

/**
 * Create a new form template
 * @param data - Template data
 */
export async function createFormTemplate(data: any): Promise<LabFormTemplate> {
  return LabFormTemplate.create(data);
}

/**
 * Get form templates with pagination and filters
 * @param currentPage - Page number
 * @param pageLimit - Items per page
 * @param search - Search term
 * @param category - Filter by category
 * @param isActive - Filter by active status
 */
export async function getFormTemplates(
  currentPage?: number,
  pageLimit?: number,
  search?: string,
  category?: string,
  isActive?: boolean
) {
  const whereClause: any = {};

  // Search filter
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  // Category filter
  if (category) {
    whereClause.category = category;
  }

  // Active status filter
  if (isActive !== undefined) {
    whereClause.is_active = isActive;
  }

  const query: any = {
    where: whereClause,
    include: [
      { model: Staff, as: 'creator', attributes: ['id', 'firstname', 'lastname'] },
      { model: Staff, as: 'updater', attributes: ['id', 'firstname', 'lastname'] },
    ],
    order: [['createdAt', 'DESC']],
  };

  // Pagination
  if (currentPage && pageLimit) {
    return LabFormTemplate.paginate({
      page: currentPage,
      paginate: pageLimit,
      ...query,
    });
  }

  // No pagination - return all
  const templates = await LabFormTemplate.findAll(query);
  return { docs: templates, total: templates.length, pages: 1 };
}

/**
 * Get a single form template by ID
 * @param id - Template ID
 */
export async function getFormTemplateById(id: number): Promise<LabFormTemplate | null> {
  return LabFormTemplate.findOne({
    where: { id },
    include: [
      { model: Staff, as: 'creator', attributes: ['id', 'firstname', 'lastname'] },
      { model: Staff, as: 'updater', attributes: ['id', 'firstname', 'lastname'] },
      { model: LabFormTemplateVersion, as: 'versions' },
    ],
  });
}

/**
 * Get a single form template by code
 * @param code - Template code
 */
export async function getFormTemplateByCode(code: string): Promise<LabFormTemplate | null> {
  return LabFormTemplate.findOne({
    where: { code },
    include: [
      { model: Staff, as: 'creator', attributes: ['id', 'firstname', 'lastname'] },
      { model: Staff, as: 'updater', attributes: ['id', 'firstname', 'lastname'] },
    ],
  });
}

/**
 * Update a form template
 * @param id - Template ID
 * @param data - Update data
 */
export async function updateFormTemplate(id: number, data: any): Promise<LabFormTemplate | null> {
  const template = await LabFormTemplate.findByPk(id);
  if (!template) return null;

  await template.update(data);
  return template;
}

/**
 * Soft delete a form template (set is_active to false)
 * @param id - Template ID
 */
export async function deleteFormTemplate(id: number): Promise<boolean> {
  const template = await LabFormTemplate.findByPk(id);
  if (!template) return false;

  // Check if it's a system template
  if (template.is_system_template) {
    throw new Error('System templates cannot be deleted');
  }

  await template.update({ is_active: false });
  return true;
}

/**
 * Hard delete a form template (permanent deletion)
 * Only allowed for non-system templates
 * @param id - Template ID
 */
export async function permanentlyDeleteFormTemplate(id: number): Promise<boolean> {
  const template = await LabFormTemplate.findByPk(id);
  if (!template) return false;

  // Check if it's a system template
  if (template.is_system_template) {
    throw new Error('System templates cannot be permanently deleted');
  }

  await template.destroy();
  return true;
}

/**
 * Create a new version of a form template
 * @param data - Version data
 */
export async function createFormTemplateVersion(data: any): Promise<LabFormTemplateVersion> {
  return LabFormTemplateVersion.create(data);
}

/**
 * Get all versions of a template
 * @param templateId - Template ID
 */
export async function getFormTemplateVersions(
  templateId: number
): Promise<LabFormTemplateVersion[]> {
  return LabFormTemplateVersion.findAll({
    where: { template_id: templateId },
    include: [{ model: Staff, as: 'creator', attributes: ['id', 'firstname', 'lastname'] }],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Get a specific version of a template
 * @param templateId - Template ID
 * @param version - Version string
 */
export async function getFormTemplateVersion(
  templateId: number,
  version: string
): Promise<LabFormTemplateVersion | null> {
  return LabFormTemplateVersion.findOne({
    where: { template_id: templateId, version },
    include: [{ model: Staff, as: 'creator', attributes: ['id', 'firstname', 'lastname'] }],
  });
}

/**
 * Get all active templates (for dropdowns/selects)
 */
export async function getActiveFormTemplates(): Promise<LabFormTemplate[]> {
  return LabFormTemplate.findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'code', 'description', 'category', 'version'],
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  });
}

/**
 * Get templates by category
 * @param category - Category name
 */
export async function getFormTemplatesByCategory(category: string): Promise<LabFormTemplate[]> {
  return LabFormTemplate.findAll({
    where: { category, is_active: true },
    order: [['name', 'ASC']],
  });
}

/**
 * Check if a template code already exists
 * @param code - Template code
 * @param excludeId - Template ID to exclude from check (for updates)
 */
export async function templateCodeExists(code: string, excludeId?: number): Promise<boolean> {
  const whereClause: any = { code };
  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const count = await LabFormTemplate.count({ where: whereClause });
  return count > 0;
}
