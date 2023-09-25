export default {
  ADD_REQUEST(state, request) {
    state.requests.push(request);
  },

  SET_REQUESTS(state, requests) {
    state.requests = requests;
  },

  SET_REQUESTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_REQUESTS_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_REQUESTS(state, requests) {
    console.log(requests);
  },

  ADD_SELECTED_REQUEST(state, request) {
    state.selectedRequests.push(request);
  },

  REMOVE_SELECTED_REQUEST(state, request) {
    const requestIndex = state.selectedRequests.findIndex(({ id }) => id === request.id);
    state.selectedRequests.splice(requestIndex, 1);
  },

  EMPTY_SELECTED_REQUESTS(state, requests) {
    state.selectedRequests = requests;
  },
};
