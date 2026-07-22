/* eslint-disable camelcase */
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../../core/startup/server';

import request from 'supertest';

import { OutboxEvent } from '../../../database/models/outboxEvent';
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

  it('emits one charge.captured per test into the outbox when enabled', async () => {
    const original = process.env.EMR_OUTBOX_ENABLED;
    process.env.EMR_OUTBOX_ENABLED = 'true';
    try {
      await OutboxEvent.destroy({ where: {}, truncate: true, force: true });

      const res = await request(server)
        .post(`/api/orders/laboratory/create/${visit_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tests });
      expect(res.status).toBe(201);

      const events = await OutboxEvent.findAll();
      // One event per test, atomic with the prescribed-line write (they share the transaction).
      expect(events).toHaveLength(3);
      expect(events.every(e => e.event_type === 'charge.captured')).toBe(true);
      expect(events.every(e => e.aggregate_id === `visit:${visit_id}`)).toBe(true);
      // Money crossed as a string of integer kobo, never a number.
      const body = events[0].payload.body as Record<string, unknown>;
      expect(typeof body.amount_kobo).toBe('string');
    } finally {
      process.env.EMR_OUTBOX_ENABLED = original;
      await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    }
  }, 10000);
});
