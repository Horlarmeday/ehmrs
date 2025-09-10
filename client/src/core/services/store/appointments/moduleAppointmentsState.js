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
  showPatientModal: false,
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
};
