export default {
  // Basic appointment mutations
  SET_APPOINTMENTS(state, appointments) {
    state.appointments = appointments;
  },

  ADD_APPOINTMENT(state, appointment) {
    state.appointments.unshift(appointment);
  },

  UPDATE_APPOINTMENT(state, updatedAppointment) {
    const index = state.appointments.findIndex((apt) => apt.id === updatedAppointment.id);
    if (index !== -1) {
      Object.assign(state.appointments[index], updatedAppointment);
    }
  },

  DELETE_APPOINTMENT(state, appointmentId) {
    state.appointments = state.appointments.filter((apt) => apt.id !== appointmentId);
  },

  SET_APPOINTMENT(state, appointment) {
    state.appointment = appointment;
  },

  SET_CURRENT_APPOINTMENT(state, appointment) {
    state.currentAppointment = appointment;
  },

  // Pagination mutations
  SET_APPOINTMENTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_APPOINTMENTS_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },

  // Loading states
  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_SUBMITTING(state, submitting) {
    state.submitting = submitting;
  },

  // Error handling
  SET_ERROR(state, error) {
    state.error = error;
  },

  CLEAR_ERROR(state) {
    state.error = null;
    state.validationErrors = {};
  },

  SET_VALIDATION_ERRORS(state, errors) {
    state.validationErrors = errors;
  },

  // Check-in queue mutations
  SET_CHECK_IN_QUEUE(state, appointments) {
    state.checkInQueue = appointments;
  },

  SET_TODAYS_APPOINTMENTS(state, appointments) {
    state.todaysAppointments = appointments;
  },

  UPDATE_APPOINTMENT_STATUS(state, { appointmentId, status }) {
    // Update in main appointments list
    const mainIndex = state.appointments.findIndex((apt) => apt.id === appointmentId);
    if (mainIndex !== -1) {
      state.appointments[mainIndex].status = status;
    }

    // Update in check-in queue
    const queueIndex = state.checkInQueue.findIndex((apt) => apt.id === appointmentId);
    if (queueIndex !== -1) {
      state.checkInQueue[queueIndex].status = status;
    }

    // Update in today's appointments
    const todayIndex = state.todaysAppointments.findIndex((apt) => apt.id === appointmentId);
    if (todayIndex !== -1) {
      state.todaysAppointments[todayIndex].status = status;
    }
  },

  // Schedule mutations
  SET_AVAILABLE_SLOTS(state, slots) {
    state.availableSlots = slots;
  },

  SET_DOCTOR_SCHEDULE(state, schedule) {
    state.doctorSchedule = schedule;
  },

  SET_SELECTED_DATE(state, date) {
    state.selectedDate = date;
  },

  SET_SELECTED_DOCTOR(state, doctor) {
    state.selectedDoctor = doctor;
  },

  // Advanced features mutations
  SET_TIME_BLOCKS(state, blocks) {
    state.timeBlocks = blocks;
  },

  ADD_TIME_BLOCK(state, block) {
    state.timeBlocks.push(block);
  },

  SET_WAITLIST(state, waitlist) {
    state.waitlist = waitlist;
  },

  ADD_TO_WAITLIST(state, entry) {
    state.waitlist.push(entry);
  },

  SET_RECURRING_APPOINTMENTS(state, appointments) {
    state.recurringAppointments = appointments;
  },

  // UI state mutations
  SET_SHOW_PATIENT_MODAL(state, show) {
    state.showPatientModal = show;
  },

  SET_SHOW_APPOINTMENT_FORM(state, show) {
    state.showAppointmentForm = show;
  },

  SET_SHOW_TIME_SLOT_PICKER(state, show) {
    state.showTimeSlotPicker = show;
  },

  // Filter mutations
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },

  CLEAR_FILTERS(state) {
    state.filters = {
      status: '',
      doctor_id: '',
      department: '',
      appointment_date: '',
      patient_name: '',
      appointment_type: '',
    };
  },

  SET_SEARCH_TERM(state, term) {
    state.searchTerm = term;
  },

  SET_ITEMS_PER_PAGE(state, count) {
    state.itemsPerPage = count;
  },
};
