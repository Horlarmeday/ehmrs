import axios from "../../../../axios";

export default {
  /**
   * PRINCIPAL
   */
  createCashPatient({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .post("/patients/create/cash", patient)
        .then(response => {
          commit(
            "ADD_PATIENT",
            Object.assign(patient, {
              patient_id: response.data.data.id
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  createHealthInsurancePatient({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .post("/patients/create/health-insurance", patient)
        .then(response => {
          commit(
            "ADD_PATIENT",
            Object.assign(patient, {
              patient_id: response.data.data.id
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  createOrdinaryPatient({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .post("/patients/create/ordinary", patient)
        .then(response => {
          commit(
            "ADD_PATIENT",
            Object.assign(patient, {
              patient_id: response.data.data.id
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchPatients({ commit }, payload) {
    console.log(payload);
    return new Promise((resolve, reject) => {
      axios
        .get("/patients/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end
          }
        })
        .then(response => {
          commit("SET_PATIENTS", response.data.data.docs);
          commit("SET_PATIENTS_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchPatient({ commit }, patientId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/patients/get/${patientId}`)
        .then(response => {
          commit("SET_PATIENT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePatient({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/update/patient`, patient)
        .then(response => {
          commit("UPDATE_PATIENT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * DEPENDANTS
   */
  createDependant({ commit }, dependant, patientId) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/patients/create/dependant/${patientId}`, dependant)
        .then(response => {
          commit(
            "ADD_DEPENDANT",
            Object.assign(dependant, {
              dependant_id: response.data.data.id
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDependants({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/patients/dependant/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end
          }
        })
        .then(response => {
          commit("SET_DEPENDANTS", response.data.data.docs);
          commit("SET_DEPENDANTS_TOTAL", response.data.data.total);
          commit("SET_DEPENDANTS_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateDependant({ commit }, dependant) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/update/dependant`, dependant)
        .then(response => {
          commit("UPDATE_DEPENDANT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDependant({ commit }, dependantId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/patients/dependant/get/${dependantId}`)
        .then(response => {
          commit("SET_DEPENDANT", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
