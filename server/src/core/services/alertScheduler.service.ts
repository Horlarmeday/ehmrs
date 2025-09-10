import { JobName } from '../command';
import agenda from '../command/agenda';
import InventoryAlertService from './inventoryAlert.service';
import { logger } from '../helpers/logger';

export interface SchedulerStats {
  lastStockLevelCheck: Date | null;
  lastExpiryCheck: Date | null;
  lastEscalationCheck: Date | null;
  lastAutoResolveCheck: Date | null;
  totalAlertsGenerated: number;
  totalAlertsEscalated: number;
  totalAlertsAutoResolved: number;
  isAgendaRunning: boolean;
}

export class AlertSchedulerService {
  private static instance: AlertSchedulerService;
  private stats: SchedulerStats;

  private constructor() {
    this.stats = {
      lastStockLevelCheck: null,
      lastExpiryCheck: null,
      lastEscalationCheck: null,
      lastAutoResolveCheck: null,
      totalAlertsGenerated: 0,
      totalAlertsEscalated: 0,
      totalAlertsAutoResolved: 0,
      isAgendaRunning: true, // Agenda is managed globally
    };
  }

  public static getInstance(): AlertSchedulerService {
    if (!AlertSchedulerService.instance) {
      AlertSchedulerService.instance = new AlertSchedulerService();
    }
    return AlertSchedulerService.instance;
  }

  // Get current scheduler statistics
  public getStats(): SchedulerStats {
    return { ...this.stats };
  }

  // Update stats when jobs complete (called from job implementations)
  public updateStockLevelCheckStats(alertsGenerated: number): void {
    this.stats.lastStockLevelCheck = new Date();
    this.stats.totalAlertsGenerated += alertsGenerated;
  }

  public updateExpiryCheckStats(alertsGenerated: number): void {
    this.stats.lastExpiryCheck = new Date();
    this.stats.totalAlertsGenerated += alertsGenerated;
  }

  public updateEscalationStats(alertsEscalated: number): void {
    this.stats.lastEscalationCheck = new Date();
    this.stats.totalAlertsEscalated += alertsEscalated;
  }

  public updateAutoResolveStats(alertsResolved: number): void {
    this.stats.lastAutoResolveCheck = new Date();
    this.stats.totalAlertsAutoResolved += alertsResolved;
  }

  // Manual trigger methods - these create immediate jobs in agenda
  public async triggerStockLevelCheck(): Promise<void> {
    try {
      logger.info('Manually triggering stock level check...');
      await agenda.now(JobName.INVENTORY_STOCK_LEVEL_CHECK);
      logger.info('Stock level check job queued');
    } catch (error) {
      logger.error(`Failed to trigger stock level check: ${error.message}`);
      throw error;
    }
  }

  public async triggerExpiryCheck(): Promise<void> {
    try {
      logger.info('Manually triggering expiry check...');
      await agenda.now(JobName.INVENTORY_EXPIRY_CHECK);
      logger.info('Expiry check job queued');
    } catch (error) {
      logger.error(`Failed to trigger expiry check: ${error.message}`);
      throw error;
    }
  }

  public async triggerEscalationCheck(): Promise<void> {
    try {
      logger.info('Manually triggering escalation check...');
      await agenda.now(JobName.INVENTORY_ALERT_ESCALATION);
      logger.info('Escalation check job queued');
    } catch (error) {
      logger.error(`Failed to trigger escalation check: ${error.message}`);
      throw error;
    }
  }

  public async triggerAutoResolveCheck(): Promise<void> {
    try {
      logger.info('Manually triggering auto-resolve check...');
      await agenda.now(JobName.INVENTORY_ALERT_AUTO_RESOLVE);
      logger.info('Auto-resolve check job queued');
    } catch (error) {
      logger.error(`Failed to trigger auto-resolve check: ${error.message}`);
      throw error;
    }
  }

  // Trigger all alert jobs at once
  public async triggerFullCheck(): Promise<void> {
    try {
      logger.info('Triggering full alert system check...');

      await Promise.all([
        agenda.now(JobName.INVENTORY_STOCK_LEVEL_CHECK),
        agenda.now(JobName.INVENTORY_EXPIRY_CHECK),
        agenda.now(JobName.INVENTORY_ALERT_ESCALATION),
        agenda.now(JobName.INVENTORY_ALERT_AUTO_RESOLVE),
      ]);

      logger.info('All alert check jobs queued');
    } catch (error) {
      logger.error(`Failed to trigger full check: ${error.message}`);
      throw error;
    }
  }

  // Get agenda job status for alert jobs
  public async getJobStatus(): Promise<any> {
    try {
      const jobs = await agenda.jobs(
        {
          name: {
            $in: [
              JobName.INVENTORY_STOCK_LEVEL_CHECK,
              JobName.INVENTORY_EXPIRY_CHECK,
              JobName.INVENTORY_ALERT_ESCALATION,
              JobName.INVENTORY_ALERT_AUTO_RESOLVE,
            ],
          },
        },
        { nextRunAt: -1 },
        20
      ); // Get latest 20 jobs

      return {
        jobs: jobs.map(job => ({
          name: job.attrs.name,
          lastRunAt: job.attrs.lastRunAt,
          nextRunAt: job.attrs.nextRunAt,
          failCount: job.attrs.failCount || 0,
          failReason: job.attrs.failReason,
          lockedAt: job.attrs.lockedAt,
          type: job.attrs.type,
        })),
        summary: {
          scheduled: jobs.filter(j => j.attrs.nextRunAt && !j.attrs.lockedAt).length,
          running: jobs.filter(j => j.attrs.lockedAt).length,
          failed: jobs.filter(j => j.attrs.failCount && j.attrs.failCount > 0).length,
        },
      };
    } catch (error) {
      logger.error(`Failed to get job status: ${error.message}`);
      throw error;
    }
  }

  // Health check method
  public async getHealthStatus(): Promise<any> {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    try {
      const jobStatus = await this.getJobStatus();

      return {
        stats: this.stats,
        health: {
          stockLevelCheckHealthy:
            !this.stats.lastStockLevelCheck ||
            now - this.stats.lastStockLevelCheck.getTime() < oneHour,
          expiryCheckHealthy:
            !this.stats.lastExpiryCheck ||
            now - this.stats.lastExpiryCheck.getTime() < 6 * oneHour + oneHour,
          escalationCheckHealthy:
            !this.stats.lastEscalationCheck ||
            now - this.stats.lastEscalationCheck.getTime() < oneHour,
          autoResolveCheckHealthy:
            !this.stats.lastAutoResolveCheck ||
            now - this.stats.lastAutoResolveCheck.getTime() < 25 * oneHour,
          agendaHealthy: jobStatus.summary.failed === 0,
        },
        jobStatus,
      };
    } catch (error) {
      return {
        stats: this.stats,
        health: {
          stockLevelCheckHealthy: false,
          expiryCheckHealthy: false,
          escalationCheckHealthy: false,
          autoResolveCheckHealthy: false,
          agendaHealthy: false,
        },
        error: error.message,
      };
    }
  }

  // Cancel scheduled alert jobs (useful for maintenance)
  public async cancelScheduledJobs(): Promise<number> {
    try {
      const cancelled = await agenda.cancel({
        name: {
          $in: [
            JobName.INVENTORY_STOCK_LEVEL_CHECK,
            JobName.INVENTORY_EXPIRY_CHECK,
            JobName.INVENTORY_ALERT_ESCALATION,
            JobName.INVENTORY_ALERT_AUTO_RESOLVE,
          ],
        },
        nextRunAt: { $exists: true },
        lockedAt: { $exists: false },
      });

      logger.info(`Cancelled ${cancelled} scheduled alert jobs`);
      return cancelled;
    } catch (error) {
      logger.error(`Failed to cancel scheduled jobs: ${error.message}`);
      throw error;
    }
  }

  // Reschedule jobs (useful after configuration changes)
  public async rescheduleJobs(): Promise<void> {
    try {
      logger.info('Rescheduling alert jobs...');

      // Cancel existing scheduled jobs
      await this.cancelScheduledJobs();

      // The cron jobs will be automatically rescheduled by agenda
      // since they're defined in the CronTimer configuration

      logger.info('Alert jobs rescheduled successfully');
    } catch (error) {
      logger.error(`Failed to reschedule jobs: ${error.message}`);
      throw error;
    }
  }

  // Direct service calls (bypassing agenda for testing/immediate execution)
  public async runStockLevelCheckDirect(): Promise<any> {
    return await InventoryAlertService.generateAlertsForAllItems();
  }

  public async runExpiryCheckDirect(): Promise<any> {
    return await InventoryAlertService.generateExpiryAlerts();
  }

  public async runEscalationCheckDirect(): Promise<number> {
    return await InventoryAlertService.checkForEscalation();
  }

  public async runAutoResolveCheckDirect(): Promise<number> {
    return await InventoryAlertService.autoResolveExpiredAlerts();
  }
}

export default AlertSchedulerService;
