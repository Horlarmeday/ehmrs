import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { Drug, OutboxEvent, Staff } from '../../database/models';
import { DrugForm } from '../../database/enums';
import PharmacyService from './pharmacy.service';

/**
 * A drug's code is its identity in Accounting: stock batches and the item cache are keyed by it,
 * and every receipt, dispense and return names it (#109). An edit may rename a drug, never re-code it.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

describe('updating a generic drug (#109)', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;
  let staffId: number;
  let drugId: number;
  const code = `LOCK-${suffix}`;

  beforeAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = 'false';
    staffId = (
      await Staff.create({
        firstname: 'Code',
        lastname: 'Keeper',
        fullname: 'Code Keeper',
        username: `code_keeper_${suffix}`,
        gender: 'Male',
        address: 'Kubwa',
        photo: 'IMG_CODE.jpg',
        password: '123456',
        email: `code_keeper_${suffix}@ehmrs.test`,
        department: 'Pharmacy',
        role: 'Pharmacist',
        sub_role: 'GP',
        date_of_birth: '1994-09-02',
        phone: `0710${suffix}`,
      } as never)
    ).id;
    drugId = (
      await Drug.create({
        name: `Lockamol ${suffix}`,
        code,
        type: DrugForm.DRUG,
        staff_id: staffId,
      } as never)
    ).id;
  });

  afterAll(async () => {
    await OutboxEvent.destroy({ where: { aggregate_id: `item:${code}` }, force: true });
    await Drug.destroy({ where: { id: drugId }, force: true });
    await Staff.destroy({ where: { id: staffId }, force: true });
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await sequelizeConnection.close();
  });

  it('renames the drug but keeps its code when a code is sent', async () => {
    await PharmacyService.updateGenericDrugService({
      drug_id: drugId,
      name: `Lockamol Forte ${suffix}`,
      type: DrugForm.CONSUMABLE,
      code: 'CHANGED-CODE',
    });

    const drug = await Drug.findByPk(drugId);
    expect(drug.code).toBe(code);
    expect(drug.name).toBe(`Lockamol Forte ${suffix}`);
    expect(drug.type).toBe(DrugForm.CONSUMABLE);
  });

  it('leaves fields that were not sent unchanged', async () => {
    await PharmacyService.updateGenericDrugService({ drug_id: drugId, name: `Lockamol ${suffix}` });

    const drug = await Drug.findByPk(drugId);
    expect(drug.name).toBe(`Lockamol ${suffix}`);
    expect(drug.type).toBe(DrugForm.CONSUMABLE);
    expect(drug.code).toBe(code);
  });
});
