import '../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from './config/data-source';
import { Drug, Staff, Unit } from './models';
import { DrugForm } from './enums';

/* eslint-disable @typescript-eslint/no-var-requires */
const repair29 = require('./migrations/20260831000001-repair-29-negative-receipt-quantities');
const check29 = require('./migrations/20260831000002-add-non-negative-receipt-check-29');
/* eslint-enable @typescript-eslint/no-var-requires */

/**
 * EMR #29 defect B — the repair migration cycle, proved against real MySQL (plan T8/T9/T5).
 *
 * The repair must: floor only the negative receipts to 0 (D3), restate total_price from the
 * authoritative quantity_remaining (D3), leave quantity_remaining untouched (D4), snapshot
 * everything it touches (D6), and be fully reversible (D6). The CHECK migration must apply
 * cleanly on a database the repair has just cleaned (T5's evidence line).
 *
 * Negative rows are seeded with the CHECK temporarily dropped and raw SQL — the point of the
 * repair is rows that predate every guard, so no guard may stand in the seeding's way. The
 * suite restores the CHECK before it finishes.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

interface SeededBin {
  id: number;
  quantity_received: number;
  quantity_remaining: number;
  unit_price: string;
  total_price: string;
}

describe('repair-29 negative receipt quantities', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  const seeded: SeededBin[] = [];

  const queryInterface = sequelizeConnection.getQueryInterface();

  // The pre-#29 writer: a raw INSERT with no validator and no CHECK — how the 586 corrupt rows
  // on ehmrs_prod actually came to exist.
  const seedBin = async (
    quantity_received: number,
    quantity_remaining: number,
    unit_price: number
  ): Promise<SeededBin> => {
    const [inserted] = await sequelizeConnection.query(
      `INSERT INTO \`Pharmacy_Store_Items\`
         (\`drug_id\`, \`product_code\`, \`quantity_received\`, \`quantity_remaining\`, \`unit_id\`,
          \`unit_price\`, \`selling_price\`, \`total_price\`, \`drug_form\`, \`drug_type\`,
          \`status\`, \`createdAt\`, \`updatedAt\`)
       VALUES
         (:drug_id, '', :quantity_received, :quantity_remaining, :unit_id,
          :unit_price, 450, :total_price, 'Drug', 'Cash',
          'Active', NOW(), NOW())`,
      {
        replacements: {
          drug_id,
          unit_id,
          quantity_received,
          quantity_remaining,
          unit_price,
          total_price: quantity_received * unit_price,
        },
        type: QueryTypes.INSERT,
      }
    );
    const [row] = await sequelizeConnection.query<SeededBin>(
      'SELECT `id`, `quantity_received`, `quantity_remaining`, `unit_price`, `total_price` ' +
        'FROM `Pharmacy_Store_Items` WHERE `id` = :id',
      { replacements: { id: inserted }, type: QueryTypes.SELECT }
    );
    seeded.push(row);
    return row;
  };

  const fetchBin = async (id: number): Promise<SeededBin> => {
    const [row] = await sequelizeConnection.query<SeededBin>(
      'SELECT `id`, `quantity_received`, `quantity_remaining`, `unit_price`, `total_price` ' +
        'FROM `Pharmacy_Store_Items` WHERE `id` = :id',
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    return row;
  };

  const reconciliation = async () =>
    sequelizeConnection.query<{ drug_type: string; remaining: string; valuation: string }>(
      'SELECT `drug_type`, SUM(`quantity_remaining`) AS remaining, SUM(`total_price`) AS valuation ' +
        'FROM `Pharmacy_Store_Items` GROUP BY `drug_type`',
      { type: QueryTypes.SELECT }
    );

  // MySQL validates existing rows when ADD CONSTRAINT runs, so the CHECK can only be (re)applied
  // once the table is clean of negatives — and only if it is not already present.
  const checkIsPresent = async (): Promise<boolean> => {
    const [row] = await sequelizeConnection.query<{ n: number | string }>(
      'SELECT COUNT(*) AS n FROM information_schema.TABLE_CONSTRAINTS ' +
        "WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'Pharmacy_Store_Items' " +
        "AND CONSTRAINT_NAME = 'chk_psi_quantity_received_nonnegative'",
      { type: QueryTypes.SELECT }
    );
    return Number(row.n) > 0;
  };

  const deleteSeededBins = async () =>
    sequelizeConnection.query('DELETE FROM `Pharmacy_Store_Items` WHERE `drug_id` = :drug_id', {
      replacements: { drug_id },
      type: QueryTypes.DELETE,
    });

  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Repair',
      lastname: 'TwentyNine',
      fullname: 'Repair TwentyNine',
      username: `repair_29_${suffix}`,
      gender: 'Male',
      address: 'Kubua',
      photo: 'IMG_REPAIR.jpg',
      password: '123456',
      email: `repair_29_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0703${suffix}`,
    });
    staff_id = staff.id;
    const drug = await Drug.create({
      name: `Repairamol ${suffix}`,
      code: `RPR-${suffix}`,
      type: DrugForm.DRUG,
      staff_id,
    });
    const unit = await Unit.create({ name: `vial ${suffix}`, staff_id });
    drug_id = drug.id;
    unit_id = unit.id;
  }, 20000);

  afterAll(async () => {
    try {
      await deleteSeededBins();
      await Drug.destroy({ where: { id: drug_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // Fixtures are namespaced by `suffix`; leftovers are inert.
    } finally {
      // Leave the schema as the migration history expects it, whatever happened above.
      if (!(await checkIsPresent())) {
        await check29.up(queryInterface, sequelizeConnection);
      }
    }
  });

  it('floors the negative receipts, restates the valuation, moves no stock, and reverts cleanly', async () => {
    // Make room for the corrupt rows the way history made them: no CHECK, no validators.
    await check29.down(queryInterface, sequelizeConnection);

    // A clean bin that the repair must not touch.
    const clean = await seedBin(100, 40, 300);

    // Two corrupt bins in the shape #29 measured: negative receipt, positive remaining.
    const corrupt1 = await seedBin(-50, 120, 200);
    const corrupt2 = await seedBin(-10, 0, 500);

    const reconciliationBefore = await reconciliation();

    await repair29.up(queryInterface, sequelizeConnection);

    // D3: floored to visibly-unknown, valuation restated from the authoritative remaining stock.
    const repaired1 = await fetchBin(corrupt1.id);
    expect(Number(repaired1.quantity_received)).toBe(0);
    expect(Number(repaired1.total_price)).toBe(120 * 200);
    expect(Number(repaired1.quantity_remaining)).toBe(120);

    const repaired2 = await fetchBin(corrupt2.id);
    expect(Number(repaired2.quantity_received)).toBe(0);
    expect(Number(repaired2.total_price)).toBe(0);

    // The clean bin is untouched.
    const untouched = await fetchBin(clean.id);
    expect(Number(untouched.quantity_received)).toBe(100);
    expect(Number(untouched.total_price)).toBe(100 * 300);

    // D6: the snapshot holds the pre-repair state of exactly the touched rows.
    const [snapshot] = await sequelizeConnection.query<{ n: number | string }>(
      'SELECT COUNT(*) AS n FROM `Pharmacy_Store_Items_repair_29_backup`',
      { type: QueryTypes.SELECT }
    );
    expect(Number(snapshot.n)).toBe(2);

    // T5's evidence line: the CHECK applies clean on a database the repair has just cleaned.
    await check29.up(queryInterface, sequelizeConnection);

    // T9 reconciliation: stock must not have moved (D3/D4); the valuation must no longer
    // carry the corrupt negative rows' contribution. GROUP BY order is not guaranteed, so the
    // classes are matched by name, not by array index.
    const reconciliationAfter = await reconciliation();
    expect(reconciliationAfter).toHaveLength(reconciliationBefore.length);
    const beforeByClass = new Map(reconciliationBefore.map(r => [r.drug_type, r]));
    reconciliationAfter.forEach(after => {
      expect(beforeByClass.get(after.drug_type)).toBeDefined();
      expect(after.remaining).toBe(beforeByClass.get(after.drug_type).remaining);
    });
    const [negatives] = await sequelizeConnection.query<{ n: number | string }>(
      'SELECT COUNT(*) AS n FROM `Pharmacy_Store_Items` WHERE `quantity_received` < 0',
      { type: QueryTypes.SELECT }
    );
    expect(Number(negatives.n)).toBe(0);

    // D6: full reversal — drop the CHECK, restore from the snapshot.
    await check29.down(queryInterface, sequelizeConnection);
    await repair29.down(queryInterface, sequelizeConnection);

    const restored1 = await fetchBin(corrupt1.id);
    expect(Number(restored1.quantity_received)).toBe(-50);
    expect(Number(restored1.total_price)).toBe(-50 * 200);
    expect(Number(restored1.quantity_remaining)).toBe(120);

    const [backupGone] = await sequelizeConnection.query<{ n: number | string }>(
      'SELECT COUNT(*) AS n FROM information_schema.TABLES ' +
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Pharmacy_Store_Items_repair_29_backup'",
      { type: QueryTypes.SELECT }
    );
    expect(Number(backupGone.n)).toBe(0);

    // Down restored the negatives, and ADD CHECK would refuse them — clear this test's bins so
    // the next test starts from a clean table, exactly as afterAll does for the whole suite.
    await deleteSeededBins();
  }, 30000);

  it('refuses to revert without the snapshot, naming the remedy', async () => {
    // Establish the precondition rather than trusting test order: the previous test leaves the
    // CHECK dropped (and afterAll's finally re-applies it only after everything has run).
    if (!(await checkIsPresent())) {
      await check29.up(queryInterface, sequelizeConnection);
    }
    await check29.down(queryInterface, sequelizeConnection);
    await seedBin(-1, 5, 100);
    await repair29.up(queryInterface, sequelizeConnection);
    await repair29.down(queryInterface, sequelizeConnection);

    await expect(repair29.down(queryInterface, sequelizeConnection)).rejects.toThrow(
      /Pharmacy_Store_Items_repair_29_backup does not exist/
    );

    // The restored -1 row would make ADD CHECK fail (MySQL validates existing rows), so repair
    // it again before the suite's schema is restored — which also proves up is re-entrant.
    await repair29.up(queryInterface, sequelizeConnection);
    await check29.up(queryInterface, sequelizeConnection);
  }, 30000);
});
