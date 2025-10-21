/**
 * API Route pour générer une stratégie d'investissement avec Grok
 * POST /api/grok/generate-strategy
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GrokAPI } from '@/services/grok';
import { Pool } from '@/services/defillama/types';

interface GenerateStrategyRequest {
  pools: Pool[];
  budget: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROK_API_KEY not configured' });
    }

    const { pools, budget, riskProfile } = req.body as GenerateStrategyRequest;

    if (!pools || !Array.isArray(pools) || pools.length === 0) {
      return res.status(400).json({ error: 'Invalid pools data' });
    }

    if (!budget || budget <= 0) {
      return res.status(400).json({ error: 'Invalid budget' });
    }

    if (!['conservative', 'moderate', 'aggressive'].includes(riskProfile)) {
      return res.status(400).json({ error: 'Invalid risk profile' });
    }

    const grok = new GrokAPI({ apiKey });
    const strategy = await grok.generateInvestmentStrategy(pools, budget, riskProfile);

    res.status(200).json({ strategy });
  } catch (error) {
    console.error('Error generating strategy:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to generate strategy',
      details: errorMessage,
    });
  }
}
