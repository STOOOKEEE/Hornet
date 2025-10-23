import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, Search, Loader2, AlertCircle, ExternalLink, Shield, Flame } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useUniswapPools } from "../../hooks/useUniswapPools";
import { selectBestPools, getRiskCriteria, getSafetyExplanation, type BestPools } from "../../hooks/usePoolSelector";

export function AIOptimizer() {
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<BestPools | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { allUniswapPools, isLoading: poolsLoading } = useUniswapPools();

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError(null);

      // Attendre un peu pour l'effet de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Vérifier que les pools sont chargées
      if (allUniswapPools.length === 0) {
        throw new Error('No pools available. Please wait for data to load.');
      }

      // Sélectionner les meilleures pools
      const bestPools = selectBestPools(allUniswapPools);
      
      // Vérifier qu'on a au moins une pool
      if (!bestPools.safe && !bestPools.medium && !bestPools.risky) {
        throw new Error('No suitable pools found matching the criteria.');
      }

      setAnalysis(bestPools);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl">USDC Pool Optimizer</h3>
            <p className="text-xs text-gray-400">Powered by DeFi Llama - USDC Pools Only</p>
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || poolsLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Best Strategies
            </>
          )}
        </Button>
      </div>

            {/* Empty State */}
      {!analysis && !error && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            Click "Search Best Strategies" to analyze USDC pools on Base
          </p>
          <p className="text-xs text-gray-500">
            We'll find the highest TVL pools in Safe, Medium, and Risky categories
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 text-sm font-medium">Error</p>
              <p className="text-red-500/80 text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Selected Best Pools</p>
              <p className="text-xs text-gray-500">{allUniswapPools.length} pools analyzed</p>
            </div>
          </div>

          {/* Results Grid - VERTICAL LAYOUT */}
          <div className="space-y-4">
            {/* Safe Pool */}
            {analysis.safe ? (
              <PoolResultCard
                recommendation={analysis.safe}
                riskLevel="safe"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-500 text-sm">
                No safe USDC pool found (4-7% APY)
              </div>
            )}

            {/* Medium Pool */}
            {analysis.medium ? (
              <PoolResultCard
                recommendation={analysis.medium}
                riskLevel="medium"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-500 text-sm">
                No medium USDC pool found (7-12% APY)
              </div>
            )}

            {/* Risky Pool */}
            {analysis.risky ? (
              <PoolResultCard
                recommendation={analysis.risky}
                riskLevel="risky"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-500 text-sm">
                No risky USDC pool found (12-20% APY)
              </div>
            )}
          </div>
        </>
      )}

    </motion.div>
  );
}

// Pool Result Card Component
interface PoolResultCardProps {
  recommendation: {
    pool: any;
    riskLevel: 'safe' | 'medium' | 'risky';
    score: number;
  };
  riskLevel: 'safe' | 'medium' | 'risky';
}

function PoolResultCard({ recommendation }: PoolResultCardProps) {
  const { pool, riskLevel, score } = recommendation;
  const criteria = getRiskCriteria(riskLevel);
  const safetyReasons = getSafetyExplanation(pool, score);

  const riskConfig = {
    safe: {
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'Safe',
    },
    medium: {
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'Medium',
    },
    risky: {
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Risky',
    },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-medium uppercase ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Score</div>
          <div className={`text-lg font-bold ${config.color}`}>{score}</div>
        </div>
      </div>

      {/* Pool Info */}
      <div className="mb-3">
        <h4 className="font-medium mb-1">{pool.symbol}</h4>
        <p className="text-xs text-gray-400 capitalize mb-2">{pool.project}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-black/20 rounded p-2">
            <div className="text-xs text-gray-400">APY</div>
            <div className="text-green-400 font-bold">{pool.apy.toFixed(2)}%</div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-xs text-gray-400">TVL</div>
            <div className="font-bold">${(pool.tvlUsd / 1e6).toFixed(1)}M</div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Range: {criteria.minAPY}-{criteria.maxAPY}% APY
        </div>
      </div>

      {/* Why this pool */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-400 mb-1">Why selected:</div>
        <div className="space-y-1">
          {safetyReasons.slice(0, 2).map((reason, idx) => (
            <div key={idx} className="text-xs text-gray-500 flex items-start gap-1">
              <span className="text-green-400">✓</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <Button
        size="sm"
        variant="ghost"
        className="w-full border border-white/10 hover:bg-white/10 text-xs"
        onClick={() => window.open(`https://defillama.com/protocol/${pool.project}`, '_blank')}
      >
        View on DeFi Llama
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </motion.div>
  );
}
