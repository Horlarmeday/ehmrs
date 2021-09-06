/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Staff, Test, NhisTest, TestSample } = require('../../database/models');

describe('Pharmacy Endpoints /pharmacy', () => {
  let token;
  let sample_id;
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
    await Test.destroy({ truncate: true, cascade: false });
    await NhisTest.destroy({ truncate: true, cascade: false });
    await TestSample.destroy({ truncate: true, cascade: false });
  });

  it('should create a new test sample', async () => {
    const res = await request(server)
      .post('/api/laboratory/test/samples/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Urine',
      });
    sample_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id', 1);
    await expect(res.body.data).toHaveProperty('name', 'Urine');
    await expect(res.body.data).not.toHaveProperty('name', 'Blood');
  }, 10000);

  it('should return updated test sample', async () => {
    const res = await request(server)
      .put('/api/laboratory/test/samples/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Semen',
        sample_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('name', 'Semen');
  }, 10000);

  it('should return searched test sample', async () => {
    const res = await request(server)
      .get('/api/laboratory/test/samples/get?currentPage=1&pageLimit=10&search=Semen')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all test samples', async () => {
    const res = await request(server)
      .get('/api/laboratory/test/samples/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);
});
