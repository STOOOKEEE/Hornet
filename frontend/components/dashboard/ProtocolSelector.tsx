import { motion } from "framer-motion";
import { useState } from "react";
import { useRealTimeData } from "../../hooks/useRealTimeData";
import { Search, TrendingUp, DollarSign } from "lucide-react";

export function ProtocolSelector() {
  const { metrics } = useRealTimeData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPools, setSelectedPools] = useState<string[]>([]);

  // Récupérer les pools disponibles depuis DeFiLlama
  const allPools = metrics?.historicalBalances || [];
  
  // Pour l'instant, on utilise les données d'APY
  const availablePools = [
    { id: 'aave-usdc', name: 'Aave V3 USDC', project: 'aave-v3', apy: 5.2, tvl: 1000000 },
    { id: 'uniswap-eth-usdc', name: 'Uniswap V3 ETH/USDC 0.05%', project: 'uniswap-v3', apy: 8.5, tvl: 5000000 },
    { id: 'uniswap-eth-usdc-030', name: 'Uniswap V3 ETH/USDC 0.3%', project: 'uniswap-v3', apy: 12.3, tvl: 3000000 },
    { id: 'aerodrome-eth-usdc', name: 'Aerodrome ETH/USDC', project: 'aerodrome', apy: 15.7, tvl: 2000000 },
  ];

  const filteredPools = availablePools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePool = (poolId: string) => {
    setSelectedPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl">Select Your Protocols</h3>
        <div className="text-sm text-gray-400">
          {selectedPools.length} selected
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search protocols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pools List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPools.map((pool) => (
          <motion.div
            key={pool.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => togglePool(pool.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedPools.includes(pool.id)
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{pool.name}</div>
                <div className="text-xs text-gray-400 capitalize">{pool.project}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {pool.apy.toFixed(2)}% APY
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${(pool.tvl / 1000000).toFixed(1)}M TVL
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPools.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No protocols found
        </div>
      )}

      {/* Save Button */}
      {selectedPools.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Track Selected Protocols
        </motion.button>
      )}
    </motion.div>
  );
}
