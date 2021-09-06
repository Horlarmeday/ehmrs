/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Triage, Staff } = require('../../database/models');

describe('Triage Endpoints /triage', () => {
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
    await Triage.destroy({ truncate: true, cascade: false });
  });

  it('should create a new patient vital sign', async () => {
    const res = await request(server)
      .post('/api/triage/create/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient_id: 1,
        visit_id: 1,
        rvs: '22',
        weight: 56,
        height: 1.98,
        bmi: 1.999999,
        pulse: 22,
        respiration: '22',
        temperature: 37.9,
        systolic: 100,
        diastolic: 45,
        heart_rate: 100,
        fetal_heart_rate: 100,
        spo2: 100,
        muac: 'red',
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('bmi', 1.999999);
  }, 10000);

  it('should return all triages done in a visits', async () => {
    const res = await request(server)
      .get('/api/triage/visit/get/1')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveLength(1);
  }, 10000);
});
