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
};
