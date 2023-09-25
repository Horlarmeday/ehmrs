import {
  Antenatal,
  AntenatalTriage,
  Patient,
  PreviousPregnancy,
  Staff,
} from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { ClinicalNote } from '../../database/models';

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
        attributes: ['firstname', 'lastname', 'fullname'],
      },
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
    include: [{ model: Staff, attributes: ['firstname', 'lastname', 'fullname'] }],
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
    include: [{ model: Staff, attributes: ['firstname', 'lastname', 'fullname'] }],
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
