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

  SET_CURRENT_PATIENT(state, patient) {
    state.currentPatient = patient;
  },

  UPDATE_PATIENT(state, patient) {
    const patientIndex = state.patients.findIndex(p => p.id === patient.id);
    Object.assign(state.patients[patientIndex], patient);
  },

  /**
   * DEPENDANTS
   */

  ADD_DEPENDANT(state, dependant) {
    state.dependants.push(dependant);
  },

  SET_DEPENDANTS(state, dependants) {
    state.dependants = dependants;
  },

  SET_DEPENDANTS_TOTAL(state, total) {
    state.totalDependants = total;
  },

  SET_DEPENDANTS_NUMB_PAGES(state, pages) {
    state.dependantpages = pages;
  },

  SET_DEPENDANT(state, dependant) {
    state.dependant = dependant;
  },

  UPDATE_DEPENDANT(state, dependant) {
    const dependantIndex = state.dependants.findIndex(
      d => d.id === dependant.id
    );
    Object.assign(state.dependants[dependantIndex], dependant);
  }
};
