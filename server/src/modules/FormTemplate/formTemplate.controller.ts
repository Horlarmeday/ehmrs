import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from '../../core/helpers/helper';
import { errorResponse } from '../../common/responses/error-responses';
import { successResponse } from '../../common/responses/success-responses';
import { SUCCESS } from '../../core/constants';
import FormTemplateService from './formTemplate.service';
import {
  validateCreateFormTemplate,
  validateUpdateFormTemplate,
  validateCreateTemplateVersion,
  validateCloneTemplate,
} from './validations';

class FormTemplateController {
  /**
   * Create a new form template
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async createTemplate(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateFormTemplate(req.body);
    if (error) {
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    try {
      const data = { ...req.body, staff_id: req.user.sub };
      const template = await FormTemplateService.createTemplate(data);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Form template created successfully',
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get form templates with pagination and filters
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPage, pageLimit, search, category, isActive } = req.query;

      const templates = await FormTemplateService.getTemplates({
        currentPage: currentPage ? +currentPage : undefined,
        pageLimit: pageLimit ? +pageLimit : undefined,
        search: search as string,
        category: category as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: templates,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get a single form template by ID
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const template = await FormTemplateService.getTemplate(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get a single form template by code
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getTemplateByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const template = await FormTemplateService.getTemplateByCode(code);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update a form template
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async updateTemplate(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateUpdateFormTemplate(req.body);
    if (error) {
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    try {
      const data = { ...req.body, staff_id: req.user.sub };
      const template = await FormTemplateService.updateTemplate(data);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Form template updated successfully',
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Delete a form template (soft delete)
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FormTemplateService.deleteTemplate(+id);

      return successResponse({
        data: null,
        res,
        httpCode: StatusCodes.OK,
        message: 'Form template deleted successfully',
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create a new version of a form template
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async createVersion(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateTemplateVersion(req.body);
    if (error) {
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    try {
      const data = { ...req.body, staff_id: req.user.sub };
      const version = await FormTemplateService.createVersion(data);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Template version created successfully',
        data: version,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all versions of a template
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const versions = await FormTemplateService.getVersions(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: versions,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get active templates (for dropdowns)
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getActiveTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await FormTemplateService.getActiveTemplates();

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: templates,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get templates by category
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async getTemplatesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const templates = await FormTemplateService.getTemplatesByCategory(category);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: templates,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Clone a template
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware
   */
  static async cloneTemplate(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCloneTemplate(req.body);
    if (error) {
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    try {
      const { id, newName, newCode } = req.body;
      const template = await FormTemplateService.cloneTemplate(id, newName, newCode, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Template cloned successfully',
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default FormTemplateController;
