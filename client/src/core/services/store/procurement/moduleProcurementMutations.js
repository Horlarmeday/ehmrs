export const SET_PROCUREMENT_ORDERS = (state, orders) => {
  state.orders = orders;
};

export const SET_PROCUREMENT_ORDER = (state, order) => {
  const index = state.orders.findIndex(o => o.id === order.id);
  if (index !== -1) {
    state.orders.splice(index, 1, order);
  } else {
    state.orders.push(order);
  }
};

export const UPDATE_PROCUREMENT_ORDER = (state, order) => {
  const index = state.orders.findIndex(o => o.id === order.id);
  if (index !== -1) {
    state.orders.splice(index, 1, order);
  }
};

export const SET_LOADING = (state, loading) => {
  state.loading = loading;
};

export const SET_ERROR = (state, error) => {
  state.error = error;
};

export const CLEAR_PROCUREMENT_DATA = state => {
  state.orders = [];
  state.error = null;
};
