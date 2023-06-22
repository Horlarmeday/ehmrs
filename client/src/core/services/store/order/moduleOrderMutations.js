export default {
  /**************
   LAB ORDERS
   *************/
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
    const test = state.selectedTests.find(({ test_id }) => test_id === testId);
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

  /**************
   RADIOLOGY ORDERS
   *************/
  ORDER_INVESTIGATION_TEST(state, investigations) {
    state.radiology_orders.push(investigations);
  },
  ADD_SELECTED_INVESTIGATION(state, investigation) {
    state.selectedInvestigations.push(investigation);
  },
  REMOVE_SELECTED_INVESTIGATION(state, investigation) {
    const investigationIndex = state.selectedInvestigations.findIndex(
      ({ investigation_id }) => investigation_id === investigation.investigation_id
    );
    state.selectedInvestigations.splice(investigationIndex, 1);
  },
  EMPTY_SELECTED_INVESTIGATION(state, investigations) {
    state.selectedInvestigations = investigations;
  },
  EMPTY_SELECTED_INVESTIGATION_BUTTONS(state) {
    state.selectedInvestigationsButtons.forEach(({ button }) => {
      button.classList.remove('btn-danger');
    });
    state.selectedInvestigationsButtons = [];
  },
  TOGGLE_INVESTIGATION_URGENCY(state, investigationId) {
    const investigation = state.selectedInvestigations.find(
      ({ investigation_id }) => investigation_id === investigationId
    );
    investigation.is_urgent = !investigation.is_urgent;
  },
  ADD_SELECTED_INVESTIGATION_BUTTON(state, button) {
    button.button.classList.add('btn-danger');
    state.selectedInvestigationsButtons.push(button);
  },
  REMOVE_SELECTED_INVESTIGATION_BUTTON(state, buttonId) {
    const buttonIndex = state.selectedInvestigationsButtons.findIndex(
      ({ button_id }) => button_id === buttonId
    );
    const button = state.selectedInvestigationsButtons.find(
      ({ button_id }) => button_id === buttonId
    );
    button.button.classList.remove('btn-danger');
    state.selectedInvestigationsButtons.splice(buttonIndex, 1);
  },
};
