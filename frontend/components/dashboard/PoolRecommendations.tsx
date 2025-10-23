import { motion } from "framer-motion";
import { useUniswapPools } from "../../hooks/useUniswapPools";
import { selectBestPools, getRiskCriteria, getSafetyExplanation, RiskLevel } from "../../hooks/usePoolSelector";
import { Shield, TrendingUp, Flame, CheckCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";

const RISK_ICONS: Record<RiskLevel, any> = {
  safe: Shield,
  medium: TrendingUp,
  risky: Flame,
};

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: 'text-green-400 border-green-500/50 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
  risky: 'text-red-400 border-red-500/50 bg-red-500/10',
};

export function PoolRecommendations() {
  const { allUniswapPools, isLoading } = useUniswapPools();

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="text-center text-gray-400">Analyzing pools...</div>
      </div>
    );
  }

  const bestPools = selectBestPools(allUniswapPools);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🎯 Recommended Pools</h2>
        <p className="text-gray-400 text-sm">
          Automatically selected based on safety score, TVL, volume, and risk profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Safe Pool */}
        {bestPools.safe && (
          <PoolCard
            recommendation={bestPools.safe}
            riskLevel="safe"
          />
        )}

        {/* Medium Pool */}
        {bestPools.medium && (
          <PoolCard
            recommendation={bestPools.medium}
            riskLevel="medium"
          />
        )}

        {/* Risky Pool */}
        {bestPools.risky && (
          <PoolCard
            recommendation={bestPools.risky}
            riskLevel="risky"
          />
        )}
      </div>

      {/* No pools found message */}
      {!bestPools.safe && !bestPools.medium && !bestPools.risky && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-yellow-400 font-medium">No suitable pools found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting the criteria or wait for pool data to load
          </p>
        </div>
      )}
    </div>
  );
}

interface PoolCardProps {
  recommendation: {
    pool: any;
    riskLevel: RiskLevel;
    score: number;
  };
  riskLevel: RiskLevel;
}

function PoolCard({ recommendation }: PoolCardProps) {
  const { pool, riskLevel, score } = recommendation;
  const criteria = getRiskCriteria(riskLevel);
  const Icon = RISK_ICONS[riskLevel];
  const safetyReasons = getSafetyExplanation(pool, score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white/5 backdrop-blur-xl border-2 rounded-2xl p-6 ${RISK_COLORS[riskLevel]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wide">
              {criteria.label}
            </span>
          </div>
          <p className="text-xs text-gray-400">{criteria.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Safety Score</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
      </div>

      {/* Pool Info */}
      <div className="bg-black/20 rounded-xl p-4 mb-4">
        <h3 className="text-xl font-bold mb-2">{pool.symbol}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="capitalize">{pool.project}</span>
          <span>•</span>
          <a
            href={`https://basescan.org/address/${pool.pool}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 flex items-center gap-1"
          >
            {pool.pool.slice(0, 6)}...{pool.pool.slice(-4)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400">APY</div>
            <div className="text-2xl font-bold text-green-400">
              {pool.apy.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">
              Range: {criteria.minAPY}-{criteria.maxAPY}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">TVL</div>
            <div className="text-lg font-bold">
              ${(pool.tvlUsd / 1e6).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">
              Vol: ${(pool.volumeUsd1d / 1e6).toFixed(1)}M/d
            </div>
          </div>
        </div>
      </div>

      {/* Safety Reasons */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium flex items-center gap-1">
          <Info className="w-3 h-3" />
          Why this pool?
        </div>
        {safetyReasons.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Risk Indicators */}
      <div className="flex gap-2 text-xs">
        {pool.stablecoin && (
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
            Stablecoin
          </span>
        )}
        {pool.ilRisk === 'no' && (
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
            No IL
          </span>
        )}
        {pool.tvlUsd > 10000000 && (
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">
            High TVL
          </span>
        )}
      </div>

      {/* Action Button */}
      <motion.a
        href={`https://app.uniswap.org/#/pool/${pool.pool}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        Open in Uniswap
        <ExternalLink className="w-4 h-4" />
      </motion.a>
    </motion.div>
  );
}
