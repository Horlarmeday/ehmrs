export default {
  // Appointment data
  appointment: null,
  appointments: [],
  total: null,
  pages: 0,
  currentPage: 1,
  currentAppointment: null,

  // Loading states
  loading: false,
  submitting: false,

  // Error states
  error: null,
  validationErrors: {},

  // Check-in queue
  checkInQueue: [],
  todaysAppointments: [],

  // Schedule data
  availableSlots: [],
  doctorSchedule: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedDoctor: null,

  // Time blocking and advanced features
  timeBlocks: [],
  waitlist: [],
  recurringAppointments: [],

  // UI state
  showAppointmentForm: false,
  showTimeSlotPicker: false,

  // Filters and search
  filters: {
    status: '',
    doctor_id: '',
    department: '',
    appointment_date: '',
    patient_name: '',
    appointment_type: '',
  },

  // Pagination
  itemsPerPage: 20,
  searchTerm: '',

  // Dashboard statistics
  dashboardStatistics: {
    today: {
      total: 0,
      completed: 0,
      pending: 0,
    },
    weekly: {
      total: 0,
      completed: 0,
      completion_rate: 0,
    },
    monthly: {
      total: 0,
      completed: 0,
      completion_rate: 0,
    },
    no_show_rate: 0,
    avg_wait_time: 0,
  },
};
