/* eslint-disable camelcase */
import { Sequelize } from 'sequelize';

const { Staff } = require('../../database/models');

const { Op } = Sequelize;

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
    fullname: `${firstname} ${lastname}`,
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
 * @param data
 */
export async function findStaffByUsername(data) {
  return Staff.findOne({ where: { username: data.username } });
}

/**
 * query staff account in the DB by phone
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function findStaffByPhone(data) {
  return Staff.findOne({ where: { phone: data } });
}

/**
 * query staff account in the DB by user id
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function getStaffById(data) {
  return Staff.findByPk(data);
}

/**
 * update staff details
 *
 * @function
 * @returns {json} json object with staff data
 * @param data
 */
export async function updateStaff(data) {
  const staff = await getStaffById(data.staff_id);
  return staff.update(data);
}

/**
 * get staffs
 *
 * @function
 * @returns {json} json object with staffs data
 * @param currentPage
 * @param pageLimit
 */
export async function getStaffs(currentPage = 1, pageLimit = 10) {
  return Staff.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] },
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
 */
export async function searchStaffs(currentPage = 1, pageLimit = 10, search) {
  return Staff.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] },
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
