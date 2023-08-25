const departments = [
  {
    id: 1,
    department: 'Records',
  },
  {
    id: 2,
    department: 'Nursing',
  },
  {
    id: 4,
    department: 'Pharmacy',
  },
  {
    id: 5,
    department: 'Laboratory',
  },
  {
    id: 6,
    department: 'Health Insurance',
  },
  {
    id: 7,
    department: 'Store',
  },
  {
    id: 8,
    department: 'Radiography',
  },
  {
    id: 9,
    department: 'Medical Practitioners',
  },
  {
    id: 10,
    department: 'Reception',
  },
  {
    id: 11,
    department: 'Accounting',
  },
  {
    id: 12,
    department: 'Administrator',
  },
];

const roles = [
  {
    id: 1,
    role: 'Medical Records',
    dept_id: 1,
  },
  {
    id: 2,
    role: 'Nurse',
    dept_id: 2,
  },
  {
    id: 3,
    role: 'Pharmacy',
    dept_id: 4,
  },
  {
    id: 4,
    role: 'Laboratory',
    dept_id: 5,
  },
  {
    id: 5,
    role: 'NHIS',
    dept_id: 6,
  },
  {
    id: 6,
    role: 'Pharmacy Store',
    dept_id: 7,
  },
  {
    id: 7,
    role: 'Lab Store',
    dept_id: 7,
  },
  {
    id: 8,
    role: 'Radiology',
    dept_id: 8,
  },
  {
    id: 9,
    role: 'Doctor',
    dept_id: 9,
  },
  {
    id: 10,
    role: 'Theater',
    dept_id: 9,
  },
  {
    id: 11,
    role: 'Customer Care',
    dept_id: 10,
  },
  {
    id: 12,
    role: 'Finance Officer',
    dept_id: 11,
  },
  {
    id: 13,
    role: 'Super Admin',
    dept_id: 12,
  },
  {
    id: 14,
    role: 'Admin',
    dept_id: 12,
  },
];

const sub_roles = [
  {
    id: 1,
    sub: 'Female Ward',
    role_id: 2,
  },
  {
    id: 2,
    sub: 'Male Ward',
    role_id: 2,
  },
  {
    id: 3,
    sub: 'Children Ward',
    role_id: 2,
  },
  {
    id: 4,
    sub: 'Accident & Emergency',
    role_id: 2,
  },
  {
    id: 5,
    sub: 'ICU',
    role_id: 2,
  },
  {
    id: 6,
    sub: 'Maternity',
    role_id: 2,
  },
  {
    id: 7,
    sub: 'G-OPD',
    role_id: 2,
  },
  {
    id: 8,
    sub: 'HOD',
    role_id: 3,
  },
  {
    id: 9,
    sub: 'HOD',
    role_id: 2,
  },
  {
    id: 10,
    sub: 'HOD',
    role_id: 4,
  },
  {
    id: 11,
    sub: 'Consultant',
    role_id: 9,
  },
  {
    id: 12,
    sub: 'Student Doctor',
    role_id: 9,
  },
  {
    id: 13,
    sub: 'General Doctor',
    role_id: 9,
  },
  {
    id: 14,
    sub: 'ANC',
    role_id: 2,
  },
];

function getRolesById(id) {
  return roles.filter(role => role.dept_id === id);
}
function getSubRoleById(id) {
  return sub_roles.filter(sub => sub.role_id === id);
}

export { departments, getRolesById, getSubRoleById, roles, sub_roles };
