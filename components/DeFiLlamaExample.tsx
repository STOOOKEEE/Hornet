/**
 * Composant exemple d'utilisation de l'API DeFiLlama
 */

import React, { useState } from 'react';
import { useTopPools, useStablecoinPools, usePoolsByChain, useDeFiLlama } from '@/hooks/useDeFiLlama';
import { Pool } from '@/services/defillama';

/**
 * Composant pour afficher un pool
 */
const PoolCard: React.FC<{ pool: Pool }> = ({ pool }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{pool.symbol}</h3>
          <p className="text-sm text-gray-600">{pool.project}</p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          {pool.chain}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div>
          <p className="text-xs text-gray-500">APY Total</p>
          <p className="text-lg font-semibold text-green-600">
            {pool.apy.toFixed(2)}%
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">TVL</p>
          <p className="text-lg font-semibold">
            ${(pool.tvlUsd / 1e6).toFixed(2)}M
          </p>
        </div>
        
        {pool.apyBase !== undefined && (
          <div>
            <p className="text-xs text-gray-500">APY Base</p>
            <p className="text-sm">{pool.apyBase.toFixed(2)}%</p>
          </div>
        )}
        
        {pool.apyReward !== undefined && (
          <div>
            <p className="text-xs text-gray-500">APY Rewards</p>
            <p className="text-sm">{pool.apyReward.toFixed(2)}%</p>
          </div>
        )}
      </div>
      
      {pool.stablecoin && (
        <div className="mt-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            Stablecoin
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Exemple 1: Afficher les meilleurs pools
 */
export const TopPoolsExample: React.FC = () => {
  const { pools, loading, error } = useTopPools(10, 1000000);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Top 10 Pools par APY</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pools.map((pool) => (
          <PoolCard key={pool.pool} pool={pool} />
        ))}
      </div>
    </div>
  );
};

/**
 * Exemple 2: Afficher les pools stablecoins
 */
export const StablecoinPoolsExample: React.FC = () => {
  const { pools, loading, error } = useStablecoinPools(500000);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error.message}</p>
      </div>
    );
  }

  // Trier par APY et prendre les 10 premiers
  const topStable = [...pools]
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Meilleurs Pools Stablecoins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topStable.map((pool) => (
          <PoolCard key={pool.pool} pool={pool} />
        ))}
      </div>
    </div>
  );
};

/**
 * Exemple 3: Pools par chaîne avec sélecteur
 */
export const PoolsByChainExample: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const { pools, loading, error } = usePoolsByChain(selectedChain);

  const chains = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'BSC', 'Avalanche'];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error.message}</p>
      </div>
    );
  }

  // Trier par APY et prendre les 9 premiers
  const topPools = [...pools]
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 9);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Pools par Chaîne</h2>
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {chains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">
              {pools.length} pools trouvés sur {selectedChain}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPools.map((pool) => (
              <PoolCard key={pool.pool} pool={pool} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Exemple 4: Recherche personnalisée avec filtres
 */
export const CustomSearchExample: React.FC = () => {
  const { pools, loading, error, fetchFilteredPools } = useDeFiLlama();
  const [minApy, setMinApy] = useState(10);
  const [minTvl, setMinTvl] = useState(1000000);
  const [stablecoinOnly, setStablecoinOnly] = useState(false);

  const handleSearch = () => {
    fetchFilteredPools({
      minApy,
      minTvl,
      stablecoin: stablecoinOnly || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Recherche Personnalisée</h2>
      
      <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              APY Minimum (%)
            </label>
            <input
              type="number"
              value={minApy}
              onChange={(e) => setMinApy(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              TVL Minimum ($)
            </label>
            <input
              type="number"
              value={minTvl}
              onChange={(e) => setMinTvl(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={stablecoinOnly}
                onChange={(e) => setStablecoinOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Stablecoins uniquement</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur: {error.message}</p>
        </div>
      )}

      {pools.length > 0 && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              {pools.length} pools trouvés
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pools.slice(0, 12).map((pool) => (
              <PoolCard key={pool.pool} pool={pool} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Composant principal avec tous les exemples
 */
export const DeFiLlamaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'top' | 'stable' | 'chain' | 'search'>('top');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DeFiLlama Yields Dashboard</h1>
          <p className="text-gray-600">
            Explorez les meilleurs pools de liquidité et leurs rendements
          </p>
        </header>

        <div className="mb-6 border-b">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'top'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Top Pools
            </button>
            <button
              onClick={() => setActiveTab('stable')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'stable'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Stablecoins
            </button>
            <button
              onClick={() => setActiveTab('chain')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'chain'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Par Chaîne
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recherche
            </button>
          </nav>
        </div>

        <main>
          {activeTab === 'top' && <TopPoolsExample />}
          {activeTab === 'stable' && <StablecoinPoolsExample />}
          {activeTab === 'chain' && <PoolsByChainExample />}
          {activeTab === 'search' && <CustomSearchExample />}
        </main>
      </div>
    </div>
  );
};

export default DeFiLlamaDashboard;
