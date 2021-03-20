export default {
  ADD_EMPLOYEE(state, employee) {
    state.employees.push(employee);
  },

  SET_EMPLOYEES(state, employees) {
    state.employees = employees;
  },

  SET_EMPLOYEES_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_EMPLOYEE(state, employee) {
    state.employee = employee;
  },

  UPDATE_EMPLOYEE(state, employee) {
    const employeeIndex = state.employees.findIndex(s => s.id === employee.id);
    Object.assign(state.employees[employeeIndex], employee);
  }
};
