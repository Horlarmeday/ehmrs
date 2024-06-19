import { SamplePeriod } from '../../modules/Orders/Laboratory/interface/prescribed-test.interface';
import { backlogQuery, todayQuery } from './helper';
import { WhereOptions } from 'sequelize';
import { Period } from '../../modules/Orders/Pharmacy/interface/prescribed-drug.interface';

export function padNumberWithZero(num, targetLength = 6) {
  return num.toString().padStart(targetLength, 0);
}

export function delay() {
  return new Promise(resolve => setTimeout(resolve, 300));
}

export async function processArray(array, delayedLog) {
  const promises = array.map(delayedLog);
  await Promise.all(promises);
}

/**
 * get a model by id
 * @returns {object} return model data
 * @param model
 * @param id
 */
export async function getModelById(model, id: number) {
  return model.findByPk(id);
}

/**
 * count number of records in a table
 * @returns {number} return number of records
 * @param model
 */
export async function getNumberOfRecords(model) {
  return model.count();
}

export const getPeriodQuery = (period: SamplePeriod | null | Period, field: string) => {
  if (period === SamplePeriod.TODAY) return todayQuery(field);
  if (period === SamplePeriod.BACKLOG) return backlogQuery(field);
};

export enum NHISApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DECLINED = 'Declined',
}

export const countRecords = async (model, query: WhereOptions<any>, dateField: string) => {
  return model.count({ where: { ...query, ...todayQuery(dateField) } });
};
