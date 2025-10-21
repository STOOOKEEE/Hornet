/**
 * API Route pour comparer deux pools avec Grok
 * POST /api/grok/compare-pools
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GrokAPI } from '@/services/grok';
import { Pool } from '@/services/defillama/types';

interface ComparePoolsRequest {
  pool1: Pool;
  pool2: Pool;
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

    const { pool1, pool2 } = req.body as ComparePoolsRequest;

    if (!pool1 || !pool2) {
      return res.status(400).json({ error: 'Both pools are required' });
    }

    const grok = new GrokAPI({ apiKey });
    const comparison = await grok.comparePools(pool1, pool2);

    res.status(200).json({ comparison });
  } catch (error) {
    console.error('Error comparing pools:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to compare pools',
      details: errorMessage,
    });
  }
}
