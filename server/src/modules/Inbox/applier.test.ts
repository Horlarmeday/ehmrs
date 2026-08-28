import '../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { PaymentStatus } from '../../database/enums';
import { InboxSequence } from '../../database/models/inboxSequence';
import { applyInstruction } from './applier';
import { isReleased } from './gate';

/**
 * Integration tests for the applier and the gate, against real MySQL. The claims — that the flip
 * touches ONLY payment_status, is sequence-guarded, never un-dispenses, and that the gate reads the
 * recorded status and fails safe — are claims about the DATABASE and the real Prescribed_* schema,
 * so they run against it, not a mock.
 *
 * A minimal Prescribed_Drugs row is seeded with FK checks off (a fixture technique — the applier's
 * UPDATE is by primary key and touches no FK column, so the parent rows are irrelevant to what is
 * under test).
 */

const DRUG_ID = 990001;
const VISIT_ID = 8891;
const AGG = `visit:${VISIT_ID}`;

async function seedDrug(paymentStatus: PaymentStatus, dispensed = 0): Promise<void> {
  // SET FOREIGN_KEY_CHECKS is SESSION-scoped, and Sequelize pools connections — so the SET and the
  // INSERT must share ONE connection or the insert can hit a connection where checks are still on.
  // A single transaction pins them to the same connection.
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(
      `INSERT INTO Prescribed_Drugs
         (id, drug_id, dosage_form_id, drug_type, quantity_prescribed, quantity_to_dispense,
          quantity_dispensed, route_id, frequency, strength_id, duration, total_price, examiner,
          date_prescribed, prescribed_strength, duration_unit, visit_id, patient_id, start_date,
          drug_prescription_id, inventory_id, payment_status, createdAt, updatedAt)
       VALUES
         (:id, 1, 1, 'Cash', 2, 2, :dispensed, 1, 'BD', 1, 5, '2500.00', 1, NOW(), '500mg', 'days',
          :visit, 100, NOW(), 1, 1, :status, NOW(), NOW())`,
      {
        replacements: { id: DRUG_ID, dispensed, visit: VISIT_ID, status: paymentStatus },
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

async function readDrug(): Promise<{ payment_status: string; quantity_dispensed: number }> {
  const [row] = await sequelizeConnection.query<{
    payment_status: string;
    quantity_dispensed: number;
  }>(`SELECT payment_status, quantity_dispensed FROM Prescribed_Drugs WHERE id = :id`, {
    replacements: { id: DRUG_ID },
    type: QueryTypes.SELECT,
  });
  return row;
}

function settledBody() {
  return { external_line_ref: { type: 'drug', id: String(DRUG_ID) }, encounter_id: AGG };
}

/**
 * What Accounting actually puts on the wire for `authorisation.granted` (ADR-0039): money as a
 * STRING of kobo, `null` for a full approval. The applier reads only the line ref, but the fixture
 * carries the real shape so a contract drift shows up here rather than in production.
 */
function grantedBody() {
  return {
    external_line_ref: { type: 'drug', id: String(DRUG_ID) },
    encounter_id: AGG,
    auth_code: 'AUTH-286',
    approved_amount_kobo: '250000',
    expires_at: '2026-09-01T00:00:00.000Z',
  };
}

describe('applier + gate (B2.2 / B2.3)', () => {
  afterAll(async () => {
    await deleteDrug();
    await sequelizeConnection.close();
  });

  beforeEach(async () => {
    await InboxSequence.destroy({ where: {}, truncate: true, force: true });
    await deleteDrug();
  });

  it('payment.settled flips payment_status to Paid and touches nothing else', async () => {
    await seedDrug(PaymentStatus.PENDING, 0);

    const result = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.settled', AGG, 1, settledBody(), t)
    );

    expect(result.outcome).toBe('APPLIED');
    const drug = await readDrug();
    expect(drug.payment_status).toBe(PaymentStatus.PAID);
    // Decision 9: no dispense side-effect. quantity_dispensed is untouched.
    expect(Number(drug.quantity_dispensed)).toBe(0);
  });

  it('is idempotent by sequence: a resent settle at the same sequence is discarded, status stays', async () => {
    await seedDrug(PaymentStatus.PENDING, 0);

    const first = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.settled', AGG, 5, settledBody(), t)
    );
    const resend = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.settled', AGG, 5, settledBody(), t)
    );

    expect(first.outcome).toBe('APPLIED');
    expect(resend.outcome).toBe('DISCARDED_STALE');
    expect((await readDrug()).payment_status).toBe(PaymentStatus.PAID);
  });

  it('a stale refund for an ALREADY-DISPENSED line changes only payment_status, never un-dispenses', async () => {
    // Paid and fully dispensed. A LATE refund (lower sequence than the settle) must be discarded.
    await seedDrug(PaymentStatus.PAID, 2);

    const settle = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.settled', AGG, 10, settledBody(), t)
    );
    const staleRefund = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.refunded', AGG, 4, settledBody(), t)
    );

    expect(settle.outcome).toBe('APPLIED');
    expect(staleRefund.outcome).toBe('DISCARDED_STALE');
    const drug = await readDrug();
    expect(drug.payment_status).toBe(PaymentStatus.PAID);
    // Never un-dispensed (Q6b.4).
    expect(Number(drug.quantity_dispensed)).toBe(2);
  });

  it('a fresh refund reverts payment_status to Pending, still never un-dispensing', async () => {
    await seedDrug(PaymentStatus.PAID, 2);

    await sequelizeConnection.transaction(t =>
      applyInstruction('payment.settled', AGG, 1, settledBody(), t)
    );
    const refund = await sequelizeConnection.transaction(t =>
      applyInstruction('payment.refunded', AGG, 2, settledBody(), t)
    );

    expect(refund.outcome).toBe('APPLIED');
    const drug = await readDrug();
    expect(drug.payment_status).toBe(PaymentStatus.PENDING);
    expect(Number(drug.quantity_dispensed)).toBe(2);
  });

  it('a valid-but-unhandled reverse type is UNHANDLED, not applied and not failed', async () => {
    await seedDrug(PaymentStatus.PENDING, 0);

    // `authorisation.rejected` used to be the example here; it is handled now (#286), so the
    // unhandled case is demonstrated with a type that genuinely has no applier yet.
    const result = await sequelizeConnection.transaction(t =>
      applyInstruction('stock.received', AGG, 1, settledBody(), t)
    );

    expect(result.outcome).toBe('UNHANDLED');
    expect((await readDrug()).payment_status).toBe(PaymentStatus.PENDING);
  });

  describe('the insurer lifecycle (Accounting #286, ADR-0039)', () => {
    it('authorisation.granted flips payment_status to Permitted and touches nothing else', async () => {
      await seedDrug(PaymentStatus.PENDING, 0);

      const result = await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.granted', AGG, 1, grantedBody(), t)
      );

      expect(result.outcome).toBe('APPLIED');
      const drug = await readDrug();
      expect(drug.payment_status).toBe(PaymentStatus.PERMITTED);
      // Decision 9 holds for the insurer lifecycle too: an authorisation hands out no drugs.
      expect(Number(drug.quantity_dispensed)).toBe(0);
    });

    it('authorisation.rejected returns the line to Pending, which HOLDS', async () => {
      await seedDrug(PaymentStatus.PERMITTED, 0);

      const result = await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.rejected', AGG, 1, settledBody(), t)
      );

      expect(result.outcome).toBe('APPLIED');
      expect((await readDrug()).payment_status).toBe(PaymentStatus.PENDING);
      expect((await isReleased('drug', DRUG_ID)).released).toBe(false);
    });

    it('a Permitted line releases the gate without the patient having paid', async () => {
      await seedDrug(PaymentStatus.PENDING, 0);
      await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.granted', AGG, 1, grantedBody(), t)
      );

      const decision = await isReleased('drug', DRUG_ID);
      expect(decision.released).toBe(true);
      expect(decision.status).toBe(PaymentStatus.PERMITTED);
    });

    it('discards a stale authorisation.granted redelivery, keeping the fresher state', async () => {
      // D5's EMR-side half: Accounting proves monotonic ALLOCATION, the EMR proves the DISCARD.
      // A redelivered grant at a sequence at-or-below the applied mark must not claw a rejected
      // line back to Permitted.
      await seedDrug(PaymentStatus.PENDING, 0);

      const granted = await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.granted', AGG, 4, grantedBody(), t)
      );
      const rejected = await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.rejected', AGG, 5, settledBody(), t)
      );
      const redelivered = await sequelizeConnection.transaction(t =>
        applyInstruction('authorisation.granted', AGG, 4, grantedBody(), t)
      );

      expect(granted.outcome).toBe('APPLIED');
      expect(rejected.outcome).toBe('APPLIED');
      expect(redelivered.outcome).toBe('DISCARDED_STALE');
      // The rejection at the higher sequence stands; the late grant did not resurrect Permitted.
      expect((await readDrug()).payment_status).toBe(PaymentStatus.PENDING);
    });

    it('a granted instruction naming a line that does not exist is an error, not a silent no-op', async () => {
      await expect(
        sequelizeConnection.transaction(t =>
          applyInstruction(
            'authorisation.granted',
            AGG,
            1,
            { external_line_ref: { type: 'drug', id: '424242' }, encounter_id: AGG },
            t
          )
        )
      ).rejects.toThrow(/does not exist/);
    });
  });

  describe('gate (B2.3) fails safe', () => {
    it('HOLDS while payment_status is Pending (stale/unpaid)', async () => {
      await seedDrug(PaymentStatus.PENDING, 0);
      const decision = await isReleased('drug', DRUG_ID);
      expect(decision.released).toBe(false);
      expect(decision.status).toBe(PaymentStatus.PENDING);
    });

    it('RELEASES once a settle has been applied', async () => {
      await seedDrug(PaymentStatus.PENDING, 0);
      await sequelizeConnection.transaction(t =>
        applyInstruction('payment.settled', AGG, 1, settledBody(), t)
      );
      const decision = await isReleased('drug', DRUG_ID);
      expect(decision.released).toBe(true);
      expect(decision.status).toBe(PaymentStatus.PAID);
    });

    it('HOLDS for a line that does not exist, never releasing on missing data', async () => {
      const decision = await isReleased('drug', 424242);
      expect(decision.released).toBe(false);
      expect(decision.status).toBeNull();
    });
  });
});
