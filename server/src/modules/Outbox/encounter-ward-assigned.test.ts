import {
  buildEncounterWardAssignedEvent,
  encounterWardAssignedIdempotencyKey,
} from './event-builder';

/**
 * `encounter.ward.assigned` must satisfy the Accounting receiver's guard
 * (`encounterWardAssignedBodySchema` = `{ ward: z.string().min(1).max(64) }`, REQUIRED) and the
 * sequence-qualified key that lets one stay emit several of these (#330, ADR-0050).
 */

const context = {
  tenantKey: 'lagoon_general',
  sequence: 7,
  occurredAt: new Date('2026-07-26T10:00:00.000Z'),
  sentAt: new Date('2026-07-26T10:00:01.000Z'),
};

function bodyOf(row: ReturnType<typeof buildEncounterWardAssignedEvent>) {
  const payload = row.payload as { body: { ward?: unknown } };
  return payload.body;
}

describe('encounterWardAssignedIdempotencyKey', () => {
  it('carries the sequence, so admission and every transfer are distinct at the UNIQUE index', () => {
    expect(encounterWardAssignedIdempotencyKey(8891, 7)).toBe('encounter-ward-assigned:8891:7');
    expect(encounterWardAssignedIdempotencyKey(8891, 8)).not.toBe(
      encounterWardAssignedIdempotencyKey(8891, 7)
    );
  });

  it('treats a numeric and string visit id as the same visit', () => {
    expect(encounterWardAssignedIdempotencyKey(8891, 7)).toBe(
      encounterWardAssignedIdempotencyKey('8891', '7')
    );
  });
});

describe('buildEncounterWardAssignedEvent', () => {
  it('emits the ward label as the whole body', () => {
    const row = buildEncounterWardAssignedEvent({ visit_id: 8891, ward: 'Medical ward' }, context);

    expect(bodyOf(row)).toEqual({ ward: 'Medical ward' });
    expect(row.event_type).toBe('encounter.ward.assigned');
    expect(row.aggregate_type).toBe('encounter');
    expect(row.idempotency_key).toBe('encounter-ward-assigned:8891:7');
  });

  it('addresses the encounter aggregate the same way encounter.opened does', () => {
    const row = buildEncounterWardAssignedEvent({ visit_id: 8891, ward: 'ICU' }, context);

    // The receiver matches on `external_encounter_id`; a different shape here would anchor a
    // second, parallel row for the same stay.
    expect(row.aggregate_id).toBe('visit:8891');
  });

  it('truncates a ward name too long for the receiver rather than losing the event', () => {
    // `Wards.name` is varchar(255); Accounting caps `ward` at 64 and DEAD_LETTERS a longer body.
    const row = buildEncounterWardAssignedEvent({ visit_id: 8891, ward: 'W'.repeat(100) }, context);

    expect(bodyOf(row).ward).toBe('W'.repeat(64));
  });

  it('keeps a name of exactly the limit intact', () => {
    const row = buildEncounterWardAssignedEvent({ visit_id: 8891, ward: 'W'.repeat(64) }, context);

    expect(bodyOf(row).ward).toBe('W'.repeat(64));
  });

  it('trims surrounding whitespace, which would otherwise eat the length budget', () => {
    const row = buildEncounterWardAssignedEvent(
      { visit_id: 8891, ward: '  Medical ward  ' },
      context
    );

    expect(bodyOf(row).ward).toBe('Medical ward');
  });

  it('refuses an empty ward rather than emitting a body the receiver will dead-letter', () => {
    expect(() => buildEncounterWardAssignedEvent({ visit_id: 8891, ward: '   ' }, context)).toThrow(
      /ward/i
    );
  });

  it('carries no demographic content', () => {
    const row = buildEncounterWardAssignedEvent({ visit_id: 8891, ward: 'Medical ward' }, context);

    // A ward is a PLACE, so it passes `assertNoDemographics` — but nothing else may ride along.
    expect(Object.keys(bodyOf(row))).toEqual(['ward']);
  });

  it('emits the sequence it was given, which is what orders a transfer after an admission', () => {
    const admission = buildEncounterWardAssignedEvent(
      { visit_id: 8891, ward: 'Medical ward' },
      { ...context, sequence: 3 }
    );
    const transfer = buildEncounterWardAssignedEvent(
      { visit_id: 8891, ward: 'ICU' },
      { ...context, sequence: 4 }
    );

    const admissionPayload = admission.payload as { sequence: number };
    const transferPayload = transfer.payload as { sequence: number };

    expect(admissionPayload.sequence).toBe(3);
    expect(transferPayload.sequence).toBe(4);
    expect(transfer.idempotency_key).not.toBe(admission.idempotency_key);
  });
});
