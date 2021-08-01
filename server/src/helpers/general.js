export function padNumberWithZero(num, targetLength = 6) {
  return num.toString().padStart(targetLength, 0);
}

export function delay() {
  return new Promise(resolve => setTimeout(resolve, 300));
}

export async function processArray(array, delayedLog) {
  const promises = array.map(delayedLog);
  // wait until all promises are resolved
  await Promise.all(promises);
}
