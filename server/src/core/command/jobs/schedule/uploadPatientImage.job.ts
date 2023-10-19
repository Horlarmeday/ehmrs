import { Job } from '@hokify/agenda';
import { uploadPatientImageCloudinary } from '../../../helpers/cloudinary';

type UploadPatientImageData = {
  image: string;
  patientId: number;
};

export const uploadPatientImage = async (job: Job) => {
  const { image, patientId } = job.attrs.data as UploadPatientImageData;
  await uploadPatientImageCloudinary(image, patientId);
};
