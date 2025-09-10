import { Request, Response } from 'express';
import { ProcurementService } from './procurement.service';
import { BadException } from '../../common/util/api-error';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    [key: string]: any;
  };
}

export class ProcurementController {
  /**
   * Create procurement order
   * POST /api/procurement/orders
   */
  static async createProcurementOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const order = await ProcurementService.createProcurementOrder(req.body, req.user.sub);
      res.status(201).json({
        success: true,
        message: 'Procurement order created successfully',
        data: order,
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
   * Get procurement order by ID
   * GET /api/procurement/orders/:id
   */
  static async getProcurementOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await ProcurementService.getProcurementOrder(parseInt(id));

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Procurement order not found',
        });
      }

      res.status(200).json({
        success: true,
        data: order,
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
   * Get all procurement orders with pagination
   * GET /api/procurement/orders
   */
  static async getProcurementOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, vendor_id, date_from, date_to, search } = req.query;

      const result = await ProcurementService.getProcurementOrders({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        vendor_id: vendor_id ? parseInt(vendor_id as string) : undefined,
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
   * Update procurement order
   * PUT /api/procurement/orders/:id
   */
  static async updateProcurementOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await ProcurementService.updateProcurementOrder(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Procurement order updated successfully',
        data: order,
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
   * Approve procurement order
   * POST /api/procurement/orders/:id/approve
   */
  static async approveProcurementOrder(req: Request & { user: { sub: number } }, res: Response) {
    try {
      const { id } = req.params;

      const order = await ProcurementService.approveProcurementOrder(parseInt(id), req.user.sub);

      res.status(200).json({
        success: true,
        message: 'Procurement order approved successfully',
        data: order,
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
   * Send procurement order
   * POST /api/procurement/orders/:id/send
   */
  static async sendProcurementOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sent_by, sent_date, expected_delivery_date } = req.body;

      const order = await ProcurementService.sendProcurementOrder(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Procurement order sent successfully',
        data: order,
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
   * Receive procurement order items
   * POST /api/procurement/orders/:id/receive
   */
  static async receiveProcurementOrderItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { received_items, received_by, received_date } = req.body;

      const result = await ProcurementService.receiveProcurementOrderItems(
        parseInt(id),
        received_items
      );

      res.status(200).json({
        success: true,
        message: 'Procurement order items received successfully',
        data: result,
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
   * Cancel procurement order
   * POST /api/procurement/orders/:id/cancel
   */
  static async cancelProcurementOrder(req: Request & { user: { sub: number } }, res: Response) {
    try {
      const { id } = req.params;
      const { cancellation_reason } = req.body;

      const order = await ProcurementService.cancelProcurementOrder(
        req.user.sub,
        cancellation_reason
      );

      res.status(200).json({
        success: true,
        message: 'Procurement order cancelled successfully',
        data: order,
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
   * Get procurement statistics
   * GET /api/procurement/statistics
   */
  static async getProcurementStatistics(req: Request, res: Response) {
    try {
      const { date_from, date_to } = req.query;

      const statistics = await ProcurementService.getProcurementStatistics();

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
   * Get vendor performance
   * GET /api/procurement/vendors/:vendorId/performance
   */
  static async getVendorPerformance(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { date_from, date_to } = req.query;

      const performance = await ProcurementService.getVendorPerformance(parseInt(vendorId));

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
   * Get procurement reports
   * GET /api/procurement/reports
   */
  static async getProcurementReports(req: Request, res: Response) {
    try {
      const { date_from, date_to, vendor_id, status } = req.query;

      const reports = await ProcurementService.getProcurementReports({
        date_from: date_from ? new Date(date_from as string) : undefined,
        date_to: date_to ? new Date(date_to as string) : undefined,
        vendor_id: vendor_id ? parseInt(vendor_id as string) : undefined,
        status: status as string,
      });

      res.status(200).json({
        success: true,
        data: reports,
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
   * Export procurement report
   * GET /api/procurement/export
   */
  static async exportProcurementReport(req: Request, res: Response) {
    try {
      const { date_from, date_to, vendor_id, status, format = 'xlsx' } = req.query;

      const exportData = await ProcurementService.exportProcurementReport({
        date_from: date_from ? new Date(date_from as string) : undefined,
        date_to: date_to ? new Date(date_to as string) : undefined,
        vendor_id: vendor_id ? parseInt(vendor_id as string) : undefined,
        status: status as string,
        format: format as string,
      });

      // Set appropriate headers for file download
      const filename = `procurement-report-${new Date().toISOString().split('T')[0]}.${format}`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.status(200).send(exportData);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}
