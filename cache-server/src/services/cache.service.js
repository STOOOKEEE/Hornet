import redisService from './redis.service.js';
import defiLlamaService from './defillama.service.js';
import geminiService from './gemini.service.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

class CacheService {
  constructor() {
    this.CACHE_KEYS = {
      ANALYSIS: 'hornet:analysis:latest',
      POOLS: 'hornet:pools:latest',
      METADATA: 'hornet:metadata',
      LAST_UPDATE: 'hornet:last_update',
    };
    this.isUpdating = false;
    this.lastUpdateTime = null;
    this.updateCount = 0;
    this.errorCount = 0;
  }

  /**
   * Refresh cache with latest data
   */
  async refreshCache() {
    if (this.isUpdating) {
      logger.warn('Cache refresh already in progress, skipping...');
      return { success: false, message: 'Update already in progress' };
    }

    this.isUpdating = true;
    const startTime = Date.now();

    try {
      logger.info('🔄 Starting cache refresh...');

      // Step 1: Fetch pools from DeFiLlama
      const poolsResult = await defiLlamaService.getPoolsForAnalysis();

      if (!poolsResult.success || poolsResult.pools.length === 0) {
        throw new Error('No pools found for analysis');
      }

      // Step 2: Analyze with Gemini
      const analysis = await geminiService.analyzeAllRiskLevels(poolsResult.pools);

      if (!analysis.success) {
        throw new Error('Gemini analysis failed');
      }

      // Step 3: Store in Redis
      await redisService.set(this.CACHE_KEYS.ANALYSIS, analysis, config.cache.ttl);
      await redisService.set(this.CACHE_KEYS.POOLS, poolsResult, config.cache.ttl);

      // Step 4: Update metadata
      const metadata = {
        lastUpdate: new Date().toISOString(),
        updateCount: ++this.updateCount,
        duration: Date.now() - startTime,
        poolsAnalyzed: poolsResult.analyzedPools,
        totalPools: poolsResult.totalPools,
      };

      await redisService.set(this.CACHE_KEYS.METADATA, metadata, config.cache.ttl * 2);
      await redisService.set(this.CACHE_KEYS.LAST_UPDATE, Date.now(), config.cache.ttl * 2);

      this.lastUpdateTime = Date.now();

      logger.info(`✅ Cache refreshed successfully in ${metadata.duration}ms`, {
        poolsAnalyzed: metadata.poolsAnalyzed,
        updateCount: metadata.updateCount,
      });

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      this.errorCount++;
      logger.error('❌ Cache refresh failed', {
        error: error.message,
        errorCount: this.errorCount,
      });

      return {
        success: false,
        error: error.message,
        errorCount: this.errorCount,
      };
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get cached analysis
   */
  async getAnalysis() {
    try {
      const analysis = await redisService.get(this.CACHE_KEYS.ANALYSIS);

      if (!analysis) {
        logger.warn('No cached analysis found');
        return {
          success: false,
          message: 'No data available. Cache is being refreshed.',
          cached: false,
        };
      }

      const metadata = await redisService.get(this.CACHE_KEYS.METADATA);
      const ttl = await redisService.ttl(this.CACHE_KEYS.ANALYSIS);

      return {
        success: true,
        data: analysis,
        metadata: {
          ...metadata,
          ttl,
          cached: true,
        },
      };
    } catch (error) {
      logger.error('Failed to get cached analysis', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cached pools
   */
  async getPools() {
    try {
      const pools = await redisService.get(this.CACHE_KEYS.POOLS);

      if (!pools) {
        return {
          success: false,
          message: 'No pools data available',
        };
      }

      return {
        success: true,
        data: pools,
      };
    } catch (error) {
      logger.error('Failed to get cached pools', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cache metadata
   */
  async getMetadata() {
    try {
      const metadata = await redisService.get(this.CACHE_KEYS.METADATA);
      const lastUpdate = await redisService.get(this.CACHE_KEYS.LAST_UPDATE);
      const ttl = await redisService.ttl(this.CACHE_KEYS.ANALYSIS);

      return {
        success: true,
        metadata: metadata || {},
        lastUpdate,
        ttl,
        isUpdating: this.isUpdating,
        updateCount: this.updateCount,
        errorCount: this.errorCount,
        nextUpdate: this.lastUpdateTime
          ? new Date(this.lastUpdateTime + config.cache.refreshIntervalMinutes * 60 * 1000).toISOString()
          : null,
      };
    } catch (error) {
      logger.error('Failed to get metadata', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      await redisService.delete(this.CACHE_KEYS.ANALYSIS);
      await redisService.delete(this.CACHE_KEYS.POOLS);
      await redisService.delete(this.CACHE_KEYS.METADATA);
      await redisService.delete(this.CACHE_KEYS.LAST_UPDATE);

      logger.info('Cache cleared successfully');

      return {
        success: true,
        message: 'Cache cleared',
      };
    } catch (error) {
      logger.error('Failed to clear cache', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cache health status
   */
  async getHealth() {
    try {
      const hasAnalysis = await redisService.exists(this.CACHE_KEYS.ANALYSIS);
      const hasPools = await redisService.exists(this.CACHE_KEYS.POOLS);
      const metadata = await this.getMetadata();

      const isHealthy = hasAnalysis && hasPools && !this.isUpdating;

      return {
        success: true,
        healthy: isHealthy,
        status: {
          hasAnalysis,
          hasPools,
          isUpdating: this.isUpdating,
          lastUpdate: metadata.lastUpdate,
          updateCount: this.updateCount,
          errorCount: this.errorCount,
        },
      };
    } catch (error) {
      logger.error('Failed to get health status', { error: error.message });
      return {
        success: false,
        healthy: false,
        error: error.message,
      };
    }
  }
}

export default new CacheService();
