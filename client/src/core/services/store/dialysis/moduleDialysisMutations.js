export const SET_DIALYSIS_VISITS = (state, visits) => {
  state.visits = visits;
};

export const SET_DIALYSIS_VISIT = (state, visit) => {
  const index = state.visits.findIndex((v) => v.id === visit.id);
  if (index !== -1) {
    state.visits.splice(index, 1, visit);
  } else {
    state.visits.push(visit);
  }
};

export const UPDATE_DIALYSIS_VISIT = (state, { id, data }) => {
  const index = state.visits.findIndex((v) => v.id === id);
  if (index !== -1) {
    state.visits.splice(index, 1, data);
  }
};

export const SET_DIALYSIS_TREATMENT = (state, treatment) => {
  const index = state.treatments.findIndex((t) => t.id === treatment.id);
  if (index !== -1) {
    state.treatments.splice(index, 1, treatment);
  } else {
    state.treatments.push(treatment);
  }
};

export const UPDATE_DIALYSIS_TREATMENT = (state, treatment) => {
  const index = state.treatments.findIndex((t) => t.id === treatment.id);
  if (index !== -1) {
    state.treatments.splice(index, 1, treatment);
  }
};

export const SET_PATIENT_DIALYSIS_TREATMENTS = (state, payload) => {
  state.patientTreatments = {
    ...state.patientTreatments,
    ...payload,
  };
};

export const SET_DIALYSIS_STATISTICS = (state, statistics) => {
  state.statistics = statistics;
};

export const SET_PATIENT_DIALYSIS_HISTORY = (state, history) => {
  state.patientHistory = history;
};

export const SET_DOCTOR_DIALYSIS_SCHEDULE = (state, schedule) => {
  state.doctorSchedule = schedule;
};

export const SET_NURSE_DIALYSIS_SCHEDULE = (state, schedule) => {
  state.nurseSchedule = schedule;
};

// ========================================
// DIALYSIS ASSESSMENT MUTATIONS
// ========================================

export const SET_DIALYSIS_ASSESSMENT = (state, assessment) => {
  state.assessment = assessment;
};

export const UPDATE_DIALYSIS_ASSESSMENT = (state, { id, data }) => {
  if (state.assessment && state.assessment.id === id) {
    state.assessment = { ...state.assessment, ...data };
  }
};

export const SET_PATIENT_DIALYSIS_ASSESSMENTS = (state, payload) => {
  state.patientAssessments = {
    ...state.patientAssessments,
    ...payload,
  };
};

// ========================================
// DIALYSIS VITALS MUTATIONS
// ========================================

export const SET_DIALYSIS_VITALS = (state, vitals) => {
  state.vitals = vitals;
};

export const ADD_DIALYSIS_VITALS = (state, vitals) => {
  state.vitals.unshift(vitals); // Add to beginning of array
};

export const UPDATE_DIALYSIS_VITALS = (state, { id, data }) => {
  const index = state.vitals.findIndex((v) => v.id === id);
  if (index !== -1) {
    state.vitals.splice(index, 1, data);
  }
};

export const SET_PATIENT_DIALYSIS_VITALS = (state, payload) => {
  state.patientVitals = {
    ...state.patientVitals,
    ...payload,
  };
};

// ========================================
// DIALYSIS NOTES MUTATIONS
// ========================================

export const SET_DIALYSIS_NOTES = (state, notes) => {
  state.notes = notes;
};

export const ADD_DIALYSIS_NOTES = (state, notes) => {
  state.notes.unshift(notes); // Add to beginning of array
};

export const UPDATE_DIALYSIS_NOTES = (state, { id, data }) => {
  const index = state.notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    state.notes.splice(index, 1, data);
  }
};

export const SET_PATIENT_DIALYSIS_NOTES = (state, payload) => {
  state.patientNotes = {
    ...state.patientNotes,
    ...payload,
  };
};

// ========================================
// DIALYSIS TREATMENTS MUTATIONS
// ========================================

export const SET_DIALYSIS_TREATMENTS = (state, treatments) => {
  state.treatments = treatments;
};

// ========================================
// ICD10 DIAGNOSES MUTATIONS
// ========================================

export const SET_ICD10_DIAGNOSES = (state, diagnoses) => {
  state.icd10Diagnoses = diagnoses;
};

export const SET_LOADING = (state, loading) => {
  state.loading = loading;
};

export const SET_ERROR = (state, error) => {
  state.error = error;
};
