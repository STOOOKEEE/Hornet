import type { NextApiRequest, NextApiResponse } from 'next';
import { DeFiLlamaAPI } from '../../../services/defillama/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer tous les pools
    const allPools = await DeFiLlamaAPI.getAllPools();

    // Filtrer les pools USDC sur Base
    const usdcBasePools = allPools.filter(pool => {
      const isBase = pool.chain.toLowerCase() === 'base';
      const hasUSDC = pool.symbol.toLowerCase().includes('usdc');
      const hasMinTvl = pool.tvlUsd >= 10000; // TVL minimum de $10k
      const hasValidApy = pool.apy > 0 && pool.apy < 1000; // APY valide
      
      return isBase && hasUSDC && hasMinTvl && hasValidApy;
    });

    // Trier par TVL décroissant
    const sortedPools = usdcBasePools.sort((a, b) => b.tvlUsd - a.tvlUsd);

    res.status(200).json({
      success: true,
      count: sortedPools.length,
      pools: sortedPools,
    });
  } catch (error) {
    console.error('Error fetching USDC pools on Base:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pools',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
