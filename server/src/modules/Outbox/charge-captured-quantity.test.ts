import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { emitChargeCapturedForRows } from './outbox-writer';

/**
 * The amount is built from `quantity_to_dispense`; Accounting must take that same quantity as its
 * basis. The two columns differ on thousands of local rows, so this is the regression that pins
 * the wire value.
 */
describe('charge.captured quantity basis', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;

  beforeAll(() => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
  });
  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await sequelizeConnection.close();
  });
  beforeEach(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

  it('sends quantity_to_dispense for a drug, not quantity_prescribed', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'drug',
      [
        {
          id: 910001,
          patient_id: 100,
          visit_id: 8891,
          total_price: '300.00',
          quantity_prescribed: 10,
          quantity_to_dispense: 3,
          drug_id: 1,
        },
      ],
      '2026-10-24',
      t
    );
    await t.commit();

    const event = await OutboxEvent.findOne({ where: { idempotency_key: 'charge:drug:910001' } });
    expect((event?.payload.body as Record<string, unknown>).quantity).toBe(3);
  });

  it('sends quantity_to_dispense for an additional item', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCapturedForRows(
      'additional_item',
      [
        {
          id: 910002,
          patient_id: 100,
          visit_id: 8891,
          total_price: '150.00',
          quantity_prescribed: 4,
          quantity_to_dispense: 2,
          drug_id: 1,
        },
      ],
      '2026-10-24',
      t
    );
    await t.commit();

    const event = await OutboxEvent.findOne({
      where: { idempotency_key: 'charge:additional_item:910002' },
    });
    expect((event?.payload.body as Record<string, unknown>).quantity).toBe(2);
  });
});
