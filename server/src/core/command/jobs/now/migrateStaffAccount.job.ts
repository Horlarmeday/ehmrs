import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Staff } from '../../../../database/models';

const mapStaffData = staffs =>
  staffs.map(staff => ({
    id: staff.staff_id,
    firstname: staff.firstname,
    lastname: staff.lastname,
    middlename: staff?.middlename,
    email: staff.email,
    password: staff.password,
    address: staff.address,
    phone: staff.phone,
    username: staff.username,
    department: staff.department,
    role: staff.role,
    sub_role: staff.sub_role,
    photo: staff.photo,
    date_of_birth: staff.date_of_birth,
    gender: staff.gender,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
    status: staff.status,
  }));

const insertStaffData = async staffs => {
  const mappedStaffs = mapStaffData(staffs);
  return await Staff.bulkCreate(mappedStaffs);
};
export const migrateStaffAccount = async () => {
  const message = taggedMessaged('migrateStaffAccount');
  const filePath = path.join(__dirname, '../../../../public/staffs.json');

  try {
    logger.info(message('Reading staff data into memory...'));
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const data = JSON.parse(readFile);
      logger.info(message('Inserting staff data into the database...'));
      const staffs = await insertStaffData(data);
      if (staffs?.length) {
        logger.notice(message('Successfully migrated all staffs data'));
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};
