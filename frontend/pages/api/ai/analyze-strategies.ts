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
    // Prendre les 100 meilleurs pools par TVL
    const limitedPools = pools
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, 100);
    
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
      customPrompt: `Analyse ces pools USDC sur Base et recommande le meilleur pour chaque niveau de risque.

CRITÈRES:
- Low Risk: TVL > $1M, APY 3-10%, protocoles établis (Aave, Morpho, Merkl)
- Medium Risk: TVL > $500K, APY 8-20%, bon équilibre rendement/sécurité
- High Risk: TVL > $100K, APY 15-50%, potentiel élevé

RÉPONSE CONCISE:
Pour chaque pool, fournis UNIQUEMENT:
- Score (0-100)
- 2-3 pros maximum
- 1-2 cons maximum
- 1 phrase d'explication courte

Pas de blabla, juste l'essentiel.`,
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
