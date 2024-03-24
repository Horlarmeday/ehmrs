export default {
  /**
   * ACTIVE VISITS
   */
  ADD_VISIT(state, visit) {
    state.activeVisits.unshift(visit);
  },

  SET_ACTIVE_VISITS(state, visits) {
    state.activeVisits = visits;
  },

  SET_ACTIVE_VISITS_TOTAL(state, total) {
    state.totalActiveVisits = total;
  },

  SET_ACTIVE_NUMB_PAGES(state, pages) {
    state.activeVisitPages = pages;
  },

  UPDATE_VISIT(state, visit) {
    console.log(visit);
  },

  /**
   * CATEGORY VISITS
   */

  SET_CATEGORY_VISITS(state, visits) {
    state.categoryVisits = visits;
  },

  SET_CATEGORY_VISITS_TOTAL(state, total) {
    state.totalCategoryVisits = total;
  },

  SET_CATEGORY_VISITS_PAGES(state, pages) {
    state.totalCategoryVisitsPages = pages;
  },

  /**
   * ASSIGNED VISITS
   */
  SET_ASSIGNED_VISITS(state, visits) {
    state.assignedVisits = visits;
  },

  SET_ASSIGNED_VISITS_TOTAL(state, total) {
    state.totalAssignedVisits = total;
  },

  SET_ASSIGNED_VISITS_PAGES(state, pages) {
    state.totalAssignedVisitsPages = pages;
  },

  /**
   * ALL VISITS
   */
  SET_VISIT(state, visit) {
    state.visit = visit;
  },

  SET_ALL_VISITS(state, visits) {
    state.visits = visits;
  },

  SET_ALL_VISITS_TOTAL(state, total) {
    state.total = total;
  },

  SET_ALL_VISITS_PAGES(state, pages) {
    state.pages = pages;
  },

  /**
   * VISIT PRESCRIPTIONS
   */
  SET_VISIT_PRESCRIPTIONS(state, prescriptions) {
    state.visitPrescriptions = prescriptions;
  },
};
