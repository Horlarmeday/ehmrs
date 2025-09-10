import { Job } from '@hokify/agenda';
import { logger, taggedMessaged } from '../../../helpers/logger';
import InventoryAlertService from '../../../services/inventoryAlert.service';

export const inventoryAlertEscalation = async (job: Job) => {
  const message = taggedMessaged('InventoryAlertEscalation');

  try {
    const startTime = Date.now();

    logger.info(message('Starting alert escalation check...'));

    const escalatedCount = await InventoryAlertService.checkForEscalation();

    const duration = Date.now() - startTime;
    logger.info(
      message(
        `Alert escalation check completed in ${duration}ms. Escalated ${escalatedCount} alerts.`
      )
    );
  } catch (error) {
    logger.error(message(`Alert escalation check failed: ${error.message}`));
    throw error;
  }
};
