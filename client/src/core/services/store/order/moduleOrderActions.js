import axios from '@/axios';

export default {
  /**************
   LAB ORDERS
   *************/
  orderLabTest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/laboratory/create/${payload.id}`, { tests: payload.tests })
        .then(response => {
          commit('ORDER_LAB_TEST', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPrescribedTests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/laboratory/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_TESTS_ORDERS', response.data.data.docs);
          commit('SET_TESTS_ORDERS_TOTAL', response.data.data.total);
          commit('SET_TESTS_ORDERS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePrescribedTest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/orders/laboratory/update`, payload.data)
        .then(response => {
          commit('UPDATE_TEST_ORDER', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addSelectedTest({ commit }, test) {
    commit('ADD_SELECTED_TEST', test);
  },
  removeSelectedTest({ commit }, test) {
    commit('REMOVE_SELECTED_TEST', test);
  },
  emptySelectedTest({ commit }) {
    commit('EMPTY_SELECTED_TEST', []);
  },
  addSelectedButton({ commit }, button) {
    commit('ADD_SELECTED_BUTTON', button);
  },
  removeSelectedButton({ commit }, buttonId) {
    commit('REMOVE_SELECTED_BUTTON', buttonId);
  },
  emptySelectedButtons({ commit }) {
    commit('EMPTY_SELECTED_BUTTONS');
  },
  toggleTestUrgent({ commit }, testId) {
    commit('TOGGLE_TEST_URGENT', testId);
  },

  /**************
   RADIOLOGY ORDERS
   *************/
  orderInvestigationTest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/radiology/create/${payload.id}`, { investigations: payload.investigations })
        .then(response => {
          commit('ORDER_INVESTIGATION_TEST', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchRadiologyOrders({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/radiology/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_INVESTIGATIONS_ORDERS', response.data.data.docs);
          commit('SET_INVESTIGATIONS_ORDERS_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATIONS_ORDERS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePrescribedInvestigation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/orders/radiology/update`, payload.data)
        .then(response => {
          commit('UPDATE_INVESTIGATION_ORDER', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addSelectedInvestigation({ commit }, investigation) {
    commit('ADD_SELECTED_INVESTIGATION', investigation);
  },
  removeSelectedInvestigation({ commit }, investigation) {
    commit('REMOVE_SELECTED_INVESTIGATION', investigation);
  },
  emptySelectedInvestigations({ commit }) {
    commit('EMPTY_SELECTED_INVESTIGATION', []);
  },
  addSelectedInvestigationButton({ commit }, button) {
    commit('ADD_SELECTED_INVESTIGATION_BUTTON', button);
  },
  removeSelectedInvestigationButton({ commit }, buttonId) {
    commit('REMOVE_SELECTED_INVESTIGATION_BUTTON', buttonId);
  },
  emptySelectedInvestigationButtons({ commit }) {
    commit('EMPTY_SELECTED_INVESTIGATION_BUTTONS');
  },
  toggleInvestigationUrgency({ commit }, investigationId) {
    commit('TOGGLE_INVESTIGATION_URGENCY', investigationId);
  },

  /**************
   DRUG ORDERS
   *************/
  orderDrug({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/pharmacy/create/${payload.id}`, payload.drug)
        .then(response => {
          commit('ORDER_DRUG', payload.drug);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPrescribedDrugs({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/pharmacy/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            fetchWithItems: payload?.fetchWithItems,
            filter: payload?.filter,
          },
        })
        .then(response => {
          if (payload.fetchWithItems) {
            commit('SET_DRUG_ORDERS', response.data.data.prescribedDrugs.docs);
            commit('SET_DRUGS_ORDERS_TOTAL', response.data.data.prescribedDrugs.total);
            commit('SET_DRUGS_ORDERS_PAGES', response.data.data.prescribedDrugs.pages);
            // Additional Items
            commit('SET_ADD_ITEMS_ORDERS', response.data.data.additionalItems.docs);
            commit('SET_ADD_ITEMS_ORDERS_TOTAL', response.data.data.additionalItems.total);
            commit('SET_ADD_ITEMS_ORDERS_PAGES', response.data.data.additionalItems.pages);
            return;
          }
          commit('SET_DRUG_ORDERS', response.data.data.docs);
          commit('SET_DRUGS_ORDERS_TOTAL', response.data.data.total);
          commit('SET_DRUGS_ORDERS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePrescribedDrug({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/orders/pharmacy/update`, payload.data)
        .then(response => {
          commit('UPDATE_DRUG_ORDER', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  orderAdditionalItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/pharmacy/additional-items/create/${payload.id}`, payload.data)
        .then(response => {
          commit('ORDER_ADD_ITEMS', payload.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPrescribedAdditionalItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/pharmacy/additional-items/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_ADD_ITEMS_ORDERS', response.data.data.docs);
          commit('SET_ADD_ITEMS_ORDERS_TOTAL', response.data.data.total);
          commit('SET_ADD_ITEMS_ORDERS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***********************
   * ADDITIONAL SERVICES
   **********************/
  orderAdditionalService({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/service/create/${payload.id}`, { services: payload.services })
        .then(response => {
          commit('ORDER_ADD_SERVICE', payload.services);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPrescribedServices({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/service/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_SERVICES_ORDERS', response.data.data.docs);
          commit('SET_SERVICES_ORDERS_TOTAL', response.data.data.total);
          commit('SET_SERVICES_ORDERS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePrescribedService({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/orders/service/update`, payload.data)
        .then(response => {
          commit('UPDATE_SERVICE_ORDER', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addSelectedService({ commit }, service) {
    commit('ADD_SELECTED_SERVICE', service);
  },
  removeSelectedService({ commit }, service) {
    commit('REMOVE_SELECTED_SERVICE', service);
  },
  emptySelectedService({ commit }) {
    commit('EMPTY_SELECTED_SERVICE', []);
  },
  addSelectedServiceButton({ commit }, button) {
    commit('ADD_SELECTED_SERVICE_BUTTON', button);
  },
  removeSelectedServiceButton({ commit }, buttonId) {
    commit('REMOVE_SELECTED_SERVICE_BUTTON', buttonId);
  },
  emptySelectedServiceButtons({ commit }) {
    commit('EMPTY_SELECTED_SERVICE_BUTTONS');
  },
  toggleServiceUrgent({ commit }, serviceId) {
    commit('TOGGLE_SERVICE_URGENT', serviceId);
  },

  /**************
   TREATMENTS
   *************/
  orderTreatment({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/pharmacy/treatment/create/${payload.id}`, payload.data)
        .then(response => {
          commit('ORDER_TREATMENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchTreatments({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/orders/pharmacy/treatment/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_TREATMENTS', response.data.data.docs);
          commit('SET_TREATMENTS_TOTAL', response.data.data.total);
          commit('SET_TREATMENTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
