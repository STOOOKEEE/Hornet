import { useAccount, useContractReads, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { base } from 'wagmi/chains';

// Interfaces pour typer nos données
interface ProtocolData {
  name: string;
  apy: number;
  tvl: bigint;
}

interface UserMetrics {
  totalValueLocked: bigint;
  totalEarned: bigint;
  currentApy: number;
  activeStrategy: string;
  historicalBalances: Array<{
    timestamp: number;
    value: bigint;
  }>;
}

// Adresses des contrats sur Base
const CONTRACTS = {
  // TODO: Remplacer par les vraies adresses des protocoles sur Base
  MOONWELL: '0x...',
  AERODROME: '0x...',
  // Ajouter d'autres protocoles si nécessaire
};

export function useProtocolData(): {
  protocolsData: ProtocolData[];
  isLoading: boolean;
  error: Error | null;
} {
  const [protocolsData, setProtocolsData] = useState<ProtocolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ici, on utilisera useContractReads pour lire les données des contrats
  // Pour l'instant, on retourne des données de test
  useEffect(() => {
    // Simule un appel API/blockchain
    setTimeout(() => {
      setProtocolsData([
        {
          name: "Moonwell",
          apy: 7.2,
          tvl: BigInt(1234560000000000000n)
        },
        {
          name: "Aerodrome Finance",
          apy: 9.5,
          tvl: BigInt(2345670000000000000n)
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { protocolsData, isLoading, error };
}

export function useUserMetrics(): {
  metrics: UserMetrics | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ 
    address,
    chainId: base.id
  });

  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setMetrics(null);
      setIsLoading(false);
      return;
    }

    // TODO: Remplacer par de vraies lectures de contrats
    const fetchMetrics = async () => {
      try {
        // Simuler la récupération des données
        const historicalData = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          value: BigInt(balance?.value || 0n) * BigInt(100 + i) / BigInt(100)
        }));

        setMetrics({
          totalValueLocked: balance?.value || 0n,
          totalEarned: BigInt(45230000000000000n), // 0.0452 ETH
          currentApy: 7.2,
          activeStrategy: "Moonwell",
          historicalBalances: historicalData
        });
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [address, isConnected, balance?.value]);

  return { metrics, isLoading, error };
}