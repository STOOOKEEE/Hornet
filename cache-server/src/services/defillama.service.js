import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { retryWithBackoff } from '../utils/retry.js';

class DeFiLlamaService {
  constructor() {
    this.client = axios.create({
      baseURL: config.defiLlama.baseUrl,
      timeout: config.defiLlama.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: config.defiLlama.retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });
  }

  /**
   * Fetch all pools from DeFiLlama
   */
  async getAllPools() {
    return retryWithBackoff(
      async () => {
        logger.info('Fetching pools from DeFiLlama...');
        const startTime = Date.now();

        const response = await this.client.get('/pools');

        if (response.status !== 200) {
          throw new Error(`DeFiLlama API returned status ${response.status}`);
        }

        const pools = response.data?.data || [];
        const duration = Date.now() - startTime;

        logger.info(`Fetched ${pools.length} pools from DeFiLlama in ${duration}ms`);

        return pools;
      },
      config.defiLlama.retries,
      1000,
      'DeFiLlama getAllPools'
    );
  }

  /**
   * Filter pools based on criteria
   */
  filterPools(pools, criteria = {}) {
    const {
      chains = config.analysis.chains,
      tokenFilter = config.analysis.tokenFilter,
      minTvl = config.analysis.minTvl,
      maxApy = config.analysis.maxApy,
    } = criteria;

    logger.info('Filtering pools...', { criteria });

    const filtered = pools.filter((pool) => {
      // Chain filter
      const isCorrectChain = chains.some(
        (chain) => pool.chain?.toLowerCase() === chain.toLowerCase()
      );
      if (!isCorrectChain) return false;

      // Token filter
      const hasToken = pool.symbol?.toLowerCase().includes(tokenFilter.toLowerCase());
      if (!hasToken) return false;

      // TVL filter
      if (pool.tvlUsd < minTvl) return false;

      // APY filter
      if (pool.apy <= 0 || pool.apy > maxApy) return false;

      return true;
    });

    logger.info(`Filtered ${filtered.length} pools from ${pools.length} total`);

    return filtered;
  }

  /**
   * Sort pools by TVL (descending)
   */
  sortPoolsByTvl(pools, limit = config.analysis.maxPoolsToAnalyze) {
    return pools.sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, limit);
  }

  /**
   * Get filtered and sorted pools ready for analysis
   */
  async getPoolsForAnalysis(criteria = {}) {
    try {
      const allPools = await this.getAllPools();
      const filtered = this.filterPools(allPools, criteria);
      const sorted = this.sortPoolsByTvl(filtered);

      return {
        success: true,
        pools: sorted,
        totalPools: allPools.length,
        filteredPools: filtered.length,
        analyzedPools: sorted.length,
      };
    } catch (error) {
      logger.error('Failed to get pools for analysis', { error: error.message });
      throw error;
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats(pools) {
    if (!pools || pools.length === 0) {
      return {
        count: 0,
        totalTvl: 0,
        avgApy: 0,
        maxApy: 0,
        minApy: 0,
      };
    }

    const totalTvl = pools.reduce((sum, p) => sum + (p.tvlUsd || 0), 0);
    const avgApy = pools.reduce((sum, p) => sum + (p.apy || 0), 0) / pools.length;
    const apys = pools.map((p) => p.apy || 0);

    return {
      count: pools.length,
      totalTvl,
      avgApy,
      maxApy: Math.max(...apys),
      minApy: Math.min(...apys),
    };
  }
}

export default new DeFiLlamaService();
