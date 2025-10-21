/**
 * Exemples d'utilisation du service Grok pour analyser les pools DeFiLlama
 */

import { GrokAPI } from './api';
import { DeFiLlamaAPI } from '../defillama/api';
import { Pool } from '../defillama/types';

/**
 * Exemple 1: Analyser les meilleurs pools et obtenir des recommandations
 */
export async function analyzeTopPools(apiKey: string) {
  console.log('🔍 Récupération des meilleurs pools...\n');
  
  // Récupérer les pools de DeFiLlama
  const pools = await DeFiLlamaAPI.getTopPoolsByApy(20, 1000000);
  
  console.log(`✅ ${pools.length} pools récupérés\n`);
  
  // Initialiser Grok
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Analyse des pools avec Grok...\n');
  
  // Analyser les pools
  const analysis = await grok.analyzePools({
    pools,
    criteria: {
      riskTolerance: 'medium',
      preferStablecoins: false,
      minTvl: 1000000,
    },
  });
  
  console.log('📊 RÉSULTATS DE L\'ANALYSE\n');
  console.log('='.repeat(60));
  
  // Afficher le résumé
  console.log('\n📝 Résumé:');
  console.log(analysis.summary);
  
  // Afficher les insights
  console.log('\n💡 Insights du marché:');
  console.log(analysis.marketInsights);
  
  // Afficher les avertissements
  if (analysis.warnings.length > 0) {
    console.log('\n⚠️  Avertissements:');
    analysis.warnings.forEach((warning, i) => {
      console.log(`${i + 1}. ${warning}`);
    });
  }
  
  // Afficher les recommandations
  console.log('\n🎯 TOP RECOMMANDATIONS:\n');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.pool.project} - ${rec.pool.symbol}`);
    console.log(`   Score: ${rec.score}/100`);
    console.log(`   Chain: ${rec.pool.chain}`);
    console.log(`   APY: ${rec.pool.apy.toFixed(2)}%`);
    console.log(`   TVL: $${(rec.pool.tvlUsd / 1e6).toFixed(2)}M`);
    console.log(`   Risque: ${rec.riskLevel.toUpperCase()}`);
    console.log(`   \n   Analyse: ${rec.reasoning}`);
    console.log(`   \n   ✅ Avantages:`);
    rec.pros.forEach(pro => console.log(`      • ${pro}`));
    console.log(`   \n   ⚠️  Inconvénients:`);
    rec.cons.forEach(con => console.log(`      • ${con}`));
    console.log('');
  });
  
  return analysis;
}

/**
 * Exemple 2: Analyser les pools stablecoins avec faible risque
 */
export async function analyzeStablecoinPools(apiKey: string) {
  console.log('🔍 Récupération des pools stablecoins...\n');
  
  // Récupérer les pools stablecoins
  const pools = await DeFiLlamaAPI.getStablecoinPools(500000);
  
  // Trier par APY et prendre les 15 meilleurs
  const topStable = pools
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 15);
  
  console.log(`✅ ${topStable.length} pools stablecoins récupérés\n`);
  
  // Initialiser Grok
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Analyse avec Grok...\n');
  
  // Analyser avec critères conservateurs
  const analysis = await grok.analyzePools({
    pools: topStable,
    criteria: {
      riskTolerance: 'low',
      preferStablecoins: true,
      minTvl: 500000,
    },
    customPrompt: 'Analyse ces pools stablecoins et recommande les 5 meilleurs pour un investisseur conservateur cherchant un rendement stable avec un risque minimal.',
  });
  
  console.log('📊 MEILLEURS POOLS STABLECOINS\n');
  console.log('='.repeat(60));
  
  console.log('\n📝 Résumé:');
  console.log(analysis.summary);
  
  console.log('\n🎯 Recommandations:\n');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.pool.project} - ${rec.pool.symbol}`);
    console.log(`   APY: ${rec.pool.apy.toFixed(2)}%`);
    console.log(`   Score: ${rec.score}/100`);
    console.log(`   ${rec.reasoning}\n`);
  });
  
  return analysis;
}

/**
 * Exemple 3: Comparer deux pools spécifiques
 */
export async function compareTwoPools(apiKey: string, poolId1: string, poolId2: string) {
  console.log('🔍 Récupération des pools...\n');
  
  const pool1 = await DeFiLlamaAPI.getPoolById(poolId1);
  const pool2 = await DeFiLlamaAPI.getPoolById(poolId2);
  
  if (!pool1 || !pool2) {
    console.log('❌ Un ou plusieurs pools non trouvés');
    return;
  }
  
  console.log('✅ Pools récupérés\n');
  
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Comparaison avec Grok...\n');
  
  const comparison = await grok.comparePools(pool1, pool2);
  
  console.log('📊 COMPARAISON DES POOLS\n');
  console.log('='.repeat(60));
  console.log(comparison);
  
  return comparison;
}

/**
 * Exemple 4: Obtenir des insights sur le marché
 */
export async function getMarketAnalysis(apiKey: string, chain?: string) {
  console.log('🔍 Récupération des données du marché...\n');
  
  let pools: Pool[];
  
  if (chain) {
    pools = await DeFiLlamaAPI.getPoolsByChain(chain);
    console.log(`✅ ${pools.length} pools récupérés sur ${chain}\n`);
  } else {
    pools = await DeFiLlamaAPI.getAllPools();
    console.log(`✅ ${pools.length} pools récupérés (toutes chaînes)\n`);
  }
  
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Analyse du marché avec Grok...\n');
  
  const insights = await grok.getMarketInsights(pools);
  
  console.log('📊 ANALYSE DU MARCHÉ\n');
  console.log('='.repeat(60));
  console.log(insights);
  
  return insights;
}

/**
 * Exemple 5: Évaluer le risque d'un pool spécifique
 */
export async function evaluatePoolRisk(apiKey: string, poolId: string) {
  console.log('🔍 Récupération du pool...\n');
  
  const pool = await DeFiLlamaAPI.getPoolById(poolId);
  
  if (!pool) {
    console.log('❌ Pool non trouvé');
    return;
  }
  
  console.log(`✅ Pool récupéré: ${pool.project} - ${pool.symbol}\n`);
  
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Évaluation des risques avec Grok...\n');
  
  const riskAnalysis = await grok.evaluatePoolRisk(pool);
  
  console.log('📊 ÉVALUATION DES RISQUES\n');
  console.log('='.repeat(60));
  console.log(riskAnalysis);
  
  return riskAnalysis;
}

/**
 * Exemple 6: Générer une stratégie d'investissement
 */
export async function generateStrategy(
  apiKey: string,
  budget: number,
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
) {
  console.log('🔍 Récupération des pools pour la stratégie...\n');
  
  // Récupérer différents types de pools selon le profil
  let pools: Pool[];
  
  if (riskProfile === 'conservative') {
    pools = await DeFiLlamaAPI.getStablecoinPools(1000000);
  } else if (riskProfile === 'moderate') {
    const stable = await DeFiLlamaAPI.getStablecoinPools(500000);
    const topPools = await DeFiLlamaAPI.getTopPoolsByApy(30, 500000);
    pools = [...stable.slice(0, 10), ...topPools.slice(0, 10)];
  } else {
    pools = await DeFiLlamaAPI.getTopPoolsByApy(50, 100000);
  }
  
  console.log(`✅ ${pools.length} pools sélectionnés\n`);
  
  const grok = new GrokAPI({ apiKey });
  
  console.log('🤖 Génération de la stratégie avec Grok...\n');
  
  const strategy = await grok.generateInvestmentStrategy(pools, budget, riskProfile);
  
  console.log('📊 STRATÉGIE D\'INVESTISSEMENT\n');
  console.log('='.repeat(60));
  console.log(`Budget: $${budget.toLocaleString()}`);
  console.log(`Profil: ${riskProfile.toUpperCase()}\n`);
  console.log(strategy);
  
  return strategy;
}

/**
 * Exemple 7: Workflow complet - De la recherche à la recommandation
 */
export async function completeWorkflow(apiKey: string) {
  console.log('🚀 WORKFLOW COMPLET D\'ANALYSE\n');
  console.log('='.repeat(60));
  
  try {
    // Étape 1: Récupérer les pools
    console.log('\n📥 Étape 1: Récupération des pools DeFiLlama...');
    const allPools = await DeFiLlamaAPI.getTopPoolsByApy(30, 500000);
    console.log(`✅ ${allPools.length} pools récupérés`);
    
    // Étape 2: Analyser avec Grok
    console.log('\n🤖 Étape 2: Analyse avec Grok...');
    const grok = new GrokAPI({ apiKey });
    
    const analysis = await grok.analyzePools({
      pools: allPools,
      criteria: {
        riskTolerance: 'medium',
        minTvl: 500000,
        investmentAmount: 10000,
      },
    });
    console.log('✅ Analyse terminée');
    
    // Étape 3: Afficher les résultats
    console.log('\n📊 Étape 3: Résultats\n');
    
    console.log('TOP 3 RECOMMANDATIONS:\n');
    analysis.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.pool.project} - ${rec.pool.symbol}`);
      console.log(`   Chain: ${rec.pool.chain}`);
      console.log(`   APY: ${rec.pool.apy.toFixed(2)}%`);
      console.log(`   Score: ${rec.score}/100`);
      console.log(`   Risque: ${rec.riskLevel}`);
      console.log(`   ${rec.reasoning}\n`);
    });
    
    // Étape 4: Évaluation détaillée du meilleur pool
    console.log('\n🔍 Étape 4: Évaluation détaillée du meilleur pool...');
    const bestPool = analysis.recommendations[0].pool;
    const riskEval = await grok.evaluatePoolRisk(bestPool);
    console.log('\n' + riskEval);
    
    // Étape 5: Stratégie d'investissement
    console.log('\n💼 Étape 5: Génération de la stratégie d\'investissement...');
    const strategy = await grok.generateInvestmentStrategy(
      analysis.recommendations.slice(0, 5).map(r => r.pool),
      10000,
      'moderate'
    );
    console.log('\n' + strategy);
    
    console.log('\n✅ Workflow terminé avec succès!');
    
    return {
      analysis,
      riskEvaluation: riskEval,
      strategy,
    };
  } catch (error) {
    console.error('❌ Erreur lors du workflow:', error);
    throw error;
  }
}

/**
 * Fonction principale pour exécuter les exemples
 */
export async function runGrokExamples(apiKey: string) {
  console.log('='.repeat(60));
  console.log('EXEMPLES D\'UTILISATION DE GROK AVEC DEFILLAMA');
  console.log('='.repeat(60));
  
  try {
    // Exemple complet
    await completeWorkflow(apiKey);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}
