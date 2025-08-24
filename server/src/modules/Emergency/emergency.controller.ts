import { Request, Response } from 'express';
import { EmergencyService } from './emergency.service';
import { BadException } from '../../common/util/api-error';

export class EmergencyController {
  /**
   * Create emergency visit
   * POST /api/emergency/visits
   */
  static async createEmergencyVisit(req: Request, res: Response) {
    try {
      const emergencyVisit = await EmergencyService.createEmergencyVisit(req.body);
      res.status(201).json({
        success: true,
        message: 'Emergency visit created successfully',
        data: emergencyVisit
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }

  /**
   * Get emergency visit by ID
   * GET /api/emergency/visits/:id
   */
  static async getEmergencyVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const emergencyVisit = await EmergencyService.getEmergencyVisit(parseInt(id));
      
      if (!emergencyVisit) {
        return res.status(404).json({
          success: false,
          message: 'Emergency visit not found'
        });
      }

      res.status(200).json({
        success: true,
        data: emergencyVisit
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get all emergency visits with pagination
   * GET /api/emergency/visits
   */
  static async getEmergencyVisits(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        emergency_type,
        triage_category,
        doctor_id,
        nurse_id,
        patient_id,
        date_from,
        date_to,
        search
      } = req.query;

      const result = await EmergencyService.getEmergencyVisits({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        emergency_type: emergency_type as string,
        triage_category: triage_category as string,
        doctor_id: doctor_id ? parseInt(doctor_id as string) : undefined,
        nurse_id: nurse_id ? parseInt(nurse_id as string) : undefined,
        patient_id: patient_id ? parseInt(patient_id as string) : undefined,
        date_from: date_from ? new Date(date_from as string) : undefined,
        date_to: date_to ? new Date(date_to as string) : undefined,
        search: search as string
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Perform triage assessment
   * POST /api/emergency/triage
   */
  static async performTriage(req: Request, res: Response) {
    try {
      const triage = await EmergencyService.performTriage(req.body);
      res.status(201).json({
        success: true,
        message: 'Triage assessment completed successfully',
        data: triage
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }

  /**
   * Assign emergency bed
   * POST /api/emergency/beds/assign
   */
  static async assignEmergencyBed(req: Request, res: Response) {
    try {
      const bed = await EmergencyService.assignEmergencyBed(req.body);
      res.status(200).json({
        success: true,
        message: 'Emergency bed assigned successfully',
        data: bed
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }

  /**
   * Get available emergency beds
   * GET /api/emergency/beds/available
   */
  static async getAvailableEmergencyBeds(req: Request, res: Response) {
    try {
      const { bed_type, required_equipment } = req.query;
      
      const requiredEquipment = required_equipment 
        ? (required_equipment as string).split(',') 
        : undefined;

      const beds = await EmergencyService.getAvailableEmergencyBeds(
        bed_type as string,
        requiredEquipment
      );

      res.status(200).json({
        success: true,
        data: beds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get emergency statistics
   * GET /api/emergency/statistics
   */
  static async getEmergencyStatistics(req: Request, res: Response) {
    try {
      const statistics = await EmergencyService.getEmergencyStatistics();
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}
