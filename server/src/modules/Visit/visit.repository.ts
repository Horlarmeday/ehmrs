/* eslint-disable camelcase */

import { Op, WhereOptions } from 'sequelize';

import { Insurance, Patient, PatientInsurance, Staff, Visit } from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { VisitCategory, VisitStatus } from '../../database/models/visit';
import {
  calcLimitAndOffset,
  dateIntervalQuery,
  patientAttributes,
  staffAttributes,
} from '../../core/helpers/helper';
import { FindAttributeOptions } from 'sequelize/types/model';
import { getVisitPrescriptions as getPrescriptions } from '../Consultation/consultation.repository';
import { getOneTriage } from '../Triage/triage.repository';
import { getOnePrescribedTest } from '../Orders/Laboratory/lab-order.repository';
import {
  getOneAdditionalItemWithJoins,
  getOnePrescribedDrug,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { getOnePrescribedService } from '../Orders/Service/service-order.repository';
import { getOnePrescribedInvestigation } from '../Orders/Radiology/radiology-order.repository';
import { PaymentStatus } from '../../database/models/prescribedDrug';

/**
 * create a patient visit
 * @param data
 * @returns {Promise<Visit>} visit data
 */
export async function createVisit(data): Promise<Visit> {
  const {
    patient_id,
    type,
    staff_id,
    ante_natal_id,
    category,
    professional,
    department,
    date_of_visit,
    priority,
    immunization_id,
  } = data || {};

  return Visit.create({
    patient_id,
    category,
    professional,
    department,
    date_visit_start: date_of_visit,
    type,
    staff_id,
    ante_natal_id,
    priority,
    immunization_id,
  });
}

/**
 * get a patient last visit status
 * @returns {Promise<Visit>} visit data
 * @param patient_id
 */
export async function getLastActiveVisit(patient_id: number): Promise<Visit> {
  return Visit.findOne({
    where: { patient_id, status: VisitStatus.ONGOING },
    order: [['createdAt', 'DESC']],
  });
}

/**
 * end a patient visit
 * @returns {Promise<Visit>} visit data
 * @param visit
 */
export async function endVisit(visit: Visit): Promise<Visit> {
  return visit.update({ status: VisitStatus.ENDED, date_visit_ended: Date.now() });
}

/**
 * get patient visit by Id
 * @returns {Promise<Visit>} visit data
 * @param id
 */
export async function getVisitById(id: number): Promise<Visit> {
  return Visit.findByPk(id);
}

/**
 * get patient visit
 * @returns {Promise<Visit>} visit data
 * @param query
 */
export const getOneVisitQuery = (query: WhereOptions<Visit>): Promise<Visit> => {
  return Visit.findOne({ where: { ...query } });
};

/**
 * get a visit by Id and including patient details
 * @param id
 */
export async function getVisit(id: number) {
  const visit = await Visit.findOne({
    where: { id },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
  if (visit) {
    const [insurance, triage] = await Promise.all([
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
      getOneTriage({
        patient_id: visit.patient_id,
      }),
    ]);
    return { ...visit.toJSON(), insurance, triage };
  }
  return null;
}

/**
 * Update a patient visit
 * @param query
 * @param fieldsToUpdate
 */
export const updateVisit = (query: WhereOptions<Visit>, fieldsToUpdate: Partial<Visit>) => {
  return Visit.update({ ...fieldsToUpdate }, { where: { ...query } });
};

/** ***********************
 * ACTIVE VISITS
 ********************** */

/**
 * search active visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with active visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 * @param filter
 */
export async function searchActiveVisits({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
  filter = null,
}): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
      ...(start && end && dateIntervalQuery('date_visit_start', start, end)),
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
        where: {
          ...(filter && JSON.parse(filter)),
          [Op.or]: [
            {
              firstname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              hospital_id: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              complete_name: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

/**
 * get all active visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
 * @param currentPage
 * @param pageLimit
 * @param start
 * @param end
 * @param filter
 */
export async function getActiveVisits({
  currentPage = 1,
  pageLimit = 10,
  start = null,
  end = null,
  filter = null,
}): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
      ...(start && end && dateIntervalQuery('date_visit_start', start, end)),
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(filter && JSON.parse(filter)),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

/** ***********************
 * ALL VISITS
 ********************** */

/**
 * search all visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchVisits({
  currentPage = 1,
  pageLimit = 10,
  search,
}): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          [Op.or]: [
            {
              firstname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              complete_name: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              hospital_id: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

/**
 * get all visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
 * @param currentPage
 * @param pageLimit
 * @param start
 * @param end
 */
export async function getVisits({
  currentPage = 1,
  pageLimit = 10,
  start = null,
  end = null,
}): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('date_visit_start', start, end)),
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

export const getVisitsQuery = async (
  currentPage = 1,
  pageLimit = 5,
  query: WhereOptions<Visit>,
  attributes: FindAttributeOptions
) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const visits = await Visit.findAll({
    where: { ...query },
    order: [['date_visit_start', 'DESC']],
    offset,
    limit,
    attributes,
    include: [{ model: Staff, attributes: staffAttributes }],
  });
  const count = await Visit.count({ where: { ...query } });
  return { visits, limit, offset, count };
};

/** ***********************
 * CATEGORY VISITS
 ********************** */

/**
 * search categorize visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param category
 * @param filter
 */
export async function searchCategoryVisits({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  category = 'Outpatient',
  filter = null,
}: {
  currentPage: number;
  pageLimit: number;
  search: string;
  category: string;
  filter: any;
}): Promise<{
  total: any;
  docs: Visit[];
  pages: number;
  perPage: number;
  currentPage: number;
}> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      category,
      status: VisitStatus.ONGOING,
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          [Op.or]: [
            {
              firstname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              hospital_id: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              complete_name: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

/**
 * get categorized visits
 *
 * @function
 * @returns { Promise<{total: any, docs: any, pages: number, perPage: number, currentPage: number}>} json object with visits data
 * @param currentPage
 * @param pageLimit
 * @param category
 * @param filter
 */
export async function getCategoryVisits({
  currentPage = 1,
  pageLimit = 10,
  category = 'Outpatient',
  filter = null,
}): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      category,
      status: VisitStatus.ONGOING,
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
}

/** ****************************
 * PROFESSIONAL ASSIGNED VISITS
 ***************************** */
/**
 * search professional assigned visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param role
 * @param start
 * @param end
 * @param filter
 */
export const getProfessionalAssignedVisits = async ({
  currentPage = 1,
  pageLimit = 10,
  role,
  search = null,
  start = null,
  end = null,
  filter = null,
}): Promise<{
  total: any;
  docs: Visit[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['updatedAt', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
      professional: role,
      ...(filter && JSON.parse(filter)),
      [Op.or]: [
        {
          category: VisitCategory.OPD,
        },
        {
          category: VisitCategory.EMERGENCY,
        },
      ],
      ...(start && end && dateIntervalQuery('updatedAt', start, end)),
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                complete_name: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
};

/** ***********************
 * VISITS SUMMARY
 ********************** */
/**
 * Get all prescriptions in a visit
 * @param visitId
 */
export const getVisitPrescriptions = async (visitId: number) => {
  const [prescriptions] = await getPrescriptions([visitId], [VisitCategory.OPD]);
  return prescriptions;
};

/**
 * Get all prescriptions in a visit
 * @param visit_id
 */
export const getPatientPendingPrescriptions = async (visit_id: number) => {
  const visit = await getVisit(visit_id);
  if (visit?.patient?.has_insurance && visit?.insurance) return {};

  const [test, drug, item, service, investigation] = await Promise.all([
    getOnePrescribedTest({ visit_id, payment_status: PaymentStatus.PENDING }),
    getOnePrescribedDrug({ visit_id, payment_status: PaymentStatus.PENDING }),
    getOneAdditionalItemWithJoins({ visit_id, payment_status: PaymentStatus.PENDING }),
    getOnePrescribedService({ visit_id, payment_status: PaymentStatus.PENDING }),
    getOnePrescribedInvestigation({ visit_id, payment_status: PaymentStatus.PENDING }),
  ]);
  return {
    testName: test?.test?.name,
    drugName: drug?.drug?.name,
    item: item?.drug?.name,
    serviceName: service?.service?.name,
    investigationName: investigation?.investigation?.name,
  };
};
