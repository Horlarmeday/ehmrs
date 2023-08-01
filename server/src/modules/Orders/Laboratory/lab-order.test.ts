/* eslint-disable camelcase */
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../../core/startup/server';

import request from 'supertest';
import { OPD } from '../../../core/constants';

import { Staff, PrescribedTest, Visit } from '../../../database/models';

const tests = [
  {
    test_id: 1,
    test_type: 'CASH',
    price: 200,
  },
  {
    test_id: 2,
    test_type: 'NHIS',
    price: 250,
  },
  {
    test_id: 3,
    test_type: 'CASH',
    price: 150,
  },
];

describe('Lab Order Endpoints /tests/lab', () => {
  let token;
  let visit_id;
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
    const visit = await Visit.create({
      patient_id: 1,
      type: OPD,
      staff_id: staff.id,
    });
    visit_id = visit.id;
  }, 14000);
  afterAll(async () => {
    await Staff.destroy({ truncate: true, cascade: false });
    await PrescribedTest.destroy({ truncate: true, cascade: false });
  });

  it('should order a lab test', async () => {
    const res = await request(server)
      .post(`/api/orders/lab/create/${visit_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tests,
      });
    expect(res.status).toBe(201);
    await expect(res.body.data).toHaveLength(3);
    await expect(res.body.data[0]).toHaveProperty('id');
  }, 10000);
});
