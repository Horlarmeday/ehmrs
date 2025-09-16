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

  UPDATE_PATIENT_PROFILE(state, patient) {
    state.patientProfile = patient;
  },

  SET_CURRENT_PATIENT(state, patient) {
    state.currentPatient = patient;
  },

  UPDATE_PATIENT(state, patient) {
    const patientIndex = state.patients.findIndex(p => p.id === patient.id);
    if (patientIndex !== -1) {
      Object.assign(state.patients[patientIndex], patient);
    }
  },

  // eslint-disable-next-line no-unused-vars
  UPDATE_PATIENT_INSURANCE(state, patient) {},

  /**
   * DEPENDANTS
   */

  ADD_DEPENDANT(state, dependant) {
    state.dependants.push(dependant);
  },

  // eslint-disable-next-line no-unused-vars
  DOWNLOAD_HOSPITAL_CARD(state, patient) {},

  /**
   * DEATH STATISTICS AND REPORTING
   */
  SET_DEATH_STATISTICS(state, statistics) {
    state.deathStatistics = statistics;
  },

  SET_MORTALITY_REPORTS(state, reports) {
    state.mortalityReports = reports;
  },

  SET_DEATH_CERTIFICATE_TRACKING(state, tracking) {
    state.deathCertificateTracking = tracking;
  },

  // Certificate verification mutations
  SET_CERTIFICATE_VERIFICATION(state, data) {
    state.certificateVerification = data;
  },

  SET_ALL_SIGNATURES(state, data) {
    state.allSignatures = data.signatures || [];
  },

  SET_MISSING_DEATH_CERTIFICATE_NUMBERS(state, data) {
    state.missingDeathCertificateNumbers = data;
  },

  SET_DEATH_CERTIFICATE(state, data) {
    state.deathCertificate = data;
  },
};
