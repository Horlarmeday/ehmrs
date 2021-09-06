/* eslint-disable camelcase */
import BoxSDK from 'box-node-sdk';
import fs from 'fs';
import { BadException } from '../../common/util/api-error';
import * as path from 'path';

//import sdkConfig from '../../../config.json';

// const fs = require('fs');
//
function readJsonFile() {
  try {
    const config = fs.readFileSync(path.join(__dirname, '../../../config.json'), 'utf8');
    return JSON.parse(config);
  } catch (e) {
    throw new BadException('ERROR', 500, e);
  }
}

const sdk = BoxSDK.getPreconfiguredInstance(readJsonFile());

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
    throw new BadException('ERROR', 400, e);
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
    throw new BadException('ERROR', 500, e);
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
