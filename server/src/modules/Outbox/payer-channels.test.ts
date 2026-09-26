import '../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { InboxEvent } from '../../database/models/inboxEvent';
import { Insurance } from '../../database/models/insurance';
import { HMO } from '../../database/models/hmo';
import { Vendor } from '../../database/models/vendor';
import { Drug, DrugForm } from '../../database/models/drug';
import { Imaging } from '../../database/models/imaging';
import { Investigation } from '../../database/models/investigation';
import { Service } from '../../database/models/service';
import { Sample } from '../../database/models/sample';
import { Test } from '../../database/models/test';
import { GeneralServiceType, InvestigationType } from '../../database/enums';
import { createTestStaff } from '../Orders/__fixtures__/order-fixtures';
import {
  createInsurance,
  createHMO,
  updateInsurance,
  updateHMO,
} from '../Insurance/insurance.repository';
import { applyInstruction } from '../Inbox/applier';
import { processOne } from '../Inbox/processor';
import { classifyPayer } from './payer-classification';
import { emitInsuranceChanged } from './outbox-writer';

/**
 * The #82 payer-name channels and catalogue full sends, against real MySQL: the emitted event per
 * write-path, the classifyPayer agreement, and the full-send + redelivery behaviour of the reverse
 * `catalogue.requested` / `payer.requested` remedies.
 */

let staffId: number;
let schemeInsuranceId: number;
let retainerInsuranceId: number;
let schemeHmoId: number;
let retainerHmoId: number;
let vendorId: number;
let investigationId: number;

const ORIGINAL_FLAG = process.env.EMR_OUTBOX_ENABLED;

async function bodyOf(eventType: string): Promise<Record<string, unknown>> {
  const row = await OutboxEvent.findOne({ where: { event_type: eventType } });
  if (!row) {
    throw new Error(`no ${eventType} event in the outbox`);
  }
  return row.payload.body as Record<string, unknown>;
}

beforeAll(async () => {
  process.env.EMR_OUTBOX_ENABLED = 'true';

  const staff = await createTestStaff();
  staffId = staff.id;

  const scheme = await Insurance.create({ name: 'NHIS', staff_id: staffId } as never);
  schemeInsuranceId = scheme.id;
  const retainer = await Insurance.create({ name: 'Retainership', staff_id: staffId } as never);
  retainerInsuranceId = retainer.id;

  const schemeHmo = await HMO.create({
    name: 'Scheme HMO',
    hmo_num: 'SH-001',
    insurance_id: schemeInsuranceId,
    staff_id: staffId,
  } as never);
  schemeHmoId = schemeHmo.id;
  const retainerHmo = await HMO.create({
    name: 'Retainer Co',
    hmo_num: 'RC-002',
    insurance_id: retainerInsuranceId,
    staff_id: staffId,
  } as never);
  retainerHmoId = retainerHmo.id;

  const vendor = await Vendor.create({ name: 'Channel Pharma Ltd', staff_id: staffId } as never);
  vendorId = vendor.id;

  await Drug.create({
    name: 'Channel Amoxicillin',
    code: 'CHAN-AMOX',
    type: DrugForm.DRUG,
    staff_id: staffId,
  } as never);

  await Service.create({
    name: 'Channel Service',
    code: 'CHAN-SVC',
    price: '500.00',
    type: GeneralServiceType.PRIMARY,
    staff_id: staffId,
  } as never);

  const imaging = await Imaging.create({ name: 'Channel Imaging', staff_id: staffId } as never);
  const investigation = await Investigation.create({
    name: 'Channel Investigation',
    code: 'CHAN-INV',
    price: '2500.00',
    type: InvestigationType.PRIMARY,
    imaging_id: imaging.id,
    staff_id: staffId,
  } as never);
  investigationId = investigation.id;

  const sample = await Sample.create({ name: 'Channel Sample', staff_id: staffId } as never);
  await Test.create({
    name: 'Channel Test',
    code: 'CHAN-TST',
    price: '1000.00',
    sample_id: sample.id,
    type: 'Primary',
    result_unit: 'mg/dL',
    valid_range: '0-100',
    staff_id: staffId,
  } as never);
});

afterAll(async () => {
  process.env.EMR_OUTBOX_ENABLED = ORIGINAL_FLAG;

  await Drug.destroy({ where: { code: 'CHAN-AMOX' }, force: true });
  await Service.destroy({ where: { code: 'CHAN-SVC' }, force: true });
  await Investigation.destroy({ where: { name: 'Channel Investigation' }, force: true });
  await Test.destroy({ where: { code: 'CHAN-TST' }, force: true });
  await Sample.destroy({ where: { name: 'Channel Sample' }, force: true });
  await Imaging.destroy({ where: { name: 'Channel Imaging' }, force: true });
  await Vendor.destroy({ where: { id: vendorId }, force: true });
  await HMO.destroy({ where: { id: [schemeHmoId, retainerHmoId] }, force: true });
  await Insurance.destroy({
    where: { id: [schemeInsuranceId, retainerInsuranceId] },
    force: true,
  });
  await sequelizeConnection.close();
});

beforeEach(async () => {
  await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
  await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
});

describe('emit-on-write for the payer channels', () => {
  it('createInsurance emits exactly one insurance.changed', async () => {
    const created = await createInsurance({ name: 'FHSS', staff_id: staffId });

    const rows = await OutboxEvent.findAll({ where: { event_type: 'insurance.changed' } });
    expect(rows).toHaveLength(1);
    expect(rows[0].aggregate_id).toBe(`insurance:${created.id}`);
    expect(await bodyOf('insurance.changed')).toMatchObject({
      insurance_id: created.id,
      name: 'FHSS',
      is_retainership: false,
    });

    await Insurance.destroy({ where: { id: created.id }, force: true });
  });

  it('updateInsurance emits exactly one insurance.changed', async () => {
    await updateInsurance({ insurance_id: schemeInsuranceId, name: 'NHIS Renamed' });

    const rows = await OutboxEvent.findAll({ where: { event_type: 'insurance.changed' } });
    expect(rows).toHaveLength(1);
    expect(await bodyOf('insurance.changed')).toMatchObject({
      insurance_id: schemeInsuranceId,
      name: 'NHIS Renamed',
    });

    await Insurance.update({ name: 'NHIS' } as never, { where: { id: schemeInsuranceId } });
  });

  it('createHMO emits exactly one hmo.changed carrying the whole body', async () => {
    const created = await createHMO({
      name: 'Channel HMO',
      hmo_num: 'CH-777',
      insurance_id: schemeInsuranceId,
      staff_id: staffId,
    });

    const rows = await OutboxEvent.findAll({ where: { event_type: 'hmo.changed' } });
    expect(rows).toHaveLength(1);
    expect(rows[0].aggregate_id).toBe(`hmo:${created.id}`);
    expect(await bodyOf('hmo.changed')).toEqual({
      hmo_id: created.id,
      insurance_id: schemeInsuranceId,
      name: 'Channel HMO',
      hmo_num: 'CH-777',
    });

    await HMO.destroy({ where: { id: created.id }, force: true });
  });

  it('updateHMO emits exactly one hmo.changed', async () => {
    await updateHMO({ hmo_id: schemeHmoId, name: 'Scheme HMO Renamed' });

    const rows = await OutboxEvent.findAll({ where: { event_type: 'hmo.changed' } });
    expect(rows).toHaveLength(1);
    expect(await bodyOf('hmo.changed')).toMatchObject({
      hmo_id: schemeHmoId,
      name: 'Scheme HMO Renamed',
    });

    await HMO.update({ name: 'Scheme HMO' } as never, { where: { id: schemeHmoId } });
  });
});

describe('is_retainership agrees with classifyPayer', () => {
  it('marks a Retainership-named scheme the way classifyPayer classifies it', async () => {
    await sequelizeConnection.transaction(t => emitInsuranceChanged(retainerInsuranceId, t));

    const row = await OutboxEvent.findOne({ where: { event_type: 'insurance.changed' } });
    if (!row) {
      throw new Error('no insurance.changed event in the outbox');
    }
    const body = row.payload.body as Record<string, unknown>;
    const classification = classifyPayer({
      insurance_id: retainerInsuranceId,
      hmo_id: retainerHmoId,
      insuranceName: 'Retainership',
    });

    expect(body.is_retainership).toBe(true);
    expect(classification?.payer_type).toBe('retainership');
  });

  it('leaves a regular scheme unmarked, matching its scheme_hmo classification', async () => {
    await sequelizeConnection.transaction(t => emitInsuranceChanged(schemeInsuranceId, t));

    const row = await OutboxEvent.findOne({ where: { event_type: 'insurance.changed' } });
    if (!row) {
      throw new Error('no insurance.changed event in the outbox');
    }
    const body = row.payload.body as Record<string, unknown>;
    const classification = classifyPayer({
      insurance_id: schemeInsuranceId,
      hmo_id: schemeHmoId,
      insuranceName: 'NHIS',
    });

    expect(body.is_retainership).toBe(false);
    expect(classification?.payer_type).toBe('scheme_hmo');
  });
});

describe('catalogue.requested full sends', () => {
  const fullSend = (kind: string) =>
    sequelizeConnection.transaction(t =>
      applyInstruction('catalogue.requested', 'catalogue:all', 1, { kind }, t)
    );

  it('kind item emits exactly one item.changed per coded row, each with its line_type', async () => {
    const result = await fullSend('item');
    expect(result.outcome).toBe('APPLIED');

    const events = await OutboxEvent.findAll({ where: { event_type: 'item.changed' } });
    // Investigations have no `code` column yet (#83 adds it), so they contribute nothing until
    // then: the full send covers coded rows of every kind and never fabricates an item_code. A
    // row whose code overflows the 43-char wire bound is skipped, not thrown — a full send must
    // never dead-letter on one bad catalogue row.
    const codedRowCount = (
      await sequelizeConnection.query<{ c: number }>(
        `SELECT (SELECT COUNT(*) FROM Drugs WHERE code IS NOT NULL AND LENGTH(TRIM(code)) BETWEEN 1 AND 43)
              + (SELECT COUNT(*) FROM Tests WHERE code IS NOT NULL AND LENGTH(TRIM(code)) BETWEEN 1 AND 43)
              + (SELECT COUNT(*) FROM Services WHERE code IS NOT NULL AND LENGTH(TRIM(code)) BETWEEN 1 AND 43) AS c`,
        { type: QueryTypes.SELECT }
      )
    )[0].c;

    expect(events).toHaveLength(codedRowCount);

    const bodies = events.map(row => row.payload.body as Record<string, unknown>);
    expect(bodies).toContainEqual({
      item_code: 'CHAN-AMOX',
      name: 'Channel Amoxicillin',
      line_type: 'drug',
    });
    expect(bodies).toContainEqual({
      item_code: 'CHAN-SVC',
      name: 'Channel Service',
      line_type: 'service',
    });
    expect(bodies).toContainEqual({
      item_code: 'CHAN-TST',
      name: 'Channel Test',
      line_type: 'test',
    });
    expect(bodies.some(body => body.item_code === String(investigationId))).toBe(false);
  });

  it('kind vendor emits exactly one vendor.changed per supplier', async () => {
    await fullSend('vendor');

    const events = await OutboxEvent.findAll({ where: { event_type: 'vendor.changed' } });
    expect(events).toHaveLength(await Vendor.count());
    const bodies = events.map(row => row.payload.body as Record<string, unknown>);
    expect(bodies).toContainEqual({ vendor_id: vendorId, name: 'Channel Pharma Ltd' });
  });

  it('kind payer emits one insurance.changed AND one hmo.changed per row', async () => {
    await fullSend('payer');

    const insuranceEvents = await OutboxEvent.findAll({
      where: { event_type: 'insurance.changed' },
    });
    const hmoEvents = await OutboxEvent.findAll({ where: { event_type: 'hmo.changed' } });

    expect(insuranceEvents).toHaveLength(await Insurance.count());
    expect(hmoEvents).toHaveLength(await HMO.count());
    expect((await bodyOf('hmo.changed')) as Record<string, unknown>).toMatchObject({
      hmo_id: expect.any(Number),
      insurance_id: expect.any(Number),
      hmo_num: expect.any(String),
    });
  });

  it('an unknown kind is UNHANDLED and emits nothing', async () => {
    const result = await fullSend('visits');
    expect(result.outcome).toBe('UNHANDLED');
    expect(await OutboxEvent.count()).toBe(0);
  });
});

describe('payer.requested is a full payer send', () => {
  it('emits every insurance and HMO without needing a kind in the body', async () => {
    const result = await sequelizeConnection.transaction(t =>
      applyInstruction('payer.requested', 'payer:all', 1, {}, t)
    );

    expect(result.outcome).toBe('APPLIED');
    expect(await OutboxEvent.count({ where: { event_type: 'insurance.changed' } })).toBe(
      await Insurance.count()
    );
    expect(await OutboxEvent.count({ where: { event_type: 'hmo.changed' } })).toBe(
      await HMO.count()
    );
  });
});

describe('a redelivered catalogue.requested does not double the outbox', () => {
  it('the second delivery gets no new inbox row, and a re-drain of a terminal row skips', async () => {
    const envelope = {
      event_id: '0197c0de-0000-7000-8000-000000000082',
      event_type: 'catalogue.requested',
      event_version: 1,
      aggregate_type: 'catalogue',
      aggregate_id: 'catalogue:all',
      sequence: 1,
      idempotency_key: 'catalogue-requested-redelivery',
      payload: { kind: 'payer' },
      key_id: 'emr-2026-07',
      status: 'PENDING',
    };

    await InboxEvent.destroy({ where: { idempotency_key: envelope.idempotency_key }, force: true });
    const row = await InboxEvent.create(envelope as never);
    expect(await processOne(row.id)).toBe('APPLIED');

    const expected = (await Insurance.count()) + (await HMO.count());
    expect(await OutboxEvent.count()).toBe(expected);

    // Redelivery path 1: the SAME idempotency key is refused at the inbox write — no second row
    // is ever created, so the applier can never see the request twice.
    await expect(InboxEvent.create(envelope as never)).rejects.toThrow();

    // Redelivery path 2: a re-drain of the already-processed row is SKIPPED — the outbox does not
    // grow.
    expect(await processOne(row.id)).toBe('SKIPPED');
    expect(await OutboxEvent.count()).toBe(expected);

    await InboxEvent.destroy({ where: { id: row.id }, force: true });
  });
});
