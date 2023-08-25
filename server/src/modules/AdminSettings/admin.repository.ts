/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { getModelById, getNumberOfRecords } from '../../core/helpers/general';

import {
  Department,
  Unit,
  Ward,
  Bed,
  Service,
  ServiceTariff,
  Patient,
} from '../../database/models';
import { canUsePriceTariff } from '../../core/helpers/helper';

/** ***********************
 * DEPARTMENT
 ********************** */

/**
 * create a department
 * @param data
 * @returns {object} department data
 */
export async function createDepartment(data) {
  const { name, description, staff_id } = data;

  return Department.create({
    name,
    staff_id,
    description,
  });
}

/**
 * update a department
 * @param data
 * @returns {object} department data
 */
export async function updateDepartment(data) {
  const { department_id } = data;
  const department = await getModelById(Department, department_id);
  return department.update(data);
}

/**
 * search departments
 *
 * @function
 * @returns {json} json object with departments data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchDepartments(currentPage = 1, pageLimit = 10, search) {
  return Department.paginate({
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
 * get departments
 *
 * @function
 * @returns {json} json object with departments data
 * @param currentPage
 * @param pageLimit
 */
export async function getDepartments(currentPage = 1, pageLimit = 10) {
  return Department.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * UNIT
 ********************** */

/**
 * create a unit (S.I unit)
 * @param data
 * @returns {object} department data
 */
export async function createUnit(data) {
  const { name, staff_id } = data;

  return Unit.create({
    name,
    staff_id,
  });
}

/**
 * update a unit
 * @param data
 * @returns {object} unit data
 */
export async function updateUnit(data) {
  const { unit_id } = data;
  const unit = await getModelById(Unit, unit_id);
  return unit.update(data);
}

/**
 * search units
 *
 * @function
 * @returns {json} json object with units data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchUnits(currentPage = 1, pageLimit = 10, search) {
  return Unit.paginate({
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
 * get units
 *
 * @function
 * @returns {json} json object with units data
 * @param currentPage
 * @param pageLimit
 */
export async function getUnits(currentPage = 1, pageLimit = 10) {
  return Unit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * WARD
 ********************** */

/**
 * create a ward
 * @param data
 * @returns {object} ward data
 */
export async function createWard(data) {
  const { name, staff_id, service_id, occupant_type } = data;

  return Ward.create({
    name,
    staff_id,
    service_id,
    occupant_type,
  });
}

/**
 * update a ward
 * @param data
 * @returns {object} ward data
 */
export async function updateWard(data) {
  const { ward_id } = data;
  const ward = await getModelById(Ward, ward_id);
  return ward.update(data);
}

/**
 * search wards
 *
 * @function
 * @returns {json} json object with wards data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchWards(currentPage = 1, pageLimit = 10, search) {
  return Ward.paginate({
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
 * get wards
 *
 * @function
 * @returns {json} json object with wards data
 * @param currentPage
 * @param pageLimit
 */
export async function getWards(currentPage = 1, pageLimit = 20) {
  return Ward.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get a ward and the associated service
 *
 * @function
 * @returns {json} json object with wards data
 * @param ward_id
 */
export const getWardWithService = async (ward_id: number) => {
  return Ward.findByPk(ward_id, { include: [{ model: Service }] });
};

/** ***********************
 * BED
 ********************** */
/**
 * create a bed
 * @param data
 * @returns {object} bed data
 */
export async function createBed(data) {
  const { code, bed_type, ward_id, staff_id } = data;

  return Bed.create({
    code,
    staff_id,
    bed_type,
    ward_id,
  });
}

/**
 * update a bed
 * @param data
 * @returns {object} bed data
 */
export async function updateBed(data) {
  const { bed_id } = data;
  const bed = await getModelById(Bed, bed_id);
  return bed.update(data);
}

/**
 * get beds
 *
 * @function
 * @returns {json} json object with beds data
 */
export async function getBeds() {
  return Bed.findAll({
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get wards and associated beds
 *
 * @function
 * @returns {json} json object with wards(beds) data
 */
export const getWardsAndBeds = (search: string) => {
  return Ward.findAll({
    order: [['createdAt', 'DESC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
    include: [
      {
        model: Bed,
        attributes: ['bed_type', 'id', 'code', 'status'],
      },
    ],
  });
};

/**
 * get beds under a ward
 *
 * @function
 * @returns {json} json object with beds data
 */
export async function getBedsInAWard(data: number) {
  return Bed.findAll({
    order: [['createdAt', 'DESC']],
    where: {
      ward_id: data,
    },
  });
}

/** ***********************
 * SERVICES
 ********************** */
/**
 * create a service
 * @param data
 * @returns {object} service data
 */
export async function createService(data) {
  const { name, price, staff_id } = data;
  const count = await getNumberOfRecords(Service);
  return Service.create({
    name,
    staff_id,
    price,
    code: `S${count + 1}`,
  });
}

/**
 * update a service
 * @param data
 * @returns {object} service data
 */
export async function updateService(data) {
  const { service_id } = data;
  const service = await getModelById(Service, service_id);
  return service.update(data);
}

/**
 * search services
 *
 * @function
 * @returns {json} json object with services data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchServices(currentPage = 1, pageLimit = 10, search) {
  return Service.paginate({
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
 * get services
 *
 * @function
 * @returns {json} json object with services data
 * @param currentPage
 * @param pageLimit
 */
export async function getServices(currentPage = 1, pageLimit = 10) {
  return Service.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * SERVICE TARIFFS
 ********************** */
/**
 * create service tariff
 *
 * @function
 * @returns {json} json object with service tariff data
 * @param data
 */
export const createServiceTariff = async data => {
  return ServiceTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const servicePriceTariff = async (patient: Patient, service_id: number): Promise<number> => {
  const { price } =
    (await ServiceTariff.findOne({
      where: { service_id, hmo_id: patient.hmo_id, insurance_id: patient.insurance_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getServicePrice = (patient: Patient, service_id: number) => {
  if (canUsePriceTariff(patient)) return servicePriceTariff(patient, service_id);
  return null;
};
