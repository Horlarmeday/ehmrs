import Agenda from 'agenda';
import { updatePatient } from '../../../modules/Patient/patient.repository';
import { logger, taggedMessaged } from '../../helpers/logger';
import { getHospitalNumber } from '../helper';

export const assignHospitalNumber = async (job: Agenda) => {
  const message = taggedMessaged('AssignHospitalNumber');
  const { id } = job.attrs.data;
  const hospitalNumber = await getHospitalNumber(id);
  await updatePatient({ patient_id: id, hospital_id: hospitalNumber });
  logger.info(message(`Hospital number ${hospitalNumber} was assigned to patient with id: ${id}`));
};
