import axios from "../../../../axios";

export default {
  /**
   * GENERIC DRUGS
   */
  addGenericDrug({ commit }, drug) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/generic-drugs/create", drug)
        .then(response => {
          commit(
            "ADD_GENERIC_DRUG",
            Object.assign(drug, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
              code: response.data.data.code
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchGenericDrugs({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/pharmacy/generic-drugs/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_GENERIC_DRUGS", response.data.data.docs);
          commit("SET_GENERIC_DRUGS_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateGenericDrug({ commit }, drug) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/pharmacy/generic-drugs/update`, drug)
        .then(response => {
          commit("UPDATE_GENERIC_DRUG", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * DOSAGE FORM
   */
  addDosageForm({ commit }, dosageForm) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/dosage-forms/create", dosageForm)
        .then(response => {
          commit(
            "ADD_DOSAGE_FORM",
            Object.assign(dosageForm, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchDosageForms({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get("/pharmacy/dosage-forms/get")
        .then(response => {
          commit("SET_DOSAGE_FORMS", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateDosageForm({ commit }, dosageForm) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/pharmacy/dosage-forms/update`, dosageForm)
        .then(response => {
          commit("UPDATE_DOSAGE_FORM", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * MEASUREMENTS
   */
  addMeasurement({ commit }, measurement) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/measurements/create", measurement)
        .then(response => {
          commit(
            "ADD_MEASUREMENT",
            Object.assign(measurement, {
              id: response.data.data.id,
              dosage_form: response.data.data.dosage_form,
              createdAt: response.data.data.createdAt
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchMeasurements({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get("/pharmacy/measurements/get")
        .then(response => {
          commit("SET_MEASUREMENTS", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateMeasurement({ commit }, measurement) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/pharmacy/measurements/update`, measurement)
        .then(response => {
          commit("UPDATE_MEASUREMENT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * ROUTES OF ADMINISTRATION
   */
  addRoute({ commit }, route) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/routes-of-administration/create", route)
        .then(response => {
          commit(
            "ADD_ROUTE",
            Object.assign(route, {
              id: response.data.data.id,
              dosage_form: response.data.data.dosage_form,
              createdAt: response.data.data.createdAt
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchRoutes({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get("/pharmacy/routes-of-administration/get")
        .then(response => {
          commit("SET_ROUTES", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateRoute({ commit }, route) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/pharmacy/routes-of-administration/update`, route)
        .then(response => {
          commit("UPDATE_ROUTE", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchRoutesAndMeasurements({ commit }, dosage_form_id) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/routes-and-measurement", dosage_form_id)
        .then(response => {
          commit("SET_ROUTES", response.data.data.routesOfAdministrations);
          commit("SET_MEASUREMENTS", response.data.data.dosageMeasurements);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
