export default {
  ADD_PATIENT(state, patient) {
    state.patients.push(patient);
  },

  SET_PATIENTS(state, patients) {
    state.patients = patients;
  },

  SET_PATIENTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_PATIENT(state, patient) {
    state.patient = patient;
  },

  SET_PATIENT_PROFILE(state, patient) {
    state.patientProfile = patient;
  },

  SET_CURRENT_PATIENT(state, patient) {
    state.currentPatient = patient;
  },

  UPDATE_PATIENT(state, patient) {
    const patientIndex = state.patients.findIndex(p => p.id === patient.id);
    Object.assign(state.patients[patientIndex], patient);
  },

  // eslint-disable-next-line no-unused-vars
  UPDATE_PATIENT_INSURANCE(state, patient) {},

  /**
   * DEPENDANTS
   */

  ADD_DEPENDANT(state, dependant) {
    state.dependants.push(dependant);
  },
};
