/* eslint-disable camelcase */

import { Op, Transaction, WhereOptions } from 'sequelize';

import { Insurance, Patient, PatientInsurance, Staff, Visit } from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
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
import { getOneDefault } from '../AdminSettings/admin.repository';
import { getInventories } from '../Inventory/inventory.repository';
import { getDrugPrice } from '../Pharmacy/pharmacy.repository';
import { getInventoryItemQuery } from '../Inventory/inventory.repository';
import { PrescribedDrug, PrescribedAdditionalItem, DrugPrescription } from '../../database/models';
import dayjs from 'dayjs';
import { sequelizeConnection } from '../../database/config/data-source';
import { emitChargeCapturedForRows } from '../Outbox/outbox-writer';
import {
  DrugForm,
  PharmacyDrugType,
  DrugGroup,
  DrugStatus,
  PaymentStatus,
  VisitCategory,
  VisitStatus,
} from '../../database/enums';
import { NHISApprovalStatus } from '../../core/helpers/general';
import { getDrugType, EXCLUDED_INSURANCE } from '../../core/helpers/helper';
import { isEmpty } from 'lodash';
import { isToday } from '../../core/helpers/helper';

/**
 * create a patient visit
 * @param data
 * @param transaction optional; when supplied the INSERT joins the caller's transaction so the
 *   visit and its outbox event commit atomically (ADR-0018)
 * @returns {Promise<Visit>} visit data
 */
export async function createVisit(data, transaction?: Transaction): Promise<Visit> {
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

  return Visit.create(
    {
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
    },
    transaction ? { transaction } : undefined
  );
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
    include: [
      { model: Staff, attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
    ],
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

/**
 * get past visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param category
 * @param filter
 */
export async function getPastVisits({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  filter = null,
  start = null,
  end = null,
}: {
  currentPage?: number;
  pageLimit?: number;
  search?: string;
  filter?: string;
  start?: Date;
  end?: Date;
}): Promise<{
  total: number;
  docs: Visit[];
  pages: number;
  perPage: number;
  currentPage: number;
}> {
  const query = {
    status: VisitStatus.ENDED,
    ...(start && end && dateIntervalQuery('date_visit_ended', start, end)),
  };
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_visit_start', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(filter && JSON.parse(filter)),
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
}

/** ***********************
 * VISITS SUMMARY
 ********************** */
/**
 * Get all prescriptions in a visit
 * @param visitId
 */
export const getVisitPrescriptions = async (visitId: number) => {
  const visit = await getVisitById(visitId);
  const ancIds = [visit?.ante_natal_id]?.filter(Boolean);
  const [prescriptions] = await getPrescriptions([visitId], [VisitCategory.OPD], ancIds);
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

/**
 * Get the last drug prescription for a patient
 * @param patient_id
 */
const getLastDrugPrescription = async (patient_id: number) => {
  return DrugPrescription.findOne({
    where: { patient_id },
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Create a new drug prescription
 * @param data
 */
const createDrugPrescription = async (data: any) => {
  return DrugPrescription.create(data);
};

/**
 * Get or create drug prescription for a patient
 * @param patient_id
 * @param data
 */
const getDrugPrescription = async (patient_id: number, data: any) => {
  const drugPrescriptionData = {
    source: data.source,
    requester: 'staff_id' in data ? data.staff_id : data.examiner,
    visit_id: data.visit_id,
    patient_id,
    date_prescribed: Date.now(),
    ...(data?.ante_natal_id && { ante_natal_id: data?.ante_natal_id }),
  };

  const lastPrescription = await getLastDrugPrescription(patient_id);

  if (lastPrescription && !isToday(lastPrescription?.date_prescribed))
    return createDrugPrescription(drugPrescriptionData);

  // if drug has not been dispensed - pick the id and use it in prescribed drug
  if (lastPrescription?.status === DrugStatus.PENDING) return lastPrescription;

  // if drug was prescribed today and has been dispensed - create new one
  if (lastPrescription?.status === DrugStatus.COMPLETE_DISPENSE)
    return createDrugPrescription(drugPrescriptionData);

  return createDrugPrescription(drugPrescriptionData);
};

/**
 * Insert default dialysis items when a dialysis visit is created
 * @param patient
 * @param visit
 * @param insurance
 */
export const insertDefaultDialysisItems = async ({
  patient,
  visit,
  insurance,
}: {
  patient: Patient;
  visit: Visit;
  insurance?: PatientInsurance | null;
}): Promise<boolean> => {
  try {
    // Get dialysis defaults
    const dialysisDefault = await getOneDefault({ type: 'DIALYSIS_ITEMS' });
    if (!dialysisDefault || !dialysisDefault.data || isEmpty(dialysisDefault.data)) {
      return false;
    }

    const drugType = getDrugType(patient.has_insurance, insurance);
    const inventories = await getInventories();
    const isNHIS = insurance ? EXCLUDED_INSURANCE.includes(insurance?.insurance?.name) : false;

    // Get drug prescription for this visit
    const drugPrescription = await getDrugPrescription(patient.id, {
      visit_id: visit.id,
      source: 'Consultation',
      examiner: visit.staff_id,
    });

    // Separate drugs and consumables
    const drugs = dialysisDefault.data.filter(item => item.type === 'drug');
    const consumables = dialysisDefault.data.filter(item => item.type === 'consumable');

    // Create prescribed drugs
    if (!isEmpty(drugs)) {
      const mapDrugs = await Promise.all(
        drugs.map(async drug => {
          const inventory_id =
            inventories.find(inventory =>
              inventory.name.toLowerCase().includes(drugType.toLowerCase())
            )?.id || 1;

          const inventoryItem = await getInventoryItemQuery({
            inventory_id,
            drug_id: drug?.drug?.drug_id,
          });
          const drugPrice =
            (await getDrugPrice(patient, drug?.drug?.drug_id, inventoryItem)) * +drug?.quantity;

          return {
            drug_id: drug?.drug?.drug_id,
            drug_type: drug?.drug?.drug_type,
            quantity_prescribed: drug?.quantity,
            quantity_to_dispense: drug?.quantity,
            route_id: drug?.drug?.route?.id,
            dosage_form_id: drug?.drug?.dosage_form?.id,
            prescribed_strength: drug?.prescribed_strength,
            strength_id: drug?.drug?.strength?.id,
            frequency: drug?.frequency || 'OD',
            duration: 1,
            duration_unit: 'Days',
            total_price:
              drug?.drug?.drug_type === PharmacyDrugType.NHIS ? drugPrice * 0.1 : drugPrice,
            examiner: visit.staff_id,
            patient_id: patient.id,
            visit_id: visit.id,
            start_date: Date.now(),
            date_prescribed: Date.now(),
            drug_prescription_id: drugPrescription?.id,
            drug_group: drug?.drug?.drug_type === PharmacyDrugType.NHIS ? DrugGroup.PRIMARY : null,
            inventory_id,
            source: 'Consultation',
            unit_id: drug?.drug?.unit_id,
            ...(drug?.drug?.drug_type === PharmacyDrugType.NHIS && {
              nhis_status: NHISApprovalStatus.PENDING,
            }),
            patient_insurance_id: insurance?.id || null,
          };
        })
      );

      await sequelizeConnection.transaction(async t => {
        const created = await PrescribedDrug.bulkCreate(mapDrugs, { transaction: t });
        await emitChargeCapturedForRows('drug', created, dayjs().format('YYYY-MM-DD'), t);
      });
    }

    // Create prescribed additional items (consumables)
    if (!isEmpty(consumables)) {
      const mapConsumables = await Promise.all(
        consumables.map(async consumable => {
          const inventory_id =
            inventories.find(inventory =>
              inventory.name.toLowerCase().includes(drugType.toLowerCase())
            )?.id || 1;

          const inventoryItem = await getInventoryItemQuery({
            inventory_id,
            drug_id: consumable?.drug?.drug_id,
          });
          const drugPrice =
            (await getDrugPrice(patient, consumable?.drug?.drug_id, inventoryItem)) *
            +consumable?.quantity;

          return {
            drug_form: DrugForm.CONSUMABLE,
            visit_id: visit.id,
            date_prescribed: Date.now(),
            drug_id: consumable?.drug?.drug_id,
            drug_type: consumable?.drug?.drug_type,
            quantity_prescribed: consumable?.quantity,
            quantity_to_dispense: consumable?.quantity,
            total_price:
              consumable?.drug?.drug_type === PharmacyDrugType.NHIS ? drugPrice * 0.1 : drugPrice,
            examiner: visit.staff_id,
            patient_id: patient.id,
            start_date: Date.now(),
            drug_prescription_id: drugPrescription?.id,
            inventory_id,
            source: 'Consultation',
            unit_id: consumable?.drug?.unit_id,
            ...(consumable?.drug?.drug_type === PharmacyDrugType.NHIS && {
              nhis_status: NHISApprovalStatus.PENDING,
            }),
            patient_insurance_id: insurance?.id || null,
          };
        })
      );

      await sequelizeConnection.transaction(async t => {
        const created = await PrescribedAdditionalItem.bulkCreate(mapConsumables, {
          transaction: t,
        });
        await emitChargeCapturedForRows(
          'additional_item',
          created,
          dayjs().format('YYYY-MM-DD'),
          t
        );
      });
    }

    return true;
  } catch (error) {
    console.error('Error inserting default dialysis items:', error);
    return false;
  }
};
