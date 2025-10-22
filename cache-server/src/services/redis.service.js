import { createClient } from 'redis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password,
        database: config.redis.db,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis Client Reconnecting');
      });

      await this.client.connect();
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis Client Disconnected');
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Failed to get key: ${key}`, { error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttl = config.cache.ttl) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Failed to set key: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Failed to delete key: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      logger.error(`Failed to check key: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Failed to get TTL for key: ${key}`, { error: error.message });
      return -1;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern = '*') {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Failed to get keys with pattern: ${pattern}`, { error: error.message });
      return [];
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll() {
    try {
      await this.client.flushAll();
      logger.warn('Redis cache flushed');
      return true;
    } catch (error) {
      logger.error('Failed to flush Redis', { error: error.message });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const info = await this.client.info('stats');
      const keys = await this.keys('hornet:*');
      
      return {
        connected: this.isConnected,
        totalKeys: keys.length,
        info: info,
      };
    } catch (error) {
      logger.error('Failed to get Redis stats', { error: error.message });
      return {
        connected: this.isConnected,
        totalKeys: 0,
        error: error.message,
      };
    }
  }
}

export default new RedisService();
