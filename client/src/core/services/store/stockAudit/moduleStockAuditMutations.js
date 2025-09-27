export const SET_STOCK_AUDITS = (state, audits) => {
  state.audits = audits;
};

export const SET_STOCK_AUDIT = (state, audit) => {
  const index = state.audits.findIndex((a) => a.id === audit.id);
  if (index !== -1) {
    state.audits.splice(index, 1, audit);
  } else {
    state.audits.push(audit);
  }
};

export const UPDATE_STOCK_AUDIT = (state, audit) => {
  const index = state.audits.findIndex((a) => a.id === audit.id);
  if (index !== -1) {
    state.audits.splice(index, 1, audit);
  }
};

export const SET_LOADING = (state, loading) => {
  state.loading = loading;
};

export const SET_ERROR = (state, error) => {
  state.error = error;
};

export const CLEAR_STOCK_AUDIT_DATA = (state) => {
  state.audits = [];
  state.error = null;
};
