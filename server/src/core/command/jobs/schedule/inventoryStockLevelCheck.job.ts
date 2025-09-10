import { Job } from '@hokify/agenda';
import { Op, col } from 'sequelize';
import { logger, taggedMessaged } from '../../../helpers/logger';
import {
  GeneralStoreItem,
  PharmacyStore,
  GeneralStoreDispensaryItem,
} from '../../../../database/models';
import InventoryAlertService, { AlertTriggerData } from '../../../services/inventoryAlert.service';
import { StoreType } from '../../../../database/models/inventoryAlert';

export const inventoryStockLevelCheck = async (_job: Job) => {
  const message = taggedMessaged('InventoryStockLevelCheck');

  try {
    const startTime = Date.now();
    let totalAlertsGenerated = 0;

    logger.info(message('Starting stock level check...'));

    // Check General Store items
    const generalStoreItems = await GeneralStoreItem.findAll({
      where: {
        [Op.or]: [{ current_stock: { [Op.lte]: col('minimum_stock') } }, { current_stock: 0 }],
      },
      include: ['category'],
    });

    for (const item of generalStoreItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.id,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        itemName: item.name,
        storeType: 'GENERAL' as StoreType,
        categoryId: item.category_id,
      };

      const result = await InventoryAlertService.generateAlertsForItem(triggerData);
      totalAlertsGenerated += result.alertsCreated;
    }

    // Check Pharmacy Store items
    const pharmacyItems = await PharmacyStore.findAll({
      where: {
        [Op.or]: [
          { quantity_remaining: { [Op.lte]: 20 } }, // Default threshold
          { quantity_remaining: 0 },
        ],
      },
      include: ['drug'],
    });

    for (const item of pharmacyItems) {
      const triggerData: AlertTriggerData = {
        pharmacyItemId: item.id,
        currentStock: item.quantity_remaining,
        minimumStock: 10, // Default minimum stock for pharmacy items
        expiryDate: item.expiration,
        itemName: item.drug?.name || 'Unknown Drug',
        storeType: 'PHARMACY' as StoreType,
      };

      const result = await InventoryAlertService.generateAlertsForItem(triggerData);
      totalAlertsGenerated += result.alertsCreated;
    }

    // Check Dispensary items
    const dispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        [Op.or]: [{ quantity_remaining: { [Op.lte]: 20 } }, { quantity_remaining: 0 }],
      },
      include: ['dispensary', 'item'],
    });

    for (const item of dispensaryItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.item_id,
        dispensaryId: item.dispensary_id,
        currentStock: item.quantity_remaining,
        minimumStock: 20, // Default minimum stock for dispensary items
        expiryDate: item.expiration_date,
        itemName: item.item?.name || 'Unknown Item',
        storeType: 'GENERAL' as StoreType,
      };

      const result = await InventoryAlertService.generateAlertsForItem(triggerData);
      totalAlertsGenerated += result.alertsCreated;
    }

    const duration = Date.now() - startTime;
    logger.info(
      message(
        `Stock level check completed in ${duration}ms. Generated ${totalAlertsGenerated} alerts.`
      )
    );
  } catch (error) {
    logger.error(message(`Stock level check failed: ${error.message}`));
    throw error;
  }
};
