/* eslint-disable camelcase */
import '../../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../../database/config/data-source';
import { OutboxEvent } from '../../../database/models/outboxEvent';
import { OutboxSequence } from '../../../database/models/outboxSequence';
import { Default, Patient, SystemSettings } from '../../../database/models';
import { DefaultType } from '../../../database/enums';
import PharmacyOrderService from './pharmacy-order.service';
import { createVisitContext, cleanUpOrderFixtures } from '../__fixtures__/order-fixtures';

/**
 * Gross pricing at the prescribing path (#90).
 *
 * The claim is about the row the EMR writes and the event it emits, so this runs the real service
 * against MySQL rather than a mock: an NHIS line must store `selling_price × quantity_to_dispense`
 * with no 0.1 reduction, and `charge.captured` must carry the same amount and quantity.
 */
describe('pharmacy gross pricing', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  let context;
  let ids;

  beforeAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    context = await createVisitContext();

    const insert = async (sql: string, replacements: Record<string, unknown>) => {
      try {
        return ((await sequelizeConnection.query(sql, {
          replacements,
          type: QueryTypes.INSERT,
        })) as unknown) as [number, number];
      } catch (error) {
        // Jest prints only the stack for this Sequelize error; surface the SQL reason.
        // eslint-disable-next-line no-console
        console.error('insert failed:', sql, (error as any).original?.sqlMessage || error);
        throw error;
      }
    };

    const [insuranceId] = await insert(
      `INSERT INTO Insurances (name, createdAt, updatedAt) VALUES ('NHIS', NOW(), NOW())`,
      {}
    );
    const [hmoId] = await insert(
      `INSERT INTO HMOs (name, insurance_id, createdAt, updatedAt)
       VALUES ('Test HMO', :insuranceId, NOW(), NOW())`,
      { insuranceId }
    );
    await insert(
      `INSERT INTO Patient_Insurances
         (patient_id, insurance_id, hmo_id, is_default, createdAt, updatedAt)
       VALUES (:patientId, :insuranceId, :hmoId, 1, NOW(), NOW())`,
      { patientId: context.patient.id, insuranceId, hmoId }
    );

    const stamp = Date.now();
    const [inventoryId] = await insert(
      `INSERT INTO Inventories (name, accepted_drug_type, createdAt, updatedAt)
       VALUES (CONCAT('NHIS Store ', :stamp), 'NHIS Drug', NOW(), NOW())`,
      { stamp }
    );
    const [
      unitId,
    ] = await insert(
      `INSERT INTO Units (name, createdAt, updatedAt) VALUES (CONCAT('TestUnit-', :stamp), NOW(), NOW())`,
      { stamp }
    );
    const [
      dosageFormId,
    ] = await insert(
      `INSERT INTO Dosage_Forms (name, createdAt, updatedAt) VALUES (CONCAT('TestForm-', :stamp), NOW(), NOW())`,
      { stamp }
    );
    const [strengthId] = await insert(
      `INSERT INTO Measurements (name, dosage_form_id, createdAt, updatedAt)
       VALUES (CONCAT('500mg-', :stamp), :dosageFormId, NOW(), NOW())`,
      { dosageFormId, stamp }
    );
    const [routeId] = await insert(
      `INSERT INTO Route_of_Administrations (name, dosage_form_id, createdAt, updatedAt)
       VALUES (CONCAT('Oral-', :stamp), :dosageFormId, NOW(), NOW())`,
      { dosageFormId, stamp }
    );
    const [drugId] = await insert(
      `INSERT INTO Drugs (name, type, code, createdAt, updatedAt)
       VALUES ('Test Paracetamol', 'Drug', :code, NOW(), NOW())`,
      { code: `T90-${Date.now()}` }
    );
    await insert(
      `INSERT INTO Inventory_Items
         (inventory_id, drug_id, quantity_received, quantity_remaining, unit_id, selling_price,
          acquired_price, expiration, drug_form, drug_type, date_received, createdAt, updatedAt)
       VALUES (:inventoryId, :drugId, 100, 100, :unitId, '123.45', '50.00', '2030-01-01',
               'Drug', 'NHIS', NOW(), NOW(), NOW())`,
      { inventoryId, drugId, unitId }
    );

    const [syringeDrugId] = await insert(
      `INSERT INTO Drugs (name, type, code, createdAt, updatedAt)
       VALUES ('2 mls Syringe', 'Consumable', :code, NOW(), NOW())`,
      { code: `T90-SYR-${Date.now()}` }
    );
    await insert(
      `INSERT INTO Inventory_Items
         (inventory_id, drug_id, quantity_received, quantity_remaining, unit_id, selling_price,
          acquired_price, expiration, drug_form, drug_type, date_received, createdAt, updatedAt)
       VALUES (:inventoryId, :syringeDrugId, 100, 100, :unitId, '10.00', '5.00', '2030-01-01',
               'Consumable', 'NHIS', NOW(), NOW(), NOW())`,
      { inventoryId, syringeDrugId, unitId }
    );
    await Default.destroy({ where: { type: DefaultType.INJECTION_ITEMS } });
    await Default.create({
      type: DefaultType.INJECTION_ITEMS,
      data: [
        {
          id: `injection-${Date.now()}`,
          drug: {
            name: '2 mls Syringe',
            drug_id: syringeDrugId,
            unit_id: unitId,
            price: 10,
            drug_type: 'NHIS',
          },
          quantity: 1,
        },
      ],
    } as never);
    await Patient.update({ has_insurance: true }, { where: { id: context.patient.id } });

    await SystemSettings.destroy({ where: {} });
    await SystemSettings.create({
      name_of_organization: 'Test Hospital',
      nhis_daily_quota_amount: 1000000,
    } as never);

    ids = {
      insuranceId,
      hmoId,
      inventoryId,
      unitId,
      dosageFormId,
      strengthId,
      routeId,
      drugId,
      syringeDrugId,
    };
  }, 30000);

  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await OutboxEvent.destroy({ where: { event_type: 'charge.captured' } });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });

    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(
        'DELETE FROM Prescribed_Drugs WHERE patient_id = :patientId',
        {
          replacements: { patientId: context.patient.id },
          transaction,
        }
      );
      await sequelizeConnection.query(
        'DELETE FROM Drug_Prescriptions WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query(
        'DELETE FROM Patient_Insurances WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query('DELETE FROM Inventory_Items WHERE inventory_id = :id', {
        replacements: { id: ids.inventoryId },
        transaction,
      });
      await sequelizeConnection.query(
        'DELETE FROM Additional_item_prescriptions WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await Default.destroy({ where: { type: DefaultType.INJECTION_ITEMS } });
      for (const [table, id] of [
        ['Drugs', ids.drugId],
        ['Drugs', ids.syringeDrugId],
        ['Units', ids.unitId],
        ['Dosage_Forms', ids.dosageFormId],
        ['Measurements', ids.strengthId],
        ['Route_of_Administrations', ids.routeId],
        ['Inventories', ids.inventoryId],
        ['HMOs', ids.hmoId],
        ['Insurances', ids.insuranceId],
      ]) {
        await sequelizeConnection.query(`DELETE FROM ${table} WHERE id = :id`, {
          replacements: { id },
          transaction,
        });
      }
    });

    await cleanUpOrderFixtures();
    await SystemSettings.destroy({ where: {} });
    await sequelizeConnection.close();
  });

  it('stores selling_price × quantity_to_dispense and emits the same amount and quantity', async () => {
    const body = [
      {
        drug_id: ids.drugId,
        drug_name: 'Test Paracetamol',
        drug_type: 'NHIS',
        inventory_id: ids.inventoryId,
        quantity_prescribed: 10,
        quantity_to_dispense: 3,
        dosage_form_id: ids.dosageFormId,
        dosage_form_name: 'Tablet',
        route_id: ids.routeId,
        frequency: 'BD',
        strength_id: ids.strengthId,
        prescribed_strength: '500mg',
        duration: 5,
        duration_unit: 'Days',
        total_price: 1,
        drug_group: 'Primary',
        start_date: new Date().toISOString(),
        source: 'Consultation',
      },
    ];

    const [drug] = await PharmacyOrderService.prescribedBulkDrugs(
      body as never,
      context.staff.id,
      context.visit_id
    ).catch(error => {
      console.error('prescribedBulkDrugs failed:', error);
      throw error;
    });

    // 123.45 × 3 = 370.35, with no 10% reduction.
    expect(Number(drug.total_price)).toBe(370.35);
    expect(Number(drug.original_total_price)).toBe(370.35);

    const event = await OutboxEvent.findOne({
      where: { idempotency_key: `charge:drug:${drug.id}` },
    });
    const payload = event?.payload.body as Record<string, unknown>;
    expect(payload.amount_kobo).toBe('37035');
    expect(payload.quantity).toBe(3);
  }, 20000);

  it('raises an NHIS-typed line with no insurance row as Cash at the full price', async () => {
    await sequelizeConnection.query(
      `UPDATE Patient_Insurances SET is_default = 0 WHERE patient_id = :patientId`,
      { replacements: { patientId: context.patient.id } }
    );

    const body = [
      {
        drug_id: ids.drugId,
        drug_name: 'Test Paracetamol',
        drug_type: 'NHIS',
        inventory_id: ids.inventoryId,
        quantity_prescribed: 2,
        quantity_to_dispense: 2,
        dosage_form_id: ids.dosageFormId,
        dosage_form_name: 'Tablet',
        route_id: ids.routeId,
        frequency: 'BD',
        strength_id: ids.strengthId,
        prescribed_strength: '500mg',
        duration: 5,
        duration_unit: 'Days',
        total_price: 1,
        drug_group: 'Primary',
        start_date: new Date().toISOString(),
        source: 'Consultation',
      },
    ];

    const [drug] = await PharmacyOrderService.prescribedBulkDrugs(
      body as never,
      context.staff.id,
      context.visit_id
    );

    expect(drug.drug_type).toBe('Cash');
    expect(drug.nhis_status).toBeNull();
    expect(Number(drug.total_price)).toBe(246.9);
  }, 20000);

  it('creates two consumable lines for two injections, each with its own charge.captured', async () => {
    const injection = {
      drug_id: ids.drugId,
      drug_name: 'Test Paracetamol',
      drug_type: 'NHIS',
      inventory_id: ids.inventoryId,
      quantity_prescribed: 10,
      quantity_to_dispense: 10,
      dosage_form_id: ids.dosageFormId,
      dosage_form_name: 'Injection',
      route_id: ids.routeId,
      frequency: 'BD',
      strength_id: ids.strengthId,
      prescribed_strength: '2',
      duration: 5,
      duration_unit: 'Days',
      total_price: 1,
      drug_group: 'Primary',
      start_date: new Date().toISOString(),
      source: 'Consultation',
    };

    const drugs = await PharmacyOrderService.prescribedBulkDrugs(
      [injection, injection] as never,
      context.staff.id,
      context.visit_id
    );
    expect(drugs).toHaveLength(2);

    const items = await sequelizeConnection.query(
      `SELECT id, total_price FROM Additional_item_prescriptions
       WHERE patient_id = :patientId AND drug_id = :drugId
       ORDER BY id ASC`,
      {
        replacements: { patientId: context.patient.id, drugId: ids.syringeDrugId },
        type: QueryTypes.SELECT,
      }
    );
    expect(items).toHaveLength(2);

    const keys = await OutboxEvent.findAll({
      where: { event_type: 'charge.captured' },
      attributes: ['idempotency_key'],
    });
    for (const item of items as Array<{ id: number; total_price: string }>) {
      expect(Number(item.total_price)).toBe(100);
      expect(keys.map(key => key.idempotency_key)).toContain(`charge:additional_item:${item.id}`);
    }
  }, 20000);
});
