import axios from '../../../../axios';

export default {
  /**
   * TESTS
   */
  addTest({ commit }, test) {
    return new Promise((resolve, reject) => {
      axios
        .post('/laboratory/tests/create', test)
        .then(response => {
          commit(
            'ADD_TEST',
            Object.assign(test, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
              code: response.data.data.code,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchTests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/tests/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
            sampleId: payload.sampleId,
          },
        })
        .then(response => {
          commit('SET_TESTS', response.data.data.docs);
          commit('SET_TESTS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateTest({ commit }, test) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/laboratory/tests/update`, test)
        .then(response => {
          commit('UPDATE_TEST', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * SAMPLES
   */
  addTestSample({ commit }, sample) {
    return new Promise((resolve, reject) => {
      axios
        .post('/laboratory/test/samples/create', sample)
        .then(response => {
          commit(
            'ADD_SAMPLE',
            Object.assign(sample, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchTestSamples({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/test/samples/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_SAMPLES', response.data.data.docs);
          commit('SET_SAMPLES_TOTAL', response.data.data.total);
          commit('SET_SAMPLE_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateTestSample({ commit }, sample) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/laboratory/test/samples/update`, sample)
        .then(response => {
          commit('UPDATE_SAMPLE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * SAMPLES TO COLLECT
   */
  fetchSamplesToCollect({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/samples-to-collect/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            period: payload.period,
          },
        })
        .then(response => {
          commit('SET_SAMPLES_TO_COLLECT', response.data.data.docs);
          commit('SET_SAMPLES_TO_COLLECT_TOTAL', response.data.data.total);
          commit('SET_SAMPLES_TO_COLLECT_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneSampleToCollect({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/laboratory/samples-to-collect/get/${payload.id}`)
        .then(response => {
          commit('SET_SAMPLE_TO_COLLECT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneCollectedSample({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/laboratory/samples-collected/get/${payload.id}`)
        .then(response => {
          commit('SET_SAMPLE_COLLECTED', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  generateAccessionNumber({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/laboratory/accession-number`)
        .then(response => {
          commit('GEN_ACCESSION_NUMBER', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  collectSamples({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/laboratory/collect-samples`, payload)
        .then(response => {
          commit('COLLECT_SAMPLES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * TEST RESULTS
   */
  addTestResult({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/laboratory/add-test-result`, { results: payload })
        .then(response => {
          commit('SET_TEST_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  validateTestResults({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/laboratory/validate-test-result`, { ...payload })
        .then(response => {
          commit('SET_TEST_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  approveTestResults({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/laboratory/approve-test-result`, { results: payload })
        .then(response => {
          commit('SET_TEST_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchTestResults({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/test-results/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_TEST_RESULTS', response.data.data.docs);
          commit('SET_TEST_RESULTS_TOTAL', response.data.data.total);
          commit('SET_TEST_RESULTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * SAMPLES COLLECTED
   */
  fetchSamplesCollected({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/samples-collected/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            period: payload.period,
          },
        })
        .then(response => {
          commit('SET_SAMPLES_COLLECTED', response.data.data.docs);
          commit('SET_SAMPLES_COLLECTED_TOTAL', response.data.data.total);
          commit('SET_SAMPLES_COLLECTED_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * NHIS TESTS
   */
  addNhisTest({ commit }, test) {
    return new Promise((resolve, reject) => {
      axios
        .post('/laboratory/nhis/tests/create', test)
        .then(response => {
          commit(
            'ADD_NHIS_TEST',
            Object.assign(test, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchNhisTests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/laboratory/nhis/tests/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_NHIS_TESTS', response.data.data.docs);
          commit('SET_NHIS_TESTS_TOTAL', response.data.data.total);
          commit('SET_NHIS_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateNhisTest({ commit }, test) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/laboratory/nhis/tests/update`, test)
        .then(response => {
          commit('UPDATE_NHIS_TEST', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
