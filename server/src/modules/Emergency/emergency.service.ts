import {
  EmergencyVisit,
  EmergencyTriage,
  EmergencyBed,
  EmergencyProcedure,
  Patient,
  Staff,
  Visit,
  Ward,
} from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { Op } from 'sequelize';

export interface EmergencyVisitData {
  patient_id: number;
  visit_id: number; // Required - links to general visit
  attending_physician_id: number;
  emergency_type:
    | 'TRAUMA'
    | 'MEDICAL'
    | 'SURGICAL'
    | 'OBSTETRIC'
    | 'PEDIATRIC'
    | 'PSYCHIATRIC'
    | 'CARDIAC'
    | 'RESPIRATORY'
    | 'NEUROLOGICAL';
  triage_category: 'IMMEDIATE' | 'EMERGENT' | 'URGENT' | 'LESS_URGENT' | 'NON_URGENT';
  priority_score: number;
  chief_complaint: string;
  presenting_symptoms?: string;
  vital_signs?: string;
  allergies?: string;
  current_medications?: string;
  past_medical_history?: string;
  social_history?: string;
  mode_of_arrival?: string;
  accompanying_person?: string;
  contact_phone?: string;
  notes?: string;
  is_insured?: boolean;
  insurance_id?: number;
  insurance_number?: string;
}

export interface TriageData {
  emergency_visit_id: number;
  triage_nurse_id: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  pain_score?: number;
  glasgow_coma_scale?: number;
  chief_complaint: string;
  presenting_symptoms?: string;
  mechanism_of_injury?: string;
  allergies?: string;
  current_medications?: string;
  past_medical_history?: string;
  social_history?: string;
  family_history?: string;
  triage_notes?: string;
  recommended_action?: string;
  disposition?: string;
}

export interface BedAssignmentData {
  emergency_visit_id: number;
  bed_id: number;
  assigned_nurse_id: number;
  expected_discharge_time?: Date;
  notes?: string;
}

export interface EmergencyStatistics {
  total_visits: number;
  active_visits: number;
  triage_pending: number;
  bed_occupancy_rate: number;
  average_wait_time: number;
  critical_cases: number;
  by_emergency_type: Record<string, number>;
  by_triage_category: Record<string, number>;
}

export class EmergencyService {
  /**
   * Create emergency visit
   */
  static async createEmergencyVisit(data: EmergencyVisitData): Promise<EmergencyVisit> {
    // Validate patient exists
    const patient = await Patient.findByPk(data.patient_id);
    if (!patient) {
      throw new BadException('NOT_FOUND', 404, 'Patient not found');
    }

    // Validate attending physician exists
    const physician = await Staff.findByPk(data.attending_physician_id);
    if (!physician) {
      throw new BadException('NOT_FOUND', 404, 'Attending physician not found');
    }

    // Validate visit exists (required)
    const visit = await Visit.findByPk(data.visit_id);
    if (!visit) {
      throw new BadException('NOT_FOUND', 404, 'Visit not found');
    }

    // Create emergency visit
    return await EmergencyVisit.create({
      ...data,
      arrival_time: new Date(),
      status: 'TRIAGE',
    });
  }

  /**
   * Get emergency visit by ID
   */
  static async getEmergencyVisit(visitId: number): Promise<EmergencyVisit | null> {
    return await EmergencyVisit.findByPk(visitId, {
      include: [
        {
          model: Patient,
          attributes: ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone'],
        },
        {
          model: Visit,
          attributes: ['date_visit_start', 'category', 'status'],
        },
        {
          model: Staff,
          as: 'attending_physician',
          attributes: ['first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Staff,
          as: 'triage_nurse',
          attributes: ['first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Staff,
          as: 'emergency_nurse',
          attributes: ['first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: EmergencyTriage,
          order: [['createdAt', 'DESC']],
        },
        {
          model: EmergencyProcedure,
          order: [['planned_time', 'ASC']],
        },
      ],
    });
  }

  /**
   * Get all emergency visits with pagination
   */
  static async getEmergencyVisits(params: {
    page?: number;
    limit?: number;
    status?: string;
    emergency_type?: string;
    triage_category?: string;
    doctor_id?: number;
    nurse_id?: number;
    patient_id?: number;
    date_from?: Date;
    date_to?: Date;
    search?: string;
  }): Promise<{
    visits: EmergencyVisit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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
      search,
    } = params;

    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (emergency_type) where.emergency_type = emergency_type;
    if (triage_category) where.triage_category = triage_category;
    if (doctor_id) where.attending_physician_id = doctor_id;
    if (patient_id) where.patient_id = patient_id;

    if (date_from || date_to) {
      where.arrival_time = {};
      if (date_from) where.arrival_time[Op.gte] = date_from;
      if (date_to) where.arrival_time[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { chief_complaint: { [Op.like]: `%${search}%` } },
        { presenting_symptoms: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await EmergencyVisit.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          attributes: ['first_name', 'last_name'],
        },
        {
          model: Staff,
          as: 'attending_physician',
          attributes: ['first_name', 'last_name'],
        },
      ],
      order: [
        ['priority_score', 'ASC'],
        ['arrival_time', 'ASC'],
      ],
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
   * Perform triage assessment
   */
  static async performTriage(triageData: TriageData): Promise<EmergencyTriage> {
    // Validate emergency visit exists
    const emergencyVisit = await EmergencyVisit.findByPk(triageData.emergency_visit_id);
    if (!emergencyVisit) {
      throw new BadException('NOT_FOUND', 404, 'Emergency visit not found');
    }

    // Validate triage nurse exists
    const nurse = await Staff.findByPk(triageData.triage_nurse_id);
    if (!nurse) {
      throw new BadException('NOT_FOUND', 404, 'Triage nurse not found');
    }

    // Create triage record
    const triage = await EmergencyTriage.create({
      ...triageData,
      status: 'COMPLETED',
      triage_completed_time: new Date(),
    });

    // Update emergency visit with triage results
    await emergencyVisit.update({
      status: 'ASSESSMENT',
      triage_completed_time: new Date(),
      triage_nurse_id: triageData.triage_nurse_id,
    });

    return triage;
  }

  /**
   * Assign emergency bed
   */
  static async assignEmergencyBed(assignmentData: BedAssignmentData): Promise<EmergencyBed> {
    // Validate emergency visit exists
    const emergencyVisit = await EmergencyVisit.findByPk(assignmentData.emergency_visit_id);
    if (!emergencyVisit) {
      throw new BadException('NOT_FOUND', 404, 'Emergency visit not found');
    }

    // Validate bed exists and is available
    const bed = await EmergencyBed.findByPk(assignmentData.bed_id);
    if (!bed) {
      throw new BadException('NOT_FOUND', 404, 'Emergency bed not found');
    }

    if (!bed.isAvailable()) {
      throw new BadException('BED_OCCUPIED', 400, 'Bed is not available');
    }

    // Validate assigned nurse exists
    const nurse = await Staff.findByPk(assignmentData.assigned_nurse_id);
    if (!nurse) {
      throw new BadException('NOT_FOUND', 404, 'Assigned nurse not found');
    }

    // Update bed assignment
    await bed.update({
      status: 'OCCUPIED',
      current_emergency_visit_id: assignmentData.emergency_visit_id,
      assigned_nurse_id: assignmentData.assigned_nurse_id,
      assigned_time: new Date(),
      expected_discharge_time: assignmentData.expected_discharge_time,
    });

    // Update emergency visit status
    await emergencyVisit.update({
      status: 'TREATMENT',
    });

    return bed;
  }

  /**
   * Get available emergency beds
   */
  static async getAvailableEmergencyBeds(
    bedType?: string,
    requiredEquipment?: string[]
  ): Promise<EmergencyBed[]> {
    const where: any = {
      status: 'AVAILABLE',
    };

    if (bedType) {
      where.bed_type = bedType;
    }

    const beds = await EmergencyBed.findAll({ where });

    if (requiredEquipment && requiredEquipment.length > 0) {
      return beds.filter(bed => bed.hasRequiredEquipment(requiredEquipment));
    }

    return beds;
  }

  /**
   * Get emergency statistics
   */
  static async getEmergencyStatistics(): Promise<EmergencyStatistics> {
    const [
      totalVisits,
      activeVisits,
      triagePending,
      criticalCases,
      emergencyTypeStats,
      triageCategoryStats,
    ] = await Promise.all([
      EmergencyVisit.count(),
      EmergencyVisit.count({
        where: { status: { [Op.in]: ['TRIAGE', 'ASSESSMENT', 'TREATMENT', 'OBSERVATION'] } },
      }),
      EmergencyVisit.count({ where: { status: 'TRIAGE' } }),
      EmergencyVisit.count({ where: { triage_category: { [Op.in]: ['IMMEDIATE', 'EMERGENT'] } } }),
      EmergencyVisit.findAll({
        attributes: [
          'emergency_type',
          [EmergencyVisit.sequelize.fn('COUNT', EmergencyVisit.sequelize.col('id')), 'count'],
        ],
        group: ['emergency_type'],
      }),
      EmergencyVisit.findAll({
        attributes: [
          'triage_category',
          [EmergencyVisit.sequelize.fn('COUNT', EmergencyVisit.sequelize.col('id')), 'count'],
        ],
        group: ['triage_category'],
      }),
    ]);

    // Calculate bed occupancy rate
    const totalBeds = await EmergencyBed.count();
    const occupiedBeds = await EmergencyBed.count({ where: { status: 'OCCUPIED' } });
    const bedOccupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    // Calculate average wait time (simplified)
    const averageWaitTime = 0; // Placeholder for future implementation

    // Process statistics
    const byEmergencyType: Record<string, number> = {};
    emergencyTypeStats.forEach(stat => {
      byEmergencyType[stat.getDataValue('emergency_type')] = parseInt(stat.getDataValue('count'));
    });

    const byTriageCategory: Record<string, number> = {};
    triageCategoryStats.forEach(stat => {
      byTriageCategory[stat.getDataValue('triage_category')] = parseInt(stat.getDataValue('count'));
    });

    return {
      total_visits: totalVisits,
      active_visits: activeVisits,
      triage_pending: triagePending,
      bed_occupancy_rate: bedOccupancyRate,
      average_wait_time: averageWaitTime,
      critical_cases: criticalCases,
      by_emergency_type: byEmergencyType,
      by_triage_category: byTriageCategory,
    };
  }

  /**
   * Generate emergency visit number
   */
  private static async generateEmergencyVisitNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastVisit = await EmergencyVisit.findOne({
      where: {
        id: { [Op.gte]: 1 },
      },
      order: [['id', 'DESC']],
    });

    let sequence = 1;
    if (lastVisit) {
      sequence = lastVisit.id + 1;
    }

    return `EM-${currentYear}-${sequence.toString().padStart(4, '0')}`;
  }
}
