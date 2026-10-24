/* eslint-disable camelcase */
import '../../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../../database/config/data-source';
import { OutboxEvent } from '../../../database/models/outboxEvent';
import { OutboxSequence } from '../../../database/models/outboxSequence';
import { LabOrderService } from './lab-order.service';
import {
  cleanUpOrderFixtures,
  createVisitContext,
  seedLabCatalogue,
} from '../__fixtures__/order-fixtures';

/**
 * Insured tests send the cash price (#90). Accounting owns the payer tariff via its item rules;
 * the EMR must not pre-select `nhis_price`.
 */
describe('lab order cash pricing', () => {
  let context;
  let catalogue;
  let insuranceId;
  let hmoId;

  beforeAll(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
    context = await createVisitContext();
    catalogue = await seedLabCatalogue(context.staff.id);

    const [
      insurance,
    ] = ((await sequelizeConnection.query(
      `INSERT INTO Insurances (name, createdAt, updatedAt) VALUES ('NHIS', NOW(), NOW())`,
      { type: QueryTypes.INSERT }
    )) as unknown) as [number, number];
    const [hmo] = ((await sequelizeConnection.query(
      `INSERT INTO HMOs (name, insurance_id, createdAt, updatedAt)
       VALUES ('Test HMO', :insuranceId, NOW(), NOW())`,
      { replacements: { insuranceId: insurance }, type: QueryTypes.INSERT }
    )) as unknown) as [number, number];
    await sequelizeConnection.query(
      `INSERT INTO Patient_Insurances
         (patient_id, insurance_id, hmo_id, is_default, createdAt, updatedAt)
       VALUES (:patientId, :insuranceId, :hmoId, 1, NOW(), NOW())`,
      {
        replacements: { patientId: context.patient.id, insuranceId: insurance, hmoId: hmo },
        type: QueryTypes.INSERT,
      }
    );

    // A tariff that must be ignored by the EMR now.
    await sequelizeConnection.query(`UPDATE Tests SET nhis_price = '999.00' WHERE id = :testId`, {
      replacements: { testId: catalogue.testIds[0] },
    });

    insuranceId = insurance;
    hmoId = hmo;
  }, 30000);

  afterAll(async () => {
    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(
        'DELETE FROM Patient_Insurances WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query('DELETE FROM HMOs WHERE id = :id', {
        replacements: { id: hmoId },
        transaction,
      });
      await sequelizeConnection.query('DELETE FROM Insurances WHERE id = :id', {
        replacements: { id: insuranceId },
        transaction,
      });
    });
    await cleanUpOrderFixtures();
    await sequelizeConnection.close();
  });

  it('stores the request price on an insured test, not nhis_price', async () => {
    const [test] = await LabOrderService.orderBulkTestService({
      staff_id: context.staff.id,
      visit_id: context.visit_id,
      tests: [
        {
          test_id: catalogue.testIds[0],
          sample_id: catalogue.sampleIds[0],
          test_type: 'NHIS',
          price: 250,
          is_urgent: false,
          source: 'Consultation',
        },
      ],
    } as never);

    expect(Number(test.price)).toBe(250);
    expect(test.test_type).toBe('NHIS');
  }, 20000);
});
