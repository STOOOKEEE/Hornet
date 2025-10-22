/**
 * Exemples d'utilisation du service Gemini pour analyser les pools DeFiLlama
 */

import { GeminiAPI } from './api';
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
  
  // Initialiser Gemini
  const gemini = new GeminiAPI({ apiKey });
  
  console.log('🤖 Analyse des pools avec Gemini...\n');
  
  // Analyser les pools
  const analysis = await gemini.analyzePools({
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
  
  // Initialiser Gemini
  const gemini = new GeminiAPI({ apiKey });
  
  console.log('🤖 Analyse avec Gemini...\n');
  
  // Analyser avec critères conservateurs
  const analysis = await gemini.analyzePools({
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
 * Exemple 3: Workflow complet - De la recherche à la recommandation
 */
export async function completeWorkflow(apiKey: string) {
  console.log('🚀 WORKFLOW COMPLET D\'ANALYSE\n');
  console.log('='.repeat(60));
  
  try {
    // Étape 1: Récupérer les pools
    console.log('\n📥 Étape 1: Récupération des pools DeFiLlama...');
    const allPools = await DeFiLlamaAPI.getTopPoolsByApy(30, 500000);
    console.log(`✅ ${allPools.length} pools récupérés`);
    
    // Étape 2: Analyser avec Gemini
    console.log('\n🤖 Étape 2: Analyse avec Gemini...');
    const gemini = new GeminiAPI({ apiKey });
    
    const analysis = await gemini.analyzePools({
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
    const riskEval = await gemini.evaluatePoolRisk(bestPool);
    console.log('\n' + riskEval);
    
    // Étape 5: Stratégie d'investissement
    console.log('\n💼 Étape 5: Génération de la stratégie d\'investissement...');
    const strategy = await gemini.generateInvestmentStrategy(
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
export async function runGeminiExamples(apiKey: string) {
  console.log('='.repeat(60));
  console.log('EXEMPLES D\'UTILISATION DE GEMINI AVEC DEFILLAMA');
  console.log('='.repeat(60));
  
  try {
    // Exemple complet
    await completeWorkflow(apiKey);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}
