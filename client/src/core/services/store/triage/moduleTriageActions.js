import axios from "../../../../axios";

export default {
  addTriage({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/triage/create/${payload.visit_id}`, payload.triage)
        .then(response => {
          commit("ADD_TRIAGE", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
