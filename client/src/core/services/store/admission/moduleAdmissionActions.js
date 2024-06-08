import axios from '@/axios';

export default {
  admitPatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/create`, payload)
        .then(response => {
          commit('ADMIT_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAdmissions({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/admission/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_ADMISSIONS', response.data.data.docs);
          commit('SET_ADMISSIONS_TOTAL', response.data.data.total);
          commit('SET_ADMISSION_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAdmission({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/patient/get`, {
          params: {
            visitId: payload.visitId,
            admissionId: payload.admissionId,
          },
        })
        .then(response => {
          commit('SET_ADMISSION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  recommendForDischarge({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/admission/recommend-discharge`, payload)
        .then(response => {
          commit('ADMIT_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  changeWard({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/admission/change-ward/${payload.id}`, payload.data)
        .then(response => {
          commit('SET_ADMISSION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDoctorPrescriptions({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/summary/${payload.id}`)
        .then(response => {
          commit('SET_DOCTOR_PRESCRIPTIONS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAdmissionHistory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/history/${payload.id}`)
        .then(response => {
          commit('SET_ADMISSION_HISTORY', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchRecommendedDischarges({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get('/admission//discharge-recommended-patients')
        .then(response => {
          commit('SET_RECOMMENDED_DISCHARGES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Observations
   */
  createObservation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/observations/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_OBSERVATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchObservations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/observations/${payload.id}`)
        .then(response => {
          commit('SET_OBSERVATIONS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Care plans
   */
  createCarePlan({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/care-plans/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_CARE_PLAN', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchCarePlans({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/care-plans/${payload.id}`)
        .then(response => {
          commit('SET_CARE_PLANS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * IO Charts
   */
  createIOChart({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/iocharts/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_IO_CHART', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchIOCharts({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/iocharts/${payload.id}`)
        .then(response => {
          commit('SET_IO_CHARTS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * IO Charts
   */
  createNursingNote({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/nursing-notes/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_NURSING_NOTE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchNursingNotes({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/nursing-notes/${payload.id}`)
        .then(response => {
          commit('SET_NURSING_NOTES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Ward Round
   */
  createWardRound({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/ward-round/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_WARD_ROUND', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchWardRounds({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/ward-round/${payload.id}`)
        .then(response => {
          commit('SET_WARD_ROUNDS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Discharge
   */
  dischargePatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/discharge/${payload.id}`, payload.data)
        .then(response => {
          commit('DISCHARGE_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDischargeRecord({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/discharge/${payload.id}`)
        .then(response => {
          commit('SET_DISCHARGE_RECORD', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDischargeRecords({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/admission/discharge', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_DISCHARGE_RECORDS', response.data.data.docs);
          commit('SET_DISCHARGE_RECORDS_TOTAL', response.data.data.total);
          commit('SET_DISCHARGE_RECORDS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * POST NATAL INFO
   */
  createPostNatalInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/postnatal-info/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_POSTNATAL_INFO', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPostNatalInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/postnatal-info/${payload.id}`)
        .then(response => {
          commit('SET_POSTNATAL_INFO', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * DELIVERY INFO
   */
  createDeliveryInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/delivery-info/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_DELIVERY_INFO', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDeliveryInfo({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/delivery-info/${payload.id}`)
        .then(response => {
          commit('SET_DELIVERY_INFO', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
