/* eslint-disable camelcase */
import '../../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../../database/config/data-source';
import { OutboxEvent } from '../../../database/models/outboxEvent';
import { OutboxSequence } from '../../../database/models/outboxSequence';
import { ServiceOrderService } from './service-order.service';
import { cleanUpOrderFixtures, createVisitContext } from '../__fixtures__/order-fixtures';

/**
 * Service lines use one basis: price is the LINE TOTAL, cash unit price × quantity (#90). The
 * payer's tariff lives in Accounting, not in the EMR.
 */
describe('service order line-total pricing', () => {
  let context;
  let serviceId;
  let insuranceId;
  let hmoId;

  beforeAll(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
    context = await createVisitContext();

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
    const [service] = ((await sequelizeConnection.query(
      `INSERT INTO Services (name, price, code, createdAt, updatedAt)
       VALUES (CONCAT('Consultation-', :stamp), '200.00', CONCAT('SVC-', :stamp), NOW(), NOW())`,
      { replacements: { stamp: Date.now() }, type: QueryTypes.INSERT }
    )) as unknown) as [number, number];

    insuranceId = insurance;
    hmoId = hmo;
    serviceId = service;
  }, 30000);

  afterAll(async () => {
    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(
        'DELETE FROM Prescribed_Services WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query(
        'DELETE FROM Patient_Insurances WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query('DELETE FROM Services WHERE id = :id', {
        replacements: { id: serviceId },
        transaction,
      });
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

  it('stores cash unit price × quantity, not a tariff unit price', async () => {
    const [service] = await ServiceOrderService.orderBulkService({
      staff_id: context.staff.id,
      visit_id: context.visit_id,
      services: [
        {
          service_id: serviceId,
          service_type: 'NHIS',
          price: 200,
          quantity: 3,
          is_urgent: false,
          source: 'Consultation',
        },
      ],
    } as never);

    expect(Number(service.price)).toBe(600);
  }, 20000);
});
