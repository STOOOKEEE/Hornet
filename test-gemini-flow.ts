/**
 * Script de test du flux complet: DefiLlama → Gemini
 */

import { DeFiLlamaAPI } from './services/defillama/api';

async function testCompleteFlow() {
  console.log('🔍 TEST DU FLUX COMPLET: DEFILLAMA → GEMINI\n');
  console.log('='.repeat(60));
  
  try {
    // Étape 1: Récupérer tous les pools
    console.log('\n📡 Étape 1: Récupération des pools DefiLlama...');
    const allPools = await DeFiLlamaAPI.getAllPools();
    console.log(`✅ ${allPools.length} pools récupérés`);
    
    // Étape 2: Filtrer les pools USDC sur Base
    console.log('\n🔍 Étape 2: Filtrage des pools USDC sur Base...');
    const usdcBasePools = allPools.filter(pool => {
      const isBase = pool.chain.toLowerCase() === 'base';
      const hasUSDC = pool.symbol.toLowerCase().includes('usdc');
      const hasMinTvl = pool.tvlUsd >= 10000;
      const hasValidApy = pool.apy > 0 && pool.apy < 1000;
      
      return isBase && hasUSDC && hasMinTvl && hasValidApy;
    });
    
    console.log(`✅ ${usdcBasePools.length} pools USDC sur Base trouvés`);
    
    // Étape 3: Trier par TVL
    const sortedPools = usdcBasePools.sort((a, b) => b.tvlUsd - a.tvlUsd);
    
    // Étape 4: Afficher un échantillon
    console.log('\n📊 Étape 3: Top 10 pools USDC sur Base:\n');
    sortedPools.slice(0, 10).forEach((pool, index) => {
      console.log(`${index + 1}. ${pool.project} - ${pool.symbol}`);
      console.log(`   APY: ${pool.apy.toFixed(2)}% | TVL: $${(pool.tvlUsd / 1e6).toFixed(2)}M`);
      console.log(`   Stablecoin: ${pool.stablecoin ? 'Oui' : 'Non'} | IL Risk: ${pool.ilRisk || 'N/A'}`);
      console.log('');
    });
    
    // Étape 5: Préparer les données pour Gemini
    console.log('📦 Étape 4: Préparation des données pour Gemini...');
    const poolsForGemini = sortedPools.map(pool => ({
      id: pool.pool,
      project: pool.project,
      symbol: pool.symbol,
      chain: pool.chain,
      apy: pool.apy,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      tvlUsd: pool.tvlUsd,
      stablecoin: pool.stablecoin,
      ilRisk: pool.ilRisk,
      exposure: pool.exposure,
      rewardTokens: pool.rewardTokens,
    }));
    
    console.log(`✅ ${poolsForGemini.length} pools formatés pour Gemini`);
    
    // Étape 6: Statistiques
    console.log('\n📈 Étape 5: Statistiques des pools filtrés:');
    
    const totalTvl = sortedPools.reduce((sum, p) => sum + p.tvlUsd, 0);
    const avgApy = sortedPools.reduce((sum, p) => sum + p.apy, 0) / sortedPools.length;
    const maxApy = Math.max(...sortedPools.map(p => p.apy));
    const minApy = Math.min(...sortedPools.map(p => p.apy));
    const stablecoinCount = sortedPools.filter(p => p.stablecoin).length;
    
    console.log(`   TVL Total: $${(totalTvl / 1e6).toFixed(2)}M`);
    console.log(`   APY Moyen: ${avgApy.toFixed(2)}%`);
    console.log(`   APY Min: ${minApy.toFixed(2)}%`);
    console.log(`   APY Max: ${maxApy.toFixed(2)}%`);
    console.log(`   Pools stablecoins: ${stablecoinCount} (${((stablecoinCount / sortedPools.length) * 100).toFixed(1)}%)`);
    
    // Grouper par projet
    const projectCounts: Record<string, number> = {};
    sortedPools.forEach(p => {
      projectCounts[p.project] = (projectCounts[p.project] || 0) + 1;
    });
    
    console.log('\n🏗️  Top 10 projets par nombre de pools:');
    Object.entries(projectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([project, count]) => {
        console.log(`   ${project}: ${count} pools`);
      });
    
    // Étape 7: Analyser par niveau de risque
    console.log('\n⚖️  Étape 6: Répartition par niveau de risque:');
    
    const lowRisk = sortedPools.filter(p => 
      p.tvlUsd > 1000000 && 
      p.apy >= 3 && p.apy <= 10 &&
      (p.ilRisk === 'no' || p.ilRisk === 'low')
    );
    
    const mediumRisk = sortedPools.filter(p => 
      p.tvlUsd > 500000 && 
      p.apy >= 8 && p.apy <= 20 &&
      (p.ilRisk === 'low' || p.ilRisk === 'medium')
    );
    
    const highRisk = sortedPools.filter(p => 
      p.tvlUsd > 100000 && 
      p.apy >= 15 && p.apy <= 50
    );
    
    console.log(`   Faible risque: ${lowRisk.length} pools (TVL>$1M, APY 3-10%)`);
    console.log(`   Risque modéré: ${mediumRisk.length} pools (TVL>$500K, APY 8-20%)`);
    console.log(`   Risque élevé: ${highRisk.length} pools (TVL>$100K, APY 15-50%)`);
    
    // Étape 8: Exemple de payload pour Gemini
    console.log('\n📤 Étape 7: Exemple de payload pour Gemini:');
    console.log('```json');
    console.log(JSON.stringify({
      pools: poolsForGemini.slice(0, 3), // Juste 3 pour l'exemple
      criteria: {
        riskTolerance: 'moderate',
        preferStablecoins: true,
        minTvl: 10000,
        preferredChains: ['Base']
      }
    }, null, 2));
    console.log('```');
    
    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST RÉUSSI - FLUX COMPLET VALIDÉ\n');
    console.log('📊 Résumé:');
    console.log(`   • ${allPools.length} pools totaux récupérés`);
    console.log(`   • ${usdcBasePools.length} pools USDC sur Base filtrés`);
    console.log(`   • ${poolsForGemini.length} pools prêts pour Gemini`);
    console.log(`   • TVL total: $${(totalTvl / 1e6).toFixed(2)}M`);
    console.log(`   • APY moyen: ${avgApy.toFixed(2)}%`);
    
    console.log('\n🎯 Prochaine étape:');
    console.log('   Envoyer ces données à Gemini via /api/ai/analyze-strategies');
    console.log('   avec le niveau de risque souhaité (low/medium/high)');
    
    console.log('\n' + '='.repeat(60));
    
    return {
      totalPools: allPools.length,
      filteredPools: usdcBasePools.length,
      poolsForGemini,
      statistics: {
        totalTvl,
        avgApy,
        maxApy,
        minApy,
        stablecoinCount,
      }
    };
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test:');
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    } else {
      console.error(`   ${error}`);
    }
    throw error;
  }
}

// Exécuter le test
testCompleteFlow().catch(error => {
  console.error('❌ Test échoué:', error);
  process.exit(1);
});
