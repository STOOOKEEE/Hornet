import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUniswapPools } from '../hooks/useUniswapPools';
import { UniswapPoolsExplorer } from '../components/dashboard/UniswapPoolsExplorer';
import { PoolRecommendations } from '../components/dashboard/PoolRecommendations';
import { Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function UniswapPoolsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { allUniswapPools, isLoading } = useUniswapPools();

  const filteredPools = allUniswapPools.filter(pool =>
    pool.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.pool.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold">🦄 Uniswap Pools Explorer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Pool Recommendations */}
          <PoolRecommendations />

          {/* Divider */}
          <div className="my-12 border-t border-white/10"></div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pools by symbol, address, or protocol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>

          {/* Pools Explorer */}
          {!searchTerm ? (
            <UniswapPoolsExplorer />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl mb-4">
                Search Results ({filteredPools.length} pools)
              </h3>
              
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : filteredPools.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No pools found</div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredPools.map((pool) => (
                    <div
                      key={pool.pool}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-lg">{pool.symbol}</div>
                          <div className="text-xs text-gray-400 capitalize">
                            {pool.project} • {pool.pool.slice(0, 10)}...{pool.pool.slice(-8)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-400">
                            {pool.apy.toFixed(2)}% APY
                          </div>
                          <div className="text-sm text-gray-400">
                            ${(pool.tvlUsd / 1000000).toFixed(2)}M TVL
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Base APY</div>
                          <div>{pool.apyBase.toFixed(2)}%</div>
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
                        <div>
                          <div className="text-gray-400">Stablecoin</div>
                          <div className={pool.stablecoin ? 'text-green-400' : 'text-gray-500'}>
                            {pool.stablecoin ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>

                      {/* Underlying Tokens */}
                      {pool.underlyingTokens.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Tokens:</div>
                          <div className="flex gap-2 flex-wrap">
                            {pool.underlyingTokens.map((token, idx) => (
                              <code key={idx} className="text-xs bg-white/5 px-2 py-1 rounded">
                                {token.slice(0, 6)}...{token.slice(-4)}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
