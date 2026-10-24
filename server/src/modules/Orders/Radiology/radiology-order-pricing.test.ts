/* eslint-disable camelcase */
import '../../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../../database/config/data-source';
import { OutboxEvent } from '../../../database/models/outboxEvent';
import { OutboxSequence } from '../../../database/models/outboxSequence';
import { RadiologyOrderService } from './radiology-order.service';
import { cleanUpOrderFixtures, createVisitContext } from '../__fixtures__/order-fixtures';

/**
 * Insured investigations send the cash price (#90); `nhis_price` is not selected at prescription.
 */
describe('radiology order cash pricing', () => {
  let context;
  let imagingId;
  let investigationId;
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
    const [imaging] = ((await sequelizeConnection.query(
      `INSERT INTO Imagings (name, createdAt, updatedAt)
       VALUES (CONCAT('X-Ray-', :stamp), NOW(), NOW())`,
      { replacements: { stamp: Date.now() }, type: QueryTypes.INSERT }
    )) as unknown) as [number, number];
    const [investigation] = ((await sequelizeConnection.query(
      `INSERT INTO Investigations (name, code, price, type, imaging_id, nhis_price, createdAt, updatedAt)
       VALUES (CONCAT('Chest-', :stamp), CONCAT('INV-90-', :stamp), '500.00', 'Primary',
               :imagingId, '999.00', NOW(), NOW())`,
      {
        replacements: { stamp: Date.now(), imagingId: imaging },
        type: QueryTypes.INSERT,
      }
    )) as unknown) as [number, number];

    insuranceId = insurance;
    hmoId = hmo;
    imagingId = imaging;
    investigationId = investigation;
  }, 30000);

  afterAll(async () => {
    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(
        'DELETE FROM Prescribed_Investigations WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query(
        'DELETE FROM Investigation_Prescriptions WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query(
        'DELETE FROM Patient_Insurances WHERE patient_id = :patientId',
        { replacements: { patientId: context.patient.id }, transaction }
      );
      await sequelizeConnection.query('DELETE FROM Investigations WHERE id = :id', {
        replacements: { id: investigationId },
        transaction,
      });
      await sequelizeConnection.query('DELETE FROM Imagings WHERE id = :id', {
        replacements: { id: imagingId },
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

  it('stores the request price on an insured investigation, not nhis_price', async () => {
    const [investigation] = await RadiologyOrderService.orderBulkInvestigationService({
      staff_id: context.staff.id,
      visit_id: context.visit_id,
      investigations: [
        {
          investigation_id: investigationId,
          imaging_id: imagingId,
          investigation_type: 'NHIS',
          price: 250,
          is_urgent: false,
          source: 'Consultation',
          name: 'Chest X-Ray',
        },
      ],
    } as never);

    expect(Number(investigation.price)).toBe(250);
    expect(investigation.investigation_type).toBe('NHIS');
  }, 20000);
});
