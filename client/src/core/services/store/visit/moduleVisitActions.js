import axios from "../../../../axios";

export default {
  /**
   * ACTIVE VISITS
   */
  addVisit({ commit }, visit) {
    return new Promise((resolve, reject) => {
      axios
        .post("/visits/create", visit)
        .then(response => {
          commit("ADD_VISIT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchActiveVisits({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/visits/active/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_ACTIVE_VISITS", response.data.data.docs);
          commit("SET_ACTIVE_VISITS_TOTAL", response.data.data.total);
          commit("SET_ACTIVE_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchVisit({ commit }, visitId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/visits/${visitId}`)
        .then(response => {
          commit("SET_VISIT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
