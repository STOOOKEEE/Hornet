import cron from 'node-cron';
import cacheService from './services/cache.service.js';
import logger from './utils/logger.js';
import config from './config/index.js';

class Scheduler {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return;
    }

    // Run immediately on start
    logger.info('Running initial cache refresh...');
    cacheService.refreshCache().catch((error) => {
      logger.error('Initial cache refresh failed', { error: error.message });
    });

    // Schedule periodic updates
    const intervalMinutes = config.cache.refreshIntervalMinutes;
    const cronExpression = `*/${intervalMinutes} * * * *`;

    logger.info(`Starting scheduler with interval: ${intervalMinutes} minutes`);

    this.job = cron.schedule(cronExpression, async () => {
      logger.info('⏰ Scheduled cache refresh triggered');
      try {
        await cacheService.refreshCache();
      } catch (error) {
        logger.error('Scheduled cache refresh failed', { error: error.message });
      }
    });

    this.isRunning = true;
    logger.info(`✅ Scheduler started (runs every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      logger.info('Scheduler stopped');
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: config.cache.refreshIntervalMinutes,
      cronExpression: `*/${config.cache.refreshIntervalMinutes} * * * *`,
    };
  }
}

export default new Scheduler();
