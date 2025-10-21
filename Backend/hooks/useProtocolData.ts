import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { base } from 'wagmi/chains';
import { CONTRACTS } from '../lib/contracts/addresses';

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
    // Si pas connecté, ne pas afficher de données
    if (!isConnected || !address) {
      setMetrics(null);
      setIsLoading(false);
      return;
    }

    // TODO: Remplacer par de vraies lectures de contrats smart contracts
    // Pour l'instant, on affiche uniquement les données réelles du wallet
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Données basées sur le wallet réel connecté
        const historicalData = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          value: balance?.value || 0n
        }));

        setMetrics({
          totalValueLocked: balance?.value || 0n,
          totalEarned: 0n, // Sera calculé depuis le smart contract
          currentApy: 0, // Sera lu depuis le smart contract
          activeStrategy: "None", // Sera lu depuis le smart contract
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