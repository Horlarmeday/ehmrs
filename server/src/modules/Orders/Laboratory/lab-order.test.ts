/* eslint-disable camelcase */
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../../core/startup/server';

import request from 'supertest';

import {
  cleanUpOrderFixtures,
  createVisitContext,
  seedLabCatalogue,
} from '../__fixtures__/order-fixtures';

describe('Lab Order Endpoints /tests/lab', () => {
  let token;
  let visit_id;
  let tests;
  beforeAll(async () => {
    const context = await createVisitContext();
    token = context.token;
    visit_id = context.visit_id;

    // The order references sample and test rows by FK, so seed them and build the request body
    // from the ids that were actually created rather than from magic numbers.
    const { sampleIds, testIds } = await seedLabCatalogue(context.staff.id);
    tests = [
      {
        test_id: testIds[0],
        test_type: 'CASH',
        sample_id: sampleIds[0],
        price: 200,
        is_urgent: false,
        source: 'Consultation',
      },
      {
        test_id: testIds[1],
        test_type: 'NHIS',
        sample_id: sampleIds[0],
        price: 250,
        is_urgent: true,
        source: 'Consultation',
      },
      {
        test_id: testIds[2],
        test_type: 'CASH',
        sample_id: sampleIds[1],
        price: 150,
        is_urgent: false,
        source: 'Consultation',
      },
    ];
  }, 14000);
  afterAll(async () => {
    await cleanUpOrderFixtures();
  });

  it('should order a lab test', async () => {
    const res = await request(server)
      .post(`/api/orders/laboratory/create/${visit_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tests,
      });
    expect(res.status).toBe(201);
    await expect(res.body.data).toHaveLength(3);
    await expect(res.body.data[0]).toHaveProperty('id');
  }, 10000);
});
