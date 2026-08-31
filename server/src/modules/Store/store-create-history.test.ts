import '../../core/config/env';
import '../../database/config/data-source';
import { Drug, PharmacyStore, PharmacyStoreHistory, Staff, Unit } from '../../database/models';
import { DrugForm, HistoryType, PharmacyDrugType } from '../../database/enums';
import { createCashItem, createNHISItem, createPrivateItem } from './store.repository';

/**
 * Integration tests for C0 of Accounting #304: the three create paths must write an opening
 * SUPPLIED history row, in the same transaction as the store row.
 *
 * Against real MySQL, because the claims are claims about the DATABASE — that two rows land
 * together, and that neither survives when the pair cannot.
 *
 * NOTE ON THE SHARED TEST DATABASE. `store.test.ts` truncates `Staffs` and `PharmacyStore` in its
 * `afterAll` (`store.test.ts:31-32`), deleting other suites' fixtures. That is why this file
 * re-establishes its fixtures before EACH test rather than once in `beforeAll`: a test that fails
 * because of a neighbour's cleanup reports a defect that does not exist. The same collision makes
 * `store-transfer.test.ts` (#295) pass alone and fail alongside `store.test.ts` — a pre-existing
 * isolation defect that belongs to that file, not this one.
 *
 * Before this change only `reorderPharmacyItems` wrote history, so a drug's FIRST delivery left no
 * trace and history began at its second restock: 40 SUPPLIED rows against 1,664 store rows on
 * `ehmrs_prod`. Accounting's `external_batch_id` belongs on the delivery rather than the bin row —
 * the bin is reused and overwritten across restocks — so a delivery with no history row has nowhere
 * to carry it.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const staffBody = () => ({
  firstname: 'Receipt',
  lastname: 'Auditor',
  fullname: 'Receipt Auditor',
  username: `receipt_auditor_${suffix}`,
  gender: 'Male',
  address: 'Kubwa',
  photo: 'IMG_RECEIPT.jpg',
  password: '123456',
  email: `receipt_auditor_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1994-09-02',
  phone: `0704${suffix}`,
});

describe('create pharmacy item writes an opening SUPPLIED history row (#304 C0)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;

  const receipt = (overrides: Record<string, unknown> = {}) => ({
    drug_id,
    shelf: 'A1',
    product_code: `PC-${suffix}`,
    batch: `B-${suffix}`,
    voucher: `V-${suffix}`,
    quantity_received: 50,
    unit_id,
    unit_price: 400,
    expiration: new Date('2027-09-07'),
    staff_id,
    date_received: new Date(),
    drug_form: DrugForm.DRUG,
    ...overrides,
  });

  const historyFor = (storeItemId: number) =>
    PharmacyStoreHistory.findAll({ where: { pharmacy_store_id: storeItemId } });

  beforeEach(async () => {
    const [staff] = await Staff.findOrCreate({
      where: { username: staffBody().username },
      defaults: staffBody(),
    });
    staff_id = staff.id;
    const [drug] = await Drug.findOrCreate({
      where: { code: `RCP-${suffix}` },
      defaults: { name: `Receiptamol ${suffix}`, type: DrugForm.DRUG, staff_id },
    });
    const [unit] = await Unit.findOrCreate({
      where: { name: `pack ${suffix}` },
      defaults: { staff_id },
    });
    drug_id = drug.id;
    unit_id = unit.id;
  }, 20000);

  afterAll(async () => {
    // FK order matters, and so does tolerance: this suite shares a database with others that
    // truncate `Staffs` and `PharmacyStore`, so rows this suite created may already be gone and
    // rows it did not create may still reference its staff. Cleanup is best-effort by design —
    // a failure to tidy up must not be reported as a failure of the assertions above.
    try {
      const rows = await PharmacyStore.findAll({ where: { drug_id }, attributes: ['id'] });
      if (rows.length) {
        await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: rows.map(r => r.id) } });
        await PharmacyStore.destroy({ where: { drug_id } });
      }
      await Drug.destroy({ where: { id: drug_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // leftover fixtures are harmless: every row is namespaced by `suffix`.
    }
  });

  it('writes exactly one SUPPLIED row carrying the full received quantity', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));

    const history = await historyFor(item.id);
    expect(history).toHaveLength(1);
    expect(history[0].history_type).toBe(HistoryType.SUPPLIED);
    expect(Number(history[0].quantity_supplied)).toBe(50);
    expect(Number(history[0].quantity_remaining)).toBe(50);
    expect(history[0].pharmacy_store_id).toBe(item.id);
  });

  it('records the price of the class it was created for, not a shared one', async () => {
    const nhis = await createNHISItem(receipt({ nhis_selling_price: 200 }));
    const priv = await createPrivateItem(receipt({ private_selling_price: 700 }));

    expect(nhis.drug_type).toBe(PharmacyDrugType.NHIS);
    expect(priv.drug_type).toBe(PharmacyDrugType.PRIVATE);

    const [nhisHistory] = await historyFor(nhis.id);
    const [privHistory] = await historyFor(priv.id);
    expect(Number(nhisHistory.selling_price)).toBe(200);
    expect(Number(privHistory.selling_price)).toBe(700);
    // Acquisition cost is the same delivery's cost regardless of the class it is priced for.
    expect(Number(nhisHistory.unit_price)).toBe(400);
    expect(Number(privHistory.unit_price)).toBe(400);
  });

  it('writes NEITHER row when the history insert fails — the pair is atomic', async () => {
    const before = await PharmacyStore.count({ where: { drug_id } });

    // `unit_id` is NOT NULL on the history row. The assertion that matters is not that the insert
    // fails, but that the STORE row does not survive the rollback: a store row with no opening
    // history understates what arrived, and stock is dispensed from that row.
    await expect(createCashItem(receipt({ unit_id: null, selling_price: 450 }))).rejects.toThrow();

    expect(await PharmacyStore.count({ where: { drug_id } })).toBe(before);
  });
});
