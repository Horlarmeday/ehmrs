export type DemoRole = 'Medical Records' | 'Admin' | 'Nurse';

export const startVisitRoles: DemoRole[] = ['Medical Records', 'Admin'];
export const deactivateRoles: DemoRole[] = ['Admin'];

export const navigation: Record<DemoRole, string[]> = {
  'Medical Records': ['Home', 'Patients', 'Worklists', 'Programs'],
  Admin: ['Home', 'Patients', 'Worklists', 'Inpatients', 'Programs', 'Finance', 'Administration'],
  Nurse: ['Home', 'Worklists', 'Inpatients'],
};
