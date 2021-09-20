/* eslint-disable camelcase */
import mime from 'mime';
import { promisify } from 'util';
import fs from 'fs';
import { BadException } from '../../common/util/api-error';
import { DEVELOPMENT } from '../constants';

const writeFile = promisify(fs.writeFile);

/**
 * process base64 image string into an actual image a writes to disk
 * @param param - base64 image string
 * @param patient - patient firstname
 * @returns {Promise<{fileName: string, filepath: string}>}
 */
export async function processSnappedPhoto(param, patient) {
  const matches = param.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches.length !== 3) throw new BadException('INVALID', 400, 'invalid base64 string');

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const extension = mime.getExtension(matches[1]);
  const fileName = `${patient}${Date.now()}.${extension}`;
  let filepath;

  if (process.env.NODE_ENV === DEVELOPMENT) {
    filepath = `src/public/images/${fileName}`;
  } else filepath = `server/src/public/images/${fileName}`;
  try {
    await writeFile(filepath, imageBuffer, 'utf8');
    return {
      fileName,
      filepath,
    };
  } catch (e) {
    throw new BadException('ERROR', 500, e);
  }
}

/**
 * generate any random numbers
 * @param num
 * @returns {number}
 */
export function generateRandomNumbers(num: number) {
  return Math.floor(Math.pow(10, num - 1) + Math.random() * 9 * Math.pow(10, num - 1));
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

export enum StatusCodes {
  CREATED = 201,
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TIMED_OUT = 408,
  SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 501,
}

const removeSpecialCharacter = (param: string, character: string) => {
  return param.split(`${character}`);
};

const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const joinCapitalizedWord = (param: string, character: string): string => {
  const arr = removeSpecialCharacter(param, character);
  let str = '';
  arr.forEach((word: string) => {
    str += capitalizeFirstLetter(word);
  });
  return str;
};
