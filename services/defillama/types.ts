/**
 * Types pour l'API DeFiLlama
 */

export interface Pool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase?: number;
  apyReward?: number;
  apy: number;
  rewardTokens?: string[];
  pool: string;
  apyPct1D?: number;
  apyPct7D?: number;
  apyPct30D?: number;
  stablecoin?: boolean;
  ilRisk?: string;
  exposure?: string;
  predictions?: {
    predictedClass?: string;
    predictedProbability?: number;
    binnedConfidence?: number;
  };
  poolMeta?: string;
  mu?: number;
  sigma?: number;
  count?: number;
  outlier?: boolean;
  underlyingTokens?: string[];
  il7d?: number;
  apyBase7d?: number;
  apyMean30d?: number;
  volumeUsd1d?: number;
  volumeUsd7d?: number;
}

export interface PoolsResponse {
  status: string;
  data: Pool[];
}

export interface PoolFilter {
  chain?: string;
  project?: string;
  symbol?: string;
  minTvl?: number;
  minApy?: number;
  stablecoin?: boolean;
}

export interface ChartDataPoint {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
}

export interface PoolHistory {
  status: string;
  data: ChartDataPoint[];
}
