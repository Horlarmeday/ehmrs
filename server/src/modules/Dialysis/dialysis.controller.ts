import { NextFunction, Request, Response } from 'express';
import { DialysisService } from './dialysis.service';
import { BadException } from '../../common/util/api-error';

export class DialysisController {
  /**
   * Create dialysis visit
   * POST /api/dialysis/visits
   */
  static async createDialysisVisit(req: Request, res: Response) {
    try {
      const visit = await DialysisService.createDialysisVisit(req.body);
      res.status(201).json({
        success: true,
        message: 'Dialysis visit created successfully',
        data: visit,
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
   * Get dialysis visit by ID
   * GET /api/dialysis/visits/:id
   */
  static async getDialysisVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visit = await DialysisService.getDialysisVisit(parseInt(id));

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Dialysis visit not found',
        });
      }

      res.status(200).json({
        success: true,
        data: visit,
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
   * Get all dialysis visits with pagination
   * GET /api/dialysis/visits
   */
  static async getDialysisVisits(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        dialysis_type,
        doctor_id,
        nurse_id,
        patient_id,
        date_from,
        date_to,
        search,
      } = req.query;

      const result = await DialysisService.getDialysisVisits({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        dialysis_type: dialysis_type as string,
        doctor_id: doctor_id ? parseInt(doctor_id as string) : undefined,
        nurse_id: nurse_id ? parseInt(nurse_id as string) : undefined,
        patient_id: patient_id ? parseInt(patient_id as string) : undefined,
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
   * Update dialysis visit
   * PUT /api/dialysis/visits/:id
   */
  static async updateDialysisVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const visit = await DialysisService.updateDialysisVisit(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Dialysis visit updated successfully',
        data: visit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start dialysis treatment
   * POST /api/dialysis/visits/:id/start
   */
  static async startDialysisTreatment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const treatmentData = req.body;
      const nurse_id = req.user.sub;

      const treatment = await DialysisService.startDialysisTreatment(parseInt(id), {
        ...treatmentData,
        nurse_id,
      });

      res.status(200).json({
        success: true,
        message: 'Dialysis treatment started successfully',
        data: treatment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete dialysis treatment
   * POST /api/dialysis/visits/:id/complete
   */
  static async completeDialysisTreatment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { treatment_data, completed_by } = req.body;

      const treatment = await DialysisService.completeDialysisTreatment(
        parseInt(id),
        treatment_data,
        completed_by
      );

      res.status(200).json({
        success: true,
        message: 'Dialysis treatment completed successfully',
        data: treatment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete dialysis treatment
   * PUT /api/dialysis/visits/:id/pause
   */
  static async updateDialysisTreatment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const treatment = await DialysisService.updateDialysisTreatment(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Dialysis treatment completed successfully',
        data: treatment,
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
   * Cancel dialysis visit
   * POST /api/dialysis/visits/:id/cancel
   */
  static async cancelDialysisVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cancellation_reason } = req.body;

      const visit = await DialysisService.cancelDialysisVisit(parseInt(id), cancellation_reason);

      res.status(200).json({
        success: true,
        message: 'Dialysis visit cancelled successfully',
        data: visit,
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
   * Get dialysis statistics
   * GET /api/dialysis/statistics
   */
  static async getDialysisStatistics(req: Request, res: Response) {
    try {
      const statistics = await DialysisService.getDialysisStatistics();

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
   * Get patient dialysis history
   * GET /api/dialysis/patients/:patientId/history
   */
  static async getPatientDialysisHistory(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const history = await DialysisService.getPatientDialysisHistory(parseInt(patientId));

      res.status(200).json({
        success: true,
        data: history,
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
   * Get doctor dialysis schedule
   * GET /api/dialysis/doctors/:doctorId/schedule
   */
  static async getDoctorDialysisSchedule(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      const schedule = await DialysisService.getDoctorDialysisSchedule(
        parseInt(doctorId),
        date ? new Date(date as string) : new Date()
      );

      res.status(200).json({
        success: true,
        data: schedule,
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
   * Get nurse dialysis schedule
   * GET /api/dialysis/nurses/:nurseId/schedule
   */
  static async getNurseDialysisSchedule(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const { date } = req.query;

      const schedule = await DialysisService.getNurseDialysisSchedule(
        parseInt(nurseId),
        date ? new Date(date as string) : new Date()
      );

      res.status(200).json({
        success: true,
        data: schedule,
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
   * Export dialysis report
   * GET /api/dialysis/reports/export
   */
  static async exportDialysisReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await DialysisService.exportDialysisReport(parseInt(id));

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // DIALYSIS ASSESSMENT ENDPOINTS
  // ========================================

  /**
   * Create dialysis assessment
   * POST /api/dialysis/visits/:id/assessment
   */
  static async createDialysisAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ...assessmentData } = req.body;

      const assessment = await DialysisService.createDialysisAssessment(
        parseInt(id), // This is now the global visit ID
        assessmentData
      );

      res.status(201).json({
        success: true,
        message: 'Dialysis assessment created successfully',
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update dialysis assessment
   * PUT /api/dialysis/visits/:id/assessment
   */
  static async updateDialysisAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { assessment_id, ...updateData } = req.body;

      if (!assessment_id) {
        return res.status(400).json({
          success: false,
          message: 'Assessment ID is required',
        });
      }

      const assessment = await DialysisService.updateDialysisAssessment(
        parseInt(assessment_id),
        updateData
      );

      res.status(200).json({
        success: true,
        message: 'Dialysis assessment updated successfully',
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dialysis assessment
   * GET /api/dialysis/visits/:id/assessment
   */
  static async getDialysisAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assessment = await DialysisService.getDialysisAssessment(parseInt(id));

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Dialysis assessment not found',
        });
      }

      res.status(200).json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // DIALYSIS VITALS ENDPOINTS
  // ========================================

  /**
   * Create dialysis vitals
   * POST /api/dialysis/visits/:id/vitals
   */
  static async createDialysisVitals(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { ...vitalsData } = req.body;
      const staff_id = req.user?.sub;

      const vitals = await DialysisService.createDialysisVitals(parseInt(id), staff_id, vitalsData);

      res.status(201).json({
        success: true,
        message: 'Dialysis vitals created successfully',
        data: vitals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dialysis vitals
   * GET /api/dialysis/visits/:id/vitals
   */
  static async getDialysisVitals(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vitals = await DialysisService.getDialysisVitals(parseInt(id));

      res.status(200).json({
        success: true,
        data: vitals,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // ========================================
  // DIALYSIS NOTES ENDPOINTS
  // ========================================

  /**
   * Create dialysis notes
   * POST /api/dialysis/visits/:id/notes
   */
  static async createDialysisNotes(req: Request & { user: { sub: number } }, res: Response) {
    try {
      const { id } = req.params;
      const { ...notesData } = req.body;
      const staff_id = req.user?.sub;

      const notes = await DialysisService.createDialysisNotes(parseInt(id), staff_id, notesData);

      res.status(201).json({
        success: true,
        message: 'Dialysis notes created successfully',
        data: notes,
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
   * Update dialysis notes
   * PUT /api/dialysis/visits/:id/notes
   */
  static async updateDialysisNotes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { notes_id, ...updateData } = req.body;

      if (!notes_id) {
        return res.status(400).json({
          success: false,
          message: 'Notes ID is required',
        });
      }

      const notes = await DialysisService.updateDialysisNotes(parseInt(notes_id), updateData);

      res.status(200).json({
        success: true,
        message: 'Dialysis notes updated successfully',
        data: notes,
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
   * Get dialysis notes
   * GET /api/dialysis/visits/:id/notes
   */
  static async getDialysisNotes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type } = req.query;

      let notes;
      if (type) {
        notes = await DialysisService.getDialysisNotesByType(parseInt(id), type as string);
      } else {
        notes = await DialysisService.getDialysisNotes(parseInt(id));
      }

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // ========================================
  // COMPREHENSIVE DATA ENDPOINTS
  // ========================================

  /**
   * Get comprehensive dialysis visit data
   * GET /api/dialysis/visits/:id/comprehensive
   */
  static async getComprehensiveDialysisVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const comprehensiveData = await DialysisService.getComprehensiveDialysisVisit(parseInt(id));

      res.status(200).json({
        success: true,
        data: comprehensiveData,
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

  // ========================================
  // ICD10 DIAGNOSIS ENDPOINTS
  // ========================================

  /**
   * Search ICD10 diagnoses
   * GET /api/dialysis/icd10/search
   */
  static async searchICD10Diagnoses(req: Request, res: Response) {
    try {
      const { q, limit = 20 } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required',
        });
      }

      const diagnoses = await DialysisService.searchICD10Diagnoses(q, parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: diagnoses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}
