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

export const queryStrings = ({
  pathName,
  currentPage = 1,
  itemsPerPage = 10,
  search
}) => {
  router
    .push({
      name: pathName,
      query: {
        currentPage: currentPage,
        itemsPerPage: itemsPerPage,
        search
      }
    })
    .then(r => console.log(r))
    .catch(e => notifyError(e));
};
