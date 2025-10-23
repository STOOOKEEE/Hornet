/**
 * API Route pour analyser les pools avec Gemini
 * POST /api/gemini/analyze-pools
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GeminiAPI } from '@/services/gemini';
import { Pool } from '@/services/defillama/types';
import { PoolAnalysisRequest } from '@/services/gemini/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier la clé API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Extraire les données de la requête
    const { pools, criteria, customPrompt } = req.body as PoolAnalysisRequest;

    // Valider les données
    if (!pools || !Array.isArray(pools) || pools.length === 0) {
      return res.status(400).json({ error: 'Invalid pools data' });
    }

    // Limiter le nombre de pools pour éviter les timeouts
    const MAX_POOLS = 30;
    const limitedPools = pools.slice(0, MAX_POOLS);

    // Initialiser Gemini
    const gemini = new GeminiAPI({ apiKey });

    // Analyser les pools
    const analysis = await gemini.analyzePools({
      pools: limitedPools,
      criteria,
      customPrompt,
    });

    // Retourner les résultats
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing pools:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to analyze pools',
      details: errorMessage,
    });
  }
}
