export default {
  // Department getters
  getDepartments: (state) => state.departments,
  getDepartment: (state) => state.department,
  getDepartmentsTotal: (state) => state.total,
  getDepartmentsPages: (state) => state.pages,

  // Unit getters
  getUnits: (state) => state.units,
  getUnit: (state) => state.unit,
  getUnitsTotal: (state) => state.totalUnit,
  getUnitsPages: (state) => state.unitPages,

  // Ward getters
  getWards: (state) => state.wards,
  getWard: (state) => state.ward,
  getWardsAndBeds: (state) => state.wardsAndBeds,
  getWardsTotal: (state) => state.totalWard,
  getWardsPages: (state) => state.wardPages,

  // Bed getters
  getBeds: (state) => state.beds,
  getBed: (state) => state.bed,

  // Service getters
  getServices: (state) => state.services,
  getServicesTotal: (state) => state.serviceTotal,
  getServicesPages: (state) => state.servicePages,

  // Default getters
  getDefaults: (state) => state.defaults,
  getDefault: (state) => state.default,

  // Encounter getters
  getEncounters: (state) => state.encounters,
  getEncounter: (state) => state.encounter,
  getEncountersTotal: (state) => state.totalEncounters,
  getEncountersPages: (state) => state.encountersPages,
};
