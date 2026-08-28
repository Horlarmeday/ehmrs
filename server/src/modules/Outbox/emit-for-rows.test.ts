import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { Insurance } from '../../database/models/insurance';
import { HMO } from '../../database/models/hmo';
import { PatientInsurance } from '../../database/models/patientInsurance';
import { Patient } from '../../database/models/patient';
import { Visit } from '../../database/models/visit';
import { VisitCategory } from '../../database/enums';
import { Drug, DrugForm } from '../../database/models/drug';
import { Test } from '../../database/models/test';
import { Service } from '../../database/models/service';
import { Investigation } from '../../database/models/investigation';
import { Imaging } from '../../database/models/imaging';
import { GeneralServiceType, InvestigationType } from '../../database/enums';
import { createTestStaff, seedLabCatalogue } from '../Orders/__fixtures__/order-fixtures';
import { emitChargeCapturedForRows, normalisePrice } from './outbox-writer';
import { EventBuildError } from './event-builder';

afterAll(async () => {
  await sequelizeConnection.close();
});

describe('normalisePrice', () => {
  it('leaves a DECIMAL string untouched', () => {
    expect(normalisePrice('2500.00')).toBe('2500.00');
  });
  it('converts an integer request number to a 2dp string', () => {
    expect(normalisePrice(200)).toBe('200.00');
  });
  it('converts a 2dp request number exactly', () => {
    expect(normalisePrice(150.5)).toBe('150.50');
  });
  it('REFUSES sub-kobo precision rather than rounding', () => {
    expect(() => normalisePrice(10.005)).toThrow(/sub-kobo/);
  });
});

/**
 * Tests the emit-for-rows path the prescribe endpoints call — the A1.2a wiring — against real
 * MySQL. Rows here stand in for the Sequelize model instances a bulkCreate returns; the helper
 * reads them the same way (plain object or model.get()).
 */

const drugRow = (id: number, total_price = '2500.00') => ({
  id,
  patient_id: 100,
  visit_id: 8891,
  total_price,
  quantity_prescribed: 2,
});

const consumableRow = (id: number) => ({
  id,
  patient_id: 100,
  visit_id: 8891,
  total_price: '150.00',
  quantity_prescribed: 1,
});

describe('emitChargeCapturedForRows (A1.2a wiring)', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;

  afterAll(() => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
  });
  beforeEach(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

  it('emits nothing when the flag is off — the inert default', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'false';
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [drugRow(1), drugRow(2)], '2026-07-22', t);
    await t.commit();

    expect(await OutboxEvent.count()).toBe(0);
  });

  it('emits one event per drug row, with the right keys and money', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [drugRow(10), drugRow(11)], '2026-07-22', t);
    await t.commit();

    const rows = await OutboxEvent.findAll({ order: [['sequence', 'ASC']] });
    expect(rows).toHaveLength(2);
    expect(rows.map(r => r.idempotency_key)).toEqual(['charge:drug:10', 'charge:drug:11']);
    // Same visit -> monotonic sequence.
    expect(rows.map(r => Number(r.sequence))).toEqual([1, 2]);
    const body = rows[0].payload.body as Record<string, unknown>;
    expect(body.amount_kobo).toBe('250000');
    expect(typeof body.amount_kobo).toBe('string');
  });

  it('emits for consumables too — the easy-to-miss billable line', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [drugRow(20)], '2026-07-22', t);
    await emitChargeCapturedForRows('additional_item', [consumableRow(30)], '2026-07-22', t);
    await t.commit();

    const keys = (await OutboxEvent.findAll()).map(r => r.idempotency_key).sort();
    expect(keys).toEqual(['charge:additional_item:30', 'charge:drug:20']);
  });

  it('rolls ALL emitted events back if the transaction fails (atomicity)', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [drugRow(40), drugRow(41)], '2026-07-22', t);
    await t.rollback();

    expect(await OutboxEvent.count()).toBe(0);
  });

  it('rolls the clinical write back if a row has an unparseable price (fail closed)', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const t = await sequelizeConnection.transaction();

    // A NULL/garbage price must not emit a zero-value charge — it must throw and roll back, so
    // the bad data is surfaced rather than silently mis-billed.
    let threw = false;
    try {
      await emitChargeCapturedForRows(
        'drug',
        [{ id: 50, patient_id: 100, visit_id: 8891, total_price: null, quantity_prescribed: 1 }],
        '2026-07-22',
        t
      );
      await t.commit();
    } catch {
      threw = true;
      await t.rollback();
    }

    expect(threw).toBe(true);
    expect(await OutboxEvent.count()).toBe(0);
  });

  it('omits the payer for a cash line (no patient_insurance_id)', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [drugRow(60)], '2026-07-22', t);
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    const body = row.payload.body as Record<string, unknown>;
    expect('payer' in body).toBe(false);
  });
});

/**
 * The payer-derivation path (#114) — reads the line's own patient_insurance_id against real MySQL
 * and attaches the resolved ID-only payer. Seeds an Insurance + PatientInsurance so the resolver
 * has a row to classify.
 */
describe('emitChargeCapturedForRows — payer derivation (#114)', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  let patientId: number;
  let schemeInsuranceId: number;
  let retainerInsuranceId: number;
  let schemeHmoId: number;
  let retainerCompanyHmoId: number;
  let schemePatientInsuranceId: number;
  let retainerPatientInsuranceId: number;

  beforeAll(async () => {
    // The FK chain (Patient_Insurances → Patients / Insurances / HMOs) is real in the test schema,
    // so the parent rows must exist. Seed the minimum: a patient, two insurances, an HMO under each.
    const patient = await Patient.create({
      firstname: 'Test',
      lastname: 'Payer',
      gender: 'Male',
      phone: '08000000000',
      address: 'N/A',
      country: 'Nigeria',
      state: 'Lagos',
      lga: 'Ikeja',
      date_of_birth: new Date('1990-01-01'),
      has_insurance: true,
    } as never);
    patientId = patient.id;

    const scheme = await Insurance.create({ name: 'NHIS' } as never);
    const retainer = await Insurance.create({ name: 'Retainership' } as never);
    schemeInsuranceId = scheme.id;
    retainerInsuranceId = retainer.id;

    const schemeHmo = await HMO.create({
      name: 'Scheme HMO',
      insurance_id: schemeInsuranceId,
    } as never);
    const retainerCompany = await HMO.create({
      name: 'Retainer Co',
      insurance_id: retainerInsuranceId,
    } as never);
    schemeHmoId = schemeHmo.id;
    retainerCompanyHmoId = retainerCompany.id;

    const schemePi = await PatientInsurance.create({
      patient_id: patientId,
      insurance_id: schemeInsuranceId,
      hmo_id: schemeHmoId,
    } as never);
    const retainerPi = await PatientInsurance.create({
      patient_id: patientId,
      insurance_id: retainerInsuranceId,
      hmo_id: retainerCompanyHmoId,
    } as never);
    schemePatientInsuranceId = schemePi.id;
    retainerPatientInsuranceId = retainerPi.id;
  });

  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await Visit.destroy({ where: { patient_id: patientId }, force: true });
    await PatientInsurance.destroy({
      where: { id: [schemePatientInsuranceId, retainerPatientInsuranceId] },
      force: true,
    });
    await HMO.destroy({ where: { id: [schemeHmoId, retainerCompanyHmoId] }, force: true });
    await Insurance.destroy({
      where: { id: [schemeInsuranceId, retainerInsuranceId] },
      force: true,
    });
    await Patient.destroy({ where: { id: patientId }, force: true });
  });

  beforeEach(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

  const insuredDrugRow = (id: number, patient_insurance_id: number, drug_type = 'NHIS') => ({
    id,
    patient_id: patientId,
    visit_id: 8891,
    total_price: '2500.00',
    quantity_prescribed: 1,
    patient_insurance_id,
    drug_type,
  });

  it('emits a scheme_hmo payer for an NHIS line — ids only, no name/enrollee_code', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [insuredDrugRow(70, schemePatientInsuranceId)],
      '2026-07-22',
      t
    );
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    const body = row.payload.body as Record<string, unknown>;
    expect(body.payer).toEqual({
      payer_type: 'scheme_hmo',
      scheme_id: String(schemeInsuranceId),
      hmo_id: String(schemeHmoId),
      patient_insurance_id: String(schemePatientInsuranceId),
    });
    // No demographic value leaked into the payload anywhere.
    const serialised = JSON.stringify(row.payload);
    expect(serialised).not.toContain('NHIS');
    expect(serialised).not.toContain('enrollee');
  });

  it('emits a retainership payer keyed by the company hmo id', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [insuredDrugRow(71, retainerPatientInsuranceId)],
      '2026-07-22',
      t
    );
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    expect((row.payload.body as Record<string, unknown>).payer).toEqual({
      payer_type: 'retainership',
      retainership_id: String(retainerCompanyHmoId),
      patient_insurance_id: String(retainerPatientInsuranceId),
    });
  });

  it('omits the payer when the line is Cash despite an insurance on file', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [insuredDrugRow(72, schemePatientInsuranceId, 'Cash')],
      '2026-07-22',
      t
    );
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    expect('payer' in (row.payload.body as Record<string, unknown>)).toBe(false);
  });

  it('falls back to cash (no payer) when patient_insurance_id resolves to no row', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [insuredDrugRow(73, 9_999_999)], '2026-07-22', t);
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    expect('payer' in (row.payload.body as Record<string, unknown>)).toBe(false);
  });

  it('resolves once for a bulk sharing one patient_insurance_id (all rows get the payer)', async () => {
    const findOneSpy = jest.spyOn(PatientInsurance, 'findOne');
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [
        insuredDrugRow(74, schemePatientInsuranceId),
        insuredDrugRow(75, schemePatientInsuranceId),
        insuredDrugRow(76, schemePatientInsuranceId),
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    const rows = await OutboxEvent.findAll();
    const charges = rows.filter(row => row.event_type === 'charge.captured');
    const demographics = rows.filter(row => row.event_type === 'patient.demographics.changed');

    expect(charges).toHaveLength(3);
    for (const row of charges) {
      expect((row.payload.body as Record<string, unknown>).payer).toMatchObject({
        payer_type: 'scheme_hmo',
      });
    }

    // ONE demographics event for three lines sharing a patient (Accounting #43): the emission is
    // deduped per call, so a 20-line prescription does not produce 20 identical sync events.
    expect(demographics).toHaveLength(1);

    // One lookup for three rows sharing the id — the per-resolver cache.
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    findOneSpy.mockRestore();
  });

  /**
   * THE COLD-CACHE FIX (Accounting #43).
   *
   * Accounting's demographic cache is fed by `patient.demographics.changed`, which fires on
   * CHANGE — so a patient registered before this integration was switched on has never changed,
   * and the cache would be empty exactly when the cashier first needs a name at the counter.
   * Emitting alongside the charge is what guarantees every billable patient is known.
   */
  it('emits demographics alongside a charge, so a never-changed patient is still cached', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [insuredDrugRow(90, schemePatientInsuranceId)],
      '2026-07-22',
      t
    );
    await t.commit();

    const demographics = (await OutboxEvent.findAll()).filter(
      row => row.event_type === 'patient.demographics.changed'
    );
    expect(demographics).toHaveLength(1);

    const event = demographics[0];
    expect(event.aggregate_type).toBe('patient');
    expect(event.aggregate_id).toBe(`patient:${patientId}`);

    const body = event.payload.body as Record<string, unknown>;
    expect(body).toMatchObject({
      patient_id: String(patientId),
      first_name: 'Test',
      last_name: 'Payer',
      date_of_birth: '1990-01-01',
    });

    // Name PARTS, never a composed legal_name — Accounting composes once, on write.
    expect(body.legal_name).toBeUndefined();

    // The COMPLETE insurance set: Accounting hard-deletes anything absent from this array, so a
    // partial list would silently drop the patient's live coverage.
    expect(body.insurances).toHaveLength(2);
  });

  describe('visit metadata emission (#192)', () => {
    it('attaches visit_type and consultation_valid_until for an OPD visit', async () => {
      const visit = await Visit.create({
        patient_id: patientId,
        category: VisitCategory.OPD,
        date_visit_start: new Date('2026-08-04T12:00:00.000Z'),
        department: 'GOPD',
        professional: 'Doctor',
        type: 'New',
      } as never);

      const t = await sequelizeConnection.transaction();
      await emitChargeCapturedForRows(
        'drug',
        [
          {
            id: 95,
            patient_id: patientId,
            visit_id: visit.id,
            total_price: '100.00',
            quantity_prescribed: 1,
          },
        ],
        '2026-08-04',
        t
      );
      await t.commit();

      const events = await OutboxEvent.findAll();
      const charge = events.find(row => row.event_type === 'charge.captured');
      expect(charge).toBeDefined();
      const body = charge!.payload.body as Record<string, unknown>;
      expect(body.visit_type).toBe('Outpatient');
      expect(body.consultation_valid_until).toBe('2026-08-09T12:00:00.000Z'); // start + 5 days
    });

    it('attaches visit_type and omits consultation_valid_until for an ongoing IPD visit', async () => {
      const visit = await Visit.create({
        patient_id: patientId,
        category: VisitCategory.IPD,
        date_visit_start: new Date('2026-08-04T12:00:00.000Z'),
        department: 'Ward A',
        professional: 'Doctor',
        type: 'Admission',
      } as never);

      const t = await sequelizeConnection.transaction();
      await emitChargeCapturedForRows(
        'drug',
        [
          {
            id: 96,
            patient_id: patientId,
            visit_id: visit.id,
            total_price: '100.00',
            quantity_prescribed: 1,
          },
        ],
        '2026-08-04',
        t
      );
      await t.commit();

      const events = await OutboxEvent.findAll();
      const charge = events.find(
        row => row.event_type === 'charge.captured' && row.idempotency_key === 'charge:drug:96'
      );
      expect(charge).toBeDefined();
      const body = charge!.payload.body as Record<string, unknown>;
      expect(body.visit_type).toBe('Inpatient');
      expect('consultation_valid_until' in body).toBe(false);
    });

    it('attaches visit_type and consultation_valid_until (as date_visit_ended) for a closed IPD visit', async () => {
      const visit = await Visit.create({
        patient_id: patientId,
        category: VisitCategory.IPD,
        date_visit_start: new Date('2026-08-04T12:00:00.000Z'),
        date_visit_ended: new Date('2026-08-05T15:00:00.000Z'),
        department: 'Ward A',
        professional: 'Doctor',
        type: 'Admission',
      } as never);

      const t = await sequelizeConnection.transaction();
      await emitChargeCapturedForRows(
        'drug',
        [
          {
            id: 97,
            patient_id: patientId,
            visit_id: visit.id,
            total_price: '100.00',
            quantity_prescribed: 1,
          },
        ],
        '2026-08-04',
        t
      );
      await t.commit();

      const events = await OutboxEvent.findAll();
      const charge = events.find(
        row => row.event_type === 'charge.captured' && row.idempotency_key === 'charge:drug:97'
      );
      expect(charge).toBeDefined();
      const body = charge!.payload.body as Record<string, unknown>;
      expect(body.visit_type).toBe('Inpatient');
      expect(body.consultation_valid_until).toBe('2026-08-05T15:00:00.000Z');
    });
  });
});

describe('emitChargeCapturedForRows — item_code derivation (#255)', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  let staffId: number;
  let drugId: number;
  let paddedDrugId: number;
  let longCodeDrugId: number;
  let testId: number;
  let serviceId: number;
  let investigationId: number;

  beforeAll(async () => {
    const staff = await createTestStaff();
    staffId = staff.id;

    const drug = await Drug.create({
      name: 'Paracetamol 500mg',
      code: 'PARA500',
      type: DrugForm.DRUG,
      staff_id: staffId,
    } as never);
    drugId = drug.id;

    const paddedDrug = await Drug.create({
      name: 'Trimmed Drug',
      code: ' PARA500 ',
      type: DrugForm.DRUG,
      staff_id: staffId,
    } as never);
    paddedDrugId = paddedDrug.id;

    const longCodeDrug = await Drug.create({
      name: 'Long Code Drug',
      code: 'C'.repeat(44),
      type: DrugForm.DRUG,
      staff_id: staffId,
    } as never);
    longCodeDrugId = longCodeDrug.id;

    const { testIds } = await seedLabCatalogue(staffId);
    testId = testIds[0];

    const service = await Service.create({
      name: 'Consultation Fee',
      code: 'CONSULT',
      price: '500.00',
      type: GeneralServiceType.PRIMARY,
      staff_id: staffId,
    } as never);
    serviceId = service.id;

    const imaging = await Imaging.create({ name: 'X-Ray', staff_id: staffId } as never);
    const investigation = await Investigation.create({
      name: 'Chest X-Ray',
      price: '2500.00',
      type: InvestigationType.PRIMARY,
      imaging_id: imaging.id,
      staff_id: staffId,
    } as never);
    investigationId = investigation.id;
  });

  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
  });

  beforeEach(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

  const baseRow = (id: number, extra: Record<string, unknown> = {}) => ({
    id,
    patient_id: 100,
    visit_id: 8891,
    total_price: '2500.00',
    quantity_prescribed: 1,
    ...extra,
  });

  it('emits item_code from the drug catalogue code', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [baseRow(200, { drug_id: drugId })], '2026-07-22', t);
    await t.commit();

    const [row] = await OutboxEvent.findAll();
    const body = row.payload.body as Record<string, unknown>;
    expect(body.item_code).toBe('PARA500');
    expect(body.service_line).toBe('Paracetamol 500mg');
  });

  it('item_code is the catalogue code not the drug name', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [baseRow(201, { drug_id: drugId })], '2026-07-22', t);
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect(body.item_code).toBe('PARA500');
    expect(body.item_code).not.toBe(body.service_line);
  });

  it('trims whitespace from catalogue code before emit', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [baseRow(202, { drug_id: paddedDrugId })],
      '2026-07-22',
      t
    );
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect(body.item_code).toBe('PARA500');
  });

  it('emits item_code from the test catalogue code', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'test',
      [
        {
          id: 203,
          patient_id: 100,
          visit_id: 8891,
          price: '100.00',
          quantity: 1,
          test_id: testId,
        },
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect(body.item_code).toBe('FBC');
  });

  it('emits item_code from the service catalogue code', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'service',
      [
        {
          id: 204,
          patient_id: 100,
          visit_id: 8891,
          price: '500.00',
          quantity: 1,
          service_id: serviceId,
        },
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect(body.item_code).toBe('CONSULT');
  });

  it('omits item_code for investigation lines', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'investigation',
      [
        {
          id: 205,
          patient_id: 100,
          visit_id: 8891,
          price: '2500.00',
          quantity: 1,
          investigation_id: investigationId,
        },
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect('item_code' in body).toBe(false);
    expect(body.service_line).toBe('Chest X-Ray');
  });

  it('omits item_code when drug_id is missing', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows('drug', [baseRow(206)], '2026-07-22', t);
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect('item_code' in body).toBe(false);
  });

  it('omits item_code when the catalogue row has no code', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'investigation',
      [
        {
          id: 207,
          patient_id: 100,
          visit_id: 8891,
          price: '2500.00',
          quantity: 1,
          investigation_id: investigationId,
        },
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    const body = (await OutboxEvent.findAll())[0].payload.body as Record<string, unknown>;
    expect('item_code' in body).toBe(false);
  });

  it('resolves catalogue once for a bulk sharing one drug_id', async () => {
    const findOneSpy = jest.spyOn(Drug, 'findOne');
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [
        baseRow(208, { drug_id: drugId }),
        baseRow(209, { drug_id: drugId }),
        baseRow(210, { drug_id: drugId }),
      ],
      '2026-07-22',
      t
    );
    await t.commit();

    expect(findOneSpy).toHaveBeenCalledTimes(1);
    findOneSpy.mockRestore();

    const rows = await OutboxEvent.findAll();
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect((row.payload.body as Record<string, unknown>).item_code).toBe('PARA500');
    }
  });

  it('rolls the clinical write back when the catalogue code exceeds 43 characters', async () => {
    const t = await sequelizeConnection.transaction();
    let threw = false;
    try {
      await emitChargeCapturedForRows(
        'drug',
        [baseRow(211, { drug_id: longCodeDrugId })],
        '2026-07-22',
        t
      );
      await t.commit();
    } catch (error) {
      threw = true;
      expect(error).toBeInstanceOf(EventBuildError);
      await t.rollback();
    }

    expect(threw).toBe(true);
    expect(await OutboxEvent.count()).toBe(0);
  });
});
