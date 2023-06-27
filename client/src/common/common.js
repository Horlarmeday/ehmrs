import Vue from "vue";
import router from "../router";

export const notifyError = error => {
  Vue.notify({
    group: "foo",
    title: "Error message",
    text: error.response.data.message,
    type: "error"
  });
};

export const notifySuccess = response => {
  Vue.notify({
    group: "foo",
    title: "Success message",
    text: response.data.message,
    type: "success"
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
        endDate
      }
    })

    .catch(e => notifyError(e));
};
