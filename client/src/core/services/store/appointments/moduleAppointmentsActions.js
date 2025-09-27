import axios from '../../../../axios';

export default {
  /**
   * CORE APPOINTMENT CRUD OPERATIONS
   */

  // Create new appointment
  createAppointment({ commit, dispatch }, appointmentData) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);
      commit('CLEAR_ERROR');

      axios
        .post('/appointments/create', appointmentData)
        .then((response) => {
          const appointment = response.data.data;
          commit('ADD_APPOINTMENT', appointment);
          commit('SET_SUBMITTING', false);

          // Refresh today's appointments if this is for today
          const today = new Date().toISOString().split('T')[0];
          const appointmentDate = new Date(appointment.appointment_date)
            .toISOString()
            .split('T')[0];
          if (appointmentDate === today) {
            dispatch('fetchTodaysAppointments');
          }

          resolve(response);
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create appointment');
          if (error.response?.data?.errors) {
            commit('SET_VALIDATION_ERRORS', error.response.data.errors);
          }
          reject(error);
        });
    });
  },

  // Fetch appointments with pagination and filters
  fetchAppointments({ commit, state }, params = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const queryParams = {
        currentPage: params.currentPage || state.currentPage,
        pageLimit: params.pageLimit || state.itemsPerPage,
        search: params.search || state.searchTerm,
        ...state.filters,
        ...params,
      };

      axios
        .get('/appointments/get', { params: queryParams })
        .then((response) => {
          commit('SET_APPOINTMENTS', response.data.data.docs);
          commit('SET_APPOINTMENTS_TOTAL', response.data.data.total);
          commit('SET_APPOINTMENTS_PAGES', response.data.data.pages);
          commit('SET_CURRENT_PAGE', queryParams.currentPage);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_LOADING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch appointments');
          reject(error);
        });
    });
  },

  // Fetch single appointment by ID
  fetchAppointment({ commit }, appointmentId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/appointments/${appointmentId}`)
        .then((response) => {
          commit('SET_APPOINTMENT', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch appointment');
          reject(error);
        });
    });
  },

  // Update appointment
  updateAppointment({ commit }, { id, data }) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);
      commit('CLEAR_ERROR');

      axios
        .put(`/appointments/${id}`, data)
        .then((response) => {
          const updatedAppointment = response.data.data;
          commit('UPDATE_APPOINTMENT', updatedAppointment);
          commit('SET_SUBMITTING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update appointment');
          if (error.response?.data?.errors) {
            commit('SET_VALIDATION_ERRORS', error.response.data.errors);
          }
          reject(error);
        });
    });
  },

  // Cancel appointment
  cancelAppointment({ commit }, { id, reason }) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);

      axios
        .put(`/appointments/${id}/cancel`, { cancellation_reason: reason })
        .then((response) => {
          const cancelledAppointment = response.data.data;
          commit('UPDATE_APPOINTMENT', cancelledAppointment);
          commit('UPDATE_APPOINTMENT_STATUS', { appointmentId: id, status: 'Cancelled' });
          commit('SET_SUBMITTING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to cancel appointment');
          reject(error);
        });
    });
  },

  // Confirm appointment
  confirmAppointment({ commit }, appointmentId) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/appointments/${appointmentId}/confirm`)
        .then((response) => {
          const confirmedAppointment = response.data.data;
          commit('UPDATE_APPOINTMENT', confirmedAppointment);
          commit('UPDATE_APPOINTMENT_STATUS', { appointmentId, status: 'Confirmed' });
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to confirm appointment');
          reject(error);
        });
    });
  },

  // Reschedule appointment
  rescheduleAppointment({ commit }, { id, appointment_date, appointment_time, reason }) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);

      axios
        .put(`/appointments/${id}/reschedule`, {
          appointment_date,
          appointment_time,
          rescheduling_reason: reason,
        })
        .then((response) => {
          const rescheduledAppointment = response.data.data;
          commit('UPDATE_APPOINTMENT', rescheduledAppointment);
          commit('UPDATE_APPOINTMENT_STATUS', { appointmentId: id, status: 'Rescheduled' });
          commit('SET_SUBMITTING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to reschedule appointment');
          reject(error);
        });
    });
  },

  /**
   * CHECK-IN OPERATIONS
   */

  // Check-in single appointment
  checkInAppointment({ commit, dispatch }, { appointmentId, checkInData = {} }) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);

      axios
        .post(`/appointments/${appointmentId}/check-in`, checkInData)
        .then((response) => {
          const { appointment, visit } = response.data.data;
          commit('UPDATE_APPOINTMENT', appointment);
          commit('UPDATE_APPOINTMENT_STATUS', { appointmentId, status: 'Completed' });
          commit('SET_SUBMITTING', false);

          // Refresh check-in queue
          dispatch('fetchCheckInQueue');

          resolve({ appointment, visit });
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to check-in appointment');
          reject(error);
        });
    });
  },

  // Bulk check-in appointments
  bulkCheckIn({ commit, dispatch }, appointmentIds) {
    return new Promise((resolve, reject) => {
      commit('SET_SUBMITTING', true);

      axios
        .post('/appointments/check-in/bulk', { appointment_ids: appointmentIds })
        .then((response) => {
          const { successful } = response.data.data;

          // Update successful check-ins
          successful.forEach((result) => {
            commit('UPDATE_APPOINTMENT', result.appointment);
            commit('UPDATE_APPOINTMENT_STATUS', {
              appointmentId: result.appointment.id,
              status: 'Completed',
            });
          });

          commit('SET_SUBMITTING', false);
          dispatch('fetchCheckInQueue');

          resolve(response.data.data);
        })
        .catch((error) => {
          commit('SET_SUBMITTING', false);
          commit('SET_ERROR', error.response?.data?.message || 'Failed to bulk check-in');
          reject(error);
        });
    });
  },

  // Validate check-in requirements
  validateCheckIn({ commit }, appointmentId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/appointments/${appointmentId}/validate-check-in`)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to validate check-in');
          reject(error);
        });
    });
  },

  // Fetch check-in queue
  fetchCheckInQueue({ commit }, doctorId = null) {
    return new Promise((resolve, reject) => {
      const params = doctorId ? { doctor_id: doctorId } : {};

      axios
        .get('/appointments/check-in-queue/get', { params })
        .then((response) => {
          commit('SET_CHECK_IN_QUEUE', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch check-in queue');
          reject(error);
        });
    });
  },

  // Fetch today's appointments
  fetchTodaysAppointments({ commit }, filters = {}) {
    return new Promise((resolve, reject) => {
      axios
        .get('/appointments/today/get', { params: filters })
        .then((response) => {
          commit('SET_TODAYS_APPOINTMENTS', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || "Failed to fetch today's appointments"
          );
          reject(error);
        });
    });
  },

  // Mark appointment as no-show
  markNoShow({ commit }, appointmentId) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/appointments/${appointmentId}/no-show`)
        .then((response) => {
          const noShowAppointment = response.data.data;
          commit('UPDATE_APPOINTMENT', noShowAppointment);
          commit('UPDATE_APPOINTMENT_STATUS', { appointmentId, status: 'No Show' });
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to mark as no-show');
          reject(error);
        });
    });
  },

  /**
   * SCHEDULE MANAGEMENT
   */

  // Get available time slots
  fetchAvailableSlots({ commit }, { doctor_id, date, duration_minutes = 30 }) {
    return new Promise((resolve, reject) => {
      axios
        .get('/appointments/available-slots/get', {
          params: { doctor_id, date, duration_minutes },
        })
        .then((response) => {
          commit('SET_AVAILABLE_SLOTS', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch available slots');
          reject(error);
        });
    });
  },

  // Get doctor schedule
  fetchDoctorSchedule({ commit }, { doctorId, date }) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/appointments/doctor/${doctorId}/schedule`, { params: { date } })
        .then((response) => {
          commit('SET_DOCTOR_SCHEDULE', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch doctor schedule');
          reject(error);
        });
    });
  },

  // Get schedule overview
  fetchScheduleOverview({ commit }, { doctorId, date }) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/appointments/doctor/${doctorId}/schedule-overview`, { params: { date } })
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch schedule overview');
          reject(error);
        });
    });
  },

  /**
   * UTILITY ACTIONS
   */

  // Set current appointment
  setCurrentAppointment({ commit }, appointment) {
    commit('SET_CURRENT_APPOINTMENT', appointment);
  },

  // Set selected date
  setSelectedDate({ commit }, date) {
    commit('SET_SELECTED_DATE', date);
  },

  // Set selected doctor
  setSelectedDoctor({ commit }, doctor) {
    commit('SET_SELECTED_DOCTOR', doctor);
  },

  // Update filters
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },

  // Clear filters
  clearFilters({ commit }) {
    commit('CLEAR_FILTERS');
  },

  // Set search term
  setSearchTerm({ commit }, term) {
    commit('SET_SEARCH_TERM', term);
  },

  // Clear error
  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },

  // UI state actions
  showPatientModal({ commit }) {
    commit('SET_SHOW_PATIENT_MODAL', true);
  },

  hidePatientModal({ commit }) {
    commit('SET_SHOW_PATIENT_MODAL', false);
  },

  showAppointmentForm({ commit }) {
    commit('SET_SHOW_APPOINTMENT_FORM', true);
  },

  hideAppointmentForm({ commit }) {
    commit('SET_SHOW_APPOINTMENT_FORM', false);
  },
};
