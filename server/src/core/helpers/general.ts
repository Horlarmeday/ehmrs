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