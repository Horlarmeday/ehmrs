import Vue from 'vue';
import router from '../router';
import dayjs from 'dayjs';

export const notifyError = error => {
  Vue.notify({
    group: 'foo',
    title: 'Error message',
    text: error.response.data.message,
    type: 'error',
  });
};

export const notifySuccess = response => {
  Vue.notify({
    group: 'foo',
    title: 'Success message',
    text: response.data.message,
    type: 'success',
  });
};

export const deleteArrayElement = (arr, value) => {
  return arr.filter(function(element) {
    return element !== value;
  });
};

export const setUrlQueryParams = ({
  pathName,
  currentPage = 1,
  itemsPerPage = 10,
  search,
  startDate,
  endDate,
  sort,
  filter,
  occupantType,
  name,
  period,
  tabIndex,
}) => {
  router
    .push({
      name: pathName,
      query: {
        currentPage,
        itemsPerPage,
        search,
        sort,
        startDate,
        endDate,
        filter,
        occupantType,
        name,
        period,
        tabIndex,
      },
    })

    .catch(e => notifyError(e));
};

export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this,
      args = arguments;
    clearTimeout(timeout);
    if (immediate && !timeout) func.apply(context, args);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
  };
}

export function monthDiff(todayDate, expiration) {
  let months;
  months = (expiration.getFullYear() - todayDate.getFullYear()) * 12;
  months -= todayDate.getMonth();
  months += expiration.getMonth();
  return months <= 0 ? 0 : months;
}

export const getExtensions = () => ({
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/pdf': 'pdf',
  'text/csv': 'csv',
});
export const addSpinner = element => {
  element.classList.add('spinner', 'spinner-primary', 'spinner-right');
};

export const removeSpinner = element => {
  element.classList.remove('spinner', 'spinner-primary', 'spinner-right');
};

export const parseJwt = token => {
  try {
    if (token) return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    throw new Error(error);
  }
};

export const EXCLUDED_INSURANCE = ['Retainership', 'PHIS'];

export const isContainEmptyValues = array => {
  return array.some(obj =>
    Object.values(obj).some(value => value === null || value === undefined || value === '')
  );
};

export const isEmpty = obj =>
  [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const randomId = () => {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
};

export const isToday = specificDateTime => {
  const currentDateTime = dayjs();
  const targetDateTime = dayjs(specificDateTime, 'YYYY-MM-DD');
  return currentDateTime.isSame(targetDateTime, 'day');
};

export function calculateAge(birthday) {
  const dateOfBirth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const month = today.getMonth() - dateOfBirth.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export const getLabelDotStatus = type => {
  if (type === 'Cash') return 'label-success';
  if (type === 'Private') return 'label-primary';
  if (type === 'Retainership') return 'label-info';
  return 'label-danger';
};

export const getItemType = type => {
  if (type === 'NHIS') return 'label-light-success';
  if (type === 'Private') return 'label-light-primary';
  if (type === 'Retainership') return 'label-light-info';
  return 'label-light-default';
};

export const getPatientDotStatus = type => {
  if (type === 'NHIS') return 'label-danger';
  if (type === 'FHSS') return 'label-success';
  if (type === 'PHIS') return 'label-primary';
  if (type === 'Retainership') return 'label-info';
  return 'label-default';
};

export const getTestTypeToFetch = (insuranceName, isSwitchOn = true) => {
  if (insuranceName && !isSwitchOn) return null;
  const insuranceMapping = {
    NHIS: { is_available_for_nhis: true },
    FHSS: { is_available_for_nhis: true },
    PHIS: { is_available_for_phis: true },
  };
  return insuranceMapping[insuranceName] || null;
};
