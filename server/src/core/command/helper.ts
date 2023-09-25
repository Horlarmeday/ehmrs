import { padNumberWithZero } from '../helpers/general';
import { generateRandomNumbers } from '../helpers/helper';
import { getPatientByHospitalId } from '../../modules/Patient/patient.repository';
import { getOneAntenatalAccount } from '../../modules/Antenatal/antenatal.repository';
import { Antenatal, Patient } from '../../database/models';

const generateUniqueNumber = async (dataId: number, count: number, prefix: string) => {
  if (count === 1) return `${prefix}/${padNumberWithZero(dataId, 6)}`;

  const randomNumbers = generateRandomNumbers(6);
  return `${prefix}/${padNumberWithZero(randomNumbers, 6)}`;
};

export const getHospitalNumber = async (patientId: number) => {
  let hospitalNumber: Patient;
  let generatedHospitalNumber: string;
  let count = 0;
  do {
    count++;
    generatedHospitalNumber = await generateUniqueNumber(patientId, count, 'SVH');
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
