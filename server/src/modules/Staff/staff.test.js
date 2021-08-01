/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../startup/server';

// const fs = require('fs');

// function readJsonFile() {
//   try {
//     return fs.readFileSync('../Patient/image.json');
//   } catch (e) {
//     throw new Error(e);
//   }
// }
//
// const file = readJsonFile();

// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');
const { Staff } = require('../../database/models');

describe('Staff Endpoints /staffs', () => {
  let token;
  let staff_id;
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
  });

  it('should create a new staff', async () => {
    const res = await request(server)
      .post('/api/staffs/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Ajao',
        phone: '07035120699',
        lastname: 'Mahmud',
        username: 'mahmud',
        gender: 'Male',
        address: 'Kubwa',
        photo: process.env.image,
        password: '123456',
        email: 'ajao@gmail.com',
        department: 'Medical',
        role: 'Doctor',
        sub_role: 'GP',
        date_of_birth: '1994-09-02',
      });
    await expect(res.status).toBe(201);
    await expect(res.body).toHaveProperty('data');
    await expect(res.body.data).toHaveProperty('id');
  }, 10000);

  it('should login staff', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        password: '123456',
        username: 'mahmud',
      });
    staff_id = res.body.data.id;
    await expect(res.status).toBe(200);
    await expect(res.body).toHaveProperty('token');
  }, 10000);

  it('should return logged in staff', async () => {
    const res = await request(server)
      .get('/api/staffs/sub')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('id');
  }, 10000);

  it('should return one staff profile', async () => {
    const res = await request(server)
      .get(`/api/staffs/${staff_id}`)
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('id');
  }, 10000);

  it('should return updated staff profile', async () => {
    const res = await request(server)
      .put('/api/staffs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'olamide',
        staff_id,
      });
    await expect(res.status).toBe(200);
    await expect(res.body.data.firstname).toBe('olamide');
  }, 10000);

  it('should return searched staff', async () => {
    const res = await request(server)
      .get('/api/staffs/get?currentPage=1&pageLimit=10&search=Ajao')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should return all staffs', async () => {
    const res = await request(server)
      .get('/api/staffs/get?currentPage=1&pageLimit=10')
      .set('Authorization', `Bearer ${token}`);
    await expect(res.status).toBe(200);
    await expect(res.body.data).toHaveProperty('docs');
    await expect(res.body.data).toHaveProperty('total');
    await expect(res.body.data.total).toBeGreaterThan(0);
  }, 10000);

  it('should change staff password', async () => {
    const res = await request(server)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: '123456',
        newPassword: '1234567',
        confirmPassword: '1234567',
      });
    await expect(res.status).toBe(200);
  }, 10000);

  it('should generate new password for staff', async () => {
    const res = await request(server)
      .post('/api/auth/forgot-password')
      .send({
        phone: '07035120699',
      });
    await expect(res.status).toBe(200);
  }, 10000);

  it('should not allow user login', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        password: '12345',
        email: 'ajao@gmail.com',
      });
    await expect(res.status).toBe(400);
  }, 10000);
});
