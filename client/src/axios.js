// axios
import axios from "axios";
import store from "./core/services/store/index";
import { notifyError, notifySuccess } from "./common/common";

const token = localStorage.getItem("user_token");

axios.defaults.baseURL = "/api";
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
axios.defaults.timeout = 180000;
axios.interceptors.response.use(
  response => {
    switch (response.status) {
      case 201:
        notifySuccess(response);
        break;
      case 204:
        notifySuccess(response);
        break;
      case 401:
        store.dispatch("auth/logout");
        break;
    }
    return response;
  },
  error => {
    if (error.response && error.response.data) {
      //add your code
      notifyError(error);
      return Promise.reject(error.response.data);
    }
    notifyError(error);
    return Promise.reject(error.message);
  }
);

export default axios;
