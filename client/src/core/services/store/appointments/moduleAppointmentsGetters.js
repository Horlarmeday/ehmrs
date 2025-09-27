export default {
  // Basic getters
  appointments: (state) => state.appointments,
  appointment: (state) => state.appointment,
  currentAppointment: (state) => state.currentAppointment,

  // Pagination getters
  total: (state) => state.total,
  pages: (state) => state.pages,
  currentPage: (state) => state.currentPage,
  itemsPerPage: (state) => state.itemsPerPage,

  // Loading state getters
  loading: (state) => state.loading,
  submitting: (state) => state.submitting,

  // Error getters
  error: (state) => state.error,
  validationErrors: (state) => state.validationErrors,
  hasError: (state) => !!state.error,
  hasValidationErrors: (state) => Object.keys(state.validationErrors).length > 0,

  // Check-in queue getters
  checkInQueue: (state) => state.checkInQueue,
  todaysAppointments: (state) => state.todaysAppointments,

  // Schedule getters
  availableSlots: (state) => state.availableSlots,
  doctorSchedule: (state) => state.doctorSchedule,
  selectedDate: (state) => state.selectedDate,
  selectedDoctor: (state) => state.selectedDoctor,

  // Advanced features getters
  timeBlocks: (state) => state.timeBlocks,
  waitlist: (state) => state.waitlist,
  recurringAppointments: (state) => state.recurringAppointments,

  // UI state getters
  showPatientModal: (state) => state.showPatientModal,
  showAppointmentForm: (state) => state.showAppointmentForm,
  showTimeSlotPicker: (state) => state.showTimeSlotPicker,

  // Filter getters
  filters: (state) => state.filters,
  searchTerm: (state) => state.searchTerm,
  activeFiltersCount: (state) => {
    return Object.values(state.filters).filter((value) => value !== '').length;
  },

  // Computed getters
  appointmentsByStatus: (state) => (status) => {
    return state.appointments.filter((appointment) => appointment.status === status);
  },

  appointmentsByDoctor: (state) => (doctorId) => {
    return state.appointments.filter((appointment) => appointment.doctor_id === doctorId);
  },

  appointmentsByDate: (state) => (date) => {
    return state.appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
      return appointmentDate === date;
    });
  },

  upcomingAppointments: (state) => {
    const now = new Date();
    return state.appointments.filter((appointment) => {
      const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );
      return appointmentDateTime > now && ['Scheduled', 'Confirmed'].includes(appointment.status);
    });
  },

  pastAppointments: (state) => {
    const now = new Date();
    return state.appointments.filter((appointment) => {
      const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );
      return appointmentDateTime < now;
    });
  },

  // Statistics getters
  appointmentStats: (state) => {
    const total = state.appointments.length;
    const scheduled = state.appointments.filter((apt) => apt.status === 'Scheduled').length;
    const confirmed = state.appointments.filter((apt) => apt.status === 'Confirmed').length;
    const completed = state.appointments.filter((apt) => apt.status === 'Completed').length;
    const cancelled = state.appointments.filter((apt) => apt.status === 'Cancelled').length;
    const noShow = state.appointments.filter((apt) => apt.status === 'No Show').length;

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
    };
  },

  checkInQueueStats: (state) => {
    const total = state.checkInQueue.length;
    const readyForCheckIn = state.checkInQueue.filter((apt) =>
      ['Scheduled', 'Confirmed'].includes(apt.status)
    ).length;
    const overdue = state.checkInQueue.filter((apt) => {
      const appointmentTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
      const now = new Date();
      const overdueThreshold = new Date(appointmentTime.getTime() + 15 * 60000); // 15 minutes
      return now > overdueThreshold && ['Scheduled', 'Confirmed'].includes(apt.status);
    }).length;

    return {
      total,
      readyForCheckIn,
      overdue,
    };
  },

  // Available slots helpers
  availableSlotsForDate: (state) => (date) => {
    return state.availableSlots.filter((slot) => slot.date === date && slot.available);
  },

  bookedSlotsForDate: (state) => (date) => {
    return state.availableSlots.filter((slot) => slot.date === date && !slot.available);
  },

  // Search and filter helpers
  filteredAppointments: (state) => {
    let filtered = [...state.appointments];

    // Apply search term
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient?.fullname?.toLowerCase().includes(term) ||
          appointment.doctor?.fullname?.toLowerCase().includes(term) ||
          appointment.reason_for_visit?.toLowerCase().includes(term) ||
          appointment.notes?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    Object.keys(state.filters).forEach((key) => {
      const value = state.filters[key];
      if (value) {
        if (key === 'patient_name') {
          filtered = filtered.filter((appointment) =>
            appointment.patient?.fullname?.toLowerCase().includes(value.toLowerCase())
          );
        } else if (key === 'appointment_date') {
          filtered = filtered.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointment_date)
              .toISOString()
              .split('T')[0];
            return appointmentDate === value;
          });
        } else {
          filtered = filtered.filter((appointment) => appointment[key] === value);
        }
      }
    });

    return filtered;
  },

  // Pagination helpers
  paginatedAppointments: (state) => {
    const filtered = state.filteredAppointments;
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    return filtered.slice(start, end);
  },

  totalFilteredAppointments: (state) => state.filteredAppointments.length,

  // Utility getters
  getAppointmentById: (state) => (id) => {
    return state.appointments.find((appointment) => appointment.id === id);
  },

  getAppointmentStatusColor: () => (status) => {
    const statusColors = {
      Scheduled: 'warning',
      Confirmed: 'info',
      Completed: 'success',
      Cancelled: 'danger',
      'No Show': 'secondary',
      Rescheduled: 'primary',
    };
    return statusColors[status] || 'secondary';
  },

  getAppointmentTypeColor: () => (type) => {
    const typeColors = {
      CONSULTATION: 'primary',
      FOLLOW_UP: 'info',
      PROCEDURE: 'warning',
      VACCINATION: 'success',
      DIALYSIS: 'danger',
      ANTENATAL: 'pink',
    };
    return typeColors[type] || 'secondary';
  },
};
