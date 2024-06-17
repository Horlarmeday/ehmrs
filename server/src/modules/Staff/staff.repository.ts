/* eslint-disable camelcase */

import { Op } from 'sequelize';

import { Staff } from '../../database/models';

/**
 * save staff details to the DB
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function createStaff(data) {
  const {
    firstname,
    lastname,
    middlename,
    email,
    password,
    address,
    phone,
    username,
    department,
    role,
    sub_role,
    fileName,
    date_of_birth,
    gender,
  } = data;
  return Staff.create({
    firstname,
    lastname,
    middlename,
    email,
    password,
    address,
    phone,
    username,
    department,
    role,
    sub_role,
    photo: fileName,
    date_of_birth,
    gender,
  });
}

/**
 * query staff details in the DB by phone or username
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function findByPhoneOrUsername(data) {
  return Staff.findOne({
    where: { [Op.or]: [{ phone: data.phone }, { username: data.username }] },
  });
}

/**
 * query staff account in the DB by username
 *
 * @function
 * @returns {json} json object with staff data
 * @param username
 */
export async function getStaffByUsername(username: string) {
  return Staff.findOne({ where: { username } });
}

/**
 * query staff account in the DB by phone
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function getStaffByPhone(data) {
  return Staff.findOne({ where: { phone: data } });
}

/**
 * query staff account in the DB by user id
 *
 * @function
 * @returns {json} json object with staff data
 * @param id
 */
export async function getStaffById(id: number) {
  return Staff.findByPk(id);
}

/**
 * update staff details
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function updateStaff(data) {
  const staff = await getStaffById(data.id);
  return staff.update(data);
}

/**
 * update staff details
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 * @param staffId
 */
export async function updateStaffAccount(data: Partial<Staff>, staffId: any) {
  return Staff.update({ ...data }, { where: { id: staffId } });
}

/**
 * get staffs
 *
 * @function
 * @returns {json} json object with staffs data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function getStaffs({ currentPage = 1, pageLimit = 10, filter }) {
  return Staff.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] },
    ...(filter && {
      where: {
        ...(filter && { ...JSON.parse(filter) }),
      },
    }),
  });
}

/**
 * search staffs
 *
 * @function
 * @returns {json} json object with staffs data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param filter
 */
export async function searchStaffs({ currentPage = 1, pageLimit = 10, search, filter = null }) {
  return Staff.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] },
    where: {
      ...(filter && { ...JSON.parse(filter) }),
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
          username: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          phone: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          role: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          sub_role: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    },
  });
}
