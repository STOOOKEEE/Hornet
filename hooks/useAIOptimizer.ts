import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface AIStrategy {
  protocol: string;
  currentAPY: number;
  suggestedAPY: number;
  confidence: number;
  reasoning: string;
  tvl: string;
  gain: string;
}

interface AIOptimizerData {
  strategies: AIStrategy[];
  currentStrategy: string;
  currentAPY: number;
}

export function useAIOptimizer() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<AIOptimizerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchAIStrategies = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Remplacer par votre vraie URL de serveur
        const API_URL = process.env.NEXT_PUBLIC_AI_SERVER_URL || 'http://localhost:3001/api';
        
        const response = await fetch(`${API_URL}/optimize?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI strategies');
        }
        
        const result = await response.json();
        setData(result);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching AI strategies:', err);
        
        // Données de fallback si le serveur n'est pas disponible
        // TODO: Vérifier si l'utilisateur a des fonds stakés sur la blockchain
        const isStaked = false; // À lire depuis le smart contract
        
        setData({
          strategies: [
            {
              protocol: "Moonwell",
              currentAPY: 7.2,
              suggestedAPY: 8.28,
              confidence: 88,
              reasoning: "Moonwell offers competitive yields with 7.2% APY and 1.23 ETH TVL.",
              tvl: "1.23 ETH",
              gain: "+1.1%"
            },
            {
              protocol: "Aerodrome Finance",
              currentAPY: 9.5,
              suggestedAPY: 10.92,
              confidence: 90,
              reasoning: "Aerodrome Finance offers competitive yields with 9.5% APY and 2.35 ETH TVL.",
              tvl: "2.35 ETH",
              gain: "+1.4%"
            }
          ],
          currentStrategy: isStaked ? "AI Optimized" : "None",
          currentAPY: isStaked ? 8.5 : 0 // APY à 0 si pas de staking
        });
        setIsLoading(false);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    fetchAIStrategies();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchAIStrategies, 30000);
    
    return () => clearInterval(interval);
  }, [address, isConnected]);

  return { data, isLoading, error };
}
