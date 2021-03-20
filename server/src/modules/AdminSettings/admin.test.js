/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import server from '../../startup/server';

const request = require('supertest');
const { Department, Unit, Staff, Ward, Bed } = require('../../database/models');

describe('Admin Settings Endpoints /settings', () => {
  let token;
  let ward_id;
  let bed_id;
  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Ajao',
      phone: '07035120699',
      lastname: 'Mahmud',
      middlename: 'Mahmud',
      fullname: 'Mahmud Ajao',
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
    await Department.destroy({ truncate: true, cascade: false });
    await Unit.destroy({ truncate: true, cascade: false });
    await Staff.destroy({ truncate: true, cascade: false });
    await Ward.destroy({ truncate: true, cascade: false });
    await Bed.destroy({ truncate: true, cascade: false });
  });

  it('should create a new department', async () => {
    const res = await request(server)
      .post('/api/settings/department/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'InPatient Department',
        description: 'Inpatient department',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('name', 'InPatient Department');
  }, 10000);

  it('should create a new unit', async () => {
    const res = await request(server)
      .post('/api/settings/unit/create/')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Carton',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('name', 'Carton');
    await expect(res.body.data).toHaveProperty('staff_id');
  }, 10000);

  it('should return searched department', async () => {
    const res = await request(server)
      .get('/api/settings/department/get?currentPage=1&pageLimit=10&search=InPatient')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all departments', async () => {
    const res = await request(server)
      .get('/api/settings/department/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched unit', async () => {
    const res = await request(server)
      .get('/api/settings/unit/get?currentPage=1&pageLimit=10&search=Cart')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all units', async () => {
    const res = await request(server)
      .get('/api/settings/unit/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should create a new ward', async () => {
    const res = await request(server)
      .post('/api/settings/ward/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Female Ward',
      });
    ward_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('name', 'Female Ward');
  }, 10000);

  it('should return updated ward record', async () => {
    const res = await request(server)
      .put('/api/settings/ward/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Male ward',
        ward_id,
      });
    await expect(res.status).toBe(204);
    await expect(res.body.data.name).toBe('Male ward');
  }, 10000);

  it('should return all wards', async () => {
    const res = await request(server)
      .get('/api/settings/ward/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched ward', async () => {
    const res = await request(server)
      .get('/api/settings/ward/get?currentPage=1&pageLimit=10&search=Male')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should create a new bed', async () => {
    const res = await request(server)
      .post('/api/settings/bed/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ward_id,
        bed_type: 'Deluxe',
        code: '417-a',
      });
    bed_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('ward_id');
    await expect(res.body.data).toHaveProperty('code', '417-a');
  }, 10000);

  it('should return updated bed record', async () => {
    const res = await request(server)
      .put('/api/settings/bed/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '417-c',
        bed_id,
      });
    await expect(res.status).toBe(204);
    await expect(res.body.data.code).toBe('417-c');
  }, 10000);

  it('should return all beds in a ward', async () => {
    const res = await request(server)
      .post('/api/settings/ward/one')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ward_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveLength(1);
  }, 10000);

  it('should not return all beds in a ward', async () => {
    const res = await request(server)
      .post('/api/settings/ward/one')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ward_id: '',
      });
    await expect(res.status).toBe(400);
  }, 10000);
});
