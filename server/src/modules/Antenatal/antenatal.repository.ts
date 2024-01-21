import {
  Antenatal,
  AntenatalObservation,
  AntenatalTriage,
  ClinicalNote,
  Delivery,
  Patient,
  PostNatal,
  PreviousPregnancy,
  Staff,
  Visit,
} from '../../database/models';
import { Op, Optional, WhereOptions } from 'sequelize';
import { getVisitsQuery, patientAttributes } from '../Visit/visit.repository';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import {
  getPrescriptionAdditionalItems,
  getPrescriptionDrugs,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { getPrescriptionInvestigations } from '../Orders/Radiology/radiology-order.repository';
import { paginate } from '../../core/helpers/helper';
import { getPatientDiagnoses } from '../Consultation/consultation.repository';
import sequelizeConnection from '../../database/config/config';
import { AccountStatus } from '../../database/models/antenatal';
import { CreatePostNatal } from './types/antenatal.types';
import { VisitStatus } from '../../database/models/visit';

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
          'occupation',
          'next_of_kin_name',
          'next_of_kin_phone',
          'next_of_kin_address',
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

/**
 * Get patient previous pregnancies
 * @param query
 */
export const getPreviousPregnancies = async (query: WhereOptions<PreviousPregnancy>) => {
  return PreviousPregnancy.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
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
  filter = null,
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
      ...(filter && JSON.parse(filter)),
    },
    order: [['createdAt', 'DESC']],
  });
};

export const getAncTriages = async (query: WhereOptions<AntenatalTriage>) => {
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
  filter = null,
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
      ...(filter && { ...JSON.parse(filter) }),
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
  filter = null,
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
      ...(filter && { ...JSON.parse(filter) }),
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
    getAncTriages({ visit_id }),
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
        ...(await getPrescriptions(id)),
      })
    )
  );
  return paginate({ rows: summary, count }, currentPage, limit);
};

/***************************
 * DELIVERY INFO
 ***************************/
/**
 * Create a patient delivery information
 * @param data
 */
export const createDeliveryInfo = async data => {
  return Delivery.create({ ...data });
};

/**
 * get a patient delivery information
 * @param query
 */
export const getDeliveryInfo = async (query: WhereOptions<Delivery>) => {
  return Delivery.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/***************************
 * POST NATAL
 ***************************/
/**
 * Create a patient postnatal information
 * @param data
 * @param antenatalId
 */
export const createPostnatal = async (
  data: Optional<CreatePostNatal, keyof CreatePostNatal>,
  antenatalId: number
) => {
  return await sequelizeConnection.transaction(async t => {
    const postnatal = await PostNatal.create({ ...data }, { transaction: t });

    await Antenatal.update(
      { account_status: AccountStatus.COMPLETED, end_date: Date.now() },
      { where: { id: antenatalId }, transaction: t }
    );

    await Visit.update(
      { status: VisitStatus.ENDED, date_visit_ended: Date.now() },
      { where: { id: data.visit_id }, transaction: t }
    );
    return postnatal;
  });
};

/**
 * get a patient delivery information
 * @param query
 */
export const getPostnatalInfo = async (query: WhereOptions<PostNatal>) => {
  return PostNatal.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};
