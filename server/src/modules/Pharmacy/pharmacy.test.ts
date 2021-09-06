/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Staff, Drug, DosageForm } = require('../../database/models');

describe('Pharmacy Endpoints /pharmacy', () => {
  let token;
  let drug_id;
  let dosage_form_id;
  let route_id;
  let measurement_id;
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
    await DosageForm.destroy({ truncate: true, cascade: false });
  });

  it('should create a new generic drug', async () => {
    const res = await request(server)
      .post('/api/pharmacy/generic-drugs/create')
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
      .put('/api/pharmacy/generic-drugs/update')
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
      .get('/api/pharmacy/generic-drugs/get?currentPage=1&pageLimit=10&search=Penicillin')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all generic drugs', async () => {
    const res = await request(server)
      .get('/api/pharmacy/generic-drugs/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should create a new dosage form', async () => {
    const res = await request(server)
      .post('/api/pharmacy/dosage-forms/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tab',
      });
    dosage_form_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('name', 'Tab');
  }, 10000);

  it('should return updated dosage form', async () => {
    const res = await request(server)
      .put('/api/pharmacy/dosage-forms/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cap',
        dosage_form_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('name', 'Cap');
  }, 10000);

  it('should return all dosage forms', async () => {
    const res = await request(server)
      .get('/api/pharmacy/dosage-forms/get')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveLength(1);
  }, 10000);

  it('should create a new route of administration', async () => {
    const res = await request(server)
      .post('/api/pharmacy/routes-of-administration/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'IV',
        dosage_form_id,
      });
    route_id = res.body.data.id;
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('dosage_form');
    await expect(res.body.data).toHaveProperty('name', 'IV');
  }, 10000);

  it('should return updated route of administration', async () => {
    const res = await request(server)
      .put('/api/pharmacy/routes-of-administration/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'IM',
        route_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('name', 'IM');
  }, 10000);

  it('should return all dosage forms', async () => {
    const res = await request(server)
      .get('/api/pharmacy/dosage-forms/get')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveLength(1);
  }, 10000);
});
