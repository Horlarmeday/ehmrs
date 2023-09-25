export default {
  /**
   * GENERIC DRUGS
   */

  ADD_GENERIC_DRUG(state, drug) {
    state.drugs.unshift(drug);
  },

  SET_GENERIC_DRUGS(state, drugs) {
    state.drugs = drugs;
  },

  SET_GENERIC_DRUGS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_GENERIC_DRUG(state, drug) {
    state.drug = drug;
  },

  UPDATE_GENERIC_DRUG(state, drug) {
    const drugIndex = state.drugs.findIndex(p => p.id === drug.id);
    Object.assign(state.drugs[drugIndex], drug);
  },

  /**
   * DOSAGE FORMS
   */
  ADD_DOSAGE_FORM(state, dosage) {
    state.dosageForms.unshift(dosage);
  },

  SET_DOSAGE_FORMS(state, dosageForms) {
    state.dosageForms = dosageForms;
  },

  SET_DOSAGE_FORM(state, dosage) {
    state.dosage = dosage;
  },

  UPDATE_DOSAGE_FORM(state, dosage) {
    const dosageIndex = state.dosageForms.findIndex(p => p.id === dosage.id);
    Object.assign(state.dosageForms[dosageIndex], dosage);
  },

  /**
   * MEASUREMENT
   */
  ADD_MEASUREMENT(state, measurement) {
    state.measurements.unshift(measurement);
  },

  SET_MEASUREMENTS(state, measurements) {
    state.measurements = measurements;
  },

  SET_MEASUREMENT(state, measurement) {
    state.measurement = measurement;
  },

  UPDATE_MEASUREMENT(state, measurement) {
    const measurementIndex = state.measurements.findIndex(
      p => p.id === measurement.id
    );
    Object.assign(state.measurements[measurementIndex], measurement);
  },

  /**
   * ROUTES OF ADMINISTRATION
   */
  ADD_ROUTE(state, route) {
    state.routes.unshift(route);
  },

  SET_ROUTES(state, routes) {
    state.routes = routes;
  },

  SET_ROUTE(state, route) {
    state.route = route;
  },

  UPDATE_ROUTE(state, route) {
    const routeIndex = state.routes.findIndex(p => p.id === route.id);
    Object.assign(state.routes[routeIndex], route);
  },

  /**
   * PRESCRIPTIONS
   */
  SET_PRESCRIPTIONS(state, prescriptions) {
    state.prescriptions = prescriptions;
  },

  SET_PRESCRIPTION(state, prescription) {
    state.prescription = prescription;
  },

  SET_PRESCRIPTIONS_TOTAL(state, total) {
    state.totalPrescription = total;
  },

  SET_PRESCRIPTIONS_PAGES(state, pages) {
    state.prescriptionPages = pages;
  },

  DISPENSE_DRUG(state, prescription) {
    console.log(prescription);
  },
};
