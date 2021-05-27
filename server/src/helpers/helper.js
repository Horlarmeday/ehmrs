/* eslint-disable camelcase */
import mime from 'mime';
import { promisify } from 'util';
import fs from 'fs';
import APIError from '../util/apiError';

const writeFile = promisify(fs.writeFile);

/**
 * process base64 image string into an actual image a writes to disk
 * @param param - base64 image string
 * @param patient - patient firstname
 * @returns {Promise<{fileName: string, filepath: string}>}
 */
export async function processSnappedPhoto(param, patient) {
  const matches = param.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches.length !== 3) throw new APIError('INVALID', 400, 'invalid base64 string');

  const decodedImg = {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };
  const imageBuffer = decodedImg.data;
  const { type } = decodedImg;
  const extension = mime.getExtension(type);
  const fileName = `${patient}${Date.now()}.${extension}`;
  let filepath;

  if (process.env.NODE_ENV === 'development') {
    filepath = `src/public/images/${fileName}`;
  } else filepath = `server/src/public/images/${fileName}`;
  try {
    await writeFile(filepath, imageBuffer, 'utf8');
    return {
      fileName,
      filepath,
    };
  } catch (e) {
    throw new APIError('ERROR', 500, e);
  }
}

/**
 * generate any random numbers
 * @param num
 * @returns {number}
 */
export function generateRandomNumbers(num) {
  // const year = new Date().getFullYear();
  return Math.floor(
    // eslint-disable-next-line no-restricted-properties
    Math.pow(10, num - 1) + Math.random() * 9 * Math.pow(10, num - 1)
  );
}

/**
 * check all values exists
 * @param history
 * @returns {boolean|*}
 */
export function checkValueExists(history) {
  const { complaint_note, history_note, examination_note, has_smoking_history } = history;
  if (complaint_note) return true;
  if (history_note) return true;
  if (examination_note) return true;
  return !!has_smoking_history;
}
