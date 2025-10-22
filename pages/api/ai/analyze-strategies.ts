import type { NextApiRequest, NextApiResponse } from 'next';
import { GeminiAPI } from '../../../services/gemini/api';
import { Pool } from '../../../services/defillama/types';

interface AnalyzeRequest {
  pools: Pool[];
  riskLevel: 'low' | 'medium' | 'high';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pools, riskLevel } = req.body as AnalyzeRequest;

    if (!pools || !Array.isArray(pools) || pools.length === 0) {
      return res.status(400).json({ error: 'Pools array is required' });
    }

    if (!riskLevel || !['low', 'medium', 'high'].includes(riskLevel)) {
      return res.status(400).json({ error: 'Valid risk level is required (low, medium, high)' });
    }

    // Limiter le nombre de pools pour éviter de surcharger Gemini
    // Prendre les 30 meilleurs pools par TVL
    const limitedPools = pools
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, 30);
    
    console.log(`📊 Analyse de ${limitedPools.length} pools (sur ${pools.length} disponibles)`);

    // Vérifier la clé API Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Initialiser l'API Gemini
    const gemini = new GeminiAPI({
      apiKey,
      model: 'gemini-2.5-flash',
    });

    // Mapper le niveau de risque vers la tolérance
    const riskToleranceMap = {
      low: 'conservative',
      medium: 'moderate',
      high: 'aggressive',
    } as const;

    // Analyser les pools avec Gemini
    const analysis = await gemini.analyzePools({
      pools: limitedPools,
      criteria: {
        riskTolerance: riskToleranceMap[riskLevel],
        preferStablecoins: true,
        minTvl: 10000,
        preferredChains: ['Base'],
      },
      customPrompt: `Analyse ces pools de liquidité USDC sur Base et recommande les 3 meilleures stratégies pour chaque niveau de risque:
      
1. **Stratégie Faible Risque** (conservative): Pools stables avec TVL élevé et protocoles établis
2. **Stratégie Risque Modéré** (moderate): Équilibre entre rendement et sécurité
3. **Stratégie Risque Élevé** (aggressive): Maximisation du rendement avec des protocoles plus récents ou innovants

Pour chaque stratégie, fournis:
- Le pool recommandé
- L'APY attendu
- Le niveau de confiance (0-100)
- Les avantages et inconvénients
- Une explication détaillée

Concentre-toi sur les pools avec le meilleur rapport rendement/risque pour chaque catégorie.`,
    });

    // Organiser les recommandations par niveau de risque
    const strategies = {
      low: analysis.recommendations.filter((r: any) => r.riskLevel === 'low').slice(0, 1),
      medium: analysis.recommendations.filter((r: any) => r.riskLevel === 'medium').slice(0, 1),
      high: analysis.recommendations.filter((r: any) => r.riskLevel === 'high').slice(0, 1),
      best: analysis.recommendations[0], // Meilleure stratégie globale
    };

    res.status(200).json({
      success: true,
      strategies,
      summary: analysis.summary,
      marketInsights: analysis.marketInsights,
      warnings: analysis.warnings,
      totalPoolsAnalyzed: limitedPools.length,
      totalPoolsAvailable: pools.length,
    });
  } catch (error) {
    console.error('Error analyzing strategies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze strategies',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
