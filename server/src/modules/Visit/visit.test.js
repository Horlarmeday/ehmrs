/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../startup/server';
import Constant from '../../config/constants';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Visit, Staff } = require('../../database/models');

describe('Store Endpoints /visits', () => {
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
    await Visit.destroy({ truncate: true, cascade: false });
  });

  it('should create a new patient visit', async () => {
    const res = await request(server)
      .post('/api/visits/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient_id: 1,
        type: Constant.OPD,
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('type', 'OPD');
  }, 10000);

  it('should return searched active visits', async () => {
    const res = await request(server)
      .get('/api/visits/get?currentPage=1&pageLimit=10&search=HALLELUYIA')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all active visits', async () => {
    const res = await request(server)
      .get('/api/visits/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched type visits', async () => {
    const res = await request(server)
      .get('/api/visits/get?currentPage=1&pageLimit=10&search=HALLELUYIA&type=OPD')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all type visits', async () => {
    const res = await request(server)
      .get('/api/visits/get?currentPage=1&pageLimit=10&type=OPD')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
  }, 10000);

  it('should not return type visits', async () => {
    const res = await request(server)
      .get('/api/visits/get?currentPage=1&pageLimit=10&type=IPD')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.total).toBe(0);
  }, 10000);
});
