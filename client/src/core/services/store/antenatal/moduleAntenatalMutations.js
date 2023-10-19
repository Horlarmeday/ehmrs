export default {
  ENROL_ANTENATAL_PATIENT(state, antenatal) {
    state.antenatal = antenatal;
  },

  SET_ONE_ANTENATAL_ACCOUNT(state, antenatal) {
    state.antenatal = antenatal;
  },

  SET_ANTENATAL_ACCOUNTS(state, accounts) {
    state.antenatalAccounts = accounts;
  },

  SET_ANTENATAL_ACCOUNTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_ANTENATAL_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  /**
   * TRIAGE
   */
  CREATE_ANTENATAL_TRIAGE(state, triage) {
    state.triages.push(triage);
  },

  SET_ANTENATAL_TRIAGES(state, triages) {
    state.triages = triages;
  },

  SET_ANTENATAL_TRIAGE_TOTAL(state, total) {
    state.totalTriage = total;
  },

  SET_ANTENATAL_TRIAGE_PAGES(state, pages) {
    state.triagePages = pages;
  },

  /**
   * CLINICAL NOTES
   */
  CREATE_CLINICAL_NOTE(state, note) {
    state.clinicalNotes.push(note);
  },

  SET_CLINICAL_NOTES(state, notes) {
    state.clinicalNotes = notes;
  },

  SET_CLINICAL_NOTES_TOTAL(state, total) {
    state.totalClinicalNotes = total;
  },

  SET_CLINICAL_NOTES_PAGES(state, pages) {
    state.totalClinicalNotesPages = pages;
  },

  UPDATE_CLINICAL_NOTE(state, note) {
    const noteIndex = state.clinicalNotes.findIndex(n => n.id === note.id);
    Object.assign(state.clinicalNotes[noteIndex], note);
  },

  /**
   * OBSERVATION
   */
  CREATE_OBSERVATION(state, observation) {
    state.observations.push(observation);
  },

  SET_OBSERVATIONS(state, observations) {
    state.observations = observations;
  },

  SET_OBSERVATIONS_TOTAL(state, total) {
    state.totalObservations = total;
  },

  SET_OBSERVATIONS_PAGES(state, pages) {
    state.totalObservationPages = pages;
  },

  UPDATE_OBSERVATION(state, observation) {
    const observationIndex = state.observations.findIndex(n => n.id === observation.id);
    Object.assign(state.observations[observationIndex], observation);
  },

  /**
   * VISITS SUMMARY
   */
  SET_VISITS_SUMMARY(state, visits) {
    state.summaries = visits;
  },

  SET_VISITS_SUMMARY_TOTAL(state, total) {
    state.totalSummaries = total;
  },

  SET_VISITS_SUMMARY_PAGES(state, pages) {
    state.totalSummaryPages = pages;
  },
};
