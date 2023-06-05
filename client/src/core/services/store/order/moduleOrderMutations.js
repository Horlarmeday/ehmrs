export default {
  ORDER_LAB_TEST(state, tests) {
    state.lab_orders.push(tests);
  },
  ADD_SELECTED_TEST(state, test) {
    state.selectedTests.push(test);
  },
  REMOVE_SELECTED_TEST(state, test) {
    const testIndex = state.selectedTests.findIndex(({ test_id }) => test_id === test.test_id);
    state.selectedTests.splice(testIndex, 1);
  },
  EMPTY_SELECTED_TEST(state, tests) {
    state.selectedTests = tests;
  },
  EMPTY_SELECTED_BUTTONS(state) {
    state.selectedButtons.forEach(({ button }) => {
      button.classList.remove('btn-danger');
    });
    state.selectedButtons = [];
  },
  TOGGLE_TEST_URGENT(state, testId) {
    const test = state.selectedTests.find(({ test_id }) => test_id === testId)
    test.is_urgent = !test.is_urgent;
  },
  ADD_SELECTED_BUTTON(state, button) {
    button.button.classList.add('btn-danger');
    state.selectedButtons.push(button);
  },
  REMOVE_SELECTED_BUTTON(state, buttonId) {
    const buttonIndex = state.selectedButtons.findIndex(({ button_id }) => button_id === buttonId);
    const button = state.selectedButtons.find(({ button_id }) => button_id === buttonId);
    button.button.classList.remove('btn-danger');
    state.selectedButtons.splice(buttonIndex, 1);
  },
};
