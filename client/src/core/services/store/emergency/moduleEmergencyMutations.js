export const SET_EMERGENCY_VISITS = (state, visits) => {
  state.visits = visits;
};

export const SET_EMERGENCY_VISIT = (state, visit) => {
  const index = state.visits.findIndex(v => v.id === visit.id);
  if (index !== -1) {
    state.visits.splice(index, 1, visit);
  } else {
    state.visits.push(visit);
  }
};

export const UPDATE_EMERGENCY_VISIT = (state, visit) => {
  const index = state.visits.findIndex(v => v.id === visit.id);
  if (index !== -1) {
    state.visits.splice(index, 1, visit);
  }
};

export const SET_EMERGENCY_TRIAGE_LIST = (state, triageList) => {
  state.triageList = triageList;
};

export const SET_EMERGENCY_TRIAGE = (state, triage) => {
  const index = state.triageList.findIndex(t => t.id === triage.id);
  if (index !== -1) {
    state.triageList.splice(index, 1, triage);
  } else {
    state.triageList.push(triage);
  }
};

export const UPDATE_EMERGENCY_TRIAGE = (state, triage) => {
  const index = state.triageList.findIndex(t => t.id === triage.id);
  if (index !== -1) {
    state.triageList.splice(index, 1, triage);
  }
};

export const SET_EMERGENCY_BEDS = (state, beds) => {
  state.beds = beds;
};

export const SET_EMERGENCY_BED = (state, bed) => {
  const index = state.beds.findIndex(b => b.id === bed.id);
  if (index !== -1) {
    state.beds.splice(index, 1, bed);
  } else {
    state.beds.push(bed);
  }
};

export const UPDATE_EMERGENCY_BED = (state, bed) => {
  const index = state.beds.findIndex(b => b.id === bed.id);
  if (index !== -1) {
    state.beds.splice(index, 1, bed);
  }
};

export const SET_EMERGENCY_PROCEDURES = (state, procedures) => {
  state.procedures = procedures;
};

export const SET_EMERGENCY_PROCEDURE = (state, procedure) => {
  const index = state.procedures.findIndex(p => p.id === procedure.id);
  if (index !== -1) {
    state.procedures.splice(index, 1, procedure);
  } else {
    state.procedures.push(procedure);
  }
};

export const UPDATE_EMERGENCY_PROCEDURE = (state, procedure) => {
  const index = state.procedures.findIndex(p => p.id === procedure.id);
  if (index !== -1) {
    state.procedures.splice(index, 1, procedure);
  }
};

export const SET_EMERGENCY_STATISTICS = (state, statistics) => {
  state.statistics = statistics;
};

export const SET_LOADING = (state, loading) => {
  state.loading = loading;
};

export const SET_ERROR = (state, error) => {
  state.error = error;
};

export const CLEAR_EMERGENCY_DATA = state => {
  state.visits = [];
  state.triageList = [];
  state.beds = [];
  state.procedures = [];
  state.statistics = null;
  state.error = null;
};
