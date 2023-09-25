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

  SET_VISIT(state, visit) {
    state.visit = visit;
  },

  SET_VISIT_TYPES(state, visits) {
    state.visitTypes = visits;
  },

  SET_VISIT_TYPES_TOTAL(state, total) {
    state.totalVisitTypes = total;
  },

  SET_VISIT_TYPES_PAGES(state, pages) {
    state.totalVisitTypesPages = pages;
  },
};
