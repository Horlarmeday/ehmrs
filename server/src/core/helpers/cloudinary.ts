import cloudinary from 'cloudinary';
import { BadException } from '../../common/util/api-error';
import { Patient } from '../../database/models';

const cloud = cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageUpdatePatient = async (image: string, patient: Patient) => {
  try {
    const response = await cloud.uploader.upload(image);
    await patient.update({ photo_url: response.url });
  } catch (e) {
    throw new BadException('ERROR', 500, e);
  }
};
