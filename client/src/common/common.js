import Vue from "vue";

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
