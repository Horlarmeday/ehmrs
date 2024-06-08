import axios from '@/axios';

export default {
  updateSettings({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post('/settings/system-settings/update', payload)
        .then(response => {
          commit('SET_SETTINGS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchSettings({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/system-settings/get')
        .then(response => {
          commit('SET_SETTINGS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
