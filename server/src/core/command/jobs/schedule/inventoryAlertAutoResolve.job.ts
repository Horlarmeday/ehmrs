import { Job } from '@hokify/agenda';
import { logger, taggedMessaged } from '../../../helpers/logger';
import InventoryAlertService from '../../../services/inventoryAlert.service';

export const inventoryAlertAutoResolve = async (job: Job) => {
  const message = taggedMessaged('InventoryAlertAutoResolve');

  try {
    const startTime = Date.now();

    logger.info(message('Starting auto-resolve check...'));

    const resolvedCount = await InventoryAlertService.autoResolveExpiredAlerts();

    const duration = Date.now() - startTime;
    logger.info(
      message(`Auto-resolve check completed in ${duration}ms. Resolved ${resolvedCount} alerts.`)
    );
  } catch (error) {
    logger.error(message(`Auto-resolve check failed: ${error.message}`));
    throw error;
  }
};
