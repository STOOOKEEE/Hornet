import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface RebalanceData {
  lastRebalanceTime: number | null;
  totalRebalances: number;
  recommendedAction: {
    from: string;
    to: string;
    apyGain: number;
    estimatedGas: string;
  } | null;
}

export function useRebalanceData() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<RebalanceData>({
    lastRebalanceTime: null,
    totalRebalances: 0,
    recommendedAction: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) {
      setData({
        lastRebalanceTime: null,
        totalRebalances: 0,
        recommendedAction: null
      });
      setIsLoading(false);
      return;
    }

    const fetchRebalanceData = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Récupérer les vraies données depuis le smart contract
        // Pour l'instant, on simule des données basées sur l'adresse
        
        // Simuler un historique de rebalancing basé sur l'adresse
        const addressHash = address.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const daysSinceLastRebalance = (addressHash % 7) + 1;
        const totalRebalances = (addressHash % 20) + 1;
        
        setData({
          lastRebalanceTime: Date.now() - (daysSinceLastRebalance * 24 * 60 * 60 * 1000),
          totalRebalances: totalRebalances,
          recommendedAction: {
            from: "Moonwell",
            to: "Aerodrome Finance",
            apyGain: 2.3,
            estimatedGas: "$0.02"
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching rebalance data:', err);
        setIsLoading(false);
      }
    };

    fetchRebalanceData();
  }, [address, isConnected]);

  return { data, isLoading };
}
