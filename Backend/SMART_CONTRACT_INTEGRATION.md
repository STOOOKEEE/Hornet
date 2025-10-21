# 🔗 Guide d'Intégration des Smart Contracts

## État Actuel

Actuellement, l'application affiche uniquement :
- ✅ **Balance réelle** du wallet connecté (depuis la blockchain)
- ❌ **Données simulées** pour les protocoles (Moonwell, Aerodrome)
- ❌ **Pas de lecture** des smart contracts de yield farming

## Prochaines Étapes pour Intégrer les Vrais Contrats

### 1️⃣ Créer ou Déployer vos Smart Contracts

Vous devez avoir des contrats sur **Base Network** qui gèrent :
- Dépôts USDC
- Calcul des rendements (APY)
- Stratégies actives
- Historique des gains

**Exemple de contrat minimal :**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YieldVault {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public earned;
    mapping(address => string) public activeStrategy;
    
    uint256 public currentAPY = 720; // 7.20% (en basis points)
    
    function deposit(uint256 amount) external {
        // Logique de dépôt
    }
    
    function withdraw(uint256 amount) external {
        // Logique de retrait
    }
    
    function getUserDeposit(address user) external view returns (uint256) {
        return deposits[user];
    }
    
    function getUserEarned(address user) external view returns (uint256) {
        return earned[user];
    }
}
```

### 2️⃣ Obtenir les Adresses des Contrats

Une fois déployés sur Base, notez les adresses :

```typescript
// hooks/useProtocolData.ts
const CONTRACTS = {
  YIELD_VAULT: '0x...', // Votre contrat principal
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC sur Base
  MOONWELL: '0x...', // Si vous intégrez Moonwell
  AERODROME: '0x...', // Si vous intégrez Aerodrome
};
```

### 3️⃣ Créer les ABIs

Créez un fichier pour stocker les ABIs de vos contrats :

```typescript
// lib/contracts/abis.ts
export const YIELD_VAULT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserDeposit",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserEarned",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentAPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USDC_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
```

### 4️⃣ Mettre à Jour le Hook useUserMetrics

Remplacez le code actuel par des vraies lectures de contrats :

```typescript
import { useAccount, useReadContracts } from 'wagmi';
import { YIELD_VAULT_ABI } from '../lib/contracts/abis';

export function useUserMetrics() {
  const { address, isConnected } = useAccount();
  
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: '0xVOTRE_CONTRAT_ADDRESS',
        abi: YIELD_VAULT_ABI,
        functionName: 'getUserDeposit',
        args: [address as `0x${string}`],
      },
      {
        address: '0xVOTRE_CONTRAT_ADDRESS',
        abi: YIELD_VAULT_ABI,
        functionName: 'getUserEarned',
        args: [address as `0x${string}`],
      },
      {
        address: '0xVOTRE_CONTRAT_ADDRESS',
        abi: YIELD_VAULT_ABI,
        functionName: 'currentAPY',
      },
    ],
    query: {
      enabled: isConnected && !!address,
    }
  });

  if (!isConnected || !data) {
    return { metrics: null, isLoading: false, error: null };
  }

  const [depositResult, earnedResult, apyResult] = data;

  const metrics = {
    totalValueLocked: depositResult.result || 0n,
    totalEarned: earnedResult.result || 0n,
    currentApy: Number(apyResult.result || 0n) / 100, // Convertir basis points
    activeStrategy: "Moonwell", // À lire depuis le contrat
    historicalBalances: [], // À implémenter
  };

  return { metrics, isLoading, error: null };
}
```

### 5️⃣ Intégrer les Protocoles DeFi Existants

Pour lire les données de protocoles comme **Moonwell** ou **Aerodrome** :

```typescript
// Exemple pour Moonwell
const MOONWELL_USDC_MARKET = '0x...'; // Adresse du marché USDC sur Moonwell

export function useProtocolData() {
  const { data } = useReadContracts({
    contracts: [
      {
        address: MOONWELL_USDC_MARKET,
        abi: MOONWELL_ABI,
        functionName: 'supplyRatePerTimestamp',
      },
      {
        address: MOONWELL_USDC_MARKET,
        abi: MOONWELL_ABI,
        functionName: 'totalSupply',
      },
    ],
  });

  // Calculer l'APY à partir du taux
  const supplyRate = data?.[0]?.result || 0n;
  const apy = calculateAPY(supplyRate);

  return {
    protocolsData: [
      {
        name: "Moonwell",
        apy: apy,
        tvl: data?.[1]?.result || 0n,
      }
    ],
    isLoading: false,
    error: null,
  };
}
```

### 6️⃣ Implémenter les Transactions (Dépôt/Retrait)

Dans `components/dashboard/DepositWithdraw.tsx` :

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

export function DepositWithdraw() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleDeposit = async (amount: string) => {
    const amountInWei = parseUnits(amount, 6); // USDC a 6 décimales
    
    writeContract({
      address: '0xVOTRE_CONTRAT',
      abi: YIELD_VAULT_ABI,
      functionName: 'deposit',
      args: [amountInWei],
    });
  };

  return (
    // Votre UI avec bouton de dépôt
  );
}
```

## 📋 Checklist d'Intégration

- [ ] Déployer ou identifier les smart contracts sur Base
- [ ] Récupérer les adresses des contrats
- [ ] Créer les fichiers ABI
- [ ] Mettre à jour `useUserMetrics` avec `useReadContracts`
- [ ] Mettre à jour `useProtocolData` avec les vrais protocoles
- [ ] Implémenter les transactions avec `useWriteContract`
- [ ] Tester sur Base Testnet d'abord
- [ ] Déployer sur Base Mainnet

## 🔍 Ressources Utiles

### Adresses Utiles sur Base Mainnet
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Moonwell**: Voir [docs.moonwell.fi](https://docs.moonwell.fi)
- **Aerodrome**: Voir [docs.aerodrome.finance](https://docs.aerodrome.finance)

### Documentation
- [Wagmi Hooks](https://wagmi.sh/react/hooks/useReadContract)
- [Base Network](https://docs.base.org/)
- [Viem Utils](https://viem.sh/docs/utilities/formatUnits.html)

## 🎯 Résultat Final

Une fois intégré, l'application affichera :
- ✅ Vraie balance USDC du wallet
- ✅ Vrais dépôts dans votre contrat
- ✅ Vrais gains calculés
- ✅ APY réel des protocoles
- ✅ Transactions réelles (dépôt/retrait)

## ⚠️ Important

Pour l'instant, l'application affiche **uniquement la balance réelle** du wallet connecté. Toutes les autres données (APY, gains, stratégies) sont à **0 ou "None"** jusqu'à ce que vous intégriez vos smart contracts.
