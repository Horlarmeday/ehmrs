import '../../../core/config/env';
import { sequelizeConnection } from '../../../database/config/data-source';
import {
  DosageForm,
  Drug,
  DrugPrescription,
  Inventory,
  Measurement,
  OutboxEvent,
  Patient,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Unit,
  Visit,
} from '../../../database/models';
import { AcceptedDrugType, DrugForm, PaymentStatus, VisitCategory } from '../../../database/enums';
import PharmacyOrderService from './pharmacy-order.service';
import { CANNOT_DELETE_DRUG_WITH_PAID_ITEMS } from './messages/response-messages';
import { chargeLines } from '../../Reconciliation/charges';

/**
 * Deleting a prescribed drug cascades its consumables away (#109). Against real MySQL, because the
 * cascade is a foreign-key action: each cascaded consumable must still send its own
 * charge.reversal.requested, and a paid consumable must stop the delete.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

describe('deleting a prescribed drug with consumables (#109)', () => {
  jest.setTimeout(60000);

  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  const ids: Record<string, number> = {};

  const prescribeDrug = async () => {
    const drugPrescription = await DrugPrescription.create({
      visit_id: ids.visit,
      patient_id: ids.patient,
      date_prescribed: new Date(),
      examiner: ids.staff,
    } as never);
    const drug = await PrescribedDrug.create({
      drug_id: ids.drug,
      dosage_form_id: ids.dosageForm,
      drug_type: 'Cash',
      quantity_prescribed: 10,
      quantity_to_dispense: 10,
      route_id: ids.route,
      frequency: 'bd',
      strength_id: ids.strength,
      duration: 5,
      total_price: 1000,
      examiner: ids.staff,
      date_prescribed: new Date(),
      prescribed_strength: '500mg',
      duration_unit: 'days',
      visit_id: ids.visit,
      patient_id: ids.patient,
      start_date: new Date(),
      drug_prescription_id: drugPrescription.id,
      inventory_id: ids.inventory,
    } as never);
    const consumable = (paymentStatus: PaymentStatus) =>
      PrescribedAdditionalItem.create({
        drug_id: ids.consumable,
        drug_type: 'Cash',
        quantity_prescribed: 2,
        quantity_to_dispense: 2,
        drug_form: DrugForm.CONSUMABLE,
        total_price: 200,
        examiner: ids.staff,
        date_prescribed: new Date(),
        visit_id: ids.visit,
        patient_id: ids.patient,
        unit_id: ids.unit,
        inventory_id: ids.inventory,
        drug_prescription_id: drugPrescription.id,
        prescribed_drug_id: drug.id,
        payment_status: paymentStatus,
      } as never);
    return { drug, consumable };
  };

  const reversalKeys = async () =>
    (
      await OutboxEvent.findAll({
        where: { event_type: 'charge.reversal.requested', aggregate_id: `visit:${ids.visit}` },
        order: [['id', 'ASC']],
      })
    ).map(row => row.idempotency_key);

  beforeAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
    const staff = await Staff.create({
      firstname: 'Cascade',
      lastname: 'Auditor',
      fullname: 'Cascade Auditor',
      username: `cascade_auditor_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_CASCADE.jpg',
      password: '123456',
      email: `cascade_auditor_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0708${suffix}`,
    } as never);
    ids.staff = staff.id;
    ids.patient = (
      await Patient.create({
        firstname: 'Cascade',
        lastname: 'Patient',
        gender: 'Male',
        phone: `0709${suffix}`,
        address: 'Kubwa',
        country: 'Nigeria',
        state: 'FCT',
        lga: 'Bwari',
        date_of_birth: new Date('1990-01-01'),
        hospital_id: `CAS${suffix}`,
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.visit = (
      await Visit.create({
        patient_id: ids.patient,
        category: VisitCategory.OPD,
        date_visit_start: new Date(),
        department: 'OPD',
        type: 'General',
        professional: 'Dr Cascade',
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.drug = (
      await Drug.create({
        name: `Cascadamol ${suffix}`,
        code: `CAS-D-${suffix}`,
        type: DrugForm.DRUG,
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.consumable = (
      await Drug.create({
        name: `Cascade syringe ${suffix}`,
        code: `CAS-C-${suffix}`,
        type: DrugForm.CONSUMABLE,
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.unit = (await Unit.create({ name: `piece ${suffix}`, staff_id: ids.staff } as never)).id;
    ids.inventory = (
      await Inventory.create({
        name: `Cascade Dispensary ${suffix}`,
        accepted_drug_type: AcceptedDrugType.CASH,
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.dosageForm = (
      await DosageForm.create({ name: `Tablet ${suffix}`, staff_id: ids.staff } as never)
    ).id;
    ids.route = (
      await RoutesOfAdministration.create({
        name: `Oral ${suffix}`,
        dosage_form_id: ids.dosageForm,
        staff_id: ids.staff,
      } as never)
    ).id;
    ids.strength = (
      await Measurement.create({
        name: `mg ${suffix}`,
        dosage_form_id: ids.dosageForm,
        staff_id: ids.staff,
      } as never)
    ).id;
  });

  afterAll(async () => {
    const steps: Array<() => Promise<unknown>> = [
      () => OutboxEvent.destroy({ where: { aggregate_id: `visit:${ids.visit}` }, force: true }),
      () => PrescribedAdditionalItem.destroy({ where: { visit_id: ids.visit }, force: true }),
      () => PrescribedDrug.destroy({ where: { visit_id: ids.visit }, force: true }),
      () => DrugPrescription.destroy({ where: { visit_id: ids.visit }, force: true }),
      () => Measurement.destroy({ where: { id: ids.strength }, force: true }),
      () => RoutesOfAdministration.destroy({ where: { id: ids.route }, force: true }),
      () => DosageForm.destroy({ where: { id: ids.dosageForm }, force: true }),
      () => Inventory.destroy({ where: { id: ids.inventory }, force: true }),
      () => Unit.destroy({ where: { id: ids.unit }, force: true }),
      () => Drug.destroy({ where: { id: [ids.drug, ids.consumable] }, force: true }),
      () => Visit.destroy({ where: { id: ids.visit }, force: true }),
      () => Patient.destroy({ where: { id: ids.patient }, force: true }),
      () => Staff.destroy({ where: { id: ids.staff }, force: true }),
    ];
    for (const step of steps) {
      try {
        await step();
      } catch {
        // Cleanup only; the scratch database is recreated by test:db:setup.
      }
    }
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await sequelizeConnection.close();
  });

  beforeEach(async () => {
    await OutboxEvent.destroy({ where: { aggregate_id: `visit:${ids.visit}` }, force: true });
  });

  it('sends a reversal request for each cascaded consumable as well as the drug', async () => {
    const { drug, consumable } = await prescribeDrug();
    const first = await consumable(PaymentStatus.PENDING);
    const second = await consumable(PaymentStatus.PENDING);

    await PharmacyOrderService.deletePrescribedDrug({ drugId: drug.id });

    expect(await PrescribedDrug.count({ where: { id: drug.id } })).toBe(0);
    expect(await PrescribedAdditionalItem.count({ where: { id: [first.id, second.id] } })).toBe(0);
    expect(await reversalKeys()).toEqual([
      `reversal_requested:drug:${drug.id}`,
      `reversal_requested:additional_item:${first.id}`,
      `reversal_requested:additional_item:${second.id}`,
    ]);
  });

  it('leaves cascaded consumables counted as deleted for the reconciliation', async () => {
    const { drug, consumable } = await prescribeDrug();
    const item = await consumable(PaymentStatus.PENDING);

    await PharmacyOrderService.deletePrescribedDrug({ drugId: drug.id });

    const { lines } = await chargeLines({
      startDate: new Date(Date.now() - 86_400_000),
      visitId: ids.visit,
    });
    expect(lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'drug', id: String(drug.id), state: 'DELETED' }),
        expect.objectContaining({ type: 'additional_item', id: String(item.id), state: 'DELETED' }),
      ])
    );
  });

  it('refuses to delete a drug whose consumable is paid, and changes nothing', async () => {
    const { drug, consumable } = await prescribeDrug();
    const paid = await consumable(PaymentStatus.PAID);

    await expect(PharmacyOrderService.deletePrescribedDrug({ drugId: drug.id })).rejects.toThrow(
      CANNOT_DELETE_DRUG_WITH_PAID_ITEMS
    );

    expect(await PrescribedDrug.count({ where: { id: drug.id } })).toBe(1);
    expect(await PrescribedAdditionalItem.count({ where: { id: paid.id } })).toBe(1);
    expect(await reversalKeys()).toEqual([]);
  });

  it('sends only the drug reversal when the drug has no consumables', async () => {
    const { drug } = await prescribeDrug();

    await PharmacyOrderService.deletePrescribedDrug({ drugId: drug.id });

    expect(await reversalKeys()).toEqual([`reversal_requested:drug:${drug.id}`]);
  });
});
