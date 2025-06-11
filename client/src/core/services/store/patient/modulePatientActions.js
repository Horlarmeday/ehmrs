import axios from '@/axios';
import { getExtensions } from '@/common/common';

export default {
  /**
   * PRINCIPAL
   */
  createPatientAccount({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .post('/patients/create', patient)
        .then(response => {
          commit(
            'ADD_PATIENT',
            Object.assign(patient, {
              patient_id: response.data.data.id,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addPatientHealthInsurance({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/patients/health-insurance/${payload.patient_id}`, payload.data)
        .then(response => {
          commit('ADD_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  createEmergencyPatient({ commit }, patient) {
    return new Promise((resolve, reject) => {
      axios
        .post('/patients/create/emergency', patient)
        .then(response => {
          commit(
            'ADD_PATIENT',
            Object.assign(patient, {
              patient_id: response.data.data.id,
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
    return new Promise((resolve, reject) => {
      axios
        .get('/patients/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_PATIENTS', response.data.data.docs);
          commit('SET_PATIENTS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
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
          commit('SET_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPatientProfile({ commit }, patientId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/patients/profile/get/${patientId}`)
        .then(response => {
          commit('SET_PATIENT_PROFILE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  setCurrentPatient({ commit }, payload) {
    commit('SET_CURRENT_PATIENT', payload);
  },

  updatePatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/update/${payload.id}`, payload.data)
        .then(response => {
          commit('UPDATE_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePatientInsurance({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/update-insurance/${payload.id}`, payload.data)
        .then(response => {
          commit('UPDATE_PATIENT_INSURANCE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  togglePatientInsurance({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/toggle-insurance/${payload.id}`, payload.data)
        .then(response => {
          commit('UPDATE_PATIENT_INSURANCE', response.data.data);
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
  createDependant({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/patients/create/dependant/${payload.patient_id}`, payload.data)
        .then(response => {
          commit('ADD_DEPENDANT', response.data.data.id);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  convertDependantAccount({ commit }, patientId) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/patients/convert-dependant/${patientId}`)
        .then(response => {
          commit('UPDATE_PATIENT_INSURANCE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***********************
   * DEPENDANTS DEPRECATED
   **********************/

  fetchDependants({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/patients/dependant/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_DEPENDANTS', response.data.data.docs);
          commit('SET_DEPENDANTS_TOTAL', response.data.data.total);
          commit('SET_DEPENDANTS_NUMB_PAGES', response.data.data.pages);
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
          commit('UPDATE_DEPENDANT', response.data.data);
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
          commit('SET_DEPENDANT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  downloadHospitalCard({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `/patients/download-hospital-card/${payload.id}`,
          {},
          {
            responseType: 'arraybuffer', // Important to receive binary data
          }
        )
        .then(response => {
          const contentType = response.headers['content-type'].split(';')[0];
          const blob = new Blob([response.data], {
            type: contentType,
          });
          const url = window.URL.createObjectURL(blob);
          // Create an anchor element with download attribute and trigger click event
          const a = document.createElement('a');
          const extension = getExtensions();
          a.href = url;
          a.download = `lab_result.${extension[contentType]}`;
          a.click();

          // Clean up resources
          window.URL.revokeObjectURL(url);
          commit('DOWNLOAD_HOSPITAL_CARD', []);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  printHospitalCard({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/patients/download-hospital-card/${payload.id}`, {
          responseType: 'arraybuffer', // 👈 Keep this
        })
        .then(response => {
          const contentType = response.headers['content-type'].split(';')[0];
          const blob = new Blob([response.data], { type: contentType });
          const blobUrl = window.URL.createObjectURL(blob);

          // Open in a new tab or iframe for printing
          const printWindow = window.open(blobUrl, '_blank');
          if (!printWindow) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
          }

          // Give the browser a moment to load the PDF, then trigger print
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
          commit('DOWNLOAD_HOSPITAL_CARD', []);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
