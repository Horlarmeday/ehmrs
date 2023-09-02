import Agenda from 'agenda';
import { uploadPatientImageCloudinary } from '../../helpers/cloudinary';

export const uploadPatientImage = async (job: Agenda) => {
  const { image, patientId } = job.attrs.data;
  await uploadPatientImageCloudinary(image, patientId);
};
