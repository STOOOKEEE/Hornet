import { UniswapPoolData } from './useUniswapPools';

export type RiskLevel = 'safe' | 'medium' | 'risky';

export interface PoolRecommendation {
  pool: UniswapPoolData;
  riskLevel: RiskLevel;
  score: number; // Score de sécurité (plus élevé = plus safe)
}

export interface BestPools {
  safe: PoolRecommendation | null;
  medium: PoolRecommendation | null;
  risky: PoolRecommendation | null;
}

/**
 * Critères de sélection des pools
 */
const RISK_CRITERIA = {
  safe: {
    minAPY: 4,
    maxAPY: 7,
    label: 'Safe',
    description: 'Low risk, stable returns',
  },
  medium: {
    minAPY: 7,
    maxAPY: 12,
    label: 'Medium',
    description: 'Balanced risk/reward',
  },
  risky: {
    minAPY: 12,
    maxAPY: 20,
    label: 'Risky',
    description: 'High APY, higher risk',
  },
} as const;

/**
 * Filtre les pools pour ne garder que celles avec USDC
 */
function hasUSDC(pool: UniswapPoolData): boolean {
  const symbol = pool.symbol.toUpperCase();
  return symbol.includes('USDC');
}

/**
 * Calcule un score de sécurité pour une pool
 * Plus le score est élevé, plus la pool est considérée comme sûre
 */
function calculateSafetyScore(pool: UniswapPoolData): number {
  let score = 0;

  // TVL élevé = plus safe (+40 points max)
  // $10M+ = excellent, $1M+ = bon, <$100k = risqué
  if (pool.tvlUsd > 10000000) score += 40;
  else if (pool.tvlUsd > 5000000) score += 35;
  else if (pool.tvlUsd > 1000000) score += 25;
  else if (pool.tvlUsd > 500000) score += 15;
  else if (pool.tvlUsd > 100000) score += 5;

  // Volume élevé = plus safe (+30 points max)
  // Volume important indique une liquidité active
  const volumeToTVLRatio = pool.tvlUsd > 0 ? pool.volumeUsd1d / pool.tvlUsd : 0;
  if (volumeToTVLRatio > 0.5) score += 30; // >50% du TVL tradé par jour = très actif
  else if (volumeToTVLRatio > 0.2) score += 25;
  else if (volumeToTVLRatio > 0.1) score += 20;
  else if (volumeToTVLRatio > 0.05) score += 15;
  else if (volumeToTVLRatio > 0.01) score += 10;

  // Pas de risque IL = plus safe (+15 points)
  if (pool.ilRisk === 'no') score += 15;

  // Pool de stablecoins = très safe (+10 points)
  if (pool.stablecoin) score += 10;

  // APY stable (moyenne 30j proche de l'APY actuel) = plus safe (+5 points)
  if (pool.apyMean30d > 0) {
    const apyVariation = Math.abs(pool.apy - pool.apyMean30d) / pool.apyMean30d;
    if (apyVariation < 0.1) score += 5; // Variation < 10%
    else if (apyVariation < 0.2) score += 3; // Variation < 20%
  }

  return score;
}

/**
 * Classe une pool selon son niveau de risque basé sur l'APY
 */
function getRiskLevel(apy: number): RiskLevel | null {
  if (apy >= RISK_CRITERIA.safe.minAPY && apy <= RISK_CRITERIA.safe.maxAPY) {
    return 'safe';
  }
  if (apy > RISK_CRITERIA.medium.minAPY && apy <= RISK_CRITERIA.medium.maxAPY) {
    return 'medium';
  }
  if (apy > RISK_CRITERIA.risky.minAPY && apy <= RISK_CRITERIA.risky.maxAPY) {
    return 'risky';
  }
  return null; // APY hors des critères
}

/**
 * Sélectionne la meilleure pool pour chaque catégorie de risque
 * Priorise TOUJOURS la sécurité via le score de sécurité
 */
export function selectBestPools(pools: UniswapPoolData[]): BestPools {
  // Filtrer uniquement les pools avec USDC et TVL minimum
  const validPools = pools.filter(pool => 
    hasUSDC(pool) && 
    pool.tvlUsd > 100000 && 
    pool.apy > 0
  );

  if (validPools.length === 0) {
    console.log('⚠️ No valid pools found with USDC');
    return {
      safe: null,
      medium: null,
      risky: null,
    };
  }

  // Grouper les pools par niveau de risque
  const poolsByRisk: Record<RiskLevel, PoolRecommendation[]> = {
    safe: [],
    medium: [],
    risky: [],
  };

  validPools.forEach(pool => {
    const riskLevel = getRiskLevel(pool.apy);
    if (riskLevel) {
      const score = calculateSafetyScore(pool);
      poolsByRisk[riskLevel].push({
        pool,
        riskLevel,
        score,
      });
    }
  });

  // Trier chaque catégorie par TVL (décroissant) - MAXIMISER TVL
  // La pool avec le TVL le plus élevé sera en premier
  Object.keys(poolsByRisk).forEach(key => {
    const riskLevel = key as RiskLevel;
    poolsByRisk[riskLevel].sort((a, b) => b.pool.tvlUsd - a.pool.tvlUsd);
  });

  console.log('🎯 Pool Selection Summary (USDC only, sorted by TVL):');
  console.log('Safe pools found:', poolsByRisk.safe.length);
  console.log('Medium pools found:', poolsByRisk.medium.length);
  console.log('Risky pools found:', poolsByRisk.risky.length);

  // Sélectionner la meilleure (plus gros TVL) de chaque catégorie
  const bestPools: BestPools = {
    safe: poolsByRisk.safe[0] || null,
    medium: poolsByRisk.medium[0] || null,
    risky: poolsByRisk.risky[0] || null,
  };

  // Logs détaillés
  if (bestPools.safe) {
    console.log('✅ Best SAFE pool (highest TVL):', {
      symbol: bestPools.safe.pool.symbol,
      apy: `${bestPools.safe.pool.apy.toFixed(2)}%`,
      tvl: `$${(bestPools.safe.pool.tvlUsd / 1e6).toFixed(2)}M`,
      safetyScore: bestPools.safe.score,
      ilRisk: bestPools.safe.pool.ilRisk,
      stablecoin: bestPools.safe.pool.stablecoin,
    });
  }

  if (bestPools.medium) {
    console.log('⚠️ Best MEDIUM pool (highest TVL):', {
      symbol: bestPools.medium.pool.symbol,
      apy: `${bestPools.medium.pool.apy.toFixed(2)}%`,
      tvl: `$${(bestPools.medium.pool.tvlUsd / 1e6).toFixed(2)}M`,
      safetyScore: bestPools.medium.score,
    });
  }

  if (bestPools.risky) {
    console.log('🔥 Best RISKY pool (highest TVL):', {
      symbol: bestPools.risky.pool.symbol,
      apy: `${bestPools.risky.pool.apy.toFixed(2)}%`,
      tvl: `$${(bestPools.risky.pool.tvlUsd / 1e6).toFixed(2)}M`,
      safetyScore: bestPools.risky.score,
    });
  }

  return bestPools;
}

/**
 * Obtient les informations sur un niveau de risque
 */
export function getRiskCriteria(level: RiskLevel) {
  return RISK_CRITERIA[level];
}

/**
 * Explique pourquoi une pool est considérée comme safe
 */
export function getSafetyExplanation(pool: UniswapPoolData, score: number): string[] {
  const reasons: string[] = [];

  if (pool.tvlUsd > 10000000) {
    reasons.push(`Very high TVL: $${(pool.tvlUsd / 1e6).toFixed(1)}M`);
  } else if (pool.tvlUsd > 1000000) {
    reasons.push(`Good TVL: $${(pool.tvlUsd / 1e6).toFixed(1)}M`);
  }

  const volumeRatio = pool.tvlUsd > 0 ? pool.volumeUsd1d / pool.tvlUsd : 0;
  if (volumeRatio > 0.2) {
    reasons.push(`High trading activity: ${(volumeRatio * 100).toFixed(1)}% daily volume/TVL ratio`);
  }

  if (pool.ilRisk === 'no') {
    reasons.push('No impermanent loss risk');
  }

  if (pool.stablecoin) {
    reasons.push('Stablecoin pool (low volatility)');
  }

  if (pool.apyMean30d > 0) {
    const variation = Math.abs(pool.apy - pool.apyMean30d) / pool.apyMean30d;
    if (variation < 0.1) {
      reasons.push(`Stable APY (${(variation * 100).toFixed(1)}% variation over 30 days)`);
    }
  }

  reasons.push(`Safety score: ${score}/100`);

  return reasons;
}
