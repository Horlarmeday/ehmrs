/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');
const { Insurance, Staff, HMO } = require('../../database/models');

describe('Insurance Endpoints /insurances', () => {
  let token;
  let insurance_id;
  let hmo_id;
  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Ajao',
      phone: '07035120699',
      lastname: 'Mahmud',
      fullname: 'Mahmud Aze',
      username: 'mahmud',
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
    await Insurance.destroy({ truncate: true, cascade: false });
    await HMO.destroy({ truncate: true, cascade: false });
  });

  it('should create a new health insurance', async () => {
    const res = await request(server)
      .post('/api/insurances/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'NHIS',
        description: 'NHIS health insurance',
      });
    insurance_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
  }, 10000);

  it('should create a new HMO', async () => {
    const res = await request(server)
      .post('/api/insurances/create/hmo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Total Health Trust',
        hmo_num: 'HMO 17',
        insurance_id,
      });
    hmo_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('insurance_id');
  }, 10000);

  it('should return updated health insurance', async () => {
    const res = await request(server)
      .put('/api/insurances/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'FHSS',
        insurance_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.name).toBe('FHSS');
  }, 10000);

  it('should return updated HMO', async () => {
    const res = await request(server)
      .put('/api/insurances/update/hmo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Police Health Trust',
        hmo_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.name).toBe('Police Health Trust');
  }, 10000);

  it('should return searched insurance', async () => {
    const res = await request(server)
      .get('/api/insurances/get?currentPage=1&pageLimit=10&search=FHSS')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all insurances', async () => {
    const res = await request(server)
      .get('/api/insurances/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched hmo', async () => {
    const res = await request(server)
      .get('/api/insurances/get/hmo?currentPage=1&pageLimit=10&search=Police')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all hmo', async () => {
    const res = await request(server)
      .get('/api/insurances/get/hmo?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all hmo under an health insurance', async () => {
    const res = await request(server)
      .get(`/api/insurances/get/hmo?currentPage=1&pageLimit=10&filter=${insurance_id}`)
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);
});
