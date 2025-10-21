/**
 * Exemples d'utilisation de l'API DeFiLlama
 */

import { DeFiLlamaAPI, Pool } from './index';

/**
 * Exemple 1: Récupérer et afficher les meilleurs pools
 */
export async function getTopYieldPools() {
  console.log('🔍 Recherche des meilleurs pools...\n');
  
  const topPools = await DeFiLlamaAPI.getTopPoolsByApy(10, 1000000);
  
  console.log('📊 Top 10 pools par APY (TVL > $1M):\n');
  topPools.forEach((pool, index) => {
    console.log(`${index + 1}. ${pool.project} - ${pool.symbol}`);
    console.log(`   Chain: ${pool.chain}`);
    console.log(`   APY: ${pool.apy.toFixed(2)}%`);
    console.log(`   TVL: $${(pool.tvlUsd / 1e6).toFixed(2)}M`);
    console.log('');
  });
  
  return topPools;
}

/**
 * Exemple 2: Trouver les meilleurs pools stablecoins
 */
export async function getBestStablecoinPools() {
  console.log('🔍 Recherche des meilleurs pools stablecoins...\n');
  
  const stablePools = await DeFiLlamaAPI.getStablecoinPools(500000);
  const topStable = stablePools
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 10);
  
  console.log('💰 Top 10 pools stablecoins (TVL > $500K):\n');
  topStable.forEach((pool, index) => {
    const stats = DeFiLlamaAPI.calculatePoolStats(pool);
    console.log(`${index + 1}. ${pool.project} - ${pool.symbol}`);
    console.log(`   Chain: ${pool.chain}`);
    console.log(`   APY Total: ${stats.totalApy.toFixed(2)}%`);
    console.log(`   APY Base: ${stats.baseApy.toFixed(2)}%`);
    console.log(`   APY Rewards: ${stats.rewardApy.toFixed(2)}%`);
    console.log(`   TVL: $${(stats.tvlUsd / 1e6).toFixed(2)}M`);
    console.log('');
  });
  
  return topStable;
}

/**
 * Exemple 3: Comparer les pools sur différentes chaînes
 */
export async function compareChains(chains: string[]) {
  console.log('🔍 Comparaison des chaînes...\n');
  
  for (const chain of chains) {
    const pools = await DeFiLlamaAPI.getPoolsByChain(chain);
    
    if (pools.length === 0) {
      console.log(`❌ ${chain}: Aucun pool trouvé\n`);
      continue;
    }
    
    const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length;
    const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
    const maxApy = Math.max(...pools.map(p => p.apy));
    
    console.log(`⛓️  ${chain}:`);
    console.log(`   Nombre de pools: ${pools.length}`);
    console.log(`   APY moyen: ${avgApy.toFixed(2)}%`);
    console.log(`   APY max: ${maxApy.toFixed(2)}%`);
    console.log(`   TVL total: $${(totalTvl / 1e9).toFixed(2)}B`);
    console.log('');
  }
}

/**
 * Exemple 4: Analyser un projet spécifique
 */
export async function analyzeProject(projectName: string) {
  console.log(`🔍 Analyse du projet: ${projectName}\n`);
  
  const pools = await DeFiLlamaAPI.getPoolsByProject(projectName);
  
  if (pools.length === 0) {
    console.log(`❌ Aucun pool trouvé pour ${projectName}`);
    return;
  }
  
  console.log(`📊 ${pools.length} pools trouvés\n`);
  
  // Grouper par chaîne
  const poolsByChain = pools.reduce((acc, pool) => {
    if (!acc[pool.chain]) {
      acc[pool.chain] = [];
    }
    acc[pool.chain].push(pool);
    return acc;
  }, {} as Record<string, Pool[]>);
  
  // Afficher les statistiques par chaîne
  Object.entries(poolsByChain).forEach(([chain, chainPools]) => {
    const avgApy = chainPools.reduce((sum, p) => sum + p.apy, 0) / chainPools.length;
    const totalTvl = chainPools.reduce((sum, p) => sum + p.tvlUsd, 0);
    
    console.log(`⛓️  ${chain}:`);
    console.log(`   Pools: ${chainPools.length}`);
    console.log(`   APY moyen: ${avgApy.toFixed(2)}%`);
    console.log(`   TVL total: $${(totalTvl / 1e6).toFixed(2)}M`);
    
    // Top 3 pools de cette chaîne
    const topPools = chainPools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3);
    
    console.log('   Top pools:');
    topPools.forEach(pool => {
      console.log(`     • ${pool.symbol}: ${pool.apy.toFixed(2)}% APY`);
    });
    console.log('');
  });
  
  return pools;
}

/**
 * Exemple 5: Trouver des opportunités avec critères personnalisés
 */
export async function findOpportunities(criteria: {
  minApy: number;
  minTvl: number;
  maxIlRisk?: string;
  chains?: string[];
  stablecoinOnly?: boolean;
}) {
  console.log('🔍 Recherche d\'opportunités avec critères personnalisés...\n');
  console.log('Critères:');
  console.log(`  APY minimum: ${criteria.minApy}%`);
  console.log(`  TVL minimum: $${(criteria.minTvl / 1e6).toFixed(2)}M`);
  if (criteria.maxIlRisk) console.log(`  Risque IL max: ${criteria.maxIlRisk}`);
  if (criteria.chains) console.log(`  Chaînes: ${criteria.chains.join(', ')}`);
  if (criteria.stablecoinOnly) console.log('  Stablecoins uniquement');
  console.log('');
  
  const allPools = await DeFiLlamaAPI.getAllPools();
  
  const opportunities = allPools.filter(pool => {
    // Critères de base
    if (pool.apy < criteria.minApy) return false;
    if (pool.tvlUsd < criteria.minTvl) return false;
    
    // Filtre stablecoin
    if (criteria.stablecoinOnly && !pool.stablecoin) return false;
    
    // Filtre chaînes
    if (criteria.chains && !criteria.chains.includes(pool.chain)) return false;
    
    // Filtre risque IL
    if (criteria.maxIlRisk && pool.ilRisk && pool.ilRisk !== criteria.maxIlRisk) {
      return false;
    }
    
    return true;
  });
  
  // Trier par APY
  opportunities.sort((a, b) => b.apy - a.apy);
  
  console.log(`✅ ${opportunities.length} opportunités trouvées\n`);
  
  // Afficher les 10 meilleures
  const top10 = opportunities.slice(0, 10);
  top10.forEach((pool, index) => {
    const stats = DeFiLlamaAPI.calculatePoolStats(pool);
    console.log(`${index + 1}. ${pool.project} - ${pool.symbol}`);
    console.log(`   Chain: ${pool.chain}`);
    console.log(`   APY: ${pool.apy.toFixed(2)}% (Base: ${stats.baseApy.toFixed(2)}% + Rewards: ${stats.rewardApy.toFixed(2)}%)`);
    console.log(`   TVL: $${(pool.tvlUsd / 1e6).toFixed(2)}M`);
    console.log(`   Risque IL: ${pool.ilRisk || 'N/A'}`);
    console.log(`   Stablecoin: ${pool.stablecoin ? 'Oui' : 'Non'}`);
    console.log('');
  });
  
  return opportunities;
}

/**
 * Exemple 6: Monitorer un pool spécifique avec historique
 */
export async function monitorPoolWithHistory(poolId: string) {
  console.log(`🔍 Monitoring du pool: ${poolId}\n`);
  
  // Récupérer les infos du pool
  const pool = await DeFiLlamaAPI.getPoolById(poolId);
  
  if (!pool) {
    console.log('❌ Pool non trouvé');
    return;
  }
  
  const stats = DeFiLlamaAPI.calculatePoolStats(pool);
  
  console.log('📊 Informations actuelles:');
  console.log(`   Projet: ${pool.project}`);
  console.log(`   Symbole: ${pool.symbol}`);
  console.log(`   Chain: ${pool.chain}`);
  console.log(`   APY Total: ${stats.totalApy.toFixed(2)}%`);
  console.log(`   APY Base: ${stats.baseApy.toFixed(2)}%`);
  console.log(`   APY Rewards: ${stats.rewardApy.toFixed(2)}%`);
  console.log(`   TVL: $${(stats.tvlUsd / 1e6).toFixed(2)}M`);
  console.log(`   Stablecoin: ${stats.isStablecoin ? 'Oui' : 'Non'}`);
  console.log(`   Risque IL: ${stats.risk}`);
  console.log(`   Exposition: ${stats.exposure}`);
  
  if (stats.hasRewards) {
    console.log(`   Tokens de reward: ${stats.rewardTokens.join(', ')}`);
  }
  
  // Récupérer l'historique
  try {
    console.log('\n📈 Historique récent:');
    const history = await DeFiLlamaAPI.getPoolHistory(poolId);
    const recentData = history.data.slice(-7); // 7 derniers points
    
    recentData.forEach(point => {
      const date = new Date(point.timestamp).toLocaleDateString();
      console.log(`   ${date}: APY ${point.apy.toFixed(2)}% | TVL $${(point.tvlUsd / 1e6).toFixed(2)}M`);
    });
    
    // Calculer les variations
    if (recentData.length >= 2) {
      const oldest = recentData[0];
      const newest = recentData[recentData.length - 1];
      const apyChange = newest.apy - oldest.apy;
      const tvlChange = ((newest.tvlUsd - oldest.tvlUsd) / oldest.tvlUsd) * 100;
      
      console.log('\n📊 Variations:');
      console.log(`   APY: ${apyChange > 0 ? '+' : ''}${apyChange.toFixed(2)}%`);
      console.log(`   TVL: ${tvlChange > 0 ? '+' : ''}${tvlChange.toFixed(2)}%`);
    }
  } catch (error) {
    console.log('\n⚠️  Historique non disponible pour ce pool');
  }
  
  return pool;
}

// Fonction principale pour exécuter tous les exemples
export async function runAllExamples() {
  console.log('='.repeat(60));
  console.log('EXEMPLES D\'UTILISATION DE L\'API DEFILLAMA');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Exemple 1
    console.log('--- Exemple 1: Top Pools ---');
    await getTopYieldPools();
    
    // Exemple 2
    console.log('\n--- Exemple 2: Meilleurs Pools Stablecoins ---');
    await getBestStablecoinPools();
    
    // Exemple 3
    console.log('\n--- Exemple 3: Comparaison de Chaînes ---');
    await compareChains(['Ethereum', 'Polygon', 'Arbitrum', 'Optimism']);
    
    // Exemple 4
    console.log('\n--- Exemple 4: Analyse de Projet ---');
    await analyzeProject('uniswap-v3');
    
    // Exemple 5
    console.log('\n--- Exemple 5: Recherche d\'Opportunités ---');
    await findOpportunities({
      minApy: 10,
      minTvl: 1000000,
      stablecoinOnly: true,
      chains: ['Ethereum', 'Arbitrum']
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des exemples:', error);
  }
}
