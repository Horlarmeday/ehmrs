export default {
  ADD_OBSERVATION(state, observation) {
    state.observations.unshift(observation);
  },

  ADD_DIAGNOSIS(state, diagnosis) {
    state.observations = [...diagnosis];
  },

  CHANGE_TEST_TYPE(state, type) {
    state.testType = type;
  },

  CHANGE_SAMPLE_ID(state, id) {
    state.sampleId = id;
  },

  /**
   * CONSULTATION HISTORY
   */
  SET_VISITS_HISTORY(state, history) {
    state.histories = history;
  },

  SET_VISITS_HISTORY_TOTAL(state, total) {
    state.totalHistories = total;
  },

  SET_VISITS_HISTORY_PAGES(state, pages) {
    state.totalHistoryPages = pages;
  },

  /**
   * CONSULTATION DIAGNOSES AND FINDINGS
   */
  SET_DIAGNOSES_FINDINGS(state, finding) {
    state.clinicalFinding = finding;
  },

  /**
   * DIAGNOSES
   */
  SET_DIAGNOSES(state, diagnoses) {
    state.diagnoses = diagnoses;
  },

  SET_DIAGNOSES_TOTAL(state, total) {
    state.totalDiagnosis = total;
  },

  SET_DIAGNOSES_PAGES(state, pages) {
    state.totalDiagnosisPages = pages;
  },

  /**
   * PATIENT HISTORIES
   */
  SET_PATIENT_HISTORIES(state, histories) {
    state.patientHistories = histories;
  },

  SET_PATIENT_HISTORY_TOTAL(state, total) {
    state.totalPatientHistories = total;
  },

  SET_PATIENT_HISTORY_PAGES(state, pages) {
    state.totalPatientHistoryPages = pages;
  },
};
