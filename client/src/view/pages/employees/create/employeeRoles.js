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
    department: 'Radiology',
  },
  {
    id: 9,
    department: 'Medical Practitioners',
  },
  // {
  //   id: 10,
  //   department: 'Reception',
  // },
  {
    id: 11,
    department: 'Accounts',
  },
  {
    id: 12,
    department: 'Administration',
  },
  {
    id: 13,
    department: 'Surgery Unit',
  },
  {
    id: 14,
    department: 'Medicine Unit',
  },
  {
    id: 15,
    department: 'Pediatrics Unit',
  },
  {
    id: 16,
    department: 'Obstetrics & Gynaecology Unit',
  },
  {
    id: 17,
    department: 'Family Medicine Unit',
  },
  {
    id: 18,
    department: 'Physiotherapy Unit',
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
    role: 'Laboratory Technician',
    dept_id: 5,
  },
  {
    id: 5,
    role: 'Health Insurance',
    dept_id: 6,
  },
  {
    id: 6,
    role: 'Pharmacy Store',
    dept_id: 7,
  },
  {
    id: 7,
    role: 'Procurement Officer',
    dept_id: 7,
  },
  {
    id: 8,
    role: 'Radiology',
    dept_id: 8,
  },
  {
    id: 9,
    role: 'General Practitioner',
    dept_id: 9,
  },
  // {
  //   id: 10,
  //   role: 'Theater',
  //   dept_id: 9,
  // },
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
  {
    id: 15,
    role: 'Gynecology Oncologist',
    dept_id: 16,
  },
  // {
  //   id: 16,
  //   role: 'Pediatrician',
  //   dept_id: 9,
  // },
  {
    id: 17,
    role: 'Oncologist',
    dept_id: 14,
  },
  {
    id: 18,
    role: 'Cardiologist',
    dept_id: 14,
  },
  {
    id: 19,
    role: 'Ophthalmologist',
    dept_id: 13,
  },
  {
    id: 20,
    role: 'Neurologist',
    dept_id: 13,
  },
  {
    id: 21,
    role: 'Dermatologist',
    dept_id: 14,
  },
  {
    id: 22,
    role: 'Psychiatrist',
    dept_id: 14,
  },
  {
    id: 23,
    role: 'Orthopaedist',
    dept_id: 13,
  },
  {
    id: 24,
    role: 'Urologist',
    dept_id: 13,
  },
  {
    id: 25,
    role: 'Endocrinologist',
    dept_id: 14,
  },
  {
    id: 26,
    role: 'Gastroenterologist',
    dept_id: 14,
  },
  // {
  //   id: 27,
  //   role: 'Optician',
  //   dept_id: 9,
  // },
  // {
  //   id: 28,
  //   role: 'Physiotherapist',
  //   dept_id: 9,
  // },
  {
    id: 29,
    role: 'Plastic Surgeon',
    dept_id: 13,
  },
  {
    id: 30,
    role: 'Ear, Nose and Throat (ENT) Specialist',
    dept_id: 13,
  },
  {
    id: 31,
    role: 'Dental Surgeon',
    dept_id: 13,
  },
  {
    id: 32,
    role: 'Radiologist',
    dept_id: 13,
  },
  {
    id: 33,
    role: 'Paediatrics Surgeon',
    dept_id: 13,
  },
  {
    id: 34,
    role: 'Anesthesiologist',
    dept_id: 13,
  },
  {
    id: 35,
    role: 'Infectious Disease Specialist',
    dept_id: 14,
  },
  {
    id: 36,
    role: 'General Medicine',
    dept_id: 14,
  },
  {
    id: 37,
    role: 'Rheumatologist',
    dept_id: 14,
  },
  {
    id: 38,
    role: 'Pediatric Cardiologist',
    dept_id: 15,
  },
  {
    id: 39,
    role: 'Endocrinologist',
    dept_id: 15,
  },
  {
    id: 40,
    role: 'Infectious Disease',
    dept_id: 15,
  },
  {
    id: 41,
    role: 'Dermatologist',
    dept_id: 15,
  },
  {
    id: 42,
    role: 'Adolescents medicine',
    dept_id: 15,
  },
  {
    id: 43,
    role: 'Gastroenterologist',
    dept_id: 15,
  },
  {
    id: 44,
    role: 'Emergency',
    dept_id: 15,
  },
  {
    id: 45,
    role: 'Nephrologist',
    dept_id: 15,
  },
  {
    id: 46,
    role: 'Infertility',
    dept_id: 16,
  },
  {
    id: 47,
    role: 'Obstetrics Endocrinologist',
    dept_id: 16,
  },
  {
    id: 48,
    role: 'Maternal-Fetal Medicine',
    dept_id: 16,
  },
  {
    id: 49,
    role: 'Geriatrics',
    dept_id: 17,
  },
  {
    id: 50,
    role: 'Lifestyle Medicine',
    dept_id: 17,
  },
  {
    id: 51,
    role: 'Adolescent Health',
    dept_id: 17,
  },
  {
    id: 52,
    role: 'Hospices and Palliative Care',
    dept_id: 17,
  },
  {
    id: 53,
    role: 'Sports Medicine',
    dept_id: 17,
  },
  {
    id: 54,
    role: 'Laboratory Scientist',
    dept_id: 5,
  },
  // {
  //   id: 55,
  //   role: 'Laboratory Manager',
  //   dept_id: 5,
  // },
  {
    id: 56,
    role: 'Laboratory Admin',
    dept_id: 5,
  },
  {
    id: 57,
    role: 'Radiology Admin',
    dept_id: 8,
  },
  {
    id: 58,
    role: 'Pharmacy Admin',
    dept_id: 4,
  },
  {
    id: 59,
    role: 'Physiotherapist',
    dept_id: 18,
  },
  {
    id: 60,
    role: 'General Store',
    dept_id: 7,
  },
  {
    id: 61,
    role: 'Nephrologist',
    dept_id: 9,
  },
  {
    id: 62,
    role: 'Store Admin',
    dept_id: 7,
  },
  {
    id: 63,
    role: 'Nursing Assistant',
    dept_id: 2,
  },
  {
    id: 64,
    role: 'Finance Admin',
    dept_id: 11,
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
  {
    id: 15,
    sub: 'Theater',
    role_id: 2,
  },
  {
    id: 16,
    sub: 'VIP/Private',
    role_id: 2,
  },
  {
    id: 17,
    sub: 'HOD',
    role_id: 6,
  },
  {
    id: 18,
    sub: 'Assistant',
    role_id: 6,
  },
  {
    id: 19,
    sub: 'Senior Physiotherapist,',
    role_id: 59,
  },
  {
    id: 20,
    sub: 'Principal Physiotherapist,',
    role_id: 59,
  },
  {
    id: 21,
    sub: 'Chief Physiotherapist,',
    role_id: 59,
  },
  {
    id: 22,
    sub: 'Ass. Director',
    role_id: 59,
  },
  {
    id: 23,
    sub: 'Deputy Director',
    role_id: 59,
  },
  {
    id: 24,
    sub: 'Director',
    role_id: 59,
  },
  {
    id: 25,
    sub: 'Dialysis',
    role_id: 2,
  },
];

function getRolesById(id) {
  return roles.filter((role) => role.dept_id === id);
}
function getSubRoleById(id) {
  return sub_roles.filter((sub) => sub.role_id === id);
}

export { departments, getRolesById, getSubRoleById, roles, sub_roles };
