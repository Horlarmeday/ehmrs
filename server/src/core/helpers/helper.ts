/* eslint-disable camelcase */
import mime from 'mime';
import { promisify } from 'util';
import fs from 'fs';
import { BadException } from '../../common/util/api-error';
import { DEVELOPMENT } from '../constants';
import {
  Patient,
  PatientInsurance,
  PrescribedTest,
  TestPrescription,
  Visit,
} from '../../database/models';
import { Response } from 'express';
import { ExportDataType } from '../../modules/Store/types/pharmacy-item.types';
import { exportDataToCSV, exportDataToExcel, exportDataToPDF } from './fileExport';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { padNumberWithZero } from './general';
import { PrescribedAdditionalItemBody } from '../../modules/Orders/Pharmacy/interface/prescribed-drug.body';
import { getOneService } from '../../modules/AdminSettings/admin.repository';
import { getTestPrescription } from '../../modules/Laboratory/laboratory.repository';
import { DrugType } from '../../database/models/pharmacyStore';
import { prescribeService } from '../../modules/Orders/Service/service-order.repository';
import { chain } from 'lodash';

const writeFile = promisify(fs.writeFile);

export type ExportSelectedDataType = {
  res: Response;
  headers: string[][];
  data: any;
  dataType: ExportDataType;
};
export const EXCLUDED_INSURANCE = ['NHIS', 'FHSS'];
export const staffAttributes = ['fullname', 'firstname', 'lastname', 'middlename'];
export const patientAttributes = [
  'fullname',
  'photo',
  'hospital_id',
  'firstname',
  'lastname',
  'middlename',
  'gender',
  'id',
  'has_insurance',
  'date_of_birth',
  'complete_name',
  'createdAt',
  'patient_type',
];

/**
 * process base64 image string into an actual image a writes to disk
 * @param param - base64 image string
 * @param patient - patient firstname
 * @returns {Promise<{fileName: string}>}
 */
export async function processSnappedPhoto(param: string, patient: string): Promise<string> {
  const matches = param.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/); // checks if its a base64 image
  if (matches.length !== 3) throw new BadException('INVALID', 400, 'invalid base64 string');

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const extension = mime.getExtension(matches[1]);
  const fileName = `${patient.trim()}${Date.now()}.${extension}`;
  let filepath: fs.PathOrFileDescriptor;

  if (process.env.NODE_ENV === DEVELOPMENT) {
    filepath = `src/public/images/${fileName}`;
  } else filepath = `ehmrs-api/public/images/${fileName}`;
  try {
    await writeFile(filepath, imageBuffer, 'utf8');
    return fileName;
  } catch (e) {
    throw new BadException('ERROR', 500, e);
  }
}

/**
 * generate any random numbers
 * @param num
 * @returns {number}
 */
export function generateRandomNumbers(num: number): number {
  return Math.floor(Math.pow(10, num - 1) + Math.random() * 9 * Math.pow(10, num - 1));
}

/**
 * check all values exists
 * @param history
 * @returns {boolean|*}
 */
export function checkValueExists(history): boolean | any {
  const { complaint_note, history_note, examination_note, has_smoking_history } = history;
  if (complaint_note) return true;
  if (history_note) return true;
  if (examination_note) return true;
  return !!has_smoking_history;
}

export enum StatusCodes {
  CREATED = 201,
  OK = 200,
  MODIFIED = 204,
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

export const splitSort = (sort: string) => {
  let result: string[];
  if (/^drug/.test(sort)) {
    result = sort.split('name_');
    return { sort_by: 'name', order: result[1].toUpperCase() };
  }
  if (/^date/.test(sort)) {
    result = sort.split('received_');
    return { sort_by: 'date_received', order: result[1].toUpperCase() };
  }
  result = sort.split('_');
  return { sort_by: result[0], order: result[1].toUpperCase() };
};

export const paginate = (data: { rows: any[]; count: number }, page: number, limit: number) => {
  const { count: total, rows: docs } = data;
  const currentPage = page || 1;
  const pages = Math.ceil(total / limit);
  const perPage = limit;

  return { total, docs, pages, perPage, currentPage };
};

export const calcLimitAndOffset = (page: number, size: number) => {
  const limit = size || 10;
  const offset = page ? (page - 1) * limit : 0;

  return { limit, offset };
};

export const canUsePriceTariff = (patient: Patient) => patient?.has_insurance;

export const exportSelectedData = ({ res, dataType, data, headers }: ExportSelectedDataType) => {
  switch (dataType) {
    case ExportDataType.CSV:
      return exportDataToCSV(res, data, headers);
    case ExportDataType.EXCEL:
      return exportDataToExcel(res, data, headers);
    case ExportDataType.PDF:
      return exportDataToPDF(res, data, headers);
  }
};

export const mapToUnique = (arr: Iterable<unknown>) => {
  const uniqueSet = new Set(arr);
  return Array.from(uniqueSet);
};

export const generateLabAccessionNumber = async () => {
  const today = dayjs().format('YYYY-MM-DD');
  const initialPart = today.split('-').join('');

  let accessionNumber: string;
  let testPrescription: TestPrescription;
  do {
    const recordCount = generateRandomNumbers(5);
    const prefix = 'LAB';
    accessionNumber = `${prefix}-${initialPart}-${padNumberWithZero(recordCount, 2)}`;
    testPrescription = await getTestPrescription({ accession_number: accessionNumber });
  } while (testPrescription);

  return accessionNumber;
};

export const isToday = (specificDateTime: Date) => {
  return dayjs(specificDateTime).isSame(dayjs(), 'day');
};

export const todayQuery = (field: string) => ({
  [field]: {
    [Op.gte]: dayjs()
      .startOf('day')
      .toDate(),
    [Op.lt]: dayjs()
      .endOf('day')
      .toDate(),
  },
});

export const dateIntervalQuery = (field: string, start: Date, end: Date) => ({
  [field]: {
    [Op.gte]: dayjs(start)
      .startOf('day')
      .toDate(),
    [Op.lt]: dayjs(end)
      .endOf('day')
      .toDate(),
  },
});

export const backlogQuery = (field: string) => ({
  [field]: {
    [Op.lt]: dayjs()
      .startOf('day')
      .toDate(),
  },
});

export const dateQuery = (field: string, date: Date) => ({
  [field]: {
    [Op.lt]: dayjs(date)
      .startOf('day')
      .toDate(),
  },
});

export const getAge = (date_of_birth: string | number | Date) => {
  const formattedDate = dayjs(date_of_birth).format('YYYY-MM-DD');
  return dayjs().diff(dayjs(formattedDate), 'year');
};

export const flattenArray = (arrayOfArrays: PrescribedAdditionalItemBody[][]) =>
  arrayOfArrays.reduce((acc, curr) => acc.concat(curr), []);

export const getDrugType = (has_insurance: boolean, insurance: PatientInsurance) => {
  if (!has_insurance) return DrugType.CASH;

  const insuranceMapping = {
    NHIS: DrugType.NHIS,
    PHIS: DrugType.PRIVATE,
    FHSS: DrugType.NHIS,
    Retainership: DrugType.CASH,
  };

  return insuranceMapping[insurance?.insurance?.name] || DrugType.CASH;
};

type SingleOrMultipleServices = {
  service_id: number | number[];
  staff_id: number;
  visit: Visit;
  patient_id: number;
  ante_natal_id?: number;
};

export const insertSingleOrMultipleServices = async ({
  service_id,
  staff_id,
  visit,
  patient_id,
  ante_natal_id,
}: SingleOrMultipleServices) => {
  if (service_id || (typeof service_id !== 'number' && service_id?.length)) {
    if (Array.isArray(service_id)) {
      await Promise.all(
        service_id.map(async id => {
          const service = await getOneService({ id });
          await prescribeService({
            service_id: id,
            service_type: 'Cash',
            price: service.price,
            patient_id,
            requester: staff_id,
            ante_natal_id: ante_natal_id || null,
            visit_id: visit.id,
          });
        })
      );
    } else {
      const service = await getOneService({ id: service_id });
      await prescribeService({
        service_id,
        service_type: 'Cash',
        price: service.price,
        patient_id,
        requester: staff_id,
        ante_natal_id: ante_natal_id || null,
        visit_id: visit.id,
      });
    }
  }
  return;
};

export const groupDataByField = ({
  array,
  field,
  resultKey,
  resultData,
}: {
  array: any[];
  field: string;
  resultKey: string;
  resultData: string;
}) => {
  return chain(array)
    .groupBy(x => x[field])
    .map((value, key) => ({
      [resultKey]: key,
      [resultData]: value,
    }))
    .value();
};

/**
 * helper function to shape prescriptions
 *
 * @function
 * @param prescriptions
 */
export const getPrescriptionsByVisit = prescriptions => {
  const prescriptionsByVisit: Record<number, any[]> = {};
  prescriptions.forEach(obs => {
    if (!prescriptionsByVisit[obs.visit_id]) {
      prescriptionsByVisit[obs.visit_id] = [];
    }
    prescriptionsByVisit[obs.visit_id].push(obs);
  });

  return prescriptionsByVisit;
};
