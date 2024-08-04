export default {
  /**************
   LAB ORDERS
   *************/
  ORDER_LAB_TEST(state, tests) {
    state.lab_orders.push(...tests);
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

  SET_TESTS_ORDERS(state, drugs) {
    state.lab_orders = drugs;
  },

  SET_TESTS_ORDERS_TOTAL(state, total) {
    state.total = total;
  },

  SET_TESTS_ORDERS_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_TEST_ORDER(state, test) {
    const testIndex = state.lab_orders.findIndex(p => p.id === test.id);
    Object.assign(state.lab_orders[testIndex], test);
  },

  DELETE_TEST_ORDER(state, test) {
    const testIndex = state.lab_orders.findIndex(({ id }) => id === test.testId);
    state.lab_orders.splice(testIndex, 1);
  },

  /**************
   RADIOLOGY ORDERS
   *************/
  ORDER_INVESTIGATION_TEST(state, investigations) {
    state.radiology_orders.push(...investigations);
  },

  SET_INVESTIGATIONS_ORDERS(state, investigations) {
    state.radiology_orders = investigations;
  },

  SET_INVESTIGATIONS_ORDERS_TOTAL(state, total) {
    state.totalInvestigations = total;
  },

  SET_INVESTIGATIONS_ORDERS_PAGES(state, pages) {
    state.investigationPages = pages;
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

  UPDATE_INVESTIGATION_ORDER(state, investigation) {
    const investigationIndex = state.radiology_orders.findIndex(p => p.id === investigation.id);
    Object.assign(state.radiology_orders[investigationIndex], investigation);
  },

  DELETE_INVESTIGATION_ORDER(state, investigation) {
    const investigationIndex = state.radiology_orders.findIndex(
      ({ id }) => id === investigation.investigationId
    );
    state.radiology_orders.splice(investigationIndex, 1);
  },

  /**************
   DRUG ORDERS
   *************/
  ORDER_DRUG(state, drug) {
    state.drug_order = drug;
  },

  SET_DRUG_ORDERS(state, drugs) {
    state.drug_orders = drugs;
  },

  SET_DRUG_TEMP_PRESCRIPTION(state, drug) {
    state.drug_prescriptions.push(drug);
  },

  DELETE_DRUG_TEMP_PRESCRIPTION(state, drugId) {
    const drugIndex = state.drug_prescriptions.findIndex(({ id }) => id === drugId);
    state.drug_prescriptions.splice(drugIndex, 1);
  },

  UPDATE_DRUG_TEMP_PRESCRIPTION(state, drug) {
    const drugIndex = state.drug_prescriptions.findIndex(p => p.id === drug.id);
    Object.assign(state.drug_prescriptions[drugIndex], drug);
  },

  EMPTY_DRUG_TEMP_PRESCRIPTION(state, payload) {
    state.drug_prescriptions = payload;
  },

  SET_DRUGS_ORDERS_TOTAL(state, total) {
    state.totalDrugsOrders = total;
  },

  SET_DRUGS_ORDERS_PAGES(state, pages) {
    state.drugsPages = pages;
  },

  ORDER_ADD_ITEMS(state, items) {
    state.additional_item = items;
  },

  SET_ADD_ITEMS_ORDERS(state, items) {
    state.additional_items_orders = items;
  },

  UPDATE_ADD_ITEM_ORDER(state, drug) {
    const drugIndex = state.additional_items_orders.findIndex(p => p.id === drug.id);
    Object.assign(state.additional_items_orders[drugIndex], drug);
  },

  SET_ADD_ITEMS_ORDERS_TOTAL(state, total) {
    state.totalAdditionalItemsOrders = total;
  },

  SET_ADD_ITEMS_ORDERS_PAGES(state, pages) {
    state.additionalItemsOrdersPages = pages;
  },

  UPDATE_DRUG_ORDER(state, drug) {
    const drugIndex = state.drug_orders.findIndex(p => p.id === drug.id);
    Object.assign(state.drug_orders[drugIndex], drug);
  },

  DELETE_DRUG_ORDER(state, drug) {
    const drugIndex = state.drug_orders.findIndex(({ id }) => id === drug.drugId);
    state.drug_orders.splice(drugIndex, 1);
  },

  DELETE_ITEM_ORDER(state, item) {
    const itemIndex = state.additional_items_orders.findIndex(({ id }) => id === item.itemId);
    state.additional_items_orders.splice(itemIndex, 1);
  },

  SET_PRESCRIBED_DRUGS(state, drugs) {
    state.drugOrders = drugs;
  },

  SET_PRESCRIBED_ADDITIONAL_ITEMS(state, items) {
    state.additionalItemOrders = items;
  },

  // eslint-disable-next-line no-unused-vars
  UPDATE_PRESCRIBED_ADDITIONAL_ITEMS(state, items) {},
  // eslint-disable-next-line no-unused-vars
  UPDATE_PRESCRIBED_DRUGS(state, drugs) {},

  /*********************
   * ADDITIONAL SERVICES
   **********************/
  ORDER_ADD_SERVICE(state, services) {
    state.service_orders.push(services);
  },

  ADD_SELECTED_SERVICE(state, service) {
    state.selectedServices.push(service);
  },

  SET_SERVICES_ORDERS(state, services) {
    state.service_orders = services;
  },

  SET_SERVICES_ORDERS_TOTAL(state, total) {
    state.totalServices = total;
  },

  SET_SERVICES_ORDERS_PAGES(state, pages) {
    state.servicePages = pages;
  },

  REMOVE_SELECTED_SERVICE(state, service) {
    const serviceIndex = state.selectedServices.findIndex(
      ({ service_id }) => service_id === service.service_id
    );
    state.selectedServices.splice(serviceIndex, 1);
  },

  EMPTY_SELECTED_SERVICE(state, services) {
    state.selectedServices = services;
  },

  EMPTY_SELECTED_SERVICE_BUTTONS(state) {
    state.selectedServicesButtons.forEach(({ button }) => {
      button.classList.remove('btn-danger');
    });
    state.selectedServicesButtons = [];
  },

  TOGGLE_SERVICE_URGENT(state, serviceId) {
    const service = state.selectedServices.find(({ service_id }) => service_id === serviceId);
    service.is_urgent = !service.is_urgent;
  },

  ADD_SELECTED_SERVICE_BUTTON(state, button) {
    button.button.classList.add('btn-danger');
    state.selectedServicesButtons.push(button);
  },

  REMOVE_SELECTED_SERVICE_BUTTON(state, buttonId) {
    const buttonIndex = state.selectedServicesButtons.findIndex(
      ({ button_id }) => button_id === buttonId
    );
    const button = state.selectedServicesButtons.find(({ button_id }) => button_id === buttonId);
    button.button.classList.remove('btn-danger');
    state.selectedServicesButtons.splice(buttonIndex, 1);
  },

  UPDATE_SERVICE_ORDER(state, service) {
    const serviceIndex = state.service_orders.findIndex(p => p.id === service.id);
    Object.assign(state.service_orders[serviceIndex], service);
  },

  DELETE_SERVICE_ORDER(state, service) {
    const serviceIndex = state.service_orders.findIndex(({ id }) => id === service.serviceId);
    state.service_orders.splice(serviceIndex, 1);
  },

  /**************
    TREATMENTS
   *************/
  ORDER_TREATMENT(state, treatments) {
    console.log(treatments);
  },

  SET_TREATMENTS(state, treatments) {
    state.treatments = treatments;
  },

  SET_TREATMENTS_TOTAL(state, total) {
    state.totalTreatments = total;
  },

  SET_TREATMENTS_PAGES(state, total) {
    state.treatmentPages = total;
  },

  /**************
   ADDITIONAL TREATMENTS
   *************/
  ADD_ADDITIONAL_TREATMENT(state, treatments) {
    console.log(treatments);
  },

  SET_ADDITIONAL_TREATMENTS(state, treatments) {
    state.additionalTreatments = treatments;
  },

  SET_ADDITIONAL_TREATMENTS_TOTAL(state, total) {
    state.totalAdditionalTreatments = total;
  },

  SET_ADDITIONAL_TREATMENTS_PAGES(state, total) {
    state.additionalTreatmentsPages = total;
  },
};
