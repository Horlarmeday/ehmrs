import { describe, expect, it } from 'vitest';
import {
  dashboardFor,
  dashboardTiles,
  menuFor,
  reservedDestinations,
  sectionOf,
} from '../navigation';

const labels = (role?: string, subRole?: string) =>
  menuFor(role, subRole).map((entry) => entry.label);

describe('role menu', () => {
  it('places every legacy tile in a section, or marks it reserved', () => {
    const unmapped = Object.values(dashboardTiles)
      .flat()
      .filter((tile) => !sectionOf(tile) && !reservedDestinations.includes(tile));
    expect(unmapped).toEqual([]);
  });

  it('hides the eight planned destinations that have no page yet', () => {
    expect(reservedDestinations).toHaveLength(8);
    for (const tile of reservedDestinations) expect(sectionOf(tile)).toBeNull();
  });

  it('follows the legacy dashboard choice by role and sub-role', () => {
    expect(dashboardFor('Laboratory', 'HOD')).toBe('laboratoryHod');
    expect(dashboardFor('Laboratory')).toBe('laboratory');
    expect(dashboardFor('Pharmacy', 'HOD')).toBe('pharmacyHod');
    expect(dashboardFor('Pharmacy', 'Staff')).toBe('pharmacy');
    expect(dashboardFor('Nurse', 'G-OPD')).toBe('nurseOpd');
    expect(dashboardFor('Nurse', 'Accident & Emergency')).toBe('nurseEmergency');
    expect(dashboardFor('Nurse', 'Unknown')).toBeNull();
    expect(dashboardFor('Urologist')).toBe('specialist');
    expect(dashboardFor('Someone new')).toBe('medicalRecords');
    expect(dashboardFor(undefined)).toBe('medicalRecords');
  });

  it('gives each role Home plus the sections its legacy tiles reach, in menu order', () => {
    expect(labels('Pharmacy')).toEqual(['Home', 'Pharmacy', 'Stock']);
    expect(labels('Pharmacy', 'HOD')).toEqual(['Home', 'Pharmacy', 'Stock']);
    expect(labels('Medical Records')).toEqual(['Home', 'Patients', 'Worklists', 'Programs']);
    expect(labels('General Practitioner')).toEqual(['Home', 'Worklists', 'Inpatients', 'Programs']);
    expect(labels('Laboratory')).toEqual(['Home', 'Laboratory', 'Reports']);
    expect(labels('Nurse', 'G-OPD')).toEqual(['Home', 'Worklists']);
    expect(labels('Nurse', 'Unknown')).toEqual(['Home']);
    expect(labels('Super Admin')).toEqual([
      'Home',
      'Patients',
      'Worklists',
      'Programs',
      'Laboratory',
      'Radiology',
      'Pharmacy',
      'Stock',
      'Insurance',
      'Orders',
      'Reports',
      'Administration',
    ]);
  });

  it('links each section to the role’s first legacy page in it', () => {
    const pharmacy = menuFor('Pharmacy', 'HOD').find((entry) => entry.id === 'stock');
    expect(pharmacy?.to).toBe('/store/pharmacy');
    const ward = menuFor('Nurse', 'Male Ward').find((entry) => entry.id === 'inpatients');
    expect(ward?.to).toBe('/visit/admitted-patients?occupantType=Male');
    expect(menuFor('Admin')[0]).toMatchObject({ id: 'home', to: '/dashboard' });
  });
});
