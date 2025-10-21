/**
 * API Route pour évaluer le risque d'un pool avec Grok
 * POST /api/grok/evaluate-risk
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GrokAPI } from '@/services/grok';
import { Pool } from '@/services/defillama/types';

interface EvaluateRiskRequest {
  pool: Pool;
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

    const { pool } = req.body as EvaluateRiskRequest;

    if (!pool) {
      return res.status(400).json({ error: 'Pool data is required' });
    }

    const grok = new GrokAPI({ apiKey });
    const riskAnalysis = await grok.evaluatePoolRisk(pool);

    res.status(200).json({ riskAnalysis });
  } catch (error) {
    console.error('Error evaluating pool risk:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to evaluate pool risk',
      details: errorMessage,
    });
  }
}
