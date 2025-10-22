/**
 * Script de diagnostic pour identifier les erreurs potentielles avec l'API DefiLlama
 */

import { DeFiLlamaAPI } from './services/defillama/api';

async function runDiagnostics() {
  console.log('🔍 DIAGNOSTIC DE L\'API DEFILLAMA\n');
  console.log('='.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };
  
  // Test 1: Connexion de base
  console.log('\n📡 Test 1: Connexion à l\'API');
  try {
    const pools = await DeFiLlamaAPI.getAllPools();
    console.log(`✅ Connexion réussie - ${pools.length} pools récupérés`);
    results.passed++;
    
    // Test 2: Vérification de la structure des données
    console.log('\n📊 Test 2: Vérification de la structure des données');
    if (pools.length === 0) {
      console.log('❌ ERREUR: Aucun pool récupéré');
      results.failed++;
    } else {
      const firstPool = pools[0];
      const requiredFields = ['chain', 'project', 'symbol', 'tvlUsd', 'apy', 'pool'];
      const missingFields = requiredFields.filter(field => !(field in firstPool));
      
      if (missingFields.length > 0) {
        console.log(`❌ ERREUR: Champs manquants: ${missingFields.join(', ')}`);
        results.failed++;
      } else {
        console.log('✅ Tous les champs requis sont présents');
        results.passed++;
      }
    }
    
    // Test 3: Vérification des valeurs
    console.log('\n🔢 Test 3: Vérification des valeurs');
    const invalidPools = pools.filter(p => 
      typeof p.tvlUsd !== 'number' || 
      typeof p.apy !== 'number' ||
      isNaN(p.tvlUsd) ||
      isNaN(p.apy)
    );
    
    if (invalidPools.length > 0) {
      console.log(`⚠️  ATTENTION: ${invalidPools.length} pools avec des valeurs invalides`);
      console.log('Exemples:', invalidPools.slice(0, 3).map(p => ({
        pool: p.pool,
        tvlUsd: p.tvlUsd,
        apy: p.apy
      })));
      results.warnings++;
    } else {
      console.log('✅ Toutes les valeurs sont valides');
      results.passed++;
    }
    
    // Test 4: Vérification des APY extrêmes
    console.log('\n📈 Test 4: Vérification des APY extrêmes');
    const extremeApyPools = pools.filter(p => p.apy > 1000);
    if (extremeApyPools.length > 0) {
      console.log(`⚠️  ATTENTION: ${extremeApyPools.length} pools avec APY > 1000%`);
      console.log('Top 5 APY extrêmes:');
      extremeApyPools
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 5)
        .forEach(p => {
          console.log(`   ${p.project} - ${p.symbol}: ${p.apy.toFixed(2)}% (TVL: $${(p.tvlUsd / 1e6).toFixed(2)}M)`);
        });
      results.warnings++;
    } else {
      console.log('✅ Pas d\'APY extrêmes détectés');
      results.passed++;
    }
    
    // Test 5: Filtrage par chaîne
    console.log('\n⛓️  Test 5: Filtrage par chaîne (Base)');
    try {
      const basePools = await DeFiLlamaAPI.getPoolsByChain('Base');
      console.log(`✅ ${basePools.length} pools trouvés sur Base`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ERREUR lors du filtrage: ${error}`);
      results.failed++;
    }
    
    // Test 6: Filtrage par projet
    console.log('\n🏗️  Test 6: Filtrage par projet (uniswap-v3)');
    try {
      const uniswapPools = await DeFiLlamaAPI.getPoolsByProject('uniswap-v3');
      console.log(`✅ ${uniswapPools.length} pools Uniswap V3 trouvés`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ERREUR lors du filtrage: ${error}`);
      results.failed++;
    }
    
    // Test 7: Top pools
    console.log('\n🏆 Test 7: Récupération des top pools');
    try {
      const topPools = await DeFiLlamaAPI.getTopPoolsByApy(10, 1000000);
      if (topPools.length === 0) {
        console.log('⚠️  ATTENTION: Aucun pool trouvé avec TVL > $1M');
        results.warnings++;
      } else {
        console.log(`✅ ${topPools.length} top pools récupérés`);
        console.log('Top 3:');
        topPools.slice(0, 3).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.project} - ${p.symbol}: ${p.apy.toFixed(2)}%`);
        });
        results.passed++;
      }
    } catch (error) {
      console.log(`❌ ERREUR: ${error}`);
      results.failed++;
    }
    
    // Test 8: Pools stablecoins
    console.log('\n💵 Test 8: Récupération des pools stablecoins');
    try {
      const stablePools = await DeFiLlamaAPI.getStablecoinPools(100000);
      console.log(`✅ ${stablePools.length} pools stablecoins trouvés (TVL > $100K)`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ERREUR: ${error}`);
      results.failed++;
    }
    
    // Test 9: Filtres personnalisés
    console.log('\n🔍 Test 9: Filtres personnalisés');
    try {
      const filtered = await DeFiLlamaAPI.getFilteredPools({
        chain: 'Base',
        minTvl: 100000,
        minApy: 5,
        stablecoin: true
      });
      console.log(`✅ ${filtered.length} pools trouvés avec filtres personnalisés`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ERREUR: ${error}`);
      results.failed++;
    }
    
    // Test 10: Récupération d'un pool spécifique
    console.log('\n🎯 Test 10: Récupération d\'un pool spécifique');
    try {
      if (pools.length > 0) {
        const poolId = pools[0].pool;
        const pool = await DeFiLlamaAPI.getPoolById(poolId);
        if (pool) {
          console.log(`✅ Pool récupéré: ${pool.project} - ${pool.symbol}`);
          results.passed++;
        } else {
          console.log('⚠️  Pool non trouvé');
          results.warnings++;
        }
      }
    } catch (error) {
      console.log(`❌ ERREUR: ${error}`);
      results.failed++;
    }
    
    // Test 11: Vérification des pools avec données manquantes
    console.log('\n📋 Test 11: Vérification des données optionnelles');
    const poolsWithoutApyBase = pools.filter(p => p.apyBase === undefined || p.apyBase === null);
    const poolsWithoutRewards = pools.filter(p => !p.rewardTokens || p.rewardTokens.length === 0);
    const poolsWithoutIlRisk = pools.filter(p => !p.ilRisk);
    
    console.log(`   Pools sans apyBase: ${poolsWithoutApyBase.length} (${((poolsWithoutApyBase.length / pools.length) * 100).toFixed(1)}%)`);
    console.log(`   Pools sans rewards: ${poolsWithoutRewards.length} (${((poolsWithoutRewards.length / pools.length) * 100).toFixed(1)}%)`);
    console.log(`   Pools sans ilRisk: ${poolsWithoutIlRisk.length} (${((poolsWithoutIlRisk.length / pools.length) * 100).toFixed(1)}%)`);
    console.log('✅ Données optionnelles vérifiées');
    results.passed++;
    
    // Test 12: Performance
    console.log('\n⚡ Test 12: Test de performance');
    const startTime = Date.now();
    await DeFiLlamaAPI.getAllPools();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 5000) {
      console.log(`⚠️  ATTENTION: Temps de réponse lent (${duration}ms)`);
      results.warnings++;
    } else {
      console.log(`✅ Temps de réponse acceptable: ${duration}ms`);
      results.passed++;
    }
    
  } catch (error) {
    console.log('\n❌ ERREUR CRITIQUE lors de la connexion à l\'API:');
    if (error instanceof Error) {
      console.log(`   Message: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    } else {
      console.log(`   ${error}`);
    }
    results.failed++;
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DU DIAGNOSTIC\n');
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`⚠️  Avertissements: ${results.warnings}`);
  
  const total = results.passed + results.failed + results.warnings;
  const successRate = (results.passed / total) * 100;
  
  console.log(`\n📈 Taux de réussite: ${successRate.toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n✅ TOUS LES TESTS CRITIQUES SONT PASSÉS');
    console.log('L\'API DefiLlama fonctionne correctement.');
  } else {
    console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('Veuillez vérifier les erreurs ci-dessus.');
  }
  
  if (results.warnings > 0) {
    console.log('\n⚠️  AVERTISSEMENTS DÉTECTÉS');
    console.log('Ces avertissements n\'empêchent pas le fonctionnement mais méritent attention.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Exécuter le diagnostic
runDiagnostics().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
