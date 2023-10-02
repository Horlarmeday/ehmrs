import {
  Antenatal,
  AntenatalObservation,
  AntenatalTriage,
  Patient,
  PreviousPregnancy,
  Staff,
} from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { ClinicalNote } from '../../database/models';
import { getVisitsQuery, patientAttributes } from '../Visit/visit.repository';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import {
  getPrescriptionAdditionalItems,
  getPrescriptionDrugs,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { getPrescriptionInvestigations } from '../Orders/Radiology/radiology-order.repository';
import { paginate } from '../../core/helpers/helper';
import { getPatientDiagnoses } from '../Consultation/consultation.repository';

export const staffAttributes = ['fullname', 'firstname', 'lastname'];

/**
 * Create a patient antenatal account
 * @param data
 */
export const createAntenatalAccount = async data => {
  return Antenatal.create({ ...data });
};

/**
 * Get one antenatal account
 * @param query
 */
export const getOneAntenatalAccount = async (query: WhereOptions<Antenatal>) => {
  return Antenatal.findOne({
    where: { ...query },
    include: [
      {
        model: Patient,
        attributes: [
          'fullname',
          'firstname',
          'lastname',
          'date_of_birth',
          'photo',
          'photo_url',
          'gender',
          'hospital_id',
          'has_insurance',
        ],
      },
    ],
  });
};

/**
 * update antenatal data
 * @param data
 * @returns {Promise<Antenatal>} return antenatal data
 */
export const updateAntenatalAccount = async (data: { [x: string]: any }): Promise<Antenatal> => {
  const antenatal = await getOneAntenatalAccount({ id: data.id });
  return antenatal.update(data);
};

/**
 * get antenatal patients
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with antenatal patients data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export const getAntenatalPatients = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
}): Promise<{
  currentPage: number;
  docs: Antenatal[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return Antenatal.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      ...(search && {
        [Op.or]: [
          {
            antenatal_number: {
              [Op.eq]: search,
            },
          },
          {
            '$patient.firstname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.lastname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.hospital_id$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Staff,
        attributes: staffAttributes,
      },
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
};

/**
 * Create a patient previous pregnancies
 * @param data
 */
export const createPreviousPregnancies = async data => {
  return PreviousPregnancy.bulkCreate(data);
};

/****************
 * TRIAGE
 ***************/

/**
 * Create antenatal triage
 * @param data
 */
export const createAntenatalTriage = async data => {
  return AntenatalTriage.create(data);
};

/**
 * get antenatal triages
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with antenatal triages data
 * @param currentPage
 * @param pageLimit
 * @param antenatalId
 */
export const getAntenatalTriages = async ({
  currentPage = 1,
  pageLimit = 10,
  antenatalId,
}): Promise<{
  currentPage: number;
  docs: Antenatal[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return AntenatalTriage.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      ante_natal_id: antenatalId,
    },
    order: [['createdAt', 'DESC']],
  });
};

export const getTriages = async (query: WhereOptions<AntenatalTriage>) => {
  return AntenatalTriage.findAll({ where: { ...query } });
};

/******************
 * CLINICAL NOTES
 ******************/

/**
 * Create antenatal clinical note
 * @param data
 */
export const createClinicalNote = async data => {
  const clinicalNote = await ClinicalNote.create(data);
  return getOneClinicalNote({ id: clinicalNote.id });
};

/**
 * get antenatal clinical notes
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with antenatal clinical notes data
 * @param currentPage
 * @param pageLimit
 * @param antenatalId
 */
export const getClinicalNotes = async ({
  currentPage = 1,
  pageLimit = 10,
  antenatalId,
}): Promise<{
  currentPage: number;
  docs: Antenatal[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return ClinicalNote.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      ante_natal_id: antenatalId,
    },
    include: [{ model: Staff, attributes: staffAttributes }],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * get one clinical note
 * @param query
 */
export const getOneClinicalNote = async (query: WhereOptions<ClinicalNote>) => {
  return ClinicalNote.findOne({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/**
 * Update antenatal clinical note
 * @param data
 * @param query
 */
export const updateClinicalNote = async (
  data: { [p: string]: any },
  query: WhereOptions<ClinicalNote>
) => {
  const clinicalNote = await getOneClinicalNote({ ...query });
  return clinicalNote.update(data);
};

export const getAntenatalClinicalNotes = async (query: WhereOptions<ClinicalNote>) => {
  return ClinicalNote.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/************************
 * ANTENATAL OBSERVATION
 ************************/

/**
 * Create a patient antenatal observation
 * @param data
 */
export const createObservation = async data => {
  return AntenatalObservation.create({ ...data });
};

/**
 * get one antenatal observation
 * @param query
 */
export const getOneObservation = async (query: WhereOptions<AntenatalObservation>) => {
  return AntenatalObservation.findOne({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/**
 * Update antenatal observation
 * @param data
 * @param query
 */
export const updateObservation = async (
  data: { [p: string]: any },
  query: WhereOptions<AntenatalObservation>
) => {
  const observation = await getOneObservation({ ...query });
  return observation.update(data);
};

/**
 * get antenatal observations
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with antenatal observations data
 * @param currentPage
 * @param pageLimit
 * @param antenatalId
 */
export const getObservations = async ({
  currentPage = 1,
  pageLimit = 10,
  antenatalId,
}): Promise<{
  currentPage: number;
  docs: Antenatal[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return AntenatalObservation.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      ante_natal_id: antenatalId,
    },
    include: [{ model: Staff, attributes: staffAttributes }],
    order: [['createdAt', 'DESC']],
  });
};

export const getAntenatalObservations = async (query: WhereOptions<AntenatalObservation>) => {
  return AntenatalObservation.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/***************************
 * ANTENATAL VISITS SUMMARY
 ***************************/

const getPrescriptions = async (visit_id: number) => {
  const [
    tests,
    drugs,
    investigations,
    observations,
    triages,
    notes,
    diagnoses,
    items,
  ] = await Promise.all([
    getPrescriptionTests({ visit_id }),
    getPrescriptionDrugs({ visit_id }),
    getPrescriptionInvestigations({ visit_id }),
    getAntenatalObservations({ visit_id }),
    getTriages({ visit_id }),
    getAntenatalClinicalNotes({ visit_id }),
    getPatientDiagnoses({ visit_id }),
    getPrescriptionAdditionalItems({ visit_id }),
  ]);
  return { tests, drugs, investigations, observations, triages, notes, diagnoses, items };
};

export const getVisitsSummary = async (currentPage = 1, pageLimit = 5, antenatalId: number) => {
  const { visits, limit, count } = await getVisitsQuery(
    currentPage,
    pageLimit,
    {
      ante_natal_id: antenatalId,
    },
    ['id', 'date_visit_start', 'date_visit_ended']
  );
  const summary = await Promise.all(
    visits.map(async ({ id, date_visit_start, date_visit_ended }) => ({
      id,
      date_visit_start,
      date_visit_ended,
      ...(await getPrescriptions(id)),
    }))
  );
  return paginate({ rows: summary, count }, currentPage, limit);
};
