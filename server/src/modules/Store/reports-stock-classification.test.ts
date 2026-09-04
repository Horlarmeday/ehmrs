import '../../core/config/env';
import '../../database/config/data-source';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { Drug, PharmacyStore, Staff, Unit } from '../../database/models';
import { DrugForm } from '../../database/enums';
import { getDashboardOverview, getStockLevels } from './reports.repository';

/**
 * EMR #29 (plan T11) — the stock-classification consumers must survive a repaired row.
 *
 * The repair (20260831000001) floors quantity_received to 0 on the corrupt rows: what arrived is
 * unknown, and quantity_remaining is authoritative. Every ratio built on quantity_received then
 * loses its denominator — the comparisons invert and the divisions yield Infinity/NaN. These
 * tests pin the guards: an unknown receipt is never "overstocked", never drives a percentage
 * recommendation, and a zero shelf on an unknown receipt is still counted as low stock.
 *
 * Against real MySQL because the guarded branches are SQL literals and raw CASE expressions —
 * the defect lives in the query, not in any mockable layer.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

describe('stock classification with repaired (quantity_received = 0) rows (#29 T11)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  const seeded: number[] = [];

  const seedBin = async (
    quantity_received: number,
    quantity_remaining: number
  ): Promise<number> => {
    const [insertId] = await sequelizeConnection.query(
      `INSERT INTO \`Pharmacy_Store_Items\`
         (\`drug_id\`, \`product_code\`, \`quantity_received\`, \`quantity_remaining\`, \`unit_id\`,
          \`unit_price\`, \`selling_price\`, \`total_price\`, \`drug_form\`, \`drug_type\`,
          \`status\`, \`createdAt\`, \`updatedAt\`)
       VALUES
         (:drug_id, '', :quantity_received, :quantity_remaining, :unit_id,
          200, 450, :total_price, 'Drug', 'Cash', 'Active', NOW(), NOW())`,
      {
        replacements: {
          drug_id,
          unit_id,
          quantity_received,
          quantity_remaining,
          total_price: quantity_remaining * 200,
        },
        type: QueryTypes.INSERT,
      }
    );
    seeded.push(Number(insertId));
    return Number(insertId);
  };

  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Report',
      lastname: 'Classifier',
      fullname: 'Report Classifier',
      username: `report_classifier_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_REPORT.jpg',
      password: '123456',
      email: `report_classifier_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0702${suffix}`,
    });
    staff_id = staff.id;
    const drug = await Drug.create({
      name: `Classifierol ${suffix}`,
      code: `CLF-${suffix}`,
      type: DrugForm.DRUG,
      staff_id,
    });
    const unit = await Unit.create({ name: `sack ${suffix}`, staff_id });
    drug_id = drug.id;
    unit_id = unit.id;

    // The repaired shape: receipt unknown (0 post-repair), shelf authoritative.
    await seedBin(0, 120);
    // An unknown receipt with an EMPTY shelf — low stock, not invisible.
    await seedBin(0, 0);
  }, 20000);

  afterAll(async () => {
    try {
      await sequelizeConnection.query(
        'DELETE FROM `Pharmacy_Store_Items` WHERE `drug_id` = :drug_id',
        { replacements: { drug_id }, type: QueryTypes.DELETE }
      );
      await Drug.destroy({ where: { id: drug_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // Fixtures are namespaced by `suffix`; leftovers are inert.
    }
  });

  it('buckets an unknown-receipt row as Unknown Receipt, never Overstocked', async () => {
    const { stockDistribution } = await getStockLevels({ currentPage: 1, pageLimit: 50 });

    // The row seeded above (received = 0, remaining = 120) must land here — before the guard, the
    // `remaining > received * 0.8` comparison was trivially true against the zero denominator and
    // the row surfaced as Overstocked.
    // The distribution rows key on the SQL alias `stock_status` — the StockDistribution
    // interface's `status` field predates and misses this; the wire shape is the alias.
    const rows = (stockDistribution as unknown) as Array<Record<string, unknown>>;
    const unknown = rows.find(d => d.stock_status === 'Unknown Receipt');
    expect(unknown).toBeDefined();
    expect(Number(unknown.item_count)).toBeGreaterThanOrEqual(1);
  });

  it('emits no percentage recommendation from a zero denominator', async () => {
    const { optimizationRecommendations } = await getStockLevels({
      currentPage: 1,
      pageLimit: 50,
    });

    // The interface declares a narrower shape than the repository actually pushes; read the
    // wire shape, which is what the guard protects.
    const recommendations = (optimizationRecommendations as unknown) as Array<
      Record<string, unknown>
    >;
    expect(recommendations.some(r => String(r.message).includes('Infinity'))).toBe(false);
    expect(recommendations.some(r => r.drugId === drug_id && r.type === 'reduce_ordering')).toBe(
      false
    );
  });

  it('counts a zero shelf on an unknown receipt as low stock on the dashboard', async () => {
    const overview = await getDashboardOverview();
    expect(Number(overview.stock.total)).toBeGreaterThanOrEqual(1);
  });
});
