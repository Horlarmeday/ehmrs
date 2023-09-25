import Vue from 'vue';
import router from '../router';

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
}) => {
  router
    .push({
      name: pathName,
      query: {
        currentPage: currentPage,
        itemsPerPage: itemsPerPage,
        search,
        sort,
        startDate,
        endDate,
        filter,
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

export const EXCLUDED_INSURANCE = ['Retainership'];

export const isContainEmptyValues = array => {
  return array.some(obj =>
    Object.values(obj).some(value => value === null || value === undefined || value === '')
  );
};
