import { useState, useEffect } from 'react';

export interface UniswapPoolData {
  // Identifiants
  pool: string; // Adresse du contrat de la pool
  chain: string; // "Base"
  project: string; // "uniswap-v3" ou "uniswap-v4"
  
  // Informations de la pool
  symbol: string; // Ex: "ETH-USDC"
  poolMeta: string | null;
  
  // TVL
  tvlUsd: number; // Total Value Locked en USD
  
  // APY
  apy: number; // APY total
  apyBase: number; // APY de base (fees de trading)
  apyReward: number; // APY des rewards additionnels
  apyMean30d: number; // APY moyen sur 30 jours
  
  // Volume
  volumeUsd1d: number; // Volume 24h en USD
  volumeUsd7d: number; // Volume 7 jours en USD
  
  // Fees
  apyBase7d: number; // APY de base sur 7 jours
  
  // Tokens
  underlyingTokens: string[]; // Adresses des tokens
  
  // Stablecoins
  stablecoin: boolean;
  
  // Risques
  ilRisk: string; // "no" | "yes" - Impermanent Loss Risk
  exposure: string; // Type d'exposition (ex: "single" ou "multi")
  
  // Predictions
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
}

export interface UniswapPoolsResult {
  uniswapV3Pools: UniswapPoolData[];
  uniswapV4Pools: UniswapPoolData[];
  allUniswapPools: UniswapPoolData[];
  isLoading: boolean;
  error: string | null;
  
  // Helpers
  getPoolByAddress: (address: string) => UniswapPoolData | undefined;
  getPoolsByTokenPair: (token0: string, token1: string) => UniswapPoolData[];
  getTopPoolsByAPY: (limit?: number) => UniswapPoolData[];
  getTopPoolsByTVL: (limit?: number) => UniswapPoolData[];
}

/**
 * Hook pour récupérer toutes les pools Uniswap V3 et V4 sur Base depuis DeFiLlama
 */
export function useUniswapPools(): UniswapPoolsResult {
  const [uniswapV3Pools, setUniswapV3Pools] = useState<UniswapPoolData[]>([]);
  const [uniswapV4Pools, setUniswapV4Pools] = useState<UniswapPoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniswapPools = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer toutes les pools depuis DeFiLlama
        const response = await fetch('https://yields.llama.fi/pools');
        
        if (!response.ok) {
          throw new Error(`DeFiLlama API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filtrer pour Uniswap V3 sur Base
        const v3Pools = data.data.filter((pool: any) => 
          pool.project === 'uniswap-v3' && 
          pool.chain === 'Base'
        );

        // Filtrer pour Uniswap V4 sur Base
        const v4Pools = data.data.filter((pool: any) => 
          pool.project === 'uniswap-v4' && 
          pool.chain === 'Base'
        );

        // Mapper les données au format UniswapPoolData
        const mapPoolData = (pool: any): UniswapPoolData => ({
          pool: pool.pool,
          chain: pool.chain,
          project: pool.project,
          symbol: pool.symbol,
          poolMeta: pool.poolMeta || null,
          tvlUsd: pool.tvlUsd || 0,
          apy: pool.apy || 0,
          apyBase: pool.apyBase || 0,
          apyReward: pool.apyReward || 0,
          apyMean30d: pool.apyMean30d || 0,
          volumeUsd1d: pool.volumeUsd1d || 0,
          volumeUsd7d: pool.volumeUsd7d || 0,
          apyBase7d: pool.apyBase7d || 0,
          underlyingTokens: pool.underlyingTokens || [],
          stablecoin: pool.stablecoin || false,
          ilRisk: pool.ilRisk || 'yes',
          exposure: pool.exposure || 'multi',
          predictions: pool.predictions,
        });

        const v3PoolsData = v3Pools.map(mapPoolData);
        const v4PoolsData = v4Pools.map(mapPoolData);

        setUniswapV3Pools(v3PoolsData);
        setUniswapV4Pools(v4PoolsData);

        console.log('🦄 Uniswap V3 Pools on Base:', v3PoolsData.length);
        console.log('🦄 Uniswap V4 Pools on Base:', v4PoolsData.length);
        
        // Afficher les top 5 pools V3 par APY
        const topV3ByAPY = v3PoolsData
          .sort((a: UniswapPoolData, b: UniswapPoolData) => b.apy - a.apy)
          .slice(0, 5);
        
        console.log('📊 Top 5 Uniswap V3 Pools by APY:');
        console.table(topV3ByAPY.map((pool: UniswapPoolData) => ({
          Pool: pool.symbol,
          Contract: pool.pool.slice(0, 10) + '...',
          APY: `${pool.apy.toFixed(2)}%`,
          'APY Base': `${pool.apyBase.toFixed(2)}%`,
          TVL: `$${(pool.tvlUsd / 1000000).toFixed(2)}M`,
          'Volume 24h': `$${(pool.volumeUsd1d / 1000000).toFixed(2)}M`,
          'IL Risk': pool.ilRisk,
        })));

        // Afficher les top 5 pools V3 par TVL
        const topV3ByTVL = v3PoolsData
          .sort((a: UniswapPoolData, b: UniswapPoolData) => b.tvlUsd - a.tvlUsd)
          .slice(0, 5);
        
        console.log('📊 Top 5 Uniswap V3 Pools by TVL:');
        console.table(topV3ByTVL.map((pool: UniswapPoolData) => ({
          Pool: pool.symbol,
          Contract: pool.pool.slice(0, 10) + '...',
          TVL: `$${(pool.tvlUsd / 1000000).toFixed(2)}M`,
          APY: `${pool.apy.toFixed(2)}%`,
          'Volume 24h': `$${(pool.volumeUsd1d / 1000000).toFixed(2)}M`,
        })));

        // Si Uniswap V4 existe, afficher aussi
        if (v4PoolsData.length > 0) {
          console.log('📊 Uniswap V4 Pools:');
          console.table(v4PoolsData.map((pool: UniswapPoolData) => ({
            Pool: pool.symbol,
            Contract: pool.pool.slice(0, 10) + '...',
            APY: `${pool.apy.toFixed(2)}%`,
            TVL: `$${(pool.tvlUsd / 1000000).toFixed(2)}M`,
          })));
        }

      } catch (err) {
        console.error('Error fetching Uniswap pools:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniswapPools();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchUniswapPools, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Combine V3 et V4
  const allUniswapPools = [...uniswapV3Pools, ...uniswapV4Pools];

  // Helper: Trouver une pool par son adresse
  const getPoolByAddress = (address: string): UniswapPoolData | undefined => {
    return allUniswapPools.find(
      pool => pool.pool.toLowerCase() === address.toLowerCase()
    );
  };

  // Helper: Trouver toutes les pools pour une paire de tokens
  const getPoolsByTokenPair = (token0: string, token1: string): UniswapPoolData[] => {
    const t0 = token0.toLowerCase();
    const t1 = token1.toLowerCase();
    
    return allUniswapPools.filter(pool => {
      const tokens = pool.underlyingTokens.map(t => t.toLowerCase());
      return (
        (tokens.includes(t0) && tokens.includes(t1)) ||
        pool.symbol.toLowerCase().includes(token0.toLowerCase()) &&
        pool.symbol.toLowerCase().includes(token1.toLowerCase())
      );
    });
  };

  // Helper: Top pools par APY
  const getTopPoolsByAPY = (limit: number = 10): UniswapPoolData[] => {
    return [...allUniswapPools]
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  };

  // Helper: Top pools par TVL
  const getTopPoolsByTVL = (limit: number = 10): UniswapPoolData[] => {
    return [...allUniswapPools]
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, limit);
  };

  return {
    uniswapV3Pools,
    uniswapV4Pools,
    allUniswapPools,
    isLoading,
    error,
    getPoolByAddress,
    getPoolsByTokenPair,
    getTopPoolsByAPY,
    getTopPoolsByTVL,
  };
}
