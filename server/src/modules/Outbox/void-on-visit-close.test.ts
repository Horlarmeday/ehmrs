import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { VisitCategory, VisitStatus, PaymentStatus } from '../../database/enums';
import { Patient } from '../../database/models/patient';
import { Service } from '../../database/models/service';
import { Visit } from '../../database/models/visit';
import { PrescribedService } from '../../database/models/prescribedService';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { emitChargeVoidedForVisit, emitEncounterClosed } from './outbox-writer';
import { endVisitAndEmitOutboxEvents } from './visit-close-emission';

jest.mock('./outbox-writer', () => {
  const actual = jest.requireActual('./outbox-writer');
  return {
    ...actual,
    emitEncounterClosed: jest.fn(actual.emitEncounterClosed),
    emitChargeVoidedForVisit: jest.fn(actual.emitChargeVoidedForVisit),
  };
});

const mockedEmitEncounterClosed = emitEncounterClosed as jest.MockedFunction<
  typeof emitEncounterClosed
>;

afterAll(async () => {
  await sequelizeConnection.close();
});

describe('void on visit close (integration)', () => {
  jest.setTimeout(30000);

  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  let patientId: number;
  let visitId: number;
  let serviceId: number;
  const occurredAt = new Date('2026-08-01T10:00:00.000Z');

  beforeAll(async () => {
    const patient = await Patient.create({
      firstname: 'Void',
      lastname: 'Test',
      gender: 'Male',
      phone: '08000000001',
      address: 'N/A',
      country: 'Nigeria',
      state: 'Lagos',
      lga: 'Ikeja',
      date_of_birth: new Date('1990-01-01'),
    } as never);
    patientId = patient.id;

    const visit = await Visit.create({
      patient_id: patientId,
      category: VisitCategory.OPD,
      date_visit_start: new Date(),
      department: 'OPD',
      professional: 'Dr Test',
      type: 'New',
      status: VisitStatus.ONGOING,
    } as never);
    visitId = visit.id;

    const service = await Service.create({
      name: 'Void Test Service',
      price: 1000,
      code: 'VTS-001',
    } as never);
    serviceId = service.id;
  });

  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await PrescribedService.destroy({ where: { visit_id: visitId }, force: true });
    await Visit.destroy({ where: { id: visitId }, force: true });
    await Service.destroy({ where: { id: serviceId }, force: true });
    await Patient.destroy({ where: { id: patientId }, force: true });
  });

  beforeEach(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    mockedEmitEncounterClosed.mockImplementation(
      jest.requireActual('./outbox-writer').emitEncounterClosed
    );
    await OutboxEvent.destroy({ where: {}, force: true });
    await OutboxSequence.destroy({ where: {}, force: true });
    await PrescribedService.destroy({ where: { visit_id: visitId }, force: true });
    await Visit.update(
      { status: VisitStatus.ONGOING, date_visit_ended: null },
      { where: { id: visitId } }
    );
  });

  it('emits charge.voided for qualifying lines and encounter.closed last', async () => {
    const pendingService = await PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 1000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
      payment_status: PaymentStatus.PENDING,
    } as never);
    await PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 2000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
      payment_status: PaymentStatus.PAID,
    } as never);

    const t = await sequelizeConnection.transaction();
    await emitChargeVoidedForVisit(visitId, occurredAt, t);
    await emitEncounterClosed(visitId, occurredAt, t);
    await t.commit();

    const voidRow = await OutboxEvent.findOne({
      where: { idempotency_key: `charge-voided:service:${pendingService.id}` },
    });
    const closeRow = await OutboxEvent.findOne({
      where: { idempotency_key: `encounter-closed:${visitId}` },
    });

    expect(voidRow).not.toBeNull();
    expect(closeRow).not.toBeNull();
    expect(Number(voidRow?.sequence)).toBeLessThan(Number(closeRow?.sequence));
    expect(
      await OutboxEvent.count({
        where: { event_type: 'charge.voided', aggregate_id: `visit:${visitId}` },
      })
    ).toBe(1);
  });

  it('is idempotent when the emit path runs twice', async () => {
    const pendingService = await PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 1000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
      payment_status: PaymentStatus.PENDING,
    } as never);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const t = await sequelizeConnection.transaction();
      await emitChargeVoidedForVisit(visitId, occurredAt, t);
      await emitEncounterClosed(visitId, occurredAt, t);
      await t.commit();
    }

    expect(
      await OutboxEvent.count({
        where: { idempotency_key: `charge-voided:service:${pendingService.id}` },
      })
    ).toBe(1);
    expect(
      await OutboxEvent.count({ where: { idempotency_key: `encounter-closed:${visitId}` } })
    ).toBe(1);
  });

  it('rolls back the visit end and outbox rows when emission fails', async () => {
    await PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 1000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
      payment_status: PaymentStatus.PENDING,
    } as never);

    mockedEmitEncounterClosed.mockRejectedValueOnce(new Error('forced failure'));

    const visit = await Visit.findByPk(visitId);
    await expect(
      sequelizeConnection.transaction(transaction =>
        endVisitAndEmitOutboxEvents(visit as Visit, occurredAt, transaction)
      )
    ).rejects.toThrow('forced failure');

    const reloaded = await Visit.findByPk(visitId);
    expect(reloaded?.status).toBe(VisitStatus.ONGOING);
    expect(await OutboxEvent.count({ where: { aggregate_id: `visit:${visitId}` } })).toBe(0);
  });

  it('ends the visit with zero outbox rows when the flag is off', async () => {
    process.env.EMR_OUTBOX_ENABLED = 'false';

    await PrescribedService.create({
      service_id: serviceId,
      service_type: 'Cash',
      price: 1000,
      patient_id: patientId,
      visit_id: visitId,
      date_requested: new Date(),
      payment_status: PaymentStatus.PENDING,
    } as never);

    const visit = await Visit.findByPk(visitId);
    await sequelizeConnection.transaction(transaction =>
      endVisitAndEmitOutboxEvents(visit as Visit, occurredAt, transaction)
    );

    const reloaded = await Visit.findByPk(visitId);
    expect(reloaded?.status).toBe(VisitStatus.ENDED);
    expect(await OutboxEvent.count({ where: { aggregate_id: `visit:${visitId}` } })).toBe(0);

    process.env.EMR_OUTBOX_ENABLED = 'true';
  });
});
