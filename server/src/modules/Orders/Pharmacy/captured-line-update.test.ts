/* eslint-disable camelcase */
import '../../../core/config/env';
import { sequelizeConnection } from '../../../database/config/data-source';
import { OutboxEvent } from '../../../database/models/outboxEvent';
import { PrescribedDrug } from '../../../database/models/prescribedDrug';
import { PrescribedAdditionalItem } from '../../../database/models/prescribedAdditionalItem';
import { BadException } from '../../../common/util/api-error';
import { updateAdditionalItem, updatePrescribedDrug } from './pharmacy-order.repository';

/**
 * Once `charge.captured` exists, the amount Accounting billed is frozen. A caller may still update
 * every other field (approval, payment/billing status, notes…), but a price or quantity change must
 * be refused; creating a new line is the only correct way to add quantity.
 */
const DRUG_ID = 990201;
const ITEM_ID = 990202;

async function seedDrug(): Promise<void> {
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(
      `INSERT INTO Prescribed_Drugs
         (id, drug_id, dosage_form_id, drug_type, quantity_prescribed, quantity_to_dispense,
          quantity_dispensed, route_id, frequency, strength_id, duration, total_price, examiner,
          date_prescribed, prescribed_strength, duration_unit, visit_id, patient_id, start_date,
          drug_prescription_id, inventory_id, payment_status, createdAt, updatedAt)
       VALUES
         (:id, 1, 1, 'Cash', 5, 3, 0, 1, 'BD', 1, 5, '300.00', 1, NOW(), '500mg', 'days',
          8891, 100, NOW(), 1, 1, 'Pending', NOW(), NOW())`,
      { replacements: { id: DRUG_ID }, transaction }
    );
  });
}

async function seedItem(): Promise<void> {
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(
      `INSERT INTO Additional_item_prescriptions
         (id, drug_id, drug_type, quantity_prescribed, quantity_to_dispense, drug_form,
          total_price, examiner, date_prescribed, visit_id, patient_id, unit_id, inventory_id,
          createdAt, updatedAt)
       VALUES
         (:id, 1, 'Cash', 5, 3, 'Consumable', '150.00', 1, NOW(), 8891, 100, 1, 1, NOW(), NOW())`,
      { replacements: { id: ITEM_ID }, transaction }
    );
  });
}

async function capture(type: string, id: number): Promise<void> {
  await OutboxEvent.create({
    aggregate_type: 'encounter',
    aggregate_id: 'visit:8891',
    sequence: 1,
    event_type: 'charge.captured',
    event_version: 1,
    idempotency_key: `charge:${type}:${id}`,
    payload: { body: {} },
    attempts: 0,
  } as never);
}

async function cleanup(): Promise<void> {
  await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query('DELETE FROM Prescribed_Drugs WHERE id = :id', {
      replacements: { id: DRUG_ID },
      transaction,
    });
    await sequelizeConnection.query('DELETE FROM Additional_item_prescriptions WHERE id = :id', {
      replacements: { id: ITEM_ID },
      transaction,
    });
  });
}

describe('captured-line immutability', () => {
  beforeEach(async () => {
    await cleanup();
    await seedDrug();
    await seedItem();
    await capture('drug', DRUG_ID);
    await capture('additional_item', ITEM_ID);
  });

  afterAll(async () => {
    await cleanup();
    await sequelizeConnection.close();
  });

  it('rejects a total_price change on a captured drug', async () => {
    await expect(
      updatePrescribedDrug({ id: DRUG_ID, total_price: 999 as never })
    ).rejects.toBeInstanceOf(BadException);
    expect(Number((await PrescribedDrug.findByPk(DRUG_ID)).total_price)).toBe(300);
  });

  it('rejects a quantity change on a captured drug', async () => {
    await expect(
      updatePrescribedDrug({ id: DRUG_ID, quantity_to_dispense: 9 })
    ).rejects.toBeInstanceOf(BadException);
  });

  it('accepts an unchanged price and every other field', async () => {
    const updated = await updatePrescribedDrug({
      id: DRUG_ID,
      total_price: 300 as never,
      nhis_status: 'Approved' as never,
      payment_status: 'Cleared' as never,
      billing_status: 'Billed' as never,
    });

    expect(updated.nhis_status).toBe('Approved');
    expect(updated.payment_status).toBe('Cleared');
    expect(updated.billing_status).toBe('Billed');
    expect(Number(updated.total_price)).toBe(300);
  });

  it('rejects a total_price change on a captured additional item', async () => {
    await expect(
      updateAdditionalItem({ id: ITEM_ID, total_price: 999 as never })
    ).rejects.toBeInstanceOf(BadException);
    expect(Number((await PrescribedAdditionalItem.findByPk(ITEM_ID)).total_price)).toBe(150);
  });

  it('strips inbox-owned split columns from update bodies', async () => {
    await updatePrescribedDrug({ id: DRUG_ID, patient_net: 123 } as never);
    expect((await PrescribedDrug.findByPk(DRUG_ID)).patient_net).toBeNull();
  });
});
