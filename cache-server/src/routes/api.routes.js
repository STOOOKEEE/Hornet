import express from 'express';
import cacheService from '../services/cache.service.js';
import redisService from '../services/redis.service.js';
import scheduler from '../scheduler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/analysis
 * Get cached AI analysis
 */
router.get('/analysis', async (req, res) => {
  try {
    const result = await cacheService.getAnalysis();

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error in /api/analysis', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/pools
 * Get cached pools data
 */
router.get('/pools', async (req, res) => {
  try {
    const result = await cacheService.getPools();

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error in /api/pools', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/metadata
 * Get cache metadata
 */
router.get('/metadata', async (req, res) => {
  try {
    const result = await cacheService.getMetadata();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/metadata', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/refresh
 * Manually trigger cache refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Manual cache refresh triggered');
    const result = await cacheService.refreshCache();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/refresh', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/cache
 * Clear all cache
 */
router.delete('/cache', async (req, res) => {
  try {
    const result = await cacheService.clearCache();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/cache', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const cacheHealth = await cacheService.getHealth();
    const redisStats = await redisService.getStats();
    const schedulerStatus = scheduler.getStatus();

    const isHealthy = cacheHealth.healthy && redisService.isConnected;

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      cache: cacheHealth,
      redis: redisStats,
      scheduler: schedulerStatus,
    });
  } catch (error) {
    logger.error('Error in /api/health', { error: error.message });
    res.status(503).json({
      success: false,
      healthy: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/stats
 * Get server statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const metadata = await cacheService.getMetadata();
    const redisStats = await redisService.getStats();

    res.json({
      success: true,
      stats: {
        cache: metadata,
        redis: redisStats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    logger.error('Error in /api/stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
