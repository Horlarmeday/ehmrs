/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import server from '../../startup/server';

// const fs = require('fs');
const request = require('supertest');
const file = require('./image.json');

// function readJsonFile() {
//   try {
//     return fs.readFileSync(filepath);
//   } catch (e) {
//     throw new Error(e);
//   }
// }

// const file = readJsonFile();
const { Patient, Staff, Dependant } = require('../../database/models');

describe('Patient Endpoints /patients', () => {
  let token;
  let patient_id;
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
    await Patient.destroy({ truncate: true, cascade: false });
    await Dependant.destroy({ truncate: true, cascade: false });
    await Staff.destroy({ truncate: true, cascade: false });
  });

  it('should create a new cash patient', async () => {
    const res = await request(server)
      .post('/api/patients/create/cash')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Ajao',
        phone: '07035120699',
        lastname: 'Mahmud',
        middlename: 'Mahmud',
        gender: 'Male',
        address: 'Kubwa',
        photo: file.image,
        next_of_kin_name: 'sodiq',
        next_of_kin_phone: '09076543212',
        next_of_kin_address: 'Same',
        email: 'ajao@gmail.com',
        marital_status: 'Medical',
        country: 'Nigeria',
        state: 'Abuja',
        lga: 'Bwari',
        occupation: 'Stylist',
        religion: 'Islam',
        relationship: 'Brother',
        alt_phone: '09087654321',
        date_of_birth: '1994-09-02',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('fullname');
    await expect(res.body.data).toHaveProperty('has_insurance', false);
    await expect(res.body.data).not.toHaveProperty('insurance_id');
  }, 10000);

  it('should create a new health insurance patient', async () => {
    const res = await request(server)
      .post('/api/patients/create/health-insurance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Ajao',
        phone: '07035120600',
        lastname: 'Jacob',
        middlename: 'Mahmud',
        gender: 'Male',
        address: 'Kubwa',
        photo: file.image,
        next_of_kin_name: 'sodiq',
        next_of_kin_phone: '09076543212',
        next_of_kin_address: 'Same',
        email: 'ajao@gmail.com',
        marital_status: 'Medical',
        country: 'Nigeria',
        state: 'Abuja',
        lga: 'Bwari',
        occupation: 'Stylist',
        religion: 'Islam',
        alt_phone: '09087654321',
        relationship: 'Brother',
        organization: 'Brother',
        date_of_birth: '1994-09-02',
        insurance_id: 1,
        hmo_id: 1,
        enrollee_code: '436wbgsdh',
        plan: 'Gold',
        dependants: [
          {
            firstname: 'Ajao',
            phone: '07035199601',
            lastname: 'Dolapo',
            gender: 'Male',
            address: 'Kubwa',
            photo: file.image,
            insurance_id: 1,
            hmo_id: 1,
            enrollee_code: '436wbgsdh-2',
            plan: 'Gold',
            relationship: 'Brother',
            date_of_birth: '1994-09-02',
          },
          {
            firstname: 'Ajao',
            phone: '07035123001',
            lastname: 'Titus',
            gender: 'Male',
            address: 'Kubwa',
            photo: file.image,
            insurance_id: 1,
            hmo_id: 1,
            enrollee_code: '436wbgsdh-1',
            plan: 'Gold',
            relationship: 'Brother',
            date_of_birth: '1994-09-02',
          },
        ],
      });
    patient_id = res.body.data.patient.id;
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data.patient).toHaveProperty('id');
    await expect(res.body.data.patient).toHaveProperty('insurance_id');
    await expect(res.body.data.patient).toHaveProperty('fullname');
    await expect(res.body.data.patient).toHaveProperty('has_insurance', true);
    await expect(res.body.data.patient).toHaveProperty('phone', '07035120600');
    // await expect(res.body.data.createdDependants).toHaveLength(2);
  }, 10000);

  it('should create a new ordinary patient', async () => {
    const res = await request(server)
      .post('/api/patients/create/ordinary')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Paul',
        phone: '07035990699',
        lastname: 'Scholes',
        gender: 'Male',
        address: 'Kubwa',
        religion: 'Islam',
        email: 'ajao@gmail.com',
        marital_status: 'Single',
        country: 'Nigeria',
        state: 'Abuja',
        lga: 'Bwari',
        date_of_birth: '1994-09-02',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('fullname');
    await expect(res.body.data).toHaveProperty('has_insurance', false);
    await expect(res.body.data).not.toHaveProperty('insurance_id');
    await expect(res.body.data).not.toHaveProperty('hospital_id');
  }, 10000);

  it('should create a dependant', async () => {
    const res = await request(server)
      .post(`/api/patients/create/dependant/${patient_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Ajao',
        phone: '07035123001',
        lastname: 'Fola',
        gender: 'Male',
        address: 'Kubwa',
        photo: file.image,
        insurance_id: 1,
        hmo_id: 1,
        enrollee_code: '436wbgsdh-7',
        plan: 'Gold',
        relationship: 'Brother',
        date_of_birth: '1994-09-02',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('patient_id');
    await expect(res.body.data).toHaveProperty('staff_id');
    await expect(res.body.data).toHaveProperty('fullname');
    await expect(res.body.data).not.toHaveProperty('occupation');
  }, 10000);

  it('should return searched patient', async () => {
    const res = await request(server)
      .get('/api/patients/get?currentPage=1&pageLimit=10&search=Mahmud')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all patients', async () => {
    const res = await request(server)
      .get('/api/patients/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return searched dependant', async () => {
    const res = await request(server)
      .get('/api/patients/dependant/get?currentPage=1&pageLimit=10&search=Fola')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data.docs).toHaveLength(1);
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all dependants', async () => {
    const res = await request(server)
      .get('/api/patients/dependant/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return updated patient profile', async () => {
    const res = await request(server)
      .put('/api/patients/update/patient')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'olamide',
        patient_id,
      });
    await expect(res.status).toBe(204);
    await expect(res.body.data.firstname).toBe('olamide');
  }, 10000);

  it('should return updated dependant profile', async () => {
    const res = await request(server)
      .put('/api/patients/update/patient')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Faruk',
        patient_id,
      });
    await expect(res.status).toBe(204);
    await expect(res.body.data.firstname).toBe('Faruk');
  }, 10000);
});
