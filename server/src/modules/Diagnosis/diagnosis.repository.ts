import { ICD10Disease, ICPC2Disease } from '../../database/models';
import { Op, Optional } from 'sequelize';
import { getModelById } from '../../core/helpers/general';

export const createICD10Disease = async (data: ICD10Disease | Optional<any, string>) => {
  return ICD10Disease.create({ ...data });
};

export const createICPC2Disease = async (data: ICPC2Disease | Optional<any, string>) => {
  return ICD10Disease.create({ ...data });
};

/**
 * update ICD10 disease
 * @param data
 * @returns {object} ICD10 disease data
 */
export const updateICD10Disease = async data => {
  const { disease_id } = data;
  const icd10 = await getModelById(ICD10Disease, disease_id);
  return icd10.update(data);
};

/**
 * update ICPC2 disease
 * @param data
 * @returns {object} ICPC2 disease data
 */
export const updateICPC2Disease = async data => {
  const { disease_id } = data;
  const icpc2 = await getModelById(ICPC2Disease, disease_id);
  return icpc2.update(data);
};

/**
 * search icd10 diseases
 *
 * @function
 * @returns {json} json object with ICD10 diseases data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export const searchICD10Diseases = async (currentPage = 1, pageLimit = 10, search) => {
  return ICD10Disease.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['diagnosis', 'ASC']],
    where: {
      diagnosis: {
        [Op.like]: `%${search}%`,
      },
    },
  });
};

/**
 * search ICPC2 diseases
 *
 * @function
 * @returns {json} json object with ICPC2 diseases data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export const searchICPC2Diseases = async (currentPage = 1, pageLimit = 10, search) => {
  return ICPC2Disease.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['diagnosis', 'ASC']],
    where: {
      diagnosis: {
        [Op.like]: `%${search}%`,
      },
    },
  });
};

/**
 * get ICD10 diseases
 *
 * @function
 * @returns {json} json object with ICD10 diseases data
 * @param currentPage
 * @param pageLimit
 */
export const getICD10Diseases = async (currentPage = 1, pageLimit = 10) => {
  return ICD10Disease.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['diagnosis', 'ASC']],
  });
};

/**
 * get ICPC2 diseases
 *
 * @function
 * @returns {json} json object with ICPC2 diseases data
 * @param currentPage
 * @param pageLimit
 */
export const getICPC2Diseases = async (currentPage = 1, pageLimit = 10) => {
  return ICPC2Disease.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['diagnosis', 'ASC']],
  });
};
