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
        
        const currentBalance = balance?.value || 0n;
        
        // TODO: Lire l'APY depuis le smart contract de staking
        // Pour l'instant, l'APY est 0 si aucun ETH n'est staké
        const isStaked = false; // TODO: Vérifier depuis le contrat de staking si l'utilisateur a staké
        const currentAPY = isStaked ? 8.5 : 0; // APY à 0 si pas de staking
        
        const daysOfHistory = 30;
        
        // Générer des données historiques réalistes avec croissance basée sur l'APY
        // On simule que l'utilisateur a déposé il y a 30 jours
        const dailyRate = currentAPY / 365 / 100;
        
        const historicalData = Array.from({ length: daysOfHistory }, (_, i) => {
          // Calculer le solde pour chaque jour en partant d'aujourd'hui et en reculant
          const daysAgo = daysOfHistory - 1 - i;
          const growthFactor = Math.pow(1 + dailyRate, daysAgo);
          const historicalValue = currentBalance > 0n 
            ? BigInt(Math.floor(Number(currentBalance) / growthFactor))
            : 0n;
          
          return {
            timestamp: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
            value: historicalValue
          };
        });

        // Calculer les gains totaux
        const initialBalance = historicalData.length > 0 ? historicalData[0].value : 0n;
        const totalEarned = currentBalance > initialBalance 
          ? currentBalance - initialBalance 
          : 0n;

        setMetrics({
          totalValueLocked: currentBalance,
          totalEarned: totalEarned,
          currentApy: currentAPY,
          activeStrategy: isStaked ? "AI Optimized" : "None",
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