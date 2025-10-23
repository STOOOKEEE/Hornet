# Guide d'Utilisation de l'API DeFiLlama pour Uniswap

Ce guide explique comment utiliser le hook `useUniswapPools` pour récupérer toutes les informations des pools Uniswap V3 et V4 sur Base.

## Installation

Le hook `useUniswapPools` est déjà créé dans `/frontend/hooks/useUniswapPools.ts`.

## Utilisation de Base

```typescript
import { useUniswapPools } from '../hooks/useUniswapPools';

function MyComponent() {
  const {
    uniswapV3Pools,      // Toutes les pools Uniswap V3 sur Base
    uniswapV4Pools,      // Toutes les pools Uniswap V4 sur Base
    allUniswapPools,     // V3 + V4 combinés
    isLoading,           // État de chargement
    error,               // Message d'erreur éventuel
    
    // Helpers
    getPoolByAddress,    // Trouver une pool par son adresse
    getPoolsByTokenPair, // Trouver toutes les pools pour une paire
    getTopPoolsByAPY,    // Top X pools par APY
    getTopPoolsByTVL,    // Top X pools par TVL
  } = useUniswapPools();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Found {uniswapV3Pools.length} Uniswap V3 pools</p>
    </div>
  );
}
```

## Structure des Données

Chaque pool contient les informations suivantes :

```typescript
interface UniswapPoolData {
  // Identifiants
  pool: string;              // "0x1234..." - Adresse du contrat
  chain: string;             // "Base"
  project: string;           // "uniswap-v3" ou "uniswap-v4"
  
  // Informations de la pool
  symbol: string;            // "ETH-USDC"
  poolMeta: string | null;   // Métadonnées additionnelles
  
  // TVL (Total Value Locked)
  tvlUsd: number;            // TVL en USD (ex: 5000000 = $5M)
  
  // APY (Annual Percentage Yield)
  apy: number;               // APY total (ex: 15.5 = 15.5%)
  apyBase: number;           // APY de base (fees trading)
  apyReward: number;         // APY des rewards additionnels
  apyMean30d: number;        // APY moyen sur 30 jours
  
  // Volume
  volumeUsd1d: number;       // Volume 24h en USD
  volumeUsd7d: number;       // Volume 7 jours en USD
  
  // Fees
  apyBase7d: number;         // APY de base sur 7 jours
  
  // Tokens
  underlyingTokens: string[]; // ["0xabc...", "0xdef..."]
  
  // Risques
  stablecoin: boolean;       // Est-ce une pool de stablecoins ?
  ilRisk: string;            // "no" | "yes" - Impermanent Loss
  exposure: string;          // "single" | "multi"
  
  // Prédictions (optionnel)
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
}
```

## Exemples d'Utilisation

### 1. Afficher les Top 5 Pools par APY

```typescript
const { getTopPoolsByAPY } = useUniswapPools();

const topPools = getTopPoolsByAPY(5);

return (
  <div>
    {topPools.map(pool => (
      <div key={pool.pool}>
        <h3>{pool.symbol}</h3>
        <p>APY: {pool.apy.toFixed(2)}%</p>
        <p>TVL: ${(pool.tvlUsd / 1000000).toFixed(2)}M</p>
      </div>
    ))}
  </div>
);
```

### 2. Trouver une Pool Spécifique par Adresse

```typescript
const { getPoolByAddress } = useUniswapPools();

const poolAddress = "0x1234...";
const pool = getPoolByAddress(poolAddress);

if (pool) {
  console.log(`${pool.symbol} - APY: ${pool.apy}%`);
}
```

### 3. Trouver Toutes les Pools ETH/USDC

```typescript
const { getPoolsByTokenPair } = useUniswapPools();

const ethAddress = "0x4200000000000000000000000000000000000006";
const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const ethUsdcPools = getPoolsByTokenPair(ethAddress, usdcAddress);

console.log(`Found ${ethUsdcPools.length} ETH/USDC pools`);
```

### 4. Filtrer par Critères Personnalisés

```typescript
const { allUniswapPools } = useUniswapPools();

// Pools avec APY > 10% et TVL > $1M
const highYieldPools = allUniswapPools.filter(pool => 
  pool.apy > 10 && 
  pool.tvlUsd > 1000000
);

// Pools stablecoins uniquement
const stablePools = allUniswapPools.filter(pool => pool.stablecoin);

// Pools sans risque d'IL
const noILPools = allUniswapPools.filter(pool => pool.ilRisk === 'no');
```

### 5. Calculer les Statistiques Globales

```typescript
const { allUniswapPools } = useUniswapPools();

const totalTVL = allUniswapPools.reduce((sum, pool) => sum + pool.tvlUsd, 0);
const avgAPY = allUniswapPools.reduce((sum, pool) => sum + pool.apy, 0) / allUniswapPools.length;
const totalVolume24h = allUniswapPools.reduce((sum, pool) => sum + pool.volumeUsd1d, 0);

console.log(`Total TVL: $${(totalTVL / 1000000).toFixed(2)}M`);
console.log(`Average APY: ${avgAPY.toFixed(2)}%`);
console.log(`24h Volume: $${(totalVolume24h / 1000000).toFixed(2)}M`);
```

## Logs Console Automatiques

Le hook affiche automatiquement dans la console :

1. **Nombre total de pools** :
   ```
   🦄 Uniswap V3 Pools on Base: 42
   🦄 Uniswap V4 Pools on Base: 0
   ```

2. **Top 5 pools par APY** :
   ```
   📊 Top 5 Uniswap V3 Pools by APY:
   ┌─────────┬──────────────┬──────────┬───────────┬─────────┬────────────┬───────────┐
   │ (index) │     Pool     │ Contract │    APY    │ APY Base│     TVL    │ Volume 24h│
   ├─────────┼──────────────┼──────────┼───────────┼─────────┼────────────┼───────────┤
   │    0    │ 'ETH-USDC'   │ '0x1234' │ '25.50%'  │ '15.2%' │ '$5.20M'   │ '$2.10M'  │
   └─────────┴──────────────┴──────────┴───────────┴─────────┴────────────┴───────────┘
   ```

3. **Top 5 pools par TVL** :
   ```
   📊 Top 5 Uniswap V3 Pools by TVL:
   ┌─────────┬──────────────┬──────────┬─────────┬─────────┬────────────┐
   │ (index) │     Pool     │ Contract │   TVL   │   APY   │ Volume 24h │
   ├─────────┼──────────────┼──────────┼─────────┼─────────┼────────────┤
   │    0    │ 'ETH-USDC'   │ '0x1234' │ '$12.5M'│ '8.50%' │ '$5.20M'   │
   └─────────┴──────────────┴──────────┴─────────┴─────────┴────────────┘
   ```

## Page de Test

Pour voir toutes les pools en action, visitez :
```
http://localhost:3001/uniswap-pools
```

Cette page affiche :
- Statistiques globales (nombre de pools, TVL total)
- Top 5 pools par APY
- Top 5 pools par TVL
- Barre de recherche pour filtrer les pools

## Rafraîchissement des Données

Les données sont automatiquement rafraîchies **toutes les 5 minutes**. Vous pouvez ajuster cet intervalle dans le hook :

```typescript
// Dans useUniswapPools.ts
const interval = setInterval(fetchUniswapPools, 5 * 60 * 1000); // 5 minutes
```

## API DeFiLlama

Le hook utilise l'endpoint public de DeFiLlama :
```
https://yields.llama.fi/pools
```

Documentation complète : https://defillama.com/docs/api

## Exemple de Composant Complet

Voir `/frontend/components/dashboard/UniswapPoolsExplorer.tsx` pour un exemple complet d'interface utilisateur.

## Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Consultez la documentation DeFiLlama
3. Vérifiez que l'API DeFiLlama est accessible

## Ressources

- [DeFiLlama API Docs](https://defillama.com/docs/api)
- [Uniswap V3 Docs](https://docs.uniswap.org/contracts/v3/overview)
- [Base Network Explorer](https://basescan.org)
