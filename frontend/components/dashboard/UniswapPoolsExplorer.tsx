import { motion } from "framer-motion";
import { useUniswapPools } from "../../hooks/useUniswapPools";
import { TrendingUp, DollarSign, Activity, AlertCircle, ExternalLink } from "lucide-react";

export function UniswapPoolsExplorer() {
  const {
    uniswapV3Pools,
    uniswapV4Pools,
    isLoading,
    error,
    getTopPoolsByAPY,
    getTopPoolsByTVL,
  } = useUniswapPools();

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="text-center text-gray-400">Loading Uniswap pools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading pools: {error}</span>
        </div>
      </div>
    );
  }

  const topByAPY = getTopPoolsByAPY(5);
  const topByTVL = getTopPoolsByTVL(5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
        >
          <div className="text-sm text-gray-400 mb-1">Uniswap V3 Pools</div>
          <div className="text-3xl font-bold">{uniswapV3Pools.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
        >
          <div className="text-sm text-gray-400 mb-1">Uniswap V4 Pools</div>
          <div className="text-3xl font-bold">{uniswapV4Pools.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
        >
          <div className="text-sm text-gray-400 mb-1">Total TVL</div>
          <div className="text-3xl font-bold">
            ${((uniswapV3Pools.reduce((sum, p) => sum + p.tvlUsd, 0) + 
                uniswapV4Pools.reduce((sum, p) => sum + p.tvlUsd, 0)) / 1000000).toFixed(1)}M
          </div>
        </motion.div>
      </div>

      {/* Top Pools by APY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Top 5 Pools by APY
        </h3>
        <div className="space-y-3">
          {topByAPY.map((pool, index) => (
            <div
              key={pool.pool}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{pool.symbol}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
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
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {pool.apy.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    Base: {pool.apyBase.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">TVL</div>
                  <div>${(pool.tvlUsd / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-gray-400">Volume 24h</div>
                  <div>${(pool.volumeUsd1d / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-gray-400">IL Risk</div>
                  <div className={pool.ilRisk === 'no' ? 'text-green-400' : 'text-yellow-400'}>
                    {pool.ilRisk === 'no' ? 'Low' : 'Yes'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Pools by TVL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          Top 5 Pools by TVL
        </h3>
        <div className="space-y-3">
          {topByTVL.map((pool) => (
            <div
              key={pool.pool}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{pool.symbol}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
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
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    ${(pool.tvlUsd / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-400">
                    APY: {pool.apy.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Volume 24h</div>
                  <div>${(pool.volumeUsd1d / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-gray-400">Volume 7d</div>
                  <div>${(pool.volumeUsd7d / 1000000).toFixed(2)}M</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
