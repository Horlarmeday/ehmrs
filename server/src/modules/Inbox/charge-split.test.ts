import '../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { InboxSequence } from '../../database/models/inboxSequence';
import { applyInstruction, ApplyError } from './applier';

/**
 * `charge.split.updated` against the real prescribed-line schema (ADR-0096/0097).
 *
 * These are claims about the columns the EMR stores and the high-water mark it keeps, so they run
 * against MySQL rather than mocks.
 */

const DRUG_ID = 990101;
const CHARGE_LINE_ID = 'charge-line-990101';

async function seedDrug(): Promise<void> {
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(
      `INSERT INTO Prescribed_Drugs
         (id, drug_id, dosage_form_id, drug_type, quantity_prescribed, quantity_to_dispense,
          quantity_dispensed, route_id, frequency, strength_id, duration, total_price, examiner,
          date_prescribed, prescribed_strength, duration_unit, visit_id, patient_id, start_date,
          drug_prescription_id, inventory_id, payment_status, createdAt, updatedAt)
       VALUES
         (:id, 1, 1, 'NHIS', 5, 3, 0, 1, 'BD', 1, 5, '3000.00', 1, NOW(), '500mg', 'days',
          8891, 100, NOW(), 1, 1, 'Pending', NOW(), NOW())`,
      {
        replacements: { id: DRUG_ID },
        type: QueryTypes.INSERT,
        transaction,
      }
    );
  });
}

async function deleteDrug(): Promise<void> {
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(`DELETE FROM Prescribed_Drugs WHERE id = :id`, {
      replacements: { id: DRUG_ID },
      type: QueryTypes.DELETE,
      transaction,
    });
  });
}

async function readSplit(): Promise<Record<string, unknown>> {
  const [row] = await sequelizeConnection.query<Record<string, unknown>>(
    `SELECT coverage_outcome, split_amount, patient_share, patient_net, insurer_amount,
            insurer_net, corporate_amount, corporate_net
     FROM Prescribed_Drugs WHERE id = :id`,
    { replacements: { id: DRUG_ID }, type: QueryTypes.SELECT }
  );
  return row;
}

function splitBody(overrides: Record<string, unknown> = {}) {
  return {
    external_line_ref: { type: 'drug', id: String(DRUG_ID) },
    encounter_id: 'visit:8891',
    outcome: 'co_pay',
    amount_kobo: '300000',
    patient_share_kobo: '30000',
    patient_net_kobo: '30000',
    insurer_amount_kobo: '270000',
    insurer_net_kobo: '270000',
    corporate_amount_kobo: '0',
    corporate_net_kobo: '0',
    ...overrides,
  };
}

describe('charge.split.updated applier', () => {
  beforeEach(async () => {
    await InboxSequence.destroy({ where: {}, truncate: true, force: true });
    await deleteDrug();
    await seedDrug();
  });

  afterAll(async () => {
    await deleteDrug();
    await sequelizeConnection.close();
  });

  it('stores every split field exactly, converting kobo to naira', async () => {
    await sequelizeConnection.transaction(t =>
      applyInstruction('charge.split.updated', CHARGE_LINE_ID, 1, splitBody(), t)
    );

    const split = await readSplit();
    expect(split.coverage_outcome).toBe('co_pay');
    expect(split.split_amount).toBe('3000.00');
    expect(split.patient_share).toBe('300.00');
    expect(split.patient_net).toBe('300.00');
    expect(split.insurer_amount).toBe('2700.00');
    expect(split.insurer_net).toBe('2700.00');
    expect(split.corporate_amount).toBe('0.00');
    expect(split.corporate_net).toBe('0.00');
  });

  it('applies a capitated split with a notional gross and zero portions', async () => {
    await sequelizeConnection.transaction(t =>
      applyInstruction(
        'charge.split.updated',
        CHARGE_LINE_ID,
        1,
        splitBody({
          outcome: 'capitated',
          patient_share_kobo: '0',
          patient_net_kobo: '0',
          insurer_amount_kobo: '0',
          insurer_net_kobo: '0',
        }),
        t
      )
    );

    expect(await readSplit()).toMatchObject({
      coverage_outcome: 'capitated',
      split_amount: '3000.00',
      patient_net: '0.00',
      insurer_net: '0.00',
    });
  });

  it('discards a stale split for the same charge line', async () => {
    await sequelizeConnection.transaction(t =>
      applyInstruction('charge.split.updated', CHARGE_LINE_ID, 5, splitBody(), t)
    );
    const result = await sequelizeConnection.transaction(t =>
      applyInstruction(
        'charge.split.updated',
        CHARGE_LINE_ID,
        4,
        splitBody({
          patient_share_kobo: '0',
          patient_net_kobo: '0',
          insurer_amount_kobo: '300000',
          insurer_net_kobo: '300000',
        }),
        t
      )
    );

    expect(result.outcome).toBe('DISCARDED_STALE');
    expect((await readSplit()).patient_net).toBe('300.00');
  });

  it('rejects a split whose portions do not conserve the gross', async () => {
    await expect(
      sequelizeConnection.transaction(t =>
        applyInstruction(
          'charge.split.updated',
          CHARGE_LINE_ID,
          1,
          splitBody({ insurer_amount_kobo: '260000' }),
          t
        )
      )
    ).rejects.toBeInstanceOf(ApplyError);
  });

  it('rejects a net above its captured share', async () => {
    await expect(
      sequelizeConnection.transaction(t =>
        applyInstruction(
          'charge.split.updated',
          CHARGE_LINE_ID,
          1,
          splitBody({ patient_net_kobo: '30001' }),
          t
        )
      )
    ).rejects.toBeInstanceOf(ApplyError);
  });

  it('rejects malformed kobo and unknown outcomes', async () => {
    await expect(
      sequelizeConnection.transaction(t =>
        applyInstruction(
          'charge.split.updated',
          CHARGE_LINE_ID,
          1,
          splitBody({ amount_kobo: '3000.00' }),
          t
        )
      )
    ).rejects.toBeInstanceOf(ApplyError);

    await expect(
      sequelizeConnection.transaction(t =>
        applyInstruction(
          'charge.split.updated',
          CHARGE_LINE_ID,
          1,
          splitBody({ outcome: 'not-an-outcome' }),
          t
        )
      )
    ).rejects.toBeInstanceOf(ApplyError);
  });

  it('rejects a split for a line that does not exist', async () => {
    await expect(
      sequelizeConnection.transaction(t =>
        applyInstruction(
          'charge.split.updated',
          CHARGE_LINE_ID,
          1,
          splitBody({ external_line_ref: { type: 'drug', id: '99999999' } }),
          t
        )
      )
    ).rejects.toBeInstanceOf(ApplyError);
  });
});
