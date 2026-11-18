import { defineStore } from 'pinia';
import axios from '../core/axios';
import type {
  AddAlertResponse,
  AlertRequest,
  AlertsResponse,
  UpdateAlertResponse,
} from '../types/api/alert';

export type Alert = NonNullable<AddAlertResponse['data']>;
export type AlertListItem = Extract<
  AlertsResponse['data'],
  { docs: { id: number }[] }
>['docs'][number];
export type StoredAlert = Alert | UpdateAlertResponse['data'];

export interface FetchAlertsPayload {
  currentPage?: number;
  itemsPerPage?: number;
  id: number | string;
}

export interface UpdateAlertPayload {
  id: number;
  [field: string]: unknown;
}

export const useAlertStore = defineStore('alert', {
  state: (): {
    alert: StoredAlert | null;
    alerts: AlertListItem[];
    total: number | null;
    pages: number;
  } => ({
    alert: null,
    alerts: [],
    total: null,
    pages: 0,
  }),
  actions: {
    ADD_ALERT(alert: StoredAlert) {
      this.alert = alert;
    },

    SET_ALERTS(alerts: AlertListItem[]) {
      this.alerts = alerts;
    },

    SET_ALERTS_TOTAL(total: number) {
      this.total = total;
    },

    SET_ALERTS_PAGES(pages: number) {
      this.pages = pages;
    },

    addAlert(payload: AlertRequest) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/alerts/create`, payload)
          .then((response) => {
            this.ADD_ALERT(response.data.data);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    fetchAlerts(payload: FetchAlertsPayload) {
      return new Promise((resolve, reject) => {
        axios
          .get('/alerts/get', {
            params: {
              currentPage: payload.currentPage,
              pageLimit: payload.itemsPerPage,
              visit_id: payload.id,
            },
          })
          .then((response) => {
            this.SET_ALERTS(response.data.data.docs);
            this.SET_ALERTS_TOTAL(response.data.data.total);
            this.SET_ALERTS_PAGES(response.data.data.pages);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    updateAlert(payload: UpdateAlertPayload) {
      return new Promise((resolve, reject) => {
        axios
          .put(`/alerts/update/${payload.id}`, payload)
          .then((response) => {
            this.ADD_ALERT(response.data.data);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});
