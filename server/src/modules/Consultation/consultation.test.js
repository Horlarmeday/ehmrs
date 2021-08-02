/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../startup/server';

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');

const { Diagnosis, History, Complaint, Staff } = require('../../database/models');

describe('Consultation Endpoints /consultations', () => {
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
    await History.destroy({ truncate: true, cascade: false });
    await Diagnosis.destroy({ truncate: true, cascade: false });
    await Complaint.destroy({ truncate: true, cascade: false });
  });

  it('should create a patient observation', async () => {
    const res = await request(server)
      .post('/api/consultations/observation/create/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient_id: 1,
        complaint_note: 'Headache',
        history_note: 'Headache history',
        examination_note: 'Malaria',
        has_smoking_history: true,
        complaints: [
          {
            complaint: 'Malaise',
            frequency: 'Days',
            frequency_number: 2,
            notes: 'Okay',
          },
        ],
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('complaint');
    await expect(res.body.data).toHaveProperty('history');
    await expect(res.body.data.history).toHaveProperty('complaint_note', 'Headache');
  }, 10000);

  it('should not create a patient observation', async () => {
    const res = await request(server)
      .post('/api/consultations/observation/create/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient_id: '',
        complaint_note: '',
        history_note: '',
        examination_note: '',
        has_smoking_history: false,
        complaints: [
          {
            complaint: 'Malaise',
            frequency: 'Days',
            frequency_number: 2,
            notes: '',
          },
        ],
      });
    await expect(res.status).toBe(400);
  }, 10000);

  it('should create a patient diagnosis', async () => {
    const res = await request(server)
      .post('/api/consultations/diagnosis/create/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        diagnosis: [
          {
            diagnosis: 'Headache',
            certainty: 'presumed',
            order: 'primary',
            notes: 'Typhoid is presumed',
          },
        ],
      });
    await expect(res.status).toBe(201);
    await expect(res.body.data).toHaveProperty('certainty', 'Presumed');
  }, 10000);

  it('should return consultation summary', async () => {
    const res = await request(server)
      .get('/api/consultations/summary/get/1')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('diagnoses');
    await expect(res.body.data).toHaveProperty('histories');
    await expect(res.body.data).toHaveProperty('complaints');
  }, 10000);
});
