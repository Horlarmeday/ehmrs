/* eslint-disable camelcase */
import BoxSDK from 'box-node-sdk';
import APIError from '../util/apiError';

const sdkConfig = require('../../config');

// const fs = require('fs');

// function readJsonFile() {
//   try {
//     return fs.readFileSync('./config.json');
//   } catch (e) {
//     throw new Error(e);
//   }
// }

const sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);

// Get the service account client, used to create and manage app user accounts
const client = sdk.getAppAuthClient('enterprise');

/**
 * update patient
 *
 * @param patient
 * @param image_url
 * @returns {Promise<void>}
 */
async function updatePatientImage(patient, image_url) {
  try {
    await patient.update({ photo_url: image_url });
  } catch (e) {
    throw new APIError('ERROR', 400, e);
  }
}

/**
 * upload single image
 *
 * @function
 * @returns {json} json object with uploaded file data
 * @param image
 * @param path
 * @param patient
 */
export async function uploadBoxImage(image, path, patient) {
  try {
    const uploadedImage = await client.files.uploadFile(process.env.PARENT_FOLDER_ID, image, path);
    const image_url = await client.files.update(uploadedImage.entries[0].id, {
      shared_link: {
        access: 'open',
        permissions: {
          can_download: true,
        },
      },
    });
    await updatePatientImage(patient, image_url.shared_link.url);
  } catch (e) {
    throw new APIError('ERROR', 500, e);
  }
}

// /**
//  * delete single file
//  *
//  * @function
//  * @returns {json} null
//  * @param file_id
//  */
// export async function deleteBoxFile(file_id) {
//   try {
//     return client.files.delete(file_id);
//   } catch (e) {
//     throw new Error(e);
//   }
// }
