import { Request, Response } from 'express';
import { StockAuditService } from './stockAudit.service';
import { BadException } from '../../common/util/api-error';

export class StockAuditController {
  /**
   * Create stock audit
   * POST /api/stock-audit
   */
  static async createStockAudit(req: Request & { user: { sub: number } }, res: Response) {
    try {
      const audit = await StockAuditService.createStockAudit(req.body, req.user.sub);
      res.status(201).json({
        success: true,
        message: 'Stock audit created successfully',
        data: audit,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get stock audit by ID
   * GET /api/stock-audit/:id
   */
  static async getStockAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const audit = await StockAuditService.getStockAudit(parseInt(id));

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Stock audit not found',
        });
      }

      res.status(200).json({
        success: true,
        data: audit,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get all stock audits with pagination
   * GET /api/stock-audit
   */
  static async getStockAudits(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        store_type,
        inventory_id,
        date_from,
        date_to,
        search,
      } = req.query;

      const result = await StockAuditService.getStockAudits({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        store_type: store_type as string,
        inventory_id: inventory_id ? parseInt(inventory_id as string) : undefined,
        date_from: date_from ? new Date(date_from as string) : undefined,
        date_to: date_to ? new Date(date_to as string) : undefined,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Update stock audit
   * PUT /api/stock-audit/:id
   */
  static async updateStockAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const audit = await StockAuditService.updateStockAudit(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Stock audit updated successfully',
        data: audit,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Start stock audit
   * POST /api/stock-audit/:id/start
   */
  static async startStockAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { started_by } = req.body;

      const audit = await StockAuditService.startStockAudit(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Stock audit started successfully',
        data: audit,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Complete stock audit
   * POST /api/stock-audit/:id/complete
   */
  static async completeStockAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { completed_by, completion_notes } = req.body;

      const audit = await StockAuditService.completeStockAudit(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Stock audit completed successfully',
        data: audit,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Approve stock audit
   * POST /api/stock-audit/:id/approve
   */
  static async approveStockAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approved_by, approval_notes } = req.body;

      const audit = await StockAuditService.approveStockAudit(parseInt(id), parseInt(approved_by));

      res.status(200).json({
        success: true,
        message: 'Stock audit approved successfully',
        data: audit,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get variance analysis
   * GET /api/stock-audit/:id/variance
   */
  static async getVarianceAnalysis(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { threshold } = req.query;

      const variance = await StockAuditService.getVarianceAnalysis(parseInt(id));

      res.status(200).json({
        success: true,
        data: variance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get stock audit statistics
   * GET /api/stock-audit/statistics
   */
  static async getStockAuditStatistics(req: Request, res: Response) {
    try {
      const { date_from, date_to, store_type } = req.query;

      const statistics = await StockAuditService.getStockAuditStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get store type performance
   * GET /api/stock-audit/performance
   */
  static async getStoreTypePerformance(req: Request, res: Response) {
    try {
      const { date_from, date_to } = req.query;

      const performance = await StockAuditService.getStoreTypePerformance();

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Export audit report
   * GET /api/stock-audit/:id/export
   */
  static async exportAuditReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const report = await StockAuditService.exportAuditReport(parseInt(id));

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="stock-audit-${id}.csv"`);
        res.status(200).send(report);
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="stock-audit-${id}.pdf"`);
        res.status(200).send(report);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}
