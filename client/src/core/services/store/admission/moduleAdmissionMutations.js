export default {
  ADMIT_PATIENT(state, admission) {
    state.admission = admission;
  },

  SET_ADMISSIONS(state, admissions) {
    state.admissions = admissions;
  },

  SET_ADMISSIONS_TOTAL(state, total) {
    state.total = total;
  },

  SET_ADMISSION_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_ADMISSION(state, admission) {
    state.admission = admission;
  },

  SET_DOCTOR_PRESCRIPTIONS(state, summary) {
    state.summary = summary;
  },

  SET_ADMISSION_HISTORY(state, history) {
    state.history = history;
  },

  /**
   * Observations
   */
  CREATE_OBSERVATION(state, observation) {
    state.observation = observation;
  },

  SET_OBSERVATIONS(state, observations) {
    state.observations = observations;
  },

  /**
   * Care plans
   */
  CREATE_CARE_PLAN(state, plan) {
    state.carePlan = plan;
  },

  SET_CARE_PLANS(state, plans) {
    state.carePlans = plans;
  },

  /**
   * IO Charts
   */
  CREATE_IO_CHART(state, chart) {
    state.iochart = chart;
  },

  SET_IO_CHARTS(state, charts) {
    state.iocharts = charts;
  },

  /**
   * Nursing Notes
   */
  CREATE_NURSING_NOTE(state, note) {
    state.nursingNote = note;
  },

  SET_NURSING_NOTES(state, notes) {
    state.nursingNotes = notes;
  },

  /**
   * Ward Round
   */
  CREATE_WARD_ROUND(state, wardRound) {
    state.wardRound = wardRound;
  },

  SET_WARD_ROUNDS(state, wardRounds) {
    state.wardRounds = wardRounds;
  },

  /**
   * Discharge
   */
  DISCHARGE_PATIENT(state, discharge) {
    state.discharge = discharge;
  },

  SET_DISCHARGE_RECORDS(state, discharges) {
    state.discharges = discharges;
  },

  SET_DISCHARGE_RECORDS_TOTAL(state, total) {
    state.totalDischarges = total;
  },

  SET_DISCHARGE_RECORDS_PAGES(state, pages) {
    state.dischargePages = pages;
  },

  SET_DISCHARGE_RECORD(state, discharge) {
    state.discharge = discharge;
  },
};
