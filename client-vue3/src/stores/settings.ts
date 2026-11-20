import { defineStore } from 'pinia';
import axios from '../core/axios';
import type { ChangePasswordRequest } from '../types/api/auth';
import type { SystemSettingsResponse } from '../types/api/settings';

export type SystemSettings = SystemSettingsResponse['data'];

export const useSettingsStore = defineStore('settings', {
  state: (): { settings: SystemSettings | null } => ({
    settings: null,
  }),
  actions: {
    SET_SETTINGS(settings: SystemSettings) {
      this.settings = settings;
    },

    CHANGE_PASSWORD() {},

    updateSettings(payload: SystemSettings | FormData) {
      return new Promise((resolve, reject) => {
        axios
          .post('/settings/system-settings/update', payload)
          .then((response) => {
            this.SET_SETTINGS(response.data.data);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    fetchSettings() {
      return new Promise((resolve, reject) => {
        axios
          .get('/settings/system-settings/get')
          .then((response) => {
            this.SET_SETTINGS(response.data.data);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    changePassword(payload: ChangePasswordRequest) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/auth/change-password`, payload)
          .then((response) => {
            this.CHANGE_PASSWORD();
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});
