/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import server from '../../core/startup/server';

const request = require('supertest');
const { Department, Unit, Staff, Ward, Bed, Service } = require('../../database/models');

describe('Admin Settings Endpoints /settings', () => {
  let token;
  let ward_id;
  let bed_id;
  let service_id;
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
    await Service.destroy({ truncate: true, cascade: false });
  });

  it('should create a new department', async () => {
    const res = await request(server)
      .post('/api/settings/departments/create')
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
      .post('/api/settings/units/create/')
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
      .get('/api/settings/departments/get?currentPage=1&pageLimit=10&search=InPatient')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all departments', async () => {
    const res = await request(server)
      .get('/api/settings/departments/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched unit', async () => {
    const res = await request(server)
      .get('/api/settings/units/get?currentPage=1&pageLimit=10&search=Cart')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all units', async () => {
    const res = await request(server)
      .get('/api/settings/units/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should create a new ward', async () => {
    const res = await request(server)
      .post('/api/settings/wards/create')
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
      .put('/api/settings/wards/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Male ward',
        ward_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.name).toBe('Male ward');
  }, 10000);

  it('should return all wards', async () => {
    const res = await request(server)
      .get('/api/settings/wards/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched ward', async () => {
    const res = await request(server)
      .get('/api/settings/wards/get?currentPage=1&pageLimit=10&search=Male')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should create a new bed', async () => {
    const res = await request(server)
      .post('/api/settings/beds/create')
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
      .put('/api/settings/beds/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '417-c',
        bed_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.code).toBe('417-c');
  }, 10000);

  it('should return all beds in a ward', async () => {
    const res = await request(server)
      .post('/api/settings/ward/beds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ward_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveLength(1);
  }, 10000);

  it('should not return all beds in a ward', async () => {
    const res = await request(server)
      .post('/api/settings/ward/beds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ward_id: '',
      });
    await expect(res.status).toBe(400);
  }, 10000);

  it('should create a new service', async () => {
    const res = await request(server)
      .post('/api/settings/services/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Hospitalization',
        price: 2000,
      });
    service_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('code');
  }, 10000);

  it('should return updated service record', async () => {
    const res = await request(server)
      .put('/api/settings/services/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        price: 4000,
        service_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.price).toBe(4000);
  }, 10000);

  it('should return all services', async () => {
    const res = await request(server)
      .get('/api/settings/services/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);
});
