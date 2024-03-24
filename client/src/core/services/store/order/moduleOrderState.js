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

  /**************
   RADIOLOGY ORDERS
   *************/
  radiology_order: null,
  radiology_orders: [],
  selectedInvestigations: [],
  selectedInvestigationsButtons: [],
  totalInvestigations: null,
  investigationPages: 0,

  /**************
   MEDICATION ORDERS
   *************/
  drug_order: null,
  drug_orders: [],
  drug_prescriptions: [],
  totalDrugsOrders: 0,
  drugsPages: 0,

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

  /**********************
   * TREATMENTS
   *********************/
  treatments: [],
  treatment: null,
  totalTreatments: 0,
  treatmentPages: 0,
};
