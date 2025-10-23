import { useAccount, useReadContracts } from 'wagmi';
import { useState, useEffect } from 'react';

const UNISWAP_V3_NFT_MANAGER = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1' as `0x${string}`;

const UNISWAP_V3_NFT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
] as const;

export interface UniswapPosition {
  tokenId: bigint;
  token0: string;
  token1: string;
  fee: number;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
}

export function useUniswapV3Positions() {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<UniswapPosition[]>([]);
  const [totalValueUSD, setTotalValueUSD] = useState<bigint>(BigInt(0));

  // Lire le nombre de positions NFT
  const { data: balanceData } = useReadContracts({
    contracts: [
      {
        address: UNISWAP_V3_NFT_MANAGER,
        abi: UNISWAP_V3_NFT_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const nftBalance = balanceData?.[0]?.result as bigint | undefined;

  // Récupérer les détails de chaque position
  useEffect(() => {
    if (!address || !nftBalance || nftBalance === BigInt(0)) {
      setPositions([]);
      setTotalValueUSD(BigInt(0));
      return;
    }

    const fetchPositions = async () => {
      const positionsList: UniswapPosition[] = [];
      let totalValue = BigInt(0);

      // Pour chaque NFT, récupérer son tokenId et ses détails
      for (let i = 0; i < Number(nftBalance); i++) {
        try {
          // Récupérer le tokenId
          const tokenIdResponse = await fetch('/api/uniswap/tokenId', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, index: i }),
          });

          if (!tokenIdResponse.ok) continue;

          const { tokenId } = await tokenIdResponse.json();

          // Récupérer les détails de la position
          const positionResponse = await fetch('/api/uniswap/position', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId }),
          });

          if (!positionResponse.ok) continue;

          const positionData = await positionResponse.json();

          positionsList.push({
            tokenId: BigInt(tokenId),
            token0: positionData.token0,
            token1: positionData.token1,
            fee: positionData.fee,
            liquidity: BigInt(positionData.liquidity),
            tickLower: positionData.tickLower,
            tickUpper: positionData.tickUpper,
          });

          // Calculer la valeur approximative (à améliorer avec les prix des tokens)
          // Pour l'instant, on utilise la liquidité comme proxy
          totalValue += BigInt(positionData.liquidity);
        } catch (error) {
          console.error('Error fetching position', i, error);
        }
      }

      setPositions(positionsList);
      setTotalValueUSD(totalValue);
    };

    fetchPositions();
  }, [address, nftBalance]);

  return {
    positions,
    totalValueUSD,
    hasPositions: positions.length > 0,
  };
}
