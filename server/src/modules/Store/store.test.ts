/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Staff, PharmacyItem } = require('../../database/models');

describe('Store Endpoints /store', () => {
  let token;
  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Fatai',
      phone: '07035121699',
      lastname: 'Mahmud',
      fullname: 'Mahmud Aze',
      username: 'wale',
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_20202022.jpg',
      password: '123456',
      email: 'ajao@gmail.com',
      department: 'Medical',
      role: 'Doctor',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
    });
    token = await staff.generateAuthToken();
  }, 14000);
  afterAll(async () => {
    await Staff.destroy({ truncate: true, cascade: false });
    await PharmacyItem.destroy({ truncate: true, cascade: false });
  });

  it('should create a new cash pharmacy item', async () => {
    const res = await request(server)
      .post('/api/store/pharmacy/items/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        drug_id: 1,
        shelf: 'A1',
        product_code: '2345678',
        batch: '097754a',
        voucher: 'ASDFD',
        quantity: 50,
        unit_id: 1,
        unit_price: 400,
        selling_price: 450,
        expiration: '2024-09-07',
        dosage_form: 'Syr',
        date_received: '2020-09-07',
        strength: 'g',
        strength_input: '1',
        route: 'IV',
        drug_form: 'Drug',
        create_cash_item: true,
        create_nhis_item: false,
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('drug_type', 'Cash');
    await expect(res.body.data).not.toHaveProperty('drug_type', 'NHIS');
  }, 10000);

  it('should create a new NHIS pharmacy item', async () => {
    const res = await request(server)
      .post('/api/store/pharmacy/items/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        drug_id: 1,
        shelf: 'A2',
        product_code: '2345678',
        batch: '097754a',
        voucher: 'ASDFD',
        quantity: 50,
        unit_id: 1,
        unit_price: 40,
        selling_price: 45,
        nhis_selling_price: 45,
        expiration: '2024-09-07',
        dosage_form: 'Syr',
        date_received: '2020-09-07',
        strength: 'g',
        strength_input: '1',
        route: 'IV',
        drug_form: 'Drug',
        create_cash_item: false,
        create_nhis_item: true,
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('drug_type', 'NHIS');
    await expect(res.body.data).not.toHaveProperty('drug_type', 'Cash');
  }, 10000);

  it('should return searched pharmacy items', async () => {
    const res = await request(server)
      .get('/api/store/pharmacy/items/get?currentPage=1&pageLimit=10&search=annusol')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all pharmacy items', async () => {
    const res = await request(server)
      .get('/api/store/pharmacy/items/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(2);
    await expect(res.body.data.total).toBeGreaterThan(0);
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
        unit_id: 1,
        unit_price: 400,
        expiration: '2024-09-07',
        name: 'Syringe',
        date_received: '2020-09-07',
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('name', 'Syringe');
  }, 10000);

  it('should return searched laboratory items', async () => {
    const res = await request(server)
      .get('/api/store/laboratory/items/get?currentPage=1&pageLimit=10&search=Syringe')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all laboratory items', async () => {
    const res = await request(server)
      .get('/api/store/laboratory/items/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);
});
