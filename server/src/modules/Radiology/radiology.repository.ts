import {
  HMO,
  Imaging,
  Insurance,
  Investigation,
  Patient,
  Test,
  TestTariff,
} from '../../database/models';
import { Op } from 'sequelize';
import { canUsePriceTariff } from '../../core/helpers/helper';
import { InvestigationTariff } from '../../database/models/investigationTariff';
import { getModelById } from '../../core/helpers/general';

/**
 * create new imaging
 * @param data
 * @returns {object} imaging data
 */
export const createImaging = async data => {
  const { name, description, staff_id } = data;
  return Imaging.create({
    name,
    description,
    staff_id,
  });
};

/**
 * get imaging by id
 * @param data
 * @returns {object} return imaging data
 */
export const getImagingById = data => {
  return Imaging.findByPk(data);
};

/**
 * get imaging
 *
 * @function
 * @returns {json} json object with imaging data
 * @param currentPage
 * @param pageLimit
 */
export async function getImaging(currentPage = 1, pageLimit = 10) {
  return Imaging.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * search imaging
 *
 * @function
 * @returns {json} json object with imaging data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchImaging(currentPage = 1, pageLimit = 10, search) {
  return Imaging.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * update a imaging
 * @param data
 * @returns {object} imaging data
 */
export const updateImaging = async data => {
  const { imaging_id } = data;
  const imaging = await getModelById(Imaging, imaging_id);
  return imaging.update(data);
};

/**
 * create an Investigation
 * @param data
 * @returns {object} investigation data
 */
export const createInvestigation = async data => {
  const { name, imaging_id, staff_id, price } = data;
  const investigation = await Investigation.create({
    name,
    imaging_id,
    staff_id,
    price,
  });
  return Investigation.findOne({
    where: { id: investigation.id },
    include: [{ model: Imaging, attributes: ['name'] }],
  });
};

/**
 * get Investigations
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 */
export async function getInvestigations(currentPage = 1, pageLimit = 10) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
  });
}

/**
 * get Investigations under an imaging
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function filterInvestigations(currentPage = 1, pageLimit = 10, filter) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
    where: {
      imaging_id: filter,
    },
  });
}

/**
 * search Investigations
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchInvestigations(currentPage = 1, pageLimit = 10, search) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * update a investigation
 * @param data
 * @returns {object} investigation data
 */
export const updateInvestigation = async data => {
  const { investigation_id } = data;
  const investigation = await getModelById(Investigation, investigation_id);
  return investigation.update(data);
};

/** ***********************
 * INVESTIGATION TARIFFS
 ********************** */
/**
 * create test tariff
 *
 * @function
 * @returns {json} json object with tests data
 * @param data
 */
export const createInvestigationTariff = async data => {
  return InvestigationTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const investigationPriceTariff = async (patient: Patient, investigation_id: number) => {
  const { price } =
    (await InvestigationTariff.findOne({
      where: { investigation_id, hmo_id: patient.hmo_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getInvestigationPrice = (patient: Patient, investigation_id: number) => {
  if (canUsePriceTariff(patient)) return investigationPriceTariff(patient, investigation_id);
  return null;
};
