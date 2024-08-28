import {
  Imaging,
  Investigation,
  PrescribedAdditionalItem,
  PrescribedDrug,
  PrescribedInvestigation,
  Staff,
} from '../../../database/models';
import { Transaction, WhereOptions } from 'sequelize';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { getDrugType, StatusCodes } from '../../../core/helpers/helper';
import { BadException } from '../../../common/util/api-error';
import { ERROR_UPDATING_INVESTIGATION, HSG_ITEMS_MISSING } from './messages/response-messages';
import sequelizeConnection from '../../../database/config/config';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { DefaultType } from '../../../database/models/default';
import { DrugForm } from '../../../database/models/drug';
import { DrugType } from '../../../database/models/pharmacyStore';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { getDrugPrice } from '../../Pharmacy/pharmacy.repository';
import { getInventories, getInventoryItemQuery } from '../../Inventory/inventory.repository';
import { DrugGroup } from '../../../database/models/prescribedDrug';
import PharmacyOrderService from '../Pharmacy/pharmacy-order.service';
import {
  InsertHSGAdditionalItemsType,
  OrderBulkInvestigationType,
  PrescribedDrugBody,
} from '../Pharmacy/interface/prescribed-drug.body';
import { isEmpty } from 'lodash';

/**
 * prescribe an investigation for patient
 * @param data
 * @returns {object} prescribed investigation data
 */
export const prescribeInvestigation = data => {
  const {
    investigation_id,
    requester,
    price,
    patient_id,
    visit_id,
    imaging_id,
    ante_natal_id,
  } = data;

  return PrescribedInvestigation.create({
    investigation_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    imaging_id,
    ante_natal_id,
  });
};

/**
 * prescribe multiple investigations for patient
 * @param data
 * @param includesHSG
 * @param patient
 * @param insurance
 * @param visit_id
 * @returns  prescribed investigation data
 */
export const orderBulkInvestigation = async ({
  data,
  includesHSG,
  patient,
  insurance,
  visit_id,
}: OrderBulkInvestigationType) => {
  const result = await sequelizeConnection.transaction(async (t: Transaction) => {
    const investigations = await PrescribedInvestigation.bulkCreate(data, { transaction: t });

    if (includesHSG) {
      const hsgItemsDefaults = await getOneDefault({ type: DefaultType.HSG_ADDITIONAL_ITEMS });
      if (!hsgItemsDefaults) throw new BadException('Error', 400, HSG_ITEMS_MISSING);

      const items = hsgItemsDefaults.data;
      await insertHSGAdditionalItems({
        investigations,
        patient,
        insurance,
        visit_id,
        items,
        t,
      });
    }
    return investigations;
  });

  const testIds = result.map(({ id }) => id);
  return getPrescriptionInvestigations({ id: testIds });
};

const insertHSGAdditionalItems = async ({
  investigations,
  patient,
  insurance,
  visit_id,
  items,
  t,
}: InsertHSGAdditionalItemsType) => {
  const drugType = getDrugType(patient.has_insurance, insurance);
  const data = {
    source: investigations?.[0]?.source,
    visit_id,
    staff_id: investigations?.[0]?.requester,
    patient_id: patient?.id,
    ante_natal_id: investigations?.[0]?.ante_natal_id,
  } as PrescribedDrugBody;

  const drugPrescription = await PharmacyOrderService.getDrugPrescription(patient.id, data);
  const inventories = await getInventories();
  const drugs = items
    .filter(item => item?.drug?.drug_form === DrugForm.DRUG)
    .filter(drug => drug?.drug?.drug_type === drugType);
  const consumables = items
    .filter(item => item?.drug?.drug_form === DrugForm.CONSUMABLE)
    .filter(drug => drug?.drug?.drug_type === drugType);

  if (isEmpty(drugs) || isEmpty(consumables)) return;

  const mapDrugs = await Promise.all(
    drugs.map(async drug => {
      const inventory_id =
        inventories.find(inventory => inventory.name.toLowerCase().includes(drugType.toLowerCase()))
          ?.id || 1;

      const inventoryItem = await getInventoryItemQuery({
        inventory_id,
        drug_id: drug?.drug?.drug_id,
      });
      const drugPrice =
        (await getDrugPrice(patient, drug?.drug?.drug_id, inventoryItem)) * +drug?.quantity;

      return {
        drug_id: drug?.drug?.drug_id,
        drug_type: drug?.drug?.drug_type,
        quantity_prescribed: drug?.quantity,
        quantity_to_dispense: drug?.quantity,
        route_id: drug?.drug?.route?.id,
        dosage_form_id: drug?.drug?.dosage_form?.id,
        prescribed_strength: drug?.prescribed_strength,
        strength_id: drug?.drug?.strength.id,
        frequency: drug?.frequency,
        duration: 1,
        duration_unit: 'Days',
        total_price: drug?.drug?.drug_type === DrugType.NHIS ? drugPrice * 0.1 : drugPrice,
        examiner: investigations?.[0]?.requester,
        patient_id: patient?.id,
        visit_id,
        start_date: Date.now(),
        date_prescribed: Date.now(),
        drug_prescription_id: drugPrescription?.id,
        drug_group: drug?.drug?.drug_type === DrugType.NHIS ? DrugGroup.PRIMARY : null,
        inventory_id,
        source: investigations[0]?.source,
        ante_natal_id: investigations[0]?.ante_natal_id,
        unit_id: drug?.drug?.unit_id,
        ...(drug?.drug?.drug_type === DrugType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
        patient_insurance_id: insurance?.id,
      };
    })
  );

  const mapConsumables = await Promise.all(
    consumables.map(async drug => {
      const inventory_id =
        inventories.find(inventory => inventory.name.toLowerCase().includes(drugType.toLowerCase()))
          ?.id || 1;

      const inventoryItem = await getInventoryItemQuery({
        inventory_id,
        drug_id: drug?.drug?.drug_id,
      });
      const drugPrice =
        (await getDrugPrice(patient, drug?.drug?.drug_id, inventoryItem)) * +drug?.quantity;

      return {
        drug_form: DrugForm.CONSUMABLE,
        visit_id,
        date_prescribed: Date.now(),
        drug_id: drug?.drug?.drug_id,
        drug_type: drug?.drug?.drug_type,
        quantity_prescribed: drug?.quantity,
        quantity_to_dispense: drug?.quantity,
        total_price: drug?.drug?.drug_type === DrugType.NHIS ? drugPrice * 0.1 : drugPrice,
        examiner: investigations?.[0]?.requester,
        patient_id: patient?.id,
        start_date: Date.now(),
        drug_prescription_id: drugPrescription?.id,
        inventory_id,
        source: investigations[0]?.source,
        ante_natal_id: investigations[0]?.ante_natal_id,
        unit_id: drug?.drug?.unit_id,
        ...(drug?.drug?.drug_type === DrugType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
        patient_insurance_id: insurance?.id,
      };
    })
  );
  await PrescribedDrug.bulkCreate(mapDrugs, { transaction: t });
  await PrescribedAdditionalItem.bulkCreate(mapConsumables, { transaction: t });
};

/**
 * update prescribed investigation
 * @param data
 */
export const updatePrescribedInvestigation = async (data: Partial<PrescribedInvestigation>) => {
  try {
    await PrescribedInvestigation.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_INVESTIGATION);
  }
  return getOnePrescribedInvestigation({ id: data.id });
};

/**
 * get prescribed investigations
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedInvestigations = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedInvestigation.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
    include: [
      { model: Investigation, attributes: ['name', 'type'] },
      { model: Imaging, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_investigation_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * get all prescribed investigations
 * @param query
 * @returns {Promise<PrescribedInvestigation[]>} prescribed investigations data
 */
export const getPrescriptionInvestigations = async (
  query: WhereOptions<PrescribedInvestigation>
): Promise<PrescribedInvestigation[]> => {
  return PrescribedInvestigation.findAll({
    where: { ...query },
    include: [
      { model: Investigation, attributes: ['name', 'type'] },
      { model: Imaging, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};

/**
 * get one prescribed investigations
 * @param query
 * @returns {Promise<PrescribedInvestigation>} prescribed investigation data
 */
export const getOnePrescribedInvestigation = async (
  query: WhereOptions<PrescribedInvestigation>
): Promise<PrescribedInvestigation> => {
  return PrescribedInvestigation.findOne({
    where: { ...query },
    include: [
      { model: Investigation, attributes: ['name', 'type'] },
      { model: Imaging, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_investigation_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * delete prescribed investigation
 * @param investigationId
 */
export const deletePrescribedInvestigation = async (investigationId: number) => {
  return PrescribedInvestigation.destroy({ where: { id: investigationId } });
};
