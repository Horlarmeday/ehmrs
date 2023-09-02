import { padNumberWithZero } from '../helpers/general';
import { generateRandomNumbers } from '../helpers/helper';
import { getPatientByHospitalId } from '../../modules/Patient/patient.repository';

const generateHospitalNumber = async (patientId, count) => {
  if (count === 1) return `SVH/${padNumberWithZero(patientId, 6)}`;

  const randomNumbers = generateRandomNumbers(6);
  return `SVH/${padNumberWithZero(randomNumbers, 6)}`;
};

export const getHospitalNumber = async (patientId: number) => {
  let hospitalNumber;
  let generatedHospitalNumber;
  let count = 0;
  do {
    count++;
    generatedHospitalNumber = await generateHospitalNumber(patientId, count);
    hospitalNumber = await getPatientByHospitalId(generatedHospitalNumber);
  } while (hospitalNumber);

  return generatedHospitalNumber;
};
