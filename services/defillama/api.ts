/**
 * Service API pour DeFiLlama
 * Documentation: https://defillama.com/docs/api
 */

import { Pool, PoolsResponse, PoolFilter, PoolHistory } from './types';

const DEFILLAMA_API_BASE = 'https://yields.llama.fi';

export class DeFiLlamaAPI {
  /**
   * Récupère tous les pools disponibles
   */
  static async getAllPools(): Promise<Pool[]> {
    try {
      const response = await fetch(`${DEFILLAMA_API_BASE}/pools`);
      
      if (!response.ok) {
        throw new Error(`Erreur API DeFiLlama: ${response.status} ${response.statusText}`);
      }
      
      const data: PoolsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pools:', error);
      throw error;
    }
  }

  /**
   * Récupère les pools filtrés selon les critères
   */
  static async getFilteredPools(filter: PoolFilter): Promise<Pool[]> {
    const allPools = await this.getAllPools();
    
    return allPools.filter(pool => {
      // Filtre par chaîne
      if (filter.chain && pool.chain.toLowerCase() !== filter.chain.toLowerCase()) {
        return false;
      }
      
      // Filtre par projet
      if (filter.project && pool.project.toLowerCase() !== filter.project.toLowerCase()) {
        return false;
      }
      
      // Filtre par symbole
      if (filter.symbol && !pool.symbol.toLowerCase().includes(filter.symbol.toLowerCase())) {
        return false;
      }
      
      // Filtre par TVL minimum
      if (filter.minTvl && pool.tvlUsd < filter.minTvl) {
        return false;
      }
      
      // Filtre par APY minimum
      if (filter.minApy && pool.apy < filter.minApy) {
        return false;
      }
      
      // Filtre stablecoin
      if (filter.stablecoin !== undefined && pool.stablecoin !== filter.stablecoin) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Récupère un pool spécifique par son ID
   */
  static async getPoolById(poolId: string): Promise<Pool | null> {
    const allPools = await this.getAllPools();
    return allPools.find(pool => pool.pool === poolId) || null;
  }

  /**
   * Récupère l'historique d'un pool
   */
  static async getPoolHistory(poolId: string): Promise<PoolHistory> {
    try {
      const response = await fetch(`${DEFILLAMA_API_BASE}/chart/${poolId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur API DeFiLlama: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique du pool:', error);
      throw error;
    }
  }

  /**
   * Récupère les pools par chaîne
   */
  static async getPoolsByChain(chain: string): Promise<Pool[]> {
    return this.getFilteredPools({ chain });
  }

  /**
   * Récupère les pools par projet
   */
  static async getPoolsByProject(project: string): Promise<Pool[]> {
    return this.getFilteredPools({ project });
  }

  /**
   * Récupère les meilleurs pools par APY
   */
  static async getTopPoolsByApy(limit: number = 10, minTvl: number = 1000000): Promise<Pool[]> {
    const allPools = await this.getAllPools();
    
    return allPools
      .filter(pool => pool.tvlUsd >= minTvl && pool.apy > 0)
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  }

  /**
   * Récupère les pools stablecoins
   */
  static async getStablecoinPools(minTvl: number = 100000): Promise<Pool[]> {
    return this.getFilteredPools({ stablecoin: true, minTvl });
  }

  /**
   * Calcule les statistiques d'un pool
   */
  static calculatePoolStats(pool: Pool) {
    return {
      totalApy: pool.apy,
      baseApy: pool.apyBase || 0,
      rewardApy: pool.apyReward || 0,
      tvlUsd: pool.tvlUsd,
      isStablecoin: pool.stablecoin || false,
      hasRewards: (pool.rewardTokens?.length || 0) > 0,
      rewardTokens: pool.rewardTokens || [],
      risk: pool.ilRisk || 'unknown',
      exposure: pool.exposure || 'unknown',
    };
  }
}
