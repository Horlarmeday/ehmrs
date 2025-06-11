/**************
    LAB ORDERS
 *************/

export default {
  /**************
   LAB ORDERS
   *************/
  lab_order: null,
  lab_orders: [],
  selectedTests: [],
  selectedButtons: [],
  total: null,
  pages: 0,
  testOrders: [],

  /**************
   RADIOLOGY ORDERS
   *************/
  radiology_order: null,
  radiology_orders: [],
  selectedInvestigations: [],
  selectedInvestigationsButtons: [],
  totalInvestigations: null,
  investigationPages: 0,
  investigationOrders: [],

  /**************
   MEDICATION ORDERS
   *************/
  drug_order: null,
  drug_orders: [],
  drug_prescriptions: [],
  totalDrugsOrders: 0,
  drugsPages: 0,
  drugOrders: [],
  additionalItemOrders: [],

  additional_item: null,
  additional_items_orders: [],
  totalAdditionalItemsOrders: 0,
  additionalItemsOrdersPages: 0,

  /**********************
   * ADDITIONAL SERVICES
   *********************/
  service_order: null,
  service_orders: [],
  selectedServices: [],
  selectedServicesButtons: [],
  totalServices: null,
  servicePages: 0,
  serviceOrders: [],

  /**********************
   * TREATMENTS
   *********************/
  treatments: [],
  treatment: null,
  totalTreatments: 0,
  treatmentPages: 0,

  /**********************
   * ADDITIONAL TREATMENTS
   *********************/
  additionalTreatments: [],
  additionalTreatment: null,
  totalAdditionalTreatments: 0,
  additionalTreatmentsPages: 0,
};
