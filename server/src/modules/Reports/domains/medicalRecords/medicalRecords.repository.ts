/* eslint-disable camelcase */
import { Op, QueryTypes, Sequelize, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import {
  Patient,
  Visit,
  Admission,
  Staff,
  Ward,
  Bed,
  PatientInsurance,
  Insurance,
  Discharge,
} from '../../../../database/models';
import { PatientStatus, Gender, Status } from '../../../../database/models/patient';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import { DischargeStatus } from '../../../../database/models/admission';
import { PatientType } from '../../../Patient/types/patient.types';
import {
  dateIntervalQuery,
  patientAttributes,
  calcLimitAndOffset,
  paginate,
} from '../../../../core/helpers/helper';
import sequelizeConnection from '../../../../database/config/data-source';
import { ReportFilters } from './types';

/**
 * Calculate age group from date of birth
 */
function calculateAgeGroup(dateOfBirth: Date): string {
  const age = dayjs().diff(dayjs(dateOfBirth), 'year');
  if (age < 1) return 'Infant (0-1)';
  if (age < 5) return 'Toddler (1-4)';
  if (age < 13) return 'Child (5-12)';
  if (age < 20) return 'Teen (13-19)';
  if (age < 40) return 'Young Adult (20-39)';
  if (age < 60) return 'Middle Age (40-59)';
  if (age < 80) return 'Senior (60-79)';
  return 'Elderly (80+)';
}

function buildDateWhereClause(filters: ReportFilters, dateField: string): Record<string, unknown> {
  const now = dayjs(); // current date (in your app's timezone)
  let startDate: Date;
  let endDate: Date;

  // Case 1: Both start and end provided
  if (filters.start && filters.end) {
    const start = dayjs(filters.start).startOf('day');
    const end = dayjs(filters.end).endOf('day');

    if (start.isAfter(end)) {
      throw new Error('Start date must be before or equal to end date.');
    }

    const diffYears = end.diff(start, 'year', true);
    if (diffYears > 2) {
      throw new Error('Date range cannot exceed 2 years.');
    }

    startDate = start.toDate();
    endDate = end.toDate();

    // Case 2: Only start provided → cap at start + 4 months
  } else if (filters.start) {
    const start = dayjs(filters.start).startOf('day');
    const end = start.add(4, 'month').endOf('day');
    startDate = start.toDate();
    endDate = end.toDate();

    // Case 3: Only end provided → go back 4 months from end
  } else if (filters.end) {
    const end = dayjs(filters.end).endOf('day');
    const start = end.subtract(4, 'month').startOf('day');
    startDate = start.toDate();
    endDate = end.toDate();

    // Case 4: No dates → default to last 4 months
  } else {
    endDate = now.endOf('day').toDate();
    startDate = now
      .subtract(4, 'month')
      .startOf('day')
      .toDate();
  }

  return {
    [dateField]: {
      [Op.gte]: startDate,
      [Op.lte]: endDate,
    },
  };
}

export async function getPatientRegistrationStats(filters: ReportFilters) {
  // Validate & build WHERE
  const where = buildDateWhereClause(filters, 'created_date');
  if (filters.patient_type) {
    where.patient_type = filters.patient_type;
  }

  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Run all aggregations in minimal queries
  const [total, dailyStats, byPatientType, byGender] = await Promise.all([
    // Total count (uses covering index!)
    Patient.count({ where }),

    // Daily breakdown — now groups on indexed created_date
    Patient.findAll({
      where,
      attributes: [
        ['created_date', 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['created_date'],
      order: [['created_date', 'ASC']],
      raw: true,
    }),

    // By patient_type
    Patient.findAll({
      where,
      attributes: ['patient_type', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['patient_type'],
      raw: true,
    }),

    // By gender
    Patient.findAll({
      where,
      attributes: ['gender', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['gender'],
      raw: true,
    }),
  ]);

  return {
    total,
    daily: dailyStats,
    by_patient_type: byPatientType,
    by_gender: byGender,
  };
}

/**
 * Get patient registration details
 */
export async function getPatientRegistrationDetails(filters: ReportFilters) {
  const where = buildDateWhereClause(filters, 'created_date');

  return await Patient.paginate({
    paginate: +filters.pageLimit,
    page: +filters.currentPage,
    where,
    attributes: [
      'id',
      'firstname',
      'lastname',
      'middlename',
      'date_of_birth',
      'gender',
      'phone',
      'address',
      'hospital_id',
      'patient_type',
      'createdAt',
      'created_date',
    ],
    // include: [
    //   {
    //     model: PatientInsurance,
    //     as: 'insurances',
    //     attributes: ['insurance_id', 'enrollee_code'],
    //     include: [
    //       {
    //         model: Insurance,
    //         as: 'insurance',
    //         attributes: ['name'],
    //       },
    //     ],
    //     required: false,
    //   },
    // ],
    order: [['created_date', 'DESC']],
  });
}

export async function getVisitCategoryStats(filters: ReportFilters) {
  // ✅ Use 'visit_date' — the indexed DATE column
  const dateWhere = buildDateWhereClause(filters, 'date_visit_start');

  // Build full WHERE clause with model-specific filters
  const where: WhereOptions = {
    ...dateWhere,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.department ? { department: { [Op.like]: `%${filters.department}%` } } : {}),
  };

  // Run queries in parallel
  const [total, byCategory, dailyStats, byDepartment] = await Promise.all([
    // Total count
    Visit.count({ where }),

    // By category
    Visit.findAll({
      where,
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    }),

    // Daily stats — now groups on indexed `visit_date`
    Visit.findAll({
      where,
      attributes: [
        ['visit_date', 'date'], // ✅ no DATE() function!
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['visit_date'],
      order: [['visit_date', 'ASC']],
      raw: true,
    }),

    // By department
    Visit.findAll({
      where,
      attributes: ['department', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['department'],
      raw: true,
    }),
  ]);

  return {
    total,
    by_category: byCategory,
    daily: dailyStats,
    by_department: byDepartment,
  };
}

/**
 * Get visit category details
 */
export async function getVisitCategoryDetails(filters: ReportFilters) {
  const where = buildDateWhereClause(filters, 'visit_date');

  // Add additional filters
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.department) {
    where.department = {
      [Op.like]: `%${filters.department}%`,
    };
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const { limit, offset } = calcLimitAndOffset(filters.currentPage || 1, filters.pageLimit || 10);

  const { rows, count } = await Visit.findAndCountAll({
    where,
    attributes: [
      'id',
      'category',
      'department',
      'professional',
      'type',
      'status',
      'priority',
      'date_visit_start',
      'date_visit_ended',
      'createdAt',
    ],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: [
          'id',
          'firstname',
          'lastname',
          'middlename',
          'hospital_id',
          'gender',
          'date_of_birth',
        ],
      },
      {
        model: Staff,
        as: 'staff',
        attributes: ['id', 'firstname', 'lastname', 'middlename'],
      },
    ],
    order: [['date_visit_start', 'DESC']],
    limit,
    offset,
  });

  return paginate({ rows, count }, filters.currentPage || 1, limit);
}

/**
 * Get patient demographics statistics
 */
export async function getPatientDemographics(filters: ReportFilters) {
  const where: any = {};

  // Determine date field based on context (registration date or visit date)
  // For demographics, we'll use registration date by default
  const dateWhere = buildDateWhereClause(filters, 'created_date');

  // Add additional filters
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Get patients with age calculation
  const patients = await Patient.findAll({
    where: { ...where, ...dateWhere },
    attributes: ['id', 'gender', 'date_of_birth', 'createdAt'],
    raw: true,
  });

  // Calculate age groups
  const ageGroups: Record<string, number> = {};
  const genderAgeGroups: Record<string, Record<string, number>> = {};
  const byGender: Record<string, number> = {};

  patients.forEach((patient: any) => {
    if (patient.date_of_birth) {
      const ageGroup = calculateAgeGroup(patient.date_of_birth);
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;

      // By gender and age group
      if (!genderAgeGroups[patient.gender]) {
        genderAgeGroups[patient.gender] = {};
      }
      genderAgeGroups[patient.gender][ageGroup] =
        (genderAgeGroups[patient.gender][ageGroup] || 0) + 1;
    }

    // By gender
    byGender[patient.gender] = (byGender[patient.gender] || 0) + 1;
  });

  return {
    total: patients.length,
    by_age_group: ageGroups,
    by_gender: byGender,
    by_gender_and_age_group: genderAgeGroups,
  };
}

/**
 * Get patient demographic details
 */
export async function getPatientDemographicDetails(filters: ReportFilters) {
  const where: any = {};
  const dateWhere = buildDateWhereClause(filters, 'created_date');

  // Add additional filters
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Filter by age group if specified
  const ageGroupFilter: any = {};
  if (filters.age_group) {
    // We'll need to filter in memory after fetching
    // For now, we'll get all patients and filter
  }

  const { limit, offset } = calcLimitAndOffset(filters.currentPage || 1, filters.pageLimit || 10);

  const { rows, count: totalCount } = await Patient.findAndCountAll({
    where: { ...where, ...dateWhere },
    attributes: [
      'id',
      'firstname',
      'lastname',
      'middlename',
      'date_of_birth',
      'gender',
      'phone',
      'address',
      'hospital_id',
      'createdAt',
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  // Filter by age group if specified
  let filteredRows = rows;
  if (filters.age_group) {
    filteredRows = rows.filter((patient: any) => {
      if (!patient.date_of_birth) return false;
      const ageGroup = calculateAgeGroup(patient.date_of_birth);
      return ageGroup === filters.age_group;
    });
  }

  // Add computed age group to each patient
  const rowsWithAgeGroup = filteredRows.map((patient: any) => {
    const ageGroup = patient.date_of_birth ? calculateAgeGroup(patient.date_of_birth) : 'Unknown';
    return {
      ...patient.toJSON(),
      age_group: ageGroup,
    };
  });

  return {
    rows: rowsWithAgeGroup,
    count: filters.age_group ? rowsWithAgeGroup.length : totalCount,
    pages: Math.ceil(
      (filters.age_group ? rowsWithAgeGroup.length : totalCount) / (filters.pageLimit || 10)
    ),
    currentPage: filters.currentPage || 1,
    pageLimit: filters.pageLimit || 10,
  };
}

export async function getAdmissionStats(filters: ReportFilters) {
  interface AvgLengthOfStayResult {
    avg_days: string;
  }
  // ✅ Use indexed 'admitted_date' instead of 'date_admitted'
  const dateWhere = buildDateWhereClause(filters, 'admitted_date');

  const where: WhereOptions = {
    ...dateWhere,
    ...(filters.ward_id ? { ward_id: filters.ward_id } : {}),
    ...(filters.status ? { discharge_status: filters.status } : {}),
  };
  const admissionTable = 'admissions';
  const dischargeTable = 'discharges';
  // Parallel queries
  const [
    total,
    currentAdmissions,
    dailyStats,
    byWard,
    byDischargeStatus,
    avgLengthOfStay,
  ] = await Promise.all([
    // Total admissions
    Admission.count({ where }),

    // Current (non-discharged) admissions
    Admission.count({
      where: {
        ...where,
        discharge_status: DischargeStatus.ON_ADMISSION,
      },
    }),

    // Daily breakdown — use admitted_date (indexed!)
    Admission.findAll({
      where,
      attributes: [
        ['admitted_date', 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('`Admission`.`id`')), 'count'], // ✅ qualified id
      ],
      group: ['admitted_date'],
      order: [['admitted_date', 'ASC']],
      raw: true,
    }),

    // By ward — include ward name safely
    Admission.findAll({
      where,
      attributes: ['ward_id', [Sequelize.fn('COUNT', Sequelize.col('`Admission`.`id`')), 'count']],
      group: ['ward_id'],
      include: [
        {
          model: Ward,
          as: 'ward',
          attributes: ['name'],
          required: true, // or false if optional
        },
      ],
      raw: true,
    }),

    // By discharge status
    Admission.findAll({
      where,
      attributes: [
        'discharge_status',
        [Sequelize.fn('COUNT', Sequelize.col('`Admission`.`id`')), 'count'],
      ],
      group: ['discharge_status'],
      raw: true,
    }),

    // ✅ Optimized: calculate avg length of stay in ONE JOINED QUERY
    (async () => {
      const result = await Admission.sequelize?.query<AvgLengthOfStayResult>(
        `
        SELECT 
          COALESCE(ROUND(AVG(DATEDIFF(d.date_discharged, a.date_admitted)), 1), 0) AS avg_days
        FROM ${admissionTable} a
        INNER JOIN ${dischargeTable} d ON a.id = d.admission_id
        WHERE 
          a.admitted_date BETWEEN :startDate AND :endDate
          ${filters.ward_id ? 'AND a.ward_id = :wardId' : ''}
          ${filters.status ? 'AND a.discharge_status = :status' : ''}
          AND a.discharge_status = :dischargedStatus
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            startDate: dateWhere.admitted_date[Op.gte],
            endDate: dateWhere.admitted_date[Op.lte],
            wardId: filters.ward_id,
            status: filters.status,
            dischargedStatus: DischargeStatus.DISCHARGED,
          },
        }
      );
      return parseFloat(result?.[0]?.avg_days ?? '0');
    })(),
  ]);

  return {
    total,
    current_admissions: currentAdmissions,
    daily: dailyStats,
    by_ward: byWard,
    by_discharge_status: byDischargeStatus,
    average_length_of_stay_days: avgLengthOfStay,
  };
}

/**
 * Get admission details
 */
export async function getAdmissionDetails(filters: ReportFilters) {
  const where: any = buildDateWhereClause(filters, 'date_admitted');

  // Add additional filters
  if (filters.ward_id) {
    where.ward_id = filters.ward_id;
  }
  if (filters.status) {
    where.discharge_status = filters.status;
  }

  const { limit, offset } = calcLimitAndOffset(filters.currentPage || 1, filters.pageLimit || 10);

  const { rows, count } = await Admission.findAndCountAll({
    where,
    attributes: ['id', 'date_admitted', 'discharge_status', 'createdAt'],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: [
          'id',
          'firstname',
          'lastname',
          'middlename',
          'hospital_id',
          'gender',
          'date_of_birth',
        ],
      },
      {
        model: Ward,
        as: 'ward',
        attributes: ['id', 'name'],
      },
      {
        model: Bed,
        as: 'bed',
        attributes: ['id', 'code', 'bed_type'],
      },
    ],
    order: [['date_admitted', 'DESC']],
    limit,
    offset,
  });

  // Get discharge records for admitted patients
  const admissionIds = rows.map((admission: any) => admission.id);
  const discharges = await Discharge.findAll({
    where: {
      admission_id: {
        [Op.in]: admissionIds,
      },
    },
    attributes: ['admission_id', 'date_discharged', 'discharge_type'],
    raw: true,
  });

  // Create a map of admission_id to discharge
  const dischargeMap = new Map();
  discharges.forEach((discharge: any) => {
    dischargeMap.set(discharge.admission_id, discharge);
  });

  // Add length of stay calculation
  const rowsWithLengthOfStay = rows.map((admission: any) => {
    const discharge = dischargeMap.get(admission.id);
    const dischargeDate = discharge?.date_discharged;
    const lengthOfStay =
      dischargeDate && admission.date_admitted
        ? dayjs(dischargeDate).diff(dayjs(admission.date_admitted), 'day')
        : admission.discharge_status === DischargeStatus.ON_ADMISSION
        ? dayjs().diff(dayjs(admission.date_admitted), 'day')
        : null;

    return {
      ...admission.toJSON(),
      discharge: discharge || null,
      length_of_stay_days: lengthOfStay,
    };
  });

  return paginate({ rows: rowsWithLengthOfStay, count }, filters.currentPage || 1, limit);
}

/**
 * Get deceased patient statistics
 */
export async function getDeceasedPatientStats(filters: ReportFilters) {
  const where: any = {
    patient_status: PatientStatus.DECEASED,
    ...buildDateWhereClause(filters, 'date_of_death'),
  };

  // Add additional filters
  if (filters.cause_of_death) {
    where.cause_of_death = {
      [Op.like]: `%${filters.cause_of_death}%`,
    };
  }
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Get total count
  const total = await Patient.count({ where });

  // Get daily breakdown
  const dailyStats = await Patient.findAll({
    where,
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('date_of_death')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    group: [Sequelize.fn('DATE', Sequelize.col('date_of_death'))],
    order: [[Sequelize.fn('DATE', Sequelize.col('date_of_death')), 'ASC']],
    raw: true,
  });

  // Get breakdown by cause of death
  const byCause = await Patient.findAll({
    where,
    attributes: ['cause_of_death', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
    group: ['cause_of_death'],
    raw: true,
  });

  // Get breakdown by gender
  const byGender = await Patient.findAll({
    where,
    attributes: ['gender', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
    group: ['gender'],
    raw: true,
  });

  // Get patients for age group calculation
  const patients = await Patient.findAll({
    where,
    attributes: ['id', 'gender', 'date_of_birth', 'date_of_death'],
    raw: true,
  });

  // Calculate age groups
  const byAgeGroup: Record<string, number> = {};
  patients.forEach((patient: any) => {
    if (patient.date_of_birth) {
      const ageGroup = calculateAgeGroup(patient.date_of_birth);
      byAgeGroup[ageGroup] = (byAgeGroup[ageGroup] || 0) + 1;
    }
  });

  return {
    total,
    daily: dailyStats,
    by_cause: byCause,
    by_gender: byGender,
    by_age_group: byAgeGroup,
  };
}

/**
 * Get deceased patient details
 */
export async function getDeceasedPatientDetails(filters: ReportFilters) {
  const where: any = {
    patient_status: PatientStatus.DECEASED,
    ...buildDateWhereClause(filters, 'date_of_death'),
  };

  // Add additional filters
  if (filters.cause_of_death) {
    where.cause_of_death = {
      [Op.like]: `%${filters.cause_of_death}%`,
    };
  }
  if (filters.gender) {
    where.gender = filters.gender;
  }

  const { limit, offset } = calcLimitAndOffset(filters.currentPage || 1, filters.pageLimit || 10);

  const { rows, count } = await Patient.findAndCountAll({
    where,
    attributes: [
      'id',
      'firstname',
      'lastname',
      'middlename',
      'date_of_birth',
      'gender',
      'phone',
      'address',
      'hospital_id',
      'date_of_death',
      'cause_of_death',
      'death_certificate_number',
      'marked_deceased_by',
      'marked_deceased_at',
      'createdAt',
    ],
    include: [
      {
        model: Staff,
        as: 'markedDeceasedBy',
        attributes: ['id', 'firstname', 'lastname', 'middlename', 'department'],
        required: false,
      },
    ],
    order: [['date_of_death', 'DESC']],
    limit,
    offset,
  });

  // Add age group calculation
  const rowsWithAgeGroup = rows.map((patient: any) => {
    const ageGroup = patient.date_of_birth ? calculateAgeGroup(patient.date_of_birth) : 'Unknown';
    return {
      ...patient.toJSON(),
      age_group: ageGroup,
    };
  });

  return paginate({ rows: rowsWithAgeGroup, count }, filters.currentPage || 1, limit);
}
