/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Staff, Drug } = require('../../database/models');

describe('Pharmacy Endpoints /pharmacy', () => {
  let token;
  let drug_id;
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
    await Drug.destroy({ truncate: true, cascade: false });
  });

  it('should create a new generic drug', async () => {
    const res = await request(server)
      .post('/api/pharmacy/generic/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Paracetamol',
        type: 'Drug',
      });
    drug_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('name', 'Paracetamol');
  }, 10000);

  it('should return updated generic drug', async () => {
    const res = await request(server)
      .put('/api/pharmacy/generic/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Penicillin',
        drug_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('name', 'Penicillin');
  }, 10000);

  it('should return searched generic drug', async () => {
    const res = await request(server)
      .get('/api/pharmacy/generic/get?currentPage=1&pageLimit=10&search=Penicillin')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all generic drugs', async () => {
    const res = await request(server)
      .get('/api/pharmacy/generic/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);
});
