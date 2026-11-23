import '../../core/config/env';
import { createHash, createHmac } from 'crypto';
import express from 'express';
import request from 'supertest';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  Drug,
  Inventory,
  InventoryItem,
  InventoryItemHistory,
  OutboxEvent,
  Patient,
  PharmacyStore,
  PharmacyStoreHistory,
  PrescribedService,
  ReturnItem,
  Service,
  Staff,
  Unit,
  Visit,
} from '../../database/models';
import {
  AcceptedDrugType,
  DrugForm,
  HistoryType,
  PharmacyDrugType,
  ReturnItemStatus,
  VisitCategory,
} from '../../database/enums';
import loaders from '../../core/startup/loaders';
import { dispensePharmacyItems } from '../Store/store.repository';
import { getInventoryItemLayers, updateReturnRequests } from '../Inventory/inventory.repository';
import { dispenseDrug, returnDrugToInventory } from '../Pharmacy/pharmacy.repository';
import { deletePrescribedLineWithReversalRequested } from '../Outbox/outbox-writer';
import { uuidV7 } from '../Outbox/event-builder';
import { tables } from './tables';

/**
 * Accounting's reconciliation reads (#109) against real MySQL. Fixtures are written through the
 * real clinical paths (deletion with a reversal request, store receipt, transfer, dispense, both
 * returns), so each count is checked against what the EMR itself records.
 */

const KEY = { keyId: 'acct-recon-test', secret: 'recon-test-secret' };
const TENANT = 'recon_test_hospital';
const BASE = '/api/integration/accounting/reconciliation';
const DEMOGRAPHIC_KEYS = /"(firstname|lastname|fullname|name|phone|email|address|date_of_birth|hospital_id)"/;

const suffix = Date.now()
  .toString()
  .slice(-8);

const app = express();
loaders(app, express);

/** Signs as Accounting's `signOutboundEvent` does: `sent_at` rides in the header, not the body. */
function signature(body: Record<string, unknown>, sentAt = new Date().toISOString()) {
  const envelope = { event_id: uuidV7(), tenant_key: TENANT, ...body };
  const rawBody = JSON.stringify(envelope);
  const bodyHash = createHash('sha256')
    .update(Buffer.from(rawBody, 'utf8'))
    .digest('hex');
  const base = [envelope.event_id, envelope.tenant_key, sentAt, bodyHash].join('\n');
  const digest = createHmac('sha256', KEY.secret)
    .update(base)
    .digest('hex');
  return {
    rawBody,
    headers: {
      'content-type': 'application/json',
      'x-ehmrs-signature': `v1=${digest}`,
      'x-ehmrs-key-id': KEY.keyId,
      'x-ehmrs-timestamp': sentAt,
    },
  };
}

function signed(path: string, body: Record<string, unknown>) {
  const { rawBody, headers } = signature(body);
  return request(app)
    .post(`${BASE}${path}`)
    .set(headers)
    .send(rawBody);
}

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000);
const dateOnly = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

async function setCreatedAt(table: string, id: number, createdAt: Date): Promise<void> {
  await sequelizeConnection.query(`UPDATE ${table} SET createdAt = :createdAt WHERE id = :id`, {
    replacements: { createdAt, id },
    type: QueryTypes.UPDATE,
  });
}

describe('Accounting reconciliation reads (#109)', () => {
  jest.setTimeout(60000);

  const savedEnv: Record<string, string | undefined> = {};
  const envKeys = [
    'EMR_INBOX_ENABLED',
    'EMR_INBOUND_KEY_ID',
    'EMR_INBOUND_SECRET',
    'EMR_TENANT_KEY',
    'EMR_OUTBOX_ENABLED',
  ];

  let staffId: number;
  let patientId: number;
  let serviceId: number;
  let busyVisitId: number;
  let quietVisitId: number;
  let settlingVisitId: number;
  let deletedServiceId: number;
  let drugId: number;
  let drugCode: string;
  let unitId: number;
  let inventoryId: number;
  let storeRowTracked: PharmacyStore;
  let storeRowLegacy: PharmacyStore;
  const trackedBatch = `acct-recon-${suffix}`;

  const startDate = dateOnly(daysFromNow(-30));
  const windowStart = () => daysFromNow(-1).toISOString();
  const cutoff = () => new Date(Date.now() + 60_000).toISOString();

  const service = (visitId: number) =>
    PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 1000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
    } as never);

  const transfer = (storeRow: PharmacyStore, quantity: number) =>
    dispensePharmacyItems(
      [
        {
          id: storeRow.id,
          drug_type: storeRow.drug_type,
          quantity_to_dispense: quantity,
          dispensary: inventoryId,
          unit_id: unitId,
          drug_name: 'Reconcilamol',
          receiver: staffId,
        },
      ],
      staffId
    );

  const prescribedStub = (visitId: number, quantityDispensed = 0) => ({
    patient_id: patientId,
    visit_id: visitId,
    drug_id: drugId,
    quantity_to_dispense: 100,
    quantity_dispensed: quantityDispensed,
    quantity_returned: 0,
    dispense_status: 'Pending',
    save: async function save() {
      return this;
    },
  });

  const storeRowWithDelivery = async (externalBatchId: string | null, batch: string) => {
    const row = await PharmacyStore.create({
      drug_id: drugId,
      quantity_received: 500,
      quantity_remaining: 500,
      unit_id: unitId,
      unit_price: 100,
      selling_price: 100,
      total_price: 50000,
      drug_form: DrugForm.DRUG,
      drug_type: PharmacyDrugType.CASH,
      batch,
      expiration: daysFromNow(400),
      brand: 'Brand-R',
      staff_id: staffId,
      date_received: new Date(),
    } as never);
    await PharmacyStoreHistory.create({
      pharmacy_store_id: row.id,
      quantity_supplied: 500,
      quantity_remaining: 500,
      unit_id: unitId,
      item_receiver: staffId,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
      external_batch_id: externalBatchId,
    } as never);
    return row;
  };

  beforeAll(async () => {
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
    }
    process.env.EMR_INBOX_ENABLED = 'true';
    process.env.EMR_INBOUND_KEY_ID = KEY.keyId;
    process.env.EMR_INBOUND_SECRET = KEY.secret;
    process.env.EMR_TENANT_KEY = TENANT;
    process.env.EMR_OUTBOX_ENABLED = 'true';

    const staff = await Staff.create({
      firstname: 'Recon',
      lastname: 'Auditor',
      fullname: 'Recon Auditor',
      username: `recon_auditor_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_RECON.jpg',
      password: '123456',
      email: `recon_auditor_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0706${suffix}`,
    } as never);
    staffId = staff.id;

    const patient = await Patient.create({
      firstname: 'Recon',
      lastname: 'Patient',
      gender: 'Male',
      phone: `0707${suffix}`,
      address: 'Kubwa',
      country: 'Nigeria',
      state: 'FCT',
      lga: 'Bwari',
      date_of_birth: new Date('1990-01-01'),
      hospital_id: `REC${suffix}`,
      staff_id: staffId,
    } as never);
    patientId = patient.id;

    const visit = () =>
      Visit.create({
        patient_id: patientId,
        category: VisitCategory.OPD,
        date_visit_start: new Date(),
        department: 'OPD',
        type: 'General',
        professional: 'Dr Recon',
        staff_id: staffId,
      } as never);
    busyVisitId = (await visit()).id;
    quietVisitId = (await visit()).id;
    settlingVisitId = (await visit()).id;

    serviceId = (
      await Service.create({
        name: `Recon Service ${suffix}`,
        price: 1000,
        code: `RS-${suffix}`,
      } as never)
    ).id;

    await service(busyVisitId);
    await service(busyVisitId);
    const toDelete = await service(busyVisitId);
    deletedServiceId = toDelete.id;
    await deletePrescribedLineWithReversalRequested(
      'service',
      toDelete.id,
      transaction => PrescribedService.findByPk(toDelete.id, { transaction }),
      transaction => PrescribedService.destroy({ where: { id: toDelete.id }, transaction })
    );
    const beforeStart = await service(busyVisitId);
    await setCreatedAt(tables().line.service, beforeStart.id, daysFromNow(-60));

    await service(quietVisitId);

    const late = await service(settlingVisitId);
    await setCreatedAt(tables().line.service, late.id, daysFromNow(1));

    drugCode = `REC-${suffix}`;
    const [drug, unit, inventory] = await Promise.all([
      Drug.create({
        name: `Reconcilamol ${suffix}`,
        code: drugCode,
        type: DrugForm.DRUG,
        staff_id: staffId,
      } as never),
      Unit.create({ name: `strip ${suffix}`, staff_id: staffId } as never),
      Inventory.create({
        name: `Recon Dispensary ${suffix}`,
        accepted_drug_type: AcceptedDrugType.CASH,
        staff_id: staffId,
      } as never),
    ]);
    drugId = drug.id;
    unitId = unit.id;
    inventoryId = inventory.id;

    storeRowTracked = await storeRowWithDelivery(trackedBatch, 'LOT-RT');
    storeRowLegacy = await storeRowWithDelivery(null, 'LOT-RL');
    await transfer(storeRowTracked, 100);
    await transfer(storeRowLegacy, 50);

    const layers = await getInventoryItemLayers(inventoryId, drugId);
    const trackedLayer = layers.find(layer => layer.pharmacy_store_id === storeRowTracked.id);
    const legacyLayer = layers.find(layer => layer.pharmacy_store_id === storeRowLegacy.id);

    await dispenseDrug([trackedLayer], prescribedStub(quietVisitId) as never, {
      quantity_to_dispense: 30,
      staff_id: staffId,
      drug_prescription_id: 99999950,
      prescription_id: 5590,
    });
    await dispenseDrug([legacyLayer], prescribedStub(quietVisitId) as never, {
      quantity_to_dispense: 10,
      staff_id: staffId,
      drug_prescription_id: 99999951,
      prescription_id: 5591,
    });
    await returnDrugToInventory(
      await InventoryItem.findByPk(trackedLayer.id),
      prescribedStub(quietVisitId, 30) as never,
      {
        quantity_to_return: 5,
        staff_id: staffId,
        drug_prescription_id: 99999950,
        prescription_id: 5590,
        reason_for_return: 'not needed',
      }
    );
    const returnItem = await ReturnItem.create({
      inventory_item_id: trackedLayer.id,
      quantity: 2,
      status: ReturnItemStatus.PENDING,
      reason_for_return: 'overstocked',
      date_received: new Date(),
      staff_id: staffId,
    } as never);
    await updateReturnRequests(
      [
        { id: returnItem.id, inventory_item_id: trackedLayer.id, quantity: 2, status: 'Granted' },
      ] as never,
      staffId
    );
  });

  afterAll(async () => {
    const layerIds = (
      await InventoryItem.findAll({ where: { inventory_id: inventoryId }, attributes: ['id'] })
    ).map(row => row.id);
    const visitIds = [busyVisitId, quietVisitId, settlingVisitId];
    const steps: Array<() => Promise<unknown>> = [
      () =>
        OutboxEvent.destroy({
          where: { aggregate_id: [...visitIds.map(id => `visit:${id}`), `store:${inventoryId}`] },
          force: true,
        }),
      () => ReturnItem.destroy({ where: { inventory_item_id: layerIds }, force: true }),
      () => InventoryItemHistory.destroy({ where: { inventory_id: inventoryId }, force: true }),
      () => InventoryItem.destroy({ where: { inventory_id: inventoryId }, force: true }),
      () =>
        PharmacyStoreHistory.destroy({
          where: { pharmacy_store_id: [storeRowTracked.id, storeRowLegacy.id] },
          force: true,
        }),
      () => PharmacyStore.destroy({ where: { drug_id: drugId }, force: true }),
      () => Inventory.destroy({ where: { id: inventoryId }, force: true }),
      () => Drug.destroy({ where: { id: drugId }, force: true }),
      () => Unit.destroy({ where: { id: unitId }, force: true }),
      () => PrescribedService.destroy({ where: { visit_id: visitIds }, force: true }),
      () => Service.destroy({ where: { id: serviceId }, force: true }),
      () => Visit.destroy({ where: { id: visitIds }, force: true }),
      () => Patient.destroy({ where: { id: patientId }, force: true }),
      () => Staff.destroy({ where: { id: staffId }, force: true }),
    ];
    for (const step of steps) {
      try {
        await step();
      } catch {
        // Cleanup only; the scratch database is recreated by test:db:setup.
      }
    }
    for (const key of envKeys) {
      process.env[key] = savedEnv[key];
    }
    await sequelizeConnection.close();
  });

  const windowBody = (overrides: Record<string, unknown> = {}) => ({
    start_date: startDate,
    window_start: windowStart(),
    cutoff: cutoff(),
    after_visit_id: null,
    limit: 500,
    visit_ids: [],
    ...overrides,
  });

  describe('authentication', () => {
    it('refuses an unsigned request with 401', async () => {
      const response = await request(app)
        .post(`${BASE}/outbox`)
        .set('content-type', 'application/json')
        .send(JSON.stringify({ event_id: uuidV7(), tenant_key: TENANT }));
      expect(response.status).toBe(401);
    });

    it('refuses a body changed after signing with 401', async () => {
      const { headers } = signature({});
      const response = await request(app)
        .post(`${BASE}/outbox`)
        .set(headers)
        .send(JSON.stringify({ event_id: uuidV7(), tenant_key: TENANT }));
      expect(response.status).toBe(401);
    });

    it('refuses a signed request with an invalid body with 400', async () => {
      const response = await signed('/charges', windowBody({ limit: 0 }));
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/limit/);
    });

    it('answers 503 while the integration is switched off', async () => {
      process.env.EMR_INBOX_ENABLED = 'false';
      try {
        const response = await signed('/outbox', {});
        expect(response.status).toBe(503);
      } finally {
        process.env.EMR_INBOX_ENABLED = 'true';
      }
    });
  });

  describe('charges', () => {
    async function allWindowVisits(limit: number) {
      const visits: Array<Record<string, unknown>> = [];
      let after: string | null = null;
      let settling = -1;
      for (let page = 0; page < 1000; page += 1) {
        const response = await signed('/charges', windowBody({ after_visit_id: after, limit }));
        expect(response.status).toBe(200);
        visits.push(...response.body.visits);
        settling = response.body.settling_visits;
        after = response.body.next_after_visit_id;
        if (after === null) {
          break;
        }
      }
      return { visits, settling };
    }

    it('counts live and reversal-deleted lines since the start date', async () => {
      const { visits } = await allWindowVisits(500);
      const busy = visits.find(visit => visit.visit_id === String(busyVisitId));
      expect(busy).toEqual({
        visit_id: String(busyVisitId),
        patient_id: String(patientId),
        last_activity_at: expect.any(String),
        lines: { drug: 0, investigation: 0, service: 3, test: 0, additional_item: 0 },
      });
      const quiet = visits.find(visit => visit.visit_id === String(quietVisitId));
      expect(quiet.lines).toEqual({
        drug: 0,
        investigation: 0,
        service: 1,
        test: 0,
        additional_item: 0,
      });
    });

    it('leaves a visit with activity after the cutoff out as settling', async () => {
      const { visits, settling } = await allWindowVisits(500);
      expect(visits.some(visit => visit.visit_id === String(settlingVisitId))).toBe(false);
      expect(settling).toBeGreaterThanOrEqual(1);
    });

    it('pages by visit id without repeating or skipping a visit', async () => {
      const whole = await allWindowVisits(500);
      const paged = await allWindowVisits(1);
      const ids = paged.visits.map(visit => Number(visit.visit_id));
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toEqual(whole.visits.map(visit => Number(visit.visit_id)));
    });

    it('answers looked-up visits, with zeros for one it does not know', async () => {
      const unknown = 2_000_000_000;
      const response = await signed(
        '/charges',
        windowBody({ visit_ids: [String(busyVisitId), String(unknown), String(settlingVisitId)] })
      );
      expect(response.status).toBe(200);
      expect(response.body.next_after_visit_id).toBeNull();
      expect(response.body.settling_visits).toBe(1);
      expect(response.body.visits).toEqual([
        expect.objectContaining({
          visit_id: String(busyVisitId),
          lines: expect.objectContaining({ service: 3 }),
        }),
        {
          visit_id: String(unknown),
          patient_id: null,
          last_activity_at: null,
          lines: { drug: 0, investigation: 0, service: 0, test: 0, additional_item: 0 },
        },
      ]);
    });

    it('lists the lines of one visit, marking the deleted one', async () => {
      const response = await signed('/charges/lines', {
        start_date: startDate,
        visit_id: String(busyVisitId),
      });
      expect(response.status).toBe(200);
      expect(response.body.truncated).toBe(false);
      const lines = response.body.lines as Array<{ type: string; id: string; state: string }>;
      expect(lines).toHaveLength(3);
      expect(lines.filter(line => line.state === 'LIVE')).toHaveLength(2);
      expect(lines.find(line => line.state === 'DELETED')).toMatchObject({
        type: 'service',
        id: String(deletedServiceId),
      });
    });

    it('carries no demographic field', async () => {
      const counts = await signed('/charges', windowBody({ visit_ids: [String(busyVisitId)] }));
      const lines = await signed('/charges/lines', {
        start_date: startDate,
        visit_id: String(busyVisitId),
      });
      expect(counts.text).not.toMatch(DEMOGRAPHIC_KEYS);
      expect(lines.text).not.toMatch(DEMOGRAPHIC_KEYS);
    });
  });

  describe('stock', () => {
    it('totals received, dispensed and both returns for a tracked batch', async () => {
      const response = await signed('/stock', {
        start_date: startDate,
        window_start: windowStart(),
        cutoff: cutoff(),
        batch_ids: [],
      });
      expect(response.status).toBe(200);
      expect(response.body.truncated).toBe(false);
      const batch = response.body.batches.find(
        (row: Record<string, unknown>) => row.external_batch_id === trackedBatch
      );
      expect(batch).toEqual({
        external_batch_id: trackedBatch,
        item_code: drugCode,
        drug_type: PharmacyDrugType.CASH,
        last_movement_at: expect.any(String),
        dispensed: 30,
        returned_by_patient: 5,
        returned_to_store: 2,
        received: 500,
      });
      expect(response.body.untracked.dispensed).toBeGreaterThanOrEqual(10);
    });

    it('answers looked-up batches with zeros for one it does not know', async () => {
      const response = await signed('/stock', {
        start_date: startDate,
        window_start: windowStart(),
        cutoff: cutoff(),
        batch_ids: [trackedBatch, 'acct-unknown-batch'],
      });
      expect(response.status).toBe(200);
      expect(response.body.untracked).toEqual({
        dispensed: 0,
        returned_by_patient: 0,
        returned_to_store: 0,
      });
      expect(response.body.batches).toEqual([
        expect.objectContaining({ external_batch_id: trackedBatch, dispensed: 30 }),
        {
          external_batch_id: 'acct-unknown-batch',
          item_code: null,
          drug_type: null,
          last_movement_at: null,
          dispensed: 0,
          returned_by_patient: 0,
          returned_to_store: 0,
          received: 0,
        },
      ]);
    });

    it('counts nothing from before the start date', async () => {
      const response = await signed('/stock', {
        start_date: dateOnly(daysFromNow(2)),
        window_start: windowStart(),
        cutoff: cutoff(),
        batch_ids: [trackedBatch],
      });
      expect(response.body.batches[0]).toMatchObject({
        dispensed: 0,
        received: 0,
        last_movement_at: null,
      });
    });
  });

  describe('outbox', () => {
    it('separates waiting rows from rows past the attempt limit', async () => {
      const aggregate = `visit:${quietVisitId}`;
      const base = {
        aggregate_type: 'encounter',
        aggregate_id: aggregate,
        event_type: 'charge.captured',
        event_version: 1,
        payload: {},
      };
      await OutboxEvent.bulkCreate([
        { ...base, sequence: 9001, idempotency_key: `recon-waiting-${suffix}`, attempts: 0 },
        { ...base, sequence: 9002, idempotency_key: `recon-exhausted-${suffix}`, attempts: 99 },
      ] as never);
      const before = await OutboxEvent.count({ where: { sent_at: null } });

      const response = await signed('/outbox', {});
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        waiting: expect.any(Number),
        exhausted: expect.any(Number),
        oldest_unsent_at: expect.any(String),
        max_attempts: expect.any(Number),
        read_at: expect.any(String),
      });
      expect(response.body.exhausted).toBeGreaterThanOrEqual(1);
      expect(response.body.waiting + response.body.exhausted).toBe(before);
    });
  });
});
