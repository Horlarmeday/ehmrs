export default {
  ADD_DEPARTMENT(state, department) {
    state.departments.unshift(department);
  },

  SET_DEPARTMENTS(state, departments) {
    state.departments = departments;
  },

  SET_DEPARTMENTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_DEPARTMENT(state, department) {
    const departmentIndex = state.departments.findIndex(
      p => p.id === department.id
    );
    Object.assign(state.departments[departmentIndex], department);
  },

  /**
   * UNIT
   */

  ADD_UNIT(state, unit) {
    state.units.unshift(unit);
  },

  SET_UNITS(state, units) {
    state.units = units;
  },

  SET_UNITS_TOTAL(state, total) {
    state.totalUnit = total;
  },

  SET_UNIT_NUMB_PAGES(state, pages) {
    state.unitPages = pages;
  },

  UPDATE_UNIT(state, unit) {
    const unitIndex = state.units.findIndex(d => d.id === unit.id);
    Object.assign(state.units[unitIndex], unit);
  },

  /**
   * WARD
   */

  ADD_WARD(state, ward) {
    state.wards.unshift(ward);
  },

  SET_WARDS(state, wards) {
    state.wards = wards;
  },

  SET_WARDS_TOTAL(state, total) {
    state.totalWard = total;
  },

  SET_WARD_NUMB_PAGES(state, pages) {
    state.wardPages = pages;
  },

  UPDATE_WARD(state, ward) {
    const wardIndex = state.wards.findIndex(d => d.id === ward.id);
    Object.assign(state.wards[wardIndex], ward);
  },

  /**
   * BED
   */

  ADD_BED(state, bed) {
    state.beds.unshift(bed);
  },

  SET_BEDS(state, beds) {
    state.beds = beds;
  },

  UPDATE_BED(state, bed) {
    const bedIndex = state.beds.findIndex(d => d.id === bed.id);
    Object.assign(state.beds[bedIndex], bed);
  }
};
