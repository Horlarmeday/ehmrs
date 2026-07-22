import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { emitChargeCapturedForRows } from './outbox-writer';

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

  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await sequelizeConnection.close();
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
});
