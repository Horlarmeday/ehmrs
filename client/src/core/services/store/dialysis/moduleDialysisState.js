export default {
  visits: [],
  treatments: [],
  statistics: null,
  patientHistory: [],
  doctorSchedule: [],
  nurseSchedule: [],

  // New state properties for Phase 4
  assessment: null,
  vitals: [],
  notes: [],
  icd10Diagnoses: [],
  patientTreatments: {
    docs: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    pageLimit: 10,
  },
  patientAssessments: {
    docs: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    pageLimit: 10,
  },
  patientVitals: {
    docs: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    pageLimit: 10,
  },
  patientNotes: {
    docs: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    pageLimit: 10,
  },

  loading: false,
  error: null,
};
