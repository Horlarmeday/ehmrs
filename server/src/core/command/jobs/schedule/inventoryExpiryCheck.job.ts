import { Job } from '@hokify/agenda';
import { Op } from 'sequelize';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { PharmacyStore, GeneralStoreDispensaryItem } from '../../../../database/models';
import InventoryAlertService, { AlertTriggerData } from '../../../services/inventoryAlert.service';
import { StoreType } from '../../../../database/models/inventoryAlert';

export const inventoryExpiryCheck = async (_job: Job) => {
  const message = taggedMessaged('InventoryExpiryCheck');

  try {
    const startTime = Date.now();
    let totalAlertsGenerated = 0;

    logger.info(message('Starting expiry check...'));

    // Check for items expiring within next 30 days
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 30);

    // Check Pharmacy expiries
    const pharmacyItems = await PharmacyStore.findAll({
      where: {
        expiration: { [Op.lte]: expiryThreshold },
        quantity_remaining: { [Op.gt]: 0 },
      },
      include: ['drug'],
    });

    for (const item of pharmacyItems) {
      const triggerData: AlertTriggerData = {
        pharmacyItemId: item.id,
        currentStock: item.quantity_remaining,
        expiryDate: item.expiration,
        itemName: item.drug?.name || 'Unknown Drug',
        storeType: 'PHARMACY' as StoreType,
      };

      const result = await InventoryAlertService.generateAlertsForItem(triggerData);
      totalAlertsGenerated += result.alertsCreated;
    }

    // Check Dispensary expiries
    const dispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        expiration_date: { [Op.lte]: expiryThreshold },
        quantity_remaining: { [Op.gt]: 0 },
      },
      include: ['dispensary', 'item'],
    });

    for (const item of dispensaryItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.item_id,
        dispensaryId: item.dispensary_id,
        currentStock: item.quantity_remaining,
        expiryDate: item.expiration_date,
        itemName: item.item?.name || 'Unknown Item',
        storeType: 'GENERAL' as StoreType,
      };

      const result = await InventoryAlertService.generateAlertsForItem(triggerData);
      totalAlertsGenerated += result.alertsCreated;
    }

    const duration = Date.now() - startTime;
    logger.info(
      message(`Expiry check completed in ${duration}ms. Generated ${totalAlertsGenerated} alerts.`)
    );
  } catch (error) {
    logger.error(message(`Expiry check failed: ${error.message}`));
    throw error;
  }
};
