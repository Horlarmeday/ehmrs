export default {
  ORDER_LAB_TEST(state, tests) {
    state.lab_orders.push(tests);
  },
  ADD_SELECTED_TEST(state, test) {
    state.selectedTests.push(test);
  },
  REMOVE_SELECTED_TEST(state, test) {
    const testIndex = state.selectedTests.findIndex(
      ({ test_id }) => test_id === test.test_id
    );
    state.selectedTests.splice(testIndex, 1);
  },
  EMPTY_SELECTED_TEST(state, tests) {
    state.selectedTests = tests;
  }
};
