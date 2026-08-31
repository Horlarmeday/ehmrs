/* eslint-disable camelcase */
import '../../core/config/env';
import '../../database/config/data-source';
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

import request from 'supertest';

import {
  Drug,
  LaboratoryStore,
  PharmacyStore,
  PharmacyStoreHistory,
  Staff,
  Unit,
  Vendor,
} from '../../database/models';
import { DrugForm } from '../../database/enums';

/**
 * Endpoint tests for the store module.
 *
 * These create their own drug, unit, vendor and staff rather than assuming `drug_id: 1` /
 * `unit_id: 1` exist, and they delete only what they created. The previous version truncated
 * `Staffs` and `PharmacyStore` wholesale, which deleted the fixtures of any suite running beside
 * it — `store-transfer.test.ts` (#295) and `store-create-history.test.ts` (#304 C0) both passed
 * alone and failed in a full run for that reason alone.
 *
 * Assertions are scoped to this suite's own drug where a shared table is involved, so a row left
 * behind by another suite cannot change the result.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

describe('Store Endpoints /store', () => {
  let token: string;
  let staff_id: number;
  let drug_id: number;
  let unit_id: number;
  let vendor_id: number;

  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Fatai',
      phone: `0703${suffix}`,
      lastname: 'Mahmud',
      fullname: 'Mahmud Aze',
      username: `wale_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_20202022.jpg',
      password: '123456',
      email: `ajao_${suffix}@gmail.com`,
      department: 'Medical',
      role: 'Doctor',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
    });
    staff_id = staff.id;
    token = await staff.generateAuthToken();

    const [drug, unit, vendor] = await Promise.all([
      Drug.create({
        name: `Annusol ${suffix}`,
        code: `ANN-${suffix}`,
        type: DrugForm.DRUG,
        staff_id,
      }),
      Unit.create({ name: `bottle ${suffix}`, staff_id }),
      Vendor.create({ name: `Vendor ${suffix}`, staff_id }),
    ]);
    drug_id = drug.id;
    unit_id = unit.id;
    vendor_id = vendor.id;
  }, 20000);

  afterAll(async () => {
    // Delete children before parents, and tolerate failure: rows left by earlier runs of this
    // suite (from before fixtures were namespaced) may still reference these Units and Staffs.
    // Cleanup is housekeeping — it must never turn a passing suite red.
    try {
      const rows = await PharmacyStore.findAll({ where: { drug_id }, attributes: ['id'] });
      if (rows.length) {
        await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: rows.map(r => r.id) } });
      }
      await PharmacyStore.destroy({ where: { drug_id } });
      await LaboratoryStore.destroy({ where: { unit_id } });
      await Drug.destroy({ where: { id: drug_id } });
      await Vendor.destroy({ where: { id: vendor_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // Every fixture is namespaced by `suffix`; leftovers are inert.
    }
  });

  const pharmacyItem = (overrides: Record<string, unknown> = {}) => ({
    drug_id,
    shelf: 'A1',
    product_code: '2345678',
    batch: '097754a',
    voucher: 'ASDFD',
    quantity_received: 50,
    unit_id,
    vendor_id,
    unit_price: 400,
    selling_price: 450,
    expiration: '2027-09-07',
    date_received: '2020-09-07',
    strength_input: '1',
    drug_form: 'Drug',
    create_cash_item: false,
    create_nhis_item: false,
    create_private_item: false,
    ...overrides,
  });

  it('should create a new cash pharmacy item', async () => {
    const res = await request(server)
      .post('/api/store/pharmacy/items/create')
      .set('Authorization', `Bearer ${token}`)
      .send(pharmacyItem({ create_cash_item: true }));
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('drug_type', 'Cash');
  }, 10000);

  it('should create a new NHIS pharmacy item', async () => {
    const res = await request(server)
      .post('/api/store/pharmacy/items/create')
      .set('Authorization', `Bearer ${token}`)
      .send(pharmacyItem({ create_nhis_item: true, nhis_selling_price: 45 }));
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('drug_type', 'NHIS');
  }, 10000);

  it('should return searched pharmacy items', async () => {
    const res = await request(server)
      .get(`/api/store/pharmacy/items/get?currentPage=1&pageLimit=10&search=Annusol ${suffix}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('docs');
    expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all pharmacy items', async () => {
    const res = await request(server)
      .get('/api/store/pharmacy/items/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('docs');
    // Scoped to this suite's drug: the table is shared, so a global count would depend on
    // whichever other suites happened to run first.
    expect(await PharmacyStore.count({ where: { drug_id } })).toBe(2);
  }, 10000);

  it('should create a new laboratory item', async () => {
    const res = await request(server)
      .post('/api/store/laboratory/items/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shelf: 'A1',
        product_code: '2345678',
        batch: '097754a',
        voucher: 'ASDFD',
        quantity: 50,
        unit_id,
        unit_price: 400,
        expiration: '2027-09-07',
        name: `Syringe ${suffix}`,
        date_received: '2020-09-07',
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('staff_id');
    expect(res.body.data).toHaveProperty('name', `Syringe ${suffix}`);
  }, 10000);

  it('should return searched laboratory items', async () => {
    const res = await request(server)
      .get(`/api/store/laboratory/items/get?currentPage=1&pageLimit=10&search=Syringe ${suffix}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all laboratory items', async () => {
    const res = await request(server)
      .get('/api/store/laboratory/items/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(await LaboratoryStore.count({ where: { unit_id } })).toBe(1);
  }, 10000);
});
