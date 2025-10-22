/**
 * API Route pour obtenir des insights sur le marché avec Gemini
 * POST /api/gemini/market-insights
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GeminiAPI } from '@/services/gemini';
import { Pool } from '@/services/defillama/types';

interface MarketInsightsRequest {
  pools: Pool[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const { pools } = req.body as MarketInsightsRequest;

    if (!pools || !Array.isArray(pools) || pools.length === 0) {
      return res.status(400).json({ error: 'Invalid pools data' });
    }

    const gemini = new GeminiAPI({ apiKey });
    const insights = await gemini.getMarketInsights(pools);

    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error getting market insights:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get market insights',
      details: errorMessage,
    });
  }
}
