import { DialysisVisit, DialysisTreatment, Patient, Staff, Visit } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { Op } from 'sequelize';
import { DialysisAssessment } from '../../database/models/dialysisAssessment';
import { DialysisVitals } from '../../database/models/dialysisVitals';
import { DialysisNotes } from '../../database/models/dialysisNotes';
import {
  StatusCodes,
  patientAttributes,
  staffAttributes,
  visitAttributes,
} from '../../core/helpers/helper';
import { TreatmentStatus } from '../../database/models/dialysisTreatment';

export interface DialysisVisitData {
  patient_id: number;
  visit_id?: number;
  doctor_id: number;
  nurse_id?: number;
  dialysis_type: 'HEMODIALYSIS' | 'PERITONEAL' | 'CONTINUOUS' | 'INTERMITTENT';
  scheduled_date: Date;
  scheduled_time: string;
  planned_duration_minutes: number; // in minutes
  clinical_notes?: string;
  nursing_notes?: string;
  price: number;
  machine_number?: string;
  bed_number?: string;
  is_emergency?: boolean;
}

export interface DialysisTreatmentData {
  dialysis_visit_id: number;
  nurse_id: number;
  actual_start_date: Date;
  actual_end_date?: Date;
  current_duration?: number;
  blood_flow_rate?: number;
  treatment_status?: string;
  treatment_notes?: string;
}

export interface DialysisVisitUpdateData {
  scheduled_date?: Date;
  scheduled_time?: string;
  planned_duration_minutes?: number;
  clinical_notes?: string;
  nursing_notes?: string;
  status?: string;
  price?: number;
  machine_number?: string;
  bed_number?: string;
  is_emergency?: boolean;
}

export interface DialysisStatistics {
  total_visits: number;
  completed_visits: number;
  cancelled_visits: number;
  total_revenue: number;
  average_duration: number;
  patient_satisfaction: number;
}

export interface PatientDialysisPaginationQuery {
  patientId: number;
  currentPage?: number;
  pageLimit?: number;
}

export interface PaginatedDialysisResource<T> {
  docs: T[];
  total: number;
  pages: number;
  currentPage: number;
  pageLimit: number;
}

export class DialysisService {
  /**
   * Create a new dialysis visit
   */
  static async createDialysisVisit(data: DialysisVisitData): Promise<DialysisVisit> {
    // Validate patient exists
    const patient = await Patient.findByPk(data.patient_id);
    if (!patient) {
      throw new BadException('NOT_FOUND', 404, 'Patient not found');
    }

    // Validate doctor exists
    const doctor = await Staff.findByPk(data.doctor_id);
    if (!doctor) {
      throw new BadException('NOT_FOUND', 404, 'Doctor not found');
    }

    // Validate nurse exists if specified
    if (data.nurse_id) {
      const nurse = await Staff.findByPk(data.nurse_id);
      if (!nurse) {
        throw new BadException('NOT_FOUND', 404, 'Nurse not found');
      }
    }

    // Validate visit exists if specified
    if (data.visit_id) {
      const visit = await Visit.findByPk(data.visit_id);
      if (!visit) {
        throw new BadException('NOT_FOUND', 404, 'Visit not found');
      }
    }

    // Check for scheduling conflicts
    const conflictingVisits = await DialysisVisit.findAll({
      where: {
        patient_id: data.patient_id,
        scheduled_date: {
          [Op.between]: [
            new Date(data.scheduled_date.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
            new Date(data.scheduled_date.getTime() + 24 * 60 * 60 * 1000), // 24 hours after
          ],
        },
        status: { [Op.in]: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingVisits.length > 0) {
      throw new BadException(
        'SCHEDULING_CONFLICT',
        400,
        'Patient has conflicting dialysis appointments'
      );
    }

    // Generate visit number
    const visitNumber = await this.generateDialysisVisitNumber();

    return await DialysisVisit.create({
      ...data,
      status: 'SCHEDULED',
    });
  }

  /**
   * Get dialysis visit by global visit ID
   */
  static async getDialysisVisit(globalVisitId: number): Promise<DialysisVisit | null> {
    return await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: Visit,
          attributes: visitAttributes,
        },
        {
          model: Staff,
          as: 'doctor',
          attributes: staffAttributes,
        },
        {
          model: Staff,
          as: 'nurse',
          attributes: staffAttributes,
        },
        {
          model: DialysisTreatment,
          order: [['start_time', 'ASC']],
        },
      ],
    });
  }

  /**
   * Get all dialysis visits with pagination
   */
  static async getDialysisVisits(params: {
    page?: number;
    limit?: number;
    status?: string;
    dialysis_type?: string;
    doctor_id?: number;
    nurse_id?: number;
    patient_id?: number;
    date_from?: Date;
    date_to?: Date;
    search?: string;
  }): Promise<{
    visits: DialysisVisit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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
    } = params;

    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dialysis_type) {
      where.dialysis_type = dialysis_type;
    }

    if (doctor_id) {
      where.doctor_id = doctor_id;
    }

    if (nurse_id) {
      where.nurse_id = nurse_id;
    }

    if (patient_id) {
      where.patient_id = patient_id;
    }

    if (date_from || date_to) {
      where.scheduled_date = {};
      if (date_from) where.scheduled_date[Op.gte] = date_from;
      if (date_to) where.scheduled_date[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { clinical_notes: { [Op.like]: `%${search}%` } },
        { nursing_notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await DialysisVisit.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: Staff,
          as: 'doctor',
          attributes: staffAttributes,
        },
        {
          model: Staff,
          as: 'nurse',
          attributes: staffAttributes,
        },
      ],
      order: [['scheduled_date', 'ASC']],
      limit,
      offset,
    });

    return {
      visits: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update dialysis visit
   */
  static async updateDialysisVisit(
    visitId: number,
    data: DialysisVisitUpdateData
  ): Promise<DialysisVisit> {
    const visit = await DialysisVisit.findOne({
      where: { visit_id: visitId },
    });
    if (!visit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found');
    }

    // Only allow updates if visit is in SCHEDULED status
    if (visit.status !== 'SCHEDULED') {
      throw new BadException(
        'INVALID_STATUS',
        400,
        'Cannot update visit that is not in SCHEDULED status'
      );
    }

    return await visit.update(data);
  }

  /**
   * Start dialysis treatment
   */
  static async startDialysisTreatment(
    visitId: number,
    treatmentData: DialysisTreatmentData
  ): Promise<DialysisTreatment> {
    const visit = await DialysisVisit.findOne({
      where: { visit_id: visitId },
    });
    if (!visit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found');
    }

    if (visit.status !== 'IN_PROGRESS') {
      throw new BadException('INVALID_STATUS', 400, 'Visit must be in progress to start treatment');
    }

    // Update visit status
    await visit.update({
      status: 'IN_PROGRESS',
      actual_start_date: new Date(),
    });

    // Create treatment record
    return await DialysisTreatment.create({
      ...treatmentData,
      actual_start_date: treatmentData.actual_start_date || new Date(),
      dialysis_visit_id: visit.id,
      visit_id: visitId,
      status: treatmentData.treatment_status,
    });
  }

  /**
   * Complete dialysis treatment
   */
  static async completeDialysisTreatment(
    visitId: number,
    treatmentData: DialysisTreatmentData,
    completedBy?: number
  ): Promise<DialysisTreatment> {
    const treatment = await DialysisTreatment.findOne({
      where: { visit_id: visitId },
      include: [DialysisVisit],
    });

    if (!treatment) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis treatment not found');
    }

    if (!treatment.actual_start_date) {
      throw new BadException('INVALID_STATUS', 400, 'Treatment must be started before completion');
    }

    // Update treatment
    await treatment.update({
      actual_end_date: treatmentData.actual_end_date,
      completedBy,
      status: TreatmentStatus.COMPLETED,
      current_duration:
        treatmentData.current_duration ||
        Math.round(
          (treatmentData.actual_start_date.getTime() - treatment.actual_start_date.getTime()) /
            (1000 * 60)
        ),
    });

    // Update visit status
    await treatment.dialysis_visit.update({
      status: 'COMPLETED',
      actual_end_date: new Date(),
    });

    return treatment;
  }

  /**
   * Cancel dialysis visit
   */
  static async cancelDialysisVisit(visitId: number, reason: string): Promise<DialysisVisit> {
    const visit = await DialysisVisit.findOne({
      where: { visit_id: visitId },
    });
    if (!visit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found');
    }

    if (visit.status === 'COMPLETED') {
      throw new BadException('INVALID_STATUS', 400, 'Cannot cancel completed visit');
    }

    return await visit.update({
      status: 'CANCELLED',
      cancellation_reason: reason,
    });
  }

  /**
   * Get dialysis statistics
   */
  static async getDialysisStatistics(): Promise<DialysisStatistics> {
    const [
      totalVisits,
      completedVisits,
      cancelledVisits,
      totalRevenue,
      averageDuration,
    ] = await Promise.all([
      DialysisVisit.count(),
      DialysisVisit.count({ where: { status: 'COMPLETED' } }),
      DialysisVisit.count({ where: { status: 'CANCELLED' } }),
      DialysisVisit.sum('price', { where: { status: 'COMPLETED' } }),
      DialysisTreatment.findAll({
        where: { actual_end_date: { [Op.ne]: null } },
        attributes: [
          [
            DialysisTreatment.sequelize.fn(
              'AVG',
              DialysisTreatment.sequelize.fn(
                'TIMESTAMPDIFF',
                DialysisTreatment.sequelize.literal('MINUTE'),
                DialysisTreatment.sequelize.col('actual_start_date'),
                DialysisTreatment.sequelize.col('actual_end_date')
              )
            ),
            'avg_duration',
          ],
        ],
      }),
    ]);

    const avgDuration = averageDuration[0]?.getDataValue('avg_duration') || 0;

    return {
      total_visits: totalVisits,
      completed_visits: completedVisits,
      cancelled_visits: cancelledVisits,
      total_revenue: totalRevenue || 0,
      average_duration: avgDuration,
      patient_satisfaction: 0, // Placeholder for future implementation
    };
  }

  /**
   * Get patient dialysis history
   */
  static async getPatientDialysisHistory(patientId: number): Promise<DialysisVisit[]> {
    return await DialysisVisit.findAll({
      where: { patient_id: patientId },
      include: [
        {
          model: DialysisTreatment,
          order: [['start_time', 'DESC']],
        },
        {
          model: Staff,
          as: 'doctor',
          attributes: staffAttributes,
        },
        {
          model: Staff,
          as: 'nurse',
          attributes: staffAttributes,
        },
      ],
      order: [['scheduled_date', 'DESC']],
    });
  }

  /**
   * Get doctor dialysis schedule
   */
  static async getDoctorDialysisSchedule(doctorId: number, date: Date): Promise<DialysisVisit[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await DialysisVisit.findAll({
      where: {
        doctor_id: doctorId,
        scheduled_date: {
          [Op.between]: [startOfDay, endOfDay],
        },
        status: { [Op.in]: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: DialysisTreatment,
        },
      ],
      order: [['scheduled_date', 'ASC']],
    });
  }

  /**
   * Get nurse dialysis schedule
   */
  static async getNurseDialysisSchedule(nurseId: number, date: Date): Promise<DialysisVisit[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await DialysisVisit.findAll({
      where: {
        nurse_id: nurseId,
        scheduled_date: {
          [Op.between]: [startOfDay, endOfDay],
        },
        status: { [Op.in]: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: DialysisTreatment,
        },
      ],
      order: [['scheduled_date', 'ASC']],
    });
  }

  /**
   * Generate dialysis visit number
   */
  static async generateDialysisVisitNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastVisit = await DialysisVisit.findOne({
      where: {
        id: { [Op.gte]: 1 },
      },
      order: [['id', 'DESC']],
    });

    let sequence = 1;
    if (lastVisit) {
      sequence = lastVisit.id + 1;
    }

    return `DV-${currentYear}-${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Export dialysis report by global visit ID
   */
  static async exportDialysisReport(
    globalVisitId: number
  ): Promise<{
    visit: DialysisVisit;
    treatments: DialysisTreatment[];
    summary: {
      total_duration: number;
      complications: string[];
      interventions: string[];
    };
  }> {
    const visit = await this.getDialysisVisit(globalVisitId);
    if (!visit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found for this global visit');
    }

    const treatments = visit.treatments || [];

    // Calculate total duration using new field names
    let totalDuration = 0;
    const complications: string[] = [];
    const interventions: string[] = [];

    for (const treatment of treatments) {
      if (treatment.actual_start_date && treatment.actual_end_date) {
        const duration =
          (new Date(treatment.actual_end_date).getTime() -
            new Date(treatment.actual_start_date).getTime()) /
          (1000 * 60);
        totalDuration += duration;
      }

      // Note: complications and interventions fields no longer exist in the new model
      // These are now stored in DialysisAssessment and DialysisNotes
      // For now, we'll return empty arrays
    }

    return {
      visit,
      treatments,
      summary: {
        total_duration: totalDuration,
        complications: complications, // Empty for now - data moved to assessment/notes
        interventions: interventions, // Empty for now - data moved to assessment/notes
      },
    };
  }

  // ========================================
  // DIALYSIS ASSESSMENT METHODS
  // ========================================

  /**
   * Create dialysis assessment by global visit ID
   */
  static async createDialysisAssessment(
    globalVisitId: number,
    assessmentData: any
  ): Promise<DialysisAssessment> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found for this global visit');
    }

    // Transform client data to backend format
    const transformedData = this.transformAssessmentFormData(assessmentData);

    return await DialysisAssessment.create({
      dialysis_visit_id: dialysisVisit.id,
      visit_id: globalVisitId,
      ...transformedData,
      assessment_date: new Date(),
      status: 'ACTIVE',
    });
  }

  /**
   * Update dialysis assessment
   */
  static async updateDialysisAssessment(
    assessmentId: number,
    updateData: any
  ): Promise<DialysisAssessment> {
    const assessment = await DialysisAssessment.findByPk(assessmentId);
    if (!assessment) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis assessment not found');
    }

    return await assessment.update(updateData);
  }

  /**
   * Get dialysis assessment by global visit ID
   */
  static async getDialysisAssessment(globalVisitId: number): Promise<DialysisAssessment | null> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      return null; // No dialysis visit found for this global visit
    }

    return await DialysisAssessment.findOne({
      where: { dialysis_visit_id: dialysisVisit.id },
      include: [
        {
          model: DialysisVisit,
          include: [
            {
              model: Patient,
              attributes: patientAttributes,
            },
          ],
        },
      ],
      order: [['assessment_date', 'DESC']],
    });
  }

  // ========================================
  // DIALYSIS VITALS METHODS
  // ========================================

  /**
   * Create dialysis vitals by global visit ID
   */
  static async createDialysisVitals(
    globalVisitId: number,
    staffId: number,
    vitalsData: any
  ): Promise<DialysisVitals> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found for this global visit');
    }

    // Validate staff exists
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new BadException('NOT_FOUND', 404, 'Staff member not found');
    }

    // Transform client data to backend format
    const transformedData = this.transformVitalsFormData(vitalsData);

    return await DialysisVitals.create({
      dialysis_visit_id: dialysisVisit.id,
      visit_id: globalVisitId,
      recorded_by: staffId,
      ...transformedData,
      recorded_at: new Date(),
      status: 'ACTIVE',
    });
  }

  /**
   * Get dialysis vitals by global visit ID
   */
  static async getDialysisVitals(globalVisitId: number): Promise<DialysisVitals[]> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      return []; // No dialysis visit found for this global visit
    }

    return await DialysisVitals.findAll({
      where: { dialysis_visit_id: dialysisVisit.id },
      include: [
        {
          model: Staff,
          attributes: staffAttributes,
        },
      ],
      order: [['time', 'DESC']],
    });
  }

  /**
   * Get latest dialysis vitals by global visit ID
   */
  static async getLatestDialysisVitals(globalVisitId: number): Promise<DialysisVitals | null> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      return null; // No dialysis visit found for this global visit
    }

    return await DialysisVitals.findOne({
      where: { dialysis_visit_id: dialysisVisit.id },
      include: [
        {
          model: Staff,
          attributes: staffAttributes,
        },
      ],
      order: [['time', 'DESC']],
    });
  }

  // ========================================
  // DIALYSIS NOTES METHODS
  // ========================================

  /**
   * Create dialysis notes by global visit ID
   */
  static async createDialysisNotes(
    globalVisitId: number,
    staffId: number,
    notesData: any
  ): Promise<DialysisNotes> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found for this global visit');
    }

    // Validate staff exists
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new BadException('NOT_FOUND', 404, 'Staff member not found');
    }

    // Transform client data to backend format
    const transformedData = this.transformNotesFormData(notesData);

    return await DialysisNotes.create({
      dialysis_visit_id: dialysisVisit.id,
      visit_id: globalVisitId,
      staff_id: staffId,
      ...transformedData,
      created_at: new Date(),
      updated_at: new Date(),
      status: 'ACTIVE',
    });
  }

  /**
   * Update dialysis notes
   */
  static async updateDialysisNotes(notesId: number, updateData: any): Promise<DialysisNotes> {
    const notes = await DialysisNotes.findByPk(notesId);
    if (!notes) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis notes not found');
    }

    return await notes.update({
      ...updateData,
      updated_at: new Date(),
    });
  }

  /**
   * Get dialysis notes by global visit ID
   */
  static async getDialysisNotes(globalVisitId: number): Promise<DialysisNotes[]> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      return []; // No dialysis visit found for this global visit
    }

    return await DialysisNotes.findAll({
      where: { dialysis_visit_id: dialysisVisit.id },
      include: [
        {
          model: Staff,
          attributes: staffAttributes,
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Get dialysis notes by type
   */
  static async getDialysisNotesByType(
    globalVisitId: number,
    type: string
  ): Promise<DialysisNotes[]> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
    });

    if (!dialysisVisit) {
      return []; // No dialysis visit found for this global visit
    }

    return await DialysisNotes.findAll({
      where: {
        dialysis_visit_id: dialysisVisit.id,
        type: type,
      },
      include: [
        {
          model: Staff,
          attributes: staffAttributes,
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  // ========================================
  // ENHANCED TREATMENT METHODS
  // ========================================

  /**
   * Enhanced update dialysis treatment
   */
  static async updateDialysisTreatment(
    visitId: number,
    updateData: any
  ): Promise<DialysisTreatment> {
    const treatment = await DialysisTreatment.findOne({
      where: { visit_id: visitId },
    });
    if (!treatment) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis treatment not found');
    }

    return await treatment.update({ ...updateData, status: updateData.treatment_status });
  }

  /**
   * Get comprehensive dialysis visit data by global visit ID
   */
  static async getComprehensiveDialysisVisit(
    globalVisitId: number
  ): Promise<{
    visit: DialysisVisit;
    assessment: DialysisAssessment | null;
    vitals: DialysisVitals[];
    notes: DialysisNotes[];
    treatments: DialysisTreatment[];
  }> {
    // First find the DialysisVisit record by global visit_id
    const dialysisVisit = await DialysisVisit.findOne({
      where: { visit_id: globalVisitId },
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: Staff,
          as: 'doctor',
          attributes: staffAttributes,
        },
        {
          model: Staff,
          as: 'nurse',
          attributes: staffAttributes,
        },
        {
          model: Visit,
          attributes: ['id', 'date_visit_start', 'status', 'priority', 'department'],
        },
      ],
    });

    if (!dialysisVisit) {
      throw new BadException('NOT_FOUND', 404, 'Dialysis visit not found for this global visit');
    }

    const [assessment, vitals, notes, treatments] = await Promise.all([
      this.getDialysisAssessment(globalVisitId),
      this.getDialysisVitals(globalVisitId),
      this.getDialysisNotes(globalVisitId),
      Promise.resolve(dialysisVisit.treatments || []),
    ]);

    return {
      visit: dialysisVisit,
      assessment,
      vitals,
      notes,
      treatments,
    };
  }

  private static async ensurePatientExists(patientId: number): Promise<void> {
    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Patient not found');
    }
  }

  private static mapPaginatedResult<T>(result: {
    docs: T[];
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  }): PaginatedDialysisResource<T> {
    return {
      docs: result.docs,
      total: result.total,
      pages: result.pages,
      currentPage: result.currentPage,
      pageLimit: result.perPage,
    };
  }

  /**
   * Get patient dialysis treatments with pagination
   */
  static async getPatientDialysisTreatments({
    patientId,
    currentPage = 1,
    pageLimit = 10,
  }: PatientDialysisPaginationQuery): Promise<PaginatedDialysisResource<DialysisTreatment>> {
    await this.ensurePatientExists(patientId);

    const result = await DialysisTreatment.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['actual_start_date', 'DESC']],
      include: [
        {
          model: DialysisVisit,
          attributes: ['id', 'dialysis_type', 'status', 'scheduled_date', 'scheduled_time'],
          where: { patient_id: patientId },
          required: true,
          include: [
            {
              model: Visit,
              attributes: visitAttributes,
            },
            {
              model: Staff,
              as: 'doctor',
              attributes: staffAttributes,
            },
            {
              model: Staff,
              as: 'nurse',
              attributes: staffAttributes,
            },
          ],
        },
        {
          model: Staff,
          as: 'nurse',
          attributes: staffAttributes,
        },
      ],
    });

    return result as unknown as PaginatedDialysisResource<DialysisTreatment>;
  }

  /**
   * Get patient dialysis assessments with pagination
   */
  static async getPatientDialysisAssessments({
    patientId,
    currentPage = 1,
    pageLimit = 10,
  }: PatientDialysisPaginationQuery): Promise<PaginatedDialysisResource<DialysisAssessment>> {
    await this.ensurePatientExists(patientId);

    const result = await DialysisAssessment.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['assessment_date', 'DESC']],
      include: [
        {
          model: DialysisVisit,
          attributes: ['id', 'dialysis_type', 'status', 'scheduled_date', 'scheduled_time'],
          where: { patient_id: patientId },
          required: true,
          include: [
            {
              model: Visit,
              attributes: visitAttributes,
            },
            {
              model: Staff,
              as: 'doctor',
              attributes: staffAttributes,
            },
            {
              model: Staff,
              as: 'nurse',
              attributes: staffAttributes,
            },
          ],
        },
        {
          model: Visit,
          attributes: visitAttributes,
        },
      ],
    });

    return result as unknown as PaginatedDialysisResource<DialysisAssessment>;
  }

  /**
   * Get patient dialysis vitals with pagination
   */
  static async getPatientDialysisVitals({
    patientId,
    currentPage = 1,
    pageLimit = 10,
  }: PatientDialysisPaginationQuery): Promise<PaginatedDialysisResource<DialysisVitals>> {
    await this.ensurePatientExists(patientId);

    const result = await DialysisVitals.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['recorded_at', 'DESC']],
      include: [
        {
          model: DialysisVisit,
          attributes: ['id', 'dialysis_type', 'status', 'scheduled_date', 'scheduled_time'],
          where: { patient_id: patientId },
          required: true,
          include: [
            {
              model: Visit,
              attributes: visitAttributes,
            },
            {
              model: Staff,
              as: 'doctor',
              attributes: staffAttributes,
            },
            {
              model: Staff,
              as: 'nurse',
              attributes: staffAttributes,
            },
          ],
        },
        {
          model: Staff,
          attributes: staffAttributes,
        },
        {
          model: Visit,
          attributes: visitAttributes,
        },
      ],
    });

    return result as unknown as PaginatedDialysisResource<DialysisVitals>;
  }

  /**
   * Get patient dialysis notes with pagination
   */
  static async getPatientDialysisNotes({
    patientId,
    currentPage = 1,
    pageLimit = 10,
  }: PatientDialysisPaginationQuery): Promise<PaginatedDialysisResource<DialysisNotes>> {
    await this.ensurePatientExists(patientId);

    const result = await DialysisNotes.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: DialysisVisit,
          attributes: ['id', 'dialysis_type', 'status', 'scheduled_date', 'scheduled_time'],
          where: { patient_id: patientId },
          required: true,
          include: [
            {
              model: Visit,
              attributes: visitAttributes,
            },
            {
              model: Staff,
              as: 'doctor',
              attributes: staffAttributes,
            },
            {
              model: Staff,
              as: 'nurse',
              attributes: staffAttributes,
            },
          ],
        },
        {
          model: Staff,
          attributes: staffAttributes,
        },
        {
          model: Visit,
          attributes: visitAttributes,
        },
      ],
    });

    return result as unknown as PaginatedDialysisResource<DialysisNotes>;
  }

  // ========================================
  // DATA TRANSFORMATION METHODS
  // ========================================

  /**
   * Transform client assessment form data to backend model format
   */
  static transformAssessmentFormData(clientData: any): any {
    return {
      // Patient Medical Information
      hiv_status: clientData.hiv_status || null,
      hbsag_status: clientData.hbsag_status || null,
      blood_group: clientData.blood_group || null,

      // Weight Management
      current_weight: clientData.current_weight ? parseFloat(clientData.current_weight) : null,
      dry_weight: clientData.dry_weight ? parseFloat(clientData.dry_weight) : null,
      previous_post_dialysis_weight: clientData.previous_post_dialysis_weight
        ? parseFloat(clientData.previous_post_dialysis_weight)
        : null,
      required_weight_loss: clientData.required_weight_loss
        ? parseFloat(clientData.required_weight_loss)
        : null,

      // Machine Parameters
      machine_type: clientData.machine_type || null,
      dialyser_type: clientData.dialyser_type || null,
      concentration_type: clientData.concentration_type || null,
      access_route: clientData.access_route || null,

      // Technical Parameters
      blood_flow_rate: clientData.blood_flow_rate ? parseFloat(clientData.blood_flow_rate) : null,
      ultrafiltration_rate: clientData.ultrafiltration_rate
        ? parseFloat(clientData.ultrafiltration_rate)
        : null,
      tmp: clientData.tmp ? parseFloat(clientData.tmp) : null,
      clothing_time: clientData.clothing_time ? parseInt(clientData.clothing_time) : null,

      // Medications & Treatments
      heparin_units: clientData.heparin_units ? parseInt(clientData.heparin_units) : null,
      infusion_drugs: clientData.infusion_drugs || null,
      blood_transfusion: clientData.blood_transfusion || null,

      // Clinical Assessment
      per_dialysis_assessment: clientData.per_dialysis_assessment || null,
      treatment_plan: clientData.treatment_plan || null,
      clinical_notes: clientData.clinical_notes || null,

      // ICD10 Diagnoses
      icd10_diagnoses: this.transformICD10DiagnosisData(clientData).diagnoses,
    };
  }

  /**
   * Transform client vitals form data to backend model format
   */
  static transformVitalsFormData(clientData: any): any {
    return {
      time: clientData.time || new Date().toTimeString().slice(0, 5), // HH:MM format
      blood_flow_rate: clientData.blood_flow_rate ? parseFloat(clientData.blood_flow_rate) : null,
      pulse: clientData.pulse ? parseFloat(clientData.pulse) : null,
      temperature: clientData.temperature ? parseFloat(clientData.temperature) : null,
      oxygen_saturation: clientData.oxygen_saturation
        ? parseFloat(clientData.oxygen_saturation)
        : null,
      weight: clientData.weight ? parseFloat(clientData.weight) : null,
      blood_pressure: clientData.blood_pressure || null,
      ultrafiltration_rate: clientData.ultrafiltration_rate
        ? parseFloat(clientData.ultrafiltration_rate)
        : null,
      ap: clientData.ap || null,
      venous_pressure: clientData.venous_pressure ? parseFloat(clientData.venous_pressure) : null,
      ivf: clientData.ivf ? parseFloat(clientData.ivf) : null,
      hep_hr: clientData.hep_hr ? parseFloat(clientData.hep_hr) : null,
      remarks: clientData.remarks || null,
    };
  }

  /**
   * Transform client notes form data to backend model format
   */
  static transformNotesFormData(clientData: any): any {
    return {
      type: clientData.type || 'clinical',
      title: clientData.title || null,
      content: clientData.content || null,
      is_urgent: clientData.is_urgent || false,
      requires_followup: clientData.requires_followup || false,
    };
  }

  /**
   * Transform client treatment form data to backend model format
   */
  static transformTreatmentFormData(clientData: any): any {
    return {
      actual_start_date: clientData.actual_start_date
        ? new Date(clientData.actual_start_date)
        : null,
      actual_end_date: clientData.actual_end_date ? new Date(clientData.actual_end_date) : null,
      current_duration: clientData.current_duration ? parseInt(clientData.current_duration) : null,
      treatment_status: clientData.treatment_status || 'not_started',
      blood_flow_rate: clientData.blood_flow_rate ? parseFloat(clientData.blood_flow_rate) : null,
      treatment_notes: clientData.treatment_notes || null,
    };
  }

  /**
   * Transform ICD10 diagnosis data for assessment
   */
  static transformICD10DiagnosisData(clientData: any): any {
    if (!clientData.selectedDiagnosis || !Array.isArray(clientData.selectedDiagnosis)) {
      return { diagnoses: [] };
    }

    return {
      diagnoses: clientData.selectedDiagnosis.map((diagnosis: any) => ({
        icd10_code: diagnosis.code || diagnosis.icd10_code,
        description: diagnosis.description || diagnosis.name,
        category: diagnosis.diagnosis || null,
      })),
    };
  }

  /**
   * Search ICD10 diagnoses for dialysis assessment
   */
  static async searchICD10Diagnoses(searchTerm: string, limit = 20): Promise<any[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const { ICD10Disease } = await import('../../database/models/icd10_disease');

    const diagnoses = await ICD10Disease.findAll({
      where: {
        [Op.or]: [
          { diagnosis: { [Op.like]: `%${searchTerm}%` } },
          { code: { [Op.like]: `%${searchTerm}%` } },
        ],
        is_active: true,
      } as any,
      attributes: ['id', 'code', 'diagnosis', 'class_code', 'sub_class_code'],
      limit: limit,
      order: [['diagnosis', 'ASC']],
    });

    return diagnoses.map(diagnosis => ({
      id: diagnosis.id,
      code: diagnosis.code,
      name: diagnosis.diagnosis,
      description: diagnosis.diagnosis,
      category: diagnosis.class_code || null,
      sub_category: diagnosis.sub_class_code || null,
    }));
  }
}
