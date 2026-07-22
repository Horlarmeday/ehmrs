/* eslint-disable camelcase */
import { PrescribedTest, Patient, Sample, Staff, Test, Visit } from '../../../database/models';
import { VisitCategory } from '../../../database/enums';
import { OPD } from '../../../core/constants';

/**
 * Shared fixtures for the order-creation integration tests (lab / pharmacy / radiology / service).
 *
 * Kept in one place because all four suites need the same valid Staff → Patient → Visit chain, and
 * the reason these tests broke in the first place was a `Visit` fixture that predated columns the
 * schema now requires (`category`, `date_visit_start`, `department`, `professional`). A single
 * source of truth means the next schema change breaks one file, not four.
 *
 * These build REAL rows against the test database. Every NOT-NULL column with no default, and
 * every model-level validator, is satisfied here.
 */

let uniqueCounter = 0;

/** A monotonic suffix so parallel-safe unique columns (username, phone, email) never collide. */
function unique(prefix: string): string {
  uniqueCounter += 1;
  return `${prefix}_${Date.now()}_${uniqueCounter}`;
}

/**
 * Removes everything the order fixtures and the endpoints under test create.
 *
 * Ordering the deletes by hand is brittle here: an order endpoint also writes rows this file
 * never named (encounters, test-prescription groupings, …), and each new endpoint tested would
 * add another table to chase. Disabling FK checks for the duration of the teardown — a standard
 * test-DB pattern, safe because the connection is a throwaway test database — deletes the tables
 * this fixture owns without having to know the full downstream graph. `truncate` is used per
 * table so auto-increment ids reset between suites.
 */
const FIXTURE_TABLES = [PrescribedTest, Test, Sample, Visit, Patient, Staff] as const;

export async function cleanUpOrderFixtures(): Promise<void> {
  const sequelize = Staff.sequelize;
  if (!sequelize) {
    throw new Error('Staff model is not attached to a Sequelize instance.');
  }

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const model of FIXTURE_TABLES) {
      await model.destroy({ where: {}, truncate: true, force: true });
    }
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

export async function createTestStaff(): Promise<Staff> {
  return Staff.create({
    firstname: 'Test',
    lastname: 'Doctor',
    middlename: '',
    phone: unique('080'),
    username: unique('doctor'),
    gender: 'Male',
    address: 'Test Address',
    photo: 'photo.jpg',
    password: '123456',
    email: `${unique('doctor')}@example.com`,
    department: 'Medical',
    role: 'Doctor',
    sub_role: 'GP',
    date_of_birth: '1990-01-01',
  } as never);
}

export async function createTestPatient(): Promise<Patient> {
  return Patient.create({
    firstname: 'Test',
    lastname: 'Patient',
    gender: 'Male',
    phone: unique('070'),
    address: 'Test Patient Address',
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Ikeja',
    date_of_birth: '1995-05-05',
  } as never);
}

/**
 * Seeds the minimal lab reference catalogue an order references by FK: sample types and the tests
 * that belong to them. A freshly-loaded schema is empty, so without this a PrescribedTest insert
 * fails a foreign-key constraint (`sample_id -> Test_Samples`, `test_id -> Tests`) — which is the
 * real reason these tests broke against a clean database rather than the populated dev one.
 *
 * Returns the seeded test/sample ids so a test asserts against what it seeded, not against magic
 * numbers.
 */
export async function seedLabCatalogue(
  staffId: number
): Promise<{ sampleIds: number[]; testIds: number[] }> {
  const bloodSample = await Sample.create({ name: 'Blood', staff_id: staffId } as never);
  const urineSample = await Sample.create({ name: 'Urine', staff_id: staffId } as never);

  const test = (name: string, code: string, sample_id: number) =>
    Test.create({
      name,
      code,
      price: '100.00',
      sample_id,
      type: 'Primary',
      result_unit: 'mg/dL',
      valid_range: '0-100',
      staff_id: staffId,
    } as never);

  const t1 = await test('Full Blood Count', 'FBC', bloodSample.id);
  const t2 = await test('Malaria Parasite', 'MP', bloodSample.id);
  const t3 = await test('Urinalysis', 'URIN', urineSample.id);

  return {
    sampleIds: [bloodSample.id, urineSample.id],
    testIds: [t1.id, t2.id, t3.id],
  };
}

/**
 * A Staff, a Patient, and an open Outpatient Visit linking them — the precondition every order
 * endpoint assumes. Returns the ids and an auth token for the requests.
 */
export async function createVisitContext(): Promise<{
  staff: Staff;
  patient: Patient;
  visit: Visit;
  visit_id: number;
  token: string;
}> {
  const staff = await createTestStaff();
  const patient = await createTestPatient();

  const visit = await Visit.create({
    patient_id: patient.id,
    staff_id: staff.id,
    category: VisitCategory.OPD,
    date_visit_start: new Date(),
    department: 'Medical',
    professional: 'Doctor',
    type: OPD,
  } as never);

  const token = await staff.generateAuthToken();

  return { staff, patient, visit, visit_id: visit.id, token };
}
