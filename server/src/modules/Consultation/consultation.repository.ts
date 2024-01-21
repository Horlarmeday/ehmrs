/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import { paginate, StatusCodes } from '../../core/helpers/helper';
import { Complaint, Diagnosis, History, Staff, Visit } from '../../database/models';
import { WhereOptions } from 'sequelize';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import {
  getPrescriptionAdditionalItems,
  getPrescriptionDrugs,
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
    has_smoking_history,
    visit_id,
    staff_id,
    patient_id,
  } = data;

  return History.create({
    complaint_note,
    history_note,
    examination_note,
    has_smoking_history: has_smoking_history || false,
    visit_id,
    staff_id,
    patient_id,
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
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/**
 * get a model by visit id
 * @param model
 * @param query
 * @returns {array} of model data
 */
export async function getModelByVisitId(model, query: WhereOptions<Visit>): Promise<any> {
  return model.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
}

/**
 * get consultation/visit summary
 * @param data
 * @returns {object} consultation summary data
 */
export async function getConsultationSummary(data: WhereOptions<Visit>) {
  const complaint = getModelByVisitId(Complaint, data) as Promise<Complaint[]>;
  const history = getModelByVisitId(History, data) as Promise<History[]>;

  try {
    const [complaints, histories] = await Promise.all([complaint, history]);
    return {
      histories,
      complaints,
    };
  } catch (e) {
    throw new BadException('ERROR', StatusCodes.SERVER_ERROR, e);
  }
}

export const getPrescriptions = async (visit_id: number, category: VisitCategory) => {
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
  ] = await Promise.all([
    getPrescriptionTests({ visit_id }),
    getPrescriptionDrugs({ visit_id }),
    getPrescriptionInvestigations({ visit_id }),
    (category === VisitCategory.ANC ? getAntenatalObservations : getConsultationSummary)({
      visit_id,
    }),
    (category === VisitCategory.ANC ? getAncTriages : getTriages)({ visit_id }),
    getPatientDiagnoses({ visit_id }),
    getPrescriptionAdditionalItems({ visit_id }),
    getPrescriptionServices({ visit_id }),
    category === VisitCategory.ANC
      ? getAntenatalClinicalNotes({ visit_id })
      : Promise.resolve(null),
  ]);
  return { tests, drugs, investigations, observations, triages, diagnoses, items, services, notes };
};

/**
 * get consultation history
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
    ['id', 'date_visit_start', 'date_visit_ended', 'patient_id', 'category', 'status']
  );
  const summary = await Promise.all(
    visits.map(
      async ({ id, date_visit_start, date_visit_ended, patient_id, category, status }) => ({
        id,
        date_visit_start,
        date_visit_ended,
        patient_id,
        category,
        status,
        ...(await getPrescriptions(id, category)),
      })
    )
  );
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
