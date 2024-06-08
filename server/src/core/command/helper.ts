import { padNumberWithZero } from '../helpers/general';
import { generateRandomNumbers } from '../helpers/helper';
import { getPatientByHospitalId } from '../../modules/Patient/patient.repository';
import { getOneAntenatalAccount } from '../../modules/Antenatal/antenatal.repository';
import { Antenatal, Immunization, Patient } from '../../database/models';
import { getOneImmunization } from '../../modules/Immunization/immunization.repository';
import { getSystemSettings } from '../../modules/AdminSettings/admin.repository';

const generateUniqueNumber = async (dataId: number, count: number, prefix: string) => {
  if (count === 1) return `${prefix}/${padNumberWithZero(dataId, 6)}`;

  const randomNumbers = generateRandomNumbers(6);
  return `${prefix}/${padNumberWithZero(randomNumbers, 6)}`;
};

export const getHospitalNumber = async (patientId: number) => {
  let hospitalNumber: Patient;
  let generatedHospitalNumber: string;
  let count = 0;
  const settings = await getSystemSettings();
  do {
    count++;
    generatedHospitalNumber = await generateUniqueNumber(
      patientId,
      count,
      settings?.patient_id_prefix || 'SVH'
    );
    hospitalNumber = await getPatientByHospitalId(generatedHospitalNumber);
  } while (hospitalNumber);

  return generatedHospitalNumber;
};

export const getAntenatalNumber = async (antenatalId: number) => {
  let antenatalNumber: Antenatal;
  let generatedAntenatalNumber: string;
  let count = 0;
  do {
    count++;
    generatedAntenatalNumber = await generateUniqueNumber(antenatalId, count, 'ANC');
    antenatalNumber = await getOneAntenatalAccount({ antenatal_number: generatedAntenatalNumber });
  } while (antenatalNumber);

  return generatedAntenatalNumber;
};

export const getImmunizationNumber = async (immunizationId: number) => {
  let immunization: Immunization;
  let generatedImmunizationNumber: string;
  let count = 0;
  do {
    count++;
    generatedImmunizationNumber = await generateUniqueNumber(immunizationId, count, 'IMM');
    immunization = await getOneImmunization({
      immunization_number: generatedImmunizationNumber,
    });
  } while (immunization);

  return generatedImmunizationNumber;
};
