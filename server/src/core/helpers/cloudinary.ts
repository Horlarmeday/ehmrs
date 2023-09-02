import cloudinary from 'cloudinary';
import { BadException } from '../../common/util/api-error';
import { logger, taggedMessaged } from './logger';
import { updatePatient } from '../../modules/Patient/patient.repository';

const cloud = cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadPatientImageCloudinary = async (image: string, patientId: string) => {
  const message = taggedMessaged('uploadPatientImageCloudinary');

  try {
    const response = await cloud.uploader.upload(image);
    await updatePatient({ patient_id: patientId, photo_url: response.url });
    logger.info(message(`Image successfully uploaded to cloudinary`));
  } catch (e) {
    logger.error(message('Error uploading to cloudinary'), e);
    throw new BadException('ERROR', 500, e);
  }
};
