import fs from 'fs';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { Patient } from '../../../../database/models';
import path from 'path';
import { PatientType } from '../../../../modules/Patient/types/patient.types';

const splitName = fullName => {
  const nameParts = fullName.split(' ');
  let firstName: any, middleName: any, lastName: any;

  if (nameParts.length === 3) {
    firstName = nameParts[0];
    middleName = nameParts[1];
    lastName = nameParts[2];
  } else {
    firstName = nameParts[0];
    lastName = nameParts[1];
    middleName = null;
  }
  return { firstName, middleName, lastName };
};

const mappedDependantData = dependants => {
  return dependants.map(dependant => ({
    firstname:
      splitName(dependant.name)
        .firstName?.replace(/ +(?= )/g, '')
        ?.trim() || 'John',
    lastname:
      splitName(dependant.name)
        .lastName?.replace(/ +(?= )/g, '')
        ?.trim() || 'Doe',
    middlename:
      splitName(dependant.name)
        .middleName?.replace(/ +(?= )/g, '')
        ?.trim() || null,
    phone: dependant.phone,
    address: dependant.address,
    gender: dependant.gender,
    date_of_birth: dependant.date_of_birth,
    country: 'Nigeria',
    state: 'Federal Capital Territory',
    lga: 'Bwari',
    photo: dependant?.photo,
    relationship_to_principal: dependant?.relationship,
    staff_id: dependant?.staff_id || 1,
    old_patient_id: dependant.dependant_id,
    principal_id: dependant.patient_id,
    patient_type: PatientType.DEPENDANT,
    createdAt: dependant.createdAt,
    updatedAt: dependant.updatedAt,
    has_insurance: true,
  }));
};
const bulkInsertDependants = async dependants => {
  const mappedDependants = mappedDependantData(dependants);
  try {
    await Patient.bulkCreate(mappedDependants);
  } catch (e) {
    console.error(e);
  }
};

export const migrateDependantAccount = async () => {
  const message = taggedMessaged('migrateDependantAccount');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_new_dumps/dependants.json');

  const CHUNK_SIZE = 1000;
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const patients = JSON.parse(fileData);

    let batch = [];
    let count = 0;

    // Insert patients in batches of the specified size
    for (let i = 0; i < patients.length; i += CHUNK_SIZE) {
      batch = patients.slice(i, i + CHUNK_SIZE);
      await bulkInsertDependants(batch);
      count += batch.length;
      logger.notice(message(`Inserted ${count} dependants into the database`));
    }
    logger.info(message('Migration ==ENDED==='));
    // const fileStream = fs.createReadStream(filePath);
    // if (!fileStream) throw new Error('cannot find file stream');
    //
    // const rl = readline.createInterface({
    //   input: fileStream,
    //   crlfDelay: Infinity,
    // });
    //
    // rl.on('line', input => {
    //   if (input) {
    //     logger.info(message('Reading file by line'));
    //     if (input.startsWith('[')) {
    //       input = input.substring(1);
    //     }
    //
    //     if (input.endsWith(']')) {
    //       input = input.substring(0, input.length - 1);
    //     }
    //
    //     if (input.charAt(input.length - 1) === ',') {
    //       input = input.substring(0, input.length - 1);
    //     }
    //     const data = JSON.parse(input);
    //     dependants.push(data);
    //     if (dependants.length >= CHUNK_SIZE) {
    //       //once chunks length is upto 50 we are pausing the stream. this will trigger the below on.pause event.
    //       rl.pause();
    //     }
    //   }
    // });
    //
    // rl.on('pause', async () => {
    //   logger.warning(message('Readline ==PAUSED==='));
    //   await bulkInsertDependants(dependants);
    //   dependants.length = 0;
    //   setTimeout(() => rl.resume(), 5 * 1000);
    // });
    //
    // rl.on('resume', () => {
    //   logger.notice(message('Readline ==RESUMED==='));
    // });
    //
    // rl.on('close', async () => {
    //   await bulkInsertDependants(dependants);
    //   logger.info(message('Readline ==ENDED==='));
    //   logger.notice(message('Successfully migrated all dependants data'));
    // });
  } catch (e) {
    throw new Error(e);
  }
};
