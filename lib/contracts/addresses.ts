// Adresses des Smart Contracts sur Base Network

export const CONTRACTS = {
  // USDC sur Base Mainnet (adresse officielle)
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  
  // TODO: Remplacer par vos vraies adresses de contrats
  // Une fois vos contrats déployés sur Base, mettez les adresses ici
  
  YIELD_VAULT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Votre contrat principal
  
  // Protocoles DeFi sur Base (à compléter)
  MOONWELL_USDC: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  AERODROME_POOL: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  
} as const;

// Vérifier si les contrats sont configurés
export const isContractsConfigured = () => {
  return CONTRACTS.YIELD_VAULT !== '0x0000000000000000000000000000000000000000';
};
