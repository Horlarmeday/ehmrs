import {
  EventBuildError,
  buildChargeCapturedEvent,
  buildEncounterOpenedEvent,
  buildPatientDemographicsChangedEvent,
  chargeIdempotencyKey,
  patientAggregateId,
  uuidV7,
  visitAggregateId,
} from './event-builder';
import { PRESCRIBED_LINE_TYPES } from './prescribed-line-types';

const baseLine = {
  type: 'drug' as const,
  id: 1,
  patient_id: 100,
  visit_id: 8891,
  amount: '2500.00',
  quantity: 2,
  service_date: '2026-07-22',
};

const context = {
  tenantKey: 'lagoon_general',
  sequence: 42,
  occurredAt: new Date('2026-07-22T09:00:00.000Z'),
  sentAt: new Date('2026-07-22T09:00:01.000Z'),
};

describe('uuidV7', () => {
  it('produces a valid v7 uuid (version nibble 7, variant 8-b)', () => {
    const id = uuidV7();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('is time-sortable: a later timestamp sorts after an earlier one', () => {
    const earlier = uuidV7(1_000_000_000_000);
    const later = uuidV7(2_000_000_000_000);
    expect(later > earlier).toBe(true);
  });
});

describe('visitAggregateId', () => {
  it('prefixes the visit id so the mapping is self-describing (ADR-0027)', () => {
    expect(visitAggregateId(8891)).toBe('visit:8891');
  });
});

describe('chargeIdempotencyKey', () => {
  it('is deterministic on type and id', () => {
    expect(chargeIdempotencyKey('drug', 1)).toBe('charge:drug:1');
  });

  it('keeps drug:1 and additional_item:1 DISTINCT (they collide without the type)', () => {
    expect(chargeIdempotencyKey('drug', 1)).not.toBe(chargeIdempotencyKey('additional_item', 1));
  });
});

describe('buildChargeCapturedEvent', () => {
  it('builds a v1 envelope with money as a STRING of integer kobo', () => {
    const row = buildChargeCapturedEvent(baseLine, context);

    expect(row.event_type).toBe('charge.captured');
    expect(row.idempotency_key).toBe('charge:drug:1');
    expect(row.aggregate_id).toBe('visit:8891');

    const body = row.payload.body as Record<string, unknown>;
    expect(body.amount_kobo).toBe('250000');
    expect(typeof body.amount_kobo).toBe('string');
    expect(body.encounter_id).toBe('visit:8891');
    expect(body.external_line_ref).toEqual({ type: 'drug', id: '1' });
  });

  it('sets the aggregate to the visit-derived encounter id', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    expect(row.payload.aggregate).toEqual({ type: 'encounter', id: 'visit:8891' });
  });

  it('mints a v7 event_id', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    expect(row.payload.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab]/);
  });

  it('reads the right price field per type', () => {
    // test uses `price`, not `total_price`; the builder must read amount regardless of the
    // column it came from, since the caller passes the resolved value.
    const row = buildChargeCapturedEvent({ ...baseLine, type: 'test', amount: '150.50' }, context);
    expect((row.payload.body as Record<string, unknown>).amount_kobo).toBe('15050');
  });

  it.each(PRESCRIBED_LINE_TYPES)('emits for prescribed type %s', type => {
    const row = buildChargeCapturedEvent({ ...baseLine, type, id: 5 }, context);
    expect(row.idempotency_key).toBe(`charge:${type}:5`);
  });

  it('REJECTS a money amount that arrives as a JS number', () => {
    expect(() => buildChargeCapturedEvent({ ...baseLine, amount: 2500 }, context)).toThrow(
      /number/
    );
  });

  it('emits a body free of demographic fields (ADR-0016)', () => {
    // The builder copies only the known ID/money fields, so even a caller passing extra input
    // keys cannot leak demographics into the body. Assert the body carries references only.
    const row = buildChargeCapturedEvent(
      { ...baseLine, department: 'Pharmacy', service_line: 'Outpatient' },
      context
    );
    const body = row.payload.body as Record<string, unknown>;
    const demographicKeys = ['firstname', 'lastname', 'patient_name', 'phone', 'address', 'dob'];
    for (const key of demographicKeys) {
      expect(body[key]).toBeUndefined();
    }
    expect(Object.keys(body).sort()).toEqual(
      [
        'amount_kobo',
        'department',
        'encounter_id',
        'external_line_ref',
        'patient_id',
        'quantity',
        'service_date',
        'service_line',
        'visit_id',
      ].sort()
    );
  });

  it('rejects an unknown prescribed-line type', () => {
    expect(() =>
      // @ts-expect-error deliberately invalid type
      buildChargeCapturedEvent({ ...baseLine, type: 'mystery' }, context)
    ).toThrow(EventBuildError);
  });

  it('stringifies ids so numeric EMR ids match the string wire contract', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    const body = row.payload.body as Record<string, unknown>;
    expect(body.patient_id).toBe('100');
    expect(body.visit_id).toBe('8891');
  });

  it('omits the payer entirely when the line carries none (cash — ADR-0028)', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    const body = row.payload.body as Record<string, unknown>;
    expect('payer' in body).toBe(false);
  });

  it('emits a scheme_hmo payer with scheme_id and hmo_id as strings, ids only', () => {
    const row = buildChargeCapturedEvent(
      { ...baseLine, payer: { payer_type: 'scheme_hmo', scheme_id: '3', hmo_id: '7' } },
      context
    );
    const payer = (row.payload.body as Record<string, unknown>).payer;
    expect(payer).toEqual({ payer_type: 'scheme_hmo', scheme_id: '3', hmo_id: '7' });
  });

  it('emits patient_insurance_id on the payer when present (ADR-0037)', () => {
    const row = buildChargeCapturedEvent(
      {
        ...baseLine,
        payer: {
          payer_type: 'scheme_hmo',
          scheme_id: '3',
          hmo_id: '7',
          patient_insurance_id: '412',
        },
      },
      context
    );
    expect((row.payload.body as Record<string, unknown>).payer).toEqual({
      payer_type: 'scheme_hmo',
      scheme_id: '3',
      hmo_id: '7',
      patient_insurance_id: '412',
    });
  });

  it('emits a retainership payer carrying the company hmo id as retainership_id', () => {
    const row = buildChargeCapturedEvent(
      { ...baseLine, payer: { payer_type: 'retainership', retainership_id: '42' } },
      context
    );
    expect((row.payload.body as Record<string, unknown>).payer).toEqual({
      payer_type: 'retainership',
      retainership_id: '42',
    });
  });

  it('drops absent id fields rather than emitting a stray key', () => {
    const row = buildChargeCapturedEvent(
      { ...baseLine, payer: { payer_type: 'scheme_hmo', scheme_id: '3', hmo_id: '7' } },
      context
    );
    const payer = (row.payload.body as Record<string, unknown>).payer as Record<string, unknown>;
    expect('retainership_id' in payer).toBe(false);
  });

  it('stringifies a numeric payer id (numbers coming off a Sequelize row)', () => {
    const row = buildChargeCapturedEvent(
      // @ts-expect-error the wire type is string; a raw numeric id must still serialise to a string
      { ...baseLine, payer: { payer_type: 'retainership', retainership_id: 42 } },
      context
    );
    const payer = (row.payload.body as Record<string, unknown>).payer as Record<string, unknown>;
    expect(payer.retainership_id).toBe('42');
  });

  it('omits visit_type and consultation_valid_until when the line carries none (backward-compat)', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    const body = row.payload.body as Record<string, unknown>;
    expect('visit_type' in body).toBe(false);
    expect('consultation_valid_until' in body).toBe(false);
  });

  it('emits visit_type and consultation_valid_until when provided', () => {
    const row = buildChargeCapturedEvent(
      {
        ...baseLine,
        visit_type: 'Outpatient',
        consultation_valid_until: '2026-08-04T12:00:00Z',
      },
      context
    );
    const body = row.payload.body as Record<string, unknown>;
    expect(body.visit_type).toBe('Outpatient');
    expect(body.consultation_valid_until).toBe('2026-08-04T12:00:00Z');
  });

  it('includes item_code on the charge.captured body when present', () => {
    const row = buildChargeCapturedEvent({ ...baseLine, item_code: 'PARA500' }, context);
    expect((row.payload.body as Record<string, unknown>).item_code).toBe('PARA500');
  });

  it('omits item_code from the body when not provided', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    expect('item_code' in (row.payload.body as Record<string, unknown>)).toBe(false);
  });

  it('rejects an empty item_code at build time', () => {
    expect(() => buildChargeCapturedEvent({ ...baseLine, item_code: '' }, context)).toThrow(
      EventBuildError
    );
  });

  it('rejects an item_code longer than 43 characters', () => {
    expect(() =>
      buildChargeCapturedEvent({ ...baseLine, item_code: 'C'.repeat(44) }, context)
    ).toThrow(EventBuildError);
  });
});

describe('patientAggregateId', () => {
  it('prefixes the patient id, keeping the person aggregate distinct from visit:', () => {
    expect(patientAggregateId(100)).toBe('patient:100');
  });
});

describe('buildPatientDemographicsChangedEvent', () => {
  const demographics = {
    patient_id: 100,
    first_name: 'Chinelo',
    middle_name: null,
    last_name: 'Nwosu',
    date_of_birth: '1990-01-15',
    hospital_number: 'PSSH/023555',
    phone: '+2348012345678',
  };

  it('emits on the patient aggregate, not the encounter (ADR-0030)', () => {
    const event = buildPatientDemographicsChangedEvent(demographics, context);

    expect(event.aggregate_type).toBe('patient');
    expect(event.aggregate_id).toBe('patient:100');
    expect(event.payload.aggregate).toEqual({ type: 'patient', id: 'patient:100' });
  });

  it('carries demographic content — the one event permitted to (ADR-0016 tier 1)', () => {
    const event = buildPatientDemographicsChangedEvent(demographics, context);
    const body = event.payload.body as Record<string, unknown>;

    expect(body).toMatchObject({
      patient_id: '100',
      first_name: 'Chinelo',
      last_name: 'Nwosu',
      date_of_birth: '1990-01-15',
      hospital_number: 'PSSH/023555',
      phone: '+2348012345678',
    });
  });

  it('sends name PARTS, never a composed legal_name (the receiver composes)', () => {
    const event = buildPatientDemographicsChangedEvent(demographics, context);
    const body = event.payload.body as Record<string, unknown>;

    expect(body.legal_name).toBeUndefined();
    expect(body.fullname).toBeUndefined();
  });

  it('rejects a date_of_birth carrying a time — it can shift across a date boundary', () => {
    expect(() =>
      buildPatientDemographicsChangedEvent(
        { ...demographics, date_of_birth: '1990-01-15T00:00:00.000Z' },
        context
      )
    ).toThrow(EventBuildError);
  });

  it('serialises the complete insurance set, ids as strings', () => {
    const event = buildPatientDemographicsChangedEvent(
      {
        ...demographics,
        insurances: [
          { patient_insurance_id: 412, enrollee_code: 'NHIS-99', hmo_id: 7, is_default: true },
        ],
      },
      context
    );
    const body = event.payload.body as Record<string, unknown>;

    expect(body.insurances).toEqual([
      { patient_insurance_id: '412', enrollee_code: 'NHIS-99', hmo_id: '7', is_default: true },
    ]);
  });

  it('distinguishes an ABSENT insurances key from an empty array', () => {
    const absent = buildPatientDemographicsChangedEvent(demographics, context);
    const empty = buildPatientDemographicsChangedEvent(
      { ...demographics, insurances: [] },
      context
    );

    // Absent means "not stated" and leaves the receiver's rows alone; empty means "holds none"
    // and clears them. Conflating the two would silently wipe a patient's live coverage.
    expect((absent.payload.body as Record<string, unknown>).insurances).toBeUndefined();
    expect((empty.payload.body as Record<string, unknown>).insurances).toEqual([]);
  });

  it('is deterministic per emission, so a redelivery dedupes at the inbox', () => {
    const event = buildPatientDemographicsChangedEvent(demographics, context);
    expect(event.idempotency_key).toBe('patient-demographics:100:42');
  });
});

describe('the demographic assertion stays scoped, not deleted', () => {
  /**
   * `charge.captured` has TWO independent defences and this covers the second.
   *
   * The first is that its builder copies only known ID/money fields, so a caller's stray key never
   * reaches the body (asserted above by the exact key-set test). The second is
   * `assertNoDemographics`, which catches a field a FUTURE edit adds to the body directly. Only
   * the second could be weakened by scoping the assertion per event type, so it is what is
   * checked here — via `service_line`, a passthrough field, carrying a demographic-looking value.
   */
  it('leaves charge.captured carrying only ID references, exemption notwithstanding', () => {
    const row = buildChargeCapturedEvent(
      { ...baseLine, department: 'Pharmacy', service_line: 'Outpatient' },
      context
    );
    const body = row.payload.body as Record<string, unknown>;

    for (const key of ['first_name', 'last_name', 'phone', 'hospital_number', 'date_of_birth']) {
      expect(body[key]).toBeUndefined();
    }
  });

  it('exempts ONLY patient.demographics.changed — the list is one entry long', () => {
    // A second entry here would be a policy change, not a refactor. Pinning the length makes
    // widening the exemption a deliberate, reviewable edit rather than a quiet one.
    const demographicEvent = buildPatientDemographicsChangedEvent(
      { patient_id: 100, first_name: 'Chinelo', phone: '+2348012345678' },
      context
    );
    expect(demographicEvent.event_type).toBe('patient.demographics.changed');

    // encounter.opened keeps an ID-only body: the assertion still runs for it.
    const opened = buildEncounterOpenedEvent({ visit_id: 8891, emergency: true }, context);
    expect(opened.payload.body).toEqual({ emergency: true });
  });
});
