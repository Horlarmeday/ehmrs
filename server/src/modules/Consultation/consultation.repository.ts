/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import { getPrescriptionsByVisit, paginate, StatusCodes } from '../../core/helpers/helper';
import { Complaint, Diagnosis, History, Staff, Visit } from '../../database/models';
import { WhereOptions } from 'sequelize';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import {
  getAdditionalItems,
  getDrugsPrescribed,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { getPrescriptionInvestigations } from '../Orders/Radiology/radiology-order.repository';
import { getTriages } from '../Triage/triage.repository';
import { getVisitById, getVisitsQuery } from '../Visit/visit.repository';
import { getPrescriptionServices } from '../Orders/Service/service-order.repository';
import {
  getAncTriages,
  getAntenatalClinicalNotes,
  getAntenatalObservations,
  staffAttributes,
} from '../Antenatal/antenatal.repository';
import { VisitCategory } from '../../database/models/visit';
import { getWardRounds } from '../Admission/admission.repository';
import { getVisitsPrescriptions } from '../Pharmacy/pharmacy.repository';

/**
 * create a patient complaint
 * @param data
 * @returns {object} complaint data
 */
export async function createComplaint(data) {
  const { patient_id, complaint, frequency, frequency_number, notes, visit_id, staff_id } = data;

  return Complaint.create({
    patient_id,
    complaint,
    frequency,
    frequency_number,
    notes,
    visit_id,
    staff_id,
  });
}

/**
 * create a bulk patient complaint
 * @param data
 * @returns {object} complaint data
 */
export async function bulkCreateComplaint(data) {
  return Complaint.bulkCreate(data);
}

/**
 * create a patient history
 * @param data
 * @returns {object} patient history data
 */
export async function createObservation(data) {
  const {
    complaint_note,
    history_note,
    examination_note,
    chest,
    other_examination,
    cvs,
    mss,
    abdomen,
    visit_id,
    staff_id,
    patient_id,
    patient_insurance_id,
    ent,
    cns,
    respiratory,
    additional_complaint,
  } = data || {};

  return History.create({
    complaint_note,
    history_note,
    examination_note,
    chest,
    other_examination,
    cvs,
    mss,
    abdomen,
    visit_id,
    staff_id,
    patient_id,
    patient_insurance_id,
    ent,
    cns,
    respiratory,
    additional_complaint,
  });
}

/**
 * create a patient diagnosis
 * @param data
 * @returns {Promise<Diagnosis[]>} diagnosis data
 */
export async function bulkCreateDiagnosis(data): Promise<Diagnosis[]> {
  return Diagnosis.bulkCreate(data);
}

/**
 * get a patient diagnoses
 * @returns {Promise<Diagnosis[]>} diagnosis data
 * @param query
 */
export const getPatientDiagnoses = async (query: WhereOptions<Diagnosis>): Promise<Diagnosis[]> => {
  return Diagnosis.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/**
 * get one diagnosis
 * @returns {Promise<Diagnosis>} diagnosis data
 * @param query
 */
export const getOneDiagnosis = async (query: WhereOptions<Diagnosis>): Promise<Diagnosis> => {
  return Diagnosis.findOne({ where: { ...query } });
};

/**
 * get a model by visit id
 * @param model
 * @param query
 * @returns {array} of model data
 */
export async function getModelByVisitId(model, query: WhereOptions<Visit>): Promise<any> {
  return model.findAll({
    order: [['createdAt', 'DESC']],
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
}

/**
 * get consultation/visit summary
 * @returns {object} consultation summary data
 * @param query
 */
export async function getConsultationSummary(query: WhereOptions<History>) {
  return History.findAll({
    order: [['createdAt', 'DESC']],
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
}

/**
 * get visit observations
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getObservations = async (visitIds: number[], categories: VisitCategory[]) => {
  const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
  const nonAncVisitIds = visitIds.filter((_, index) => categories[index] !== VisitCategory.ANC);

  const [ancObservations, consultationSummaries] = await Promise.all([
    ancVisitIds.length > 0 ? getAntenatalObservations({ visit_id: ancVisitIds }) : [],
    nonAncVisitIds.length > 0 ? getConsultationSummary({ visit_id: nonAncVisitIds }) : [],
  ]);

  return [...ancObservations, ...consultationSummaries];
};

/**
 * get clinical notes
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getClinicalNotes = async (visitIds: number[], categories: VisitCategory[]) => {
  const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
  return getAntenatalClinicalNotes({ visit_id: ancVisitIds });
};

/**
 * get visit triages
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitTriages = async (visitIds: number[], categories: VisitCategory[]) => {
  const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
  const nonAncVisitIds = visitIds.filter((_, index) => categories[index] !== VisitCategory.ANC);

  const [ancTriages, regularTriages] = await Promise.all([
    ancVisitIds.length > 0 ? getAncTriages({ visit_id: ancVisitIds }) : [],
    nonAncVisitIds.length > 0 ? getTriages({ visit_id: nonAncVisitIds }) : [],
  ]);

  return [...ancTriages, ...regularTriages];
};

/**
 * get clinical notes
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitsWardRounds = async (visitIds: number[], categories: VisitCategory[]) => {
  const ipdVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.IPD);
  return getWardRounds({ visit_id: ipdVisitIds });
};

/**
 * get visits prescriptions
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitPrescriptions = async (visitIds: number[], categories: VisitCategory[]) => {
  const [
    tests,
    drugs,
    investigations,
    observations,
    triages,
    diagnoses,
    items,
    services,
    notes,
    wardRounds,
  ] = await Promise.all([
    getPrescriptionTests({ visit_id: visitIds }),
    getDrugsPrescribed({ visit_id: visitIds }),
    getPrescriptionInvestigations({ visit_id: visitIds }),
    getObservations(visitIds, categories),
    getVisitTriages(visitIds, categories),
    getPatientDiagnoses({ visit_id: visitIds }),
    getAdditionalItems({ visit_id: visitIds }),
    getPrescriptionServices({ visit_id: visitIds }),
    getClinicalNotes(visitIds, categories),
    getVisitsWardRounds(visitIds, categories),
  ]);

  const data = {
    tests: getPrescriptionsByVisit(tests.map(prescription => prescription.toJSON())),
    drugs: getPrescriptionsByVisit(drugs.map(prescription => prescription.toJSON())),
    investigations: getPrescriptionsByVisit(
      investigations.map(prescription => prescription.toJSON())
    ),
    observations: getPrescriptionsByVisit(observations.map(prescription => prescription.toJSON())),
    triages: getPrescriptionsByVisit(triages.map(prescription => prescription.toJSON())),
    diagnoses: getPrescriptionsByVisit(diagnoses.map(prescription => prescription.toJSON())),
    items: getPrescriptionsByVisit(items.map(prescription => prescription.toJSON())),
    services: getPrescriptionsByVisit(services.map(prescription => prescription.toJSON())),
    notes: getPrescriptionsByVisit(notes.map(prescription => prescription.toJSON())),
    wardRounds: getPrescriptionsByVisit(wardRounds.map(prescription => prescription.toJSON())),
  };

  return visitIds.map(id => ({
    tests: data.tests[id] || [],
    drugs: data.drugs[id] || [],
    investigations: data.investigations[id] || [],
    observations: data.observations[id] || [],
    triages: data.triages[id] || [],
    diagnoses: data.diagnoses[id] || [],
    items: data.items[id] || [],
    services: data.services[id] || [],
    notes: data.notes[id] || [],
    wardRounds: data.wardRounds[id] || [],
  }));
};

/**
 * get consultation history
 *
 * @returns {Promise<{total: number, docs: any[], pages: number, perPage: number, currentPage: number}>} consultation summary data
 * @param currentPage
 * @param pageLimit
 * @param patientId
 */
export const getVisitsHistory = async (
  currentPage = 1,
  pageLimit = 5,
  patientId: number
): Promise<{
  total: number;
  docs: any[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  const { visits, limit, count } = await getVisitsQuery(
    currentPage,
    pageLimit,
    {
      patient_id: patientId,
    },
    ['id', 'date_visit_start', 'date_visit_ended', 'patient_id', 'category', 'status', 'staff_id']
  );
  const visitJSON = visits.map(visit => visit.toJSON());
  const visitIds = visitJSON.map(visit => visit.id);
  const categories = visitJSON.map(visit => visit.category);

  const prescriptions = await getVisitPrescriptions(visitIds, categories);

  const summary = visitJSON.map((visit, index) => ({
    ...visit,
    ...prescriptions[index],
  }));

  return paginate({ rows: summary, count }, currentPage, limit);
};

/**
 * get patient diagnoses and consultation findings
 * @param visit_id
 */
export const getDiagnosesAndFindings = async (visit_id: number) => {
  const visit = await getVisitById(visit_id);
  const [diagnoses, findings] = await Promise.all([
    getPatientDiagnoses({ visit_id }),
    (visit.category === VisitCategory.ANC ? getAntenatalObservations : getConsultationSummary)({
      visit_id,
    }),
  ]);
  return { diagnoses, findings };
};

/**
 * get diagnoses
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getDiagnoses = async ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return Diagnosis.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
  });
};

/**
 * get consultation histories
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getHistories = async ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return History.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
  });
};
