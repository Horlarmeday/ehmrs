import { Transaction } from 'sequelize';
import { VisitStatus } from '../../database/enums';
import { Visit } from '../../database/models/visit';
import {
  claimSequences,
  emitChargeVoidedForVisit,
  emitEncounterClosed,
  getQualifyingVoidableLinesForVisit,
  isOutboxEnabled,
} from './outbox-writer';
import { visitAggregateId } from './event-builder';

export async function endVisitAndEmitOutboxEvents(
  visit: Pick<Visit, 'id'>,
  occurredAt: Date,
  transaction: Transaction
): Promise<void> {
  await Visit.update(
    { status: VisitStatus.ENDED, date_visit_ended: occurredAt },
    { where: { id: visit.id }, transaction }
  );

  if (!isOutboxEnabled()) {
    return;
  }

  const lines = await getQualifyingVoidableLinesForVisit(visit.id, transaction);
  const totalEvents = lines.length + 1;
  const aggregateId = visitAggregateId(visit.id);
  const endSequence = await claimSequences(aggregateId, totalEvents, transaction);
  const startSequence = endSequence - totalEvents + 1;

  await emitChargeVoidedForVisit(visit.id, occurredAt, transaction, startSequence);

  const closeSequence = startSequence + lines.length;
  await emitEncounterClosed(visit.id, occurredAt, transaction, closeSequence);
}
