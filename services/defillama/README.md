# Service API DeFiLlama

Ce module permet d'interagir avec l'API DeFiLlama pour récupérer les informations sur les pools de liquidité et leurs yields.

## Installation

Aucune dépendance supplémentaire n'est requise. Le module utilise l'API fetch native.

## Utilisation

### Importer le service

```typescript
import { DeFiLlamaAPI, Pool, PoolFilter } from '@/services/defillama';
```

### Récupérer tous les pools

```typescript
const pools = await DeFiLlamaAPI.getAllPools();
console.log(`${pools.length} pools trouvés`);
```

### Filtrer les pools

```typescript
// Pools sur Ethereum avec TVL > 1M$
const ethPools = await DeFiLlamaAPI.getFilteredPools({
  chain: 'Ethereum',
  minTvl: 1000000
});

// Pools Uniswap
const uniswapPools = await DeFiLlamaAPI.getPoolsByProject('uniswap-v3');

// Pools stablecoins avec APY > 5%
const stablePools = await DeFiLlamaAPI.getFilteredPools({
  stablecoin: true,
  minApy: 5
});
```

### Récupérer les meilleurs pools

```typescript
// Top 10 pools par APY avec TVL > 1M$
const topPools = await DeFiLlamaAPI.getTopPoolsByApy(10, 1000000);

topPools.forEach(pool => {
  console.log(`${pool.symbol} - APY: ${pool.apy.toFixed(2)}%`);
});
```

### Récupérer un pool spécifique

```typescript
const poolId = 'pool-id-here';
const pool = await DeFiLlamaAPI.getPoolById(poolId);

if (pool) {
  const stats = DeFiLlamaAPI.calculatePoolStats(pool);
  console.log('Statistiques du pool:', stats);
}
```

### Récupérer l'historique d'un pool

```typescript
const poolId = 'pool-id-here';
const history = await DeFiLlamaAPI.getPoolHistory(poolId);

history.data.forEach(point => {
  console.log(`${point.timestamp}: APY ${point.apy}%`);
});
```

## Types disponibles

### Pool

```typescript
interface Pool {
  chain: string;           // Blockchain (Ethereum, Polygon, etc.)
  project: string;         // Nom du projet (Uniswap, Aave, etc.)
  symbol: string;          // Symbole du pool (ETH-USDC, etc.)
  tvlUsd: number;         // Total Value Locked en USD
  apyBase?: number;       // APY de base (sans rewards)
  apyReward?: number;     // APY des rewards
  apy: number;            // APY total
  rewardTokens?: string[]; // Tokens de reward
  pool: string;           // ID unique du pool
  stablecoin?: boolean;   // Si le pool contient des stablecoins
  ilRisk?: string;        // Risque d'impermanent loss
  exposure?: string;      // Exposition du pool
  // ... autres champs
}
```

### PoolFilter

```typescript
interface PoolFilter {
  chain?: string;        // Filtrer par blockchain
  project?: string;      // Filtrer par projet
  symbol?: string;       // Filtrer par symbole
  minTvl?: number;      // TVL minimum
  minApy?: number;      // APY minimum
  stablecoin?: boolean; // Uniquement stablecoins
}
```

## Exemples d'utilisation

### Exemple 1: Trouver les meilleurs pools stablecoins

```typescript
const stablePools = await DeFiLlamaAPI.getStablecoinPools(500000);
const topStable = stablePools
  .sort((a, b) => b.apy - a.apy)
  .slice(0, 5);

console.log('Top 5 pools stablecoins:');
topStable.forEach((pool, i) => {
  console.log(`${i + 1}. ${pool.project} - ${pool.symbol}`);
  console.log(`   APY: ${pool.apy.toFixed(2)}% | TVL: $${(pool.tvlUsd / 1e6).toFixed(2)}M`);
});
```

### Exemple 2: Comparer les pools d'un projet

```typescript
const aavePools = await DeFiLlamaAPI.getPoolsByProject('aave-v3');

console.log(`${aavePools.length} pools Aave V3 trouvés`);

aavePools.forEach(pool => {
  const stats = DeFiLlamaAPI.calculatePoolStats(pool);
  console.log(`${pool.symbol} sur ${pool.chain}:`);
  console.log(`  APY Total: ${stats.totalApy.toFixed(2)}%`);
  console.log(`  APY Base: ${stats.baseApy.toFixed(2)}%`);
  console.log(`  APY Rewards: ${stats.rewardApy.toFixed(2)}%`);
  console.log(`  TVL: $${(stats.tvlUsd / 1e6).toFixed(2)}M`);
});
```

### Exemple 3: Surveiller un pool spécifique

```typescript
async function monitorPool(poolId: string) {
  const pool = await DeFiLlamaAPI.getPoolById(poolId);
  
  if (!pool) {
    console.log('Pool non trouvé');
    return;
  }

  console.log(`Monitoring: ${pool.project} - ${pool.symbol}`);
  console.log(`Chain: ${pool.chain}`);
  console.log(`APY actuel: ${pool.apy.toFixed(2)}%`);
  console.log(`TVL: $${(pool.tvlUsd / 1e6).toFixed(2)}M`);

  // Récupérer l'historique
  const history = await DeFiLlamaAPI.getPoolHistory(poolId);
  const recentData = history.data.slice(-7); // 7 derniers points

  console.log('\nHistorique récent:');
  recentData.forEach(point => {
    console.log(`  ${point.timestamp}: ${point.apy.toFixed(2)}%`);
  });
}
```

## Chaînes supportées

Les principales chaînes disponibles incluent:
- Ethereum
- Polygon
- Arbitrum
- Optimism
- BSC (Binance Smart Chain)
- Avalanche
- Fantom
- Base
- Et bien d'autres...

## Projets populaires

Quelques projets disponibles:
- uniswap-v3, uniswap-v2
- aave-v3, aave-v2
- curve
- balancer
- pancakeswap
- sushiswap
- compound
- yearn-finance
- Et des centaines d'autres...

## Notes importantes

1. **Rate limiting**: L'API DeFiLlama peut avoir des limites de taux. Implémentez un cache si nécessaire.
2. **Données en temps réel**: Les données sont mises à jour régulièrement mais peuvent avoir un léger délai.
3. **Risques**: Toujours vérifier les risques (IL, smart contract, etc.) avant d'investir.
4. **TVL**: Une TVL élevée indique généralement plus de liquidité et moins de slippage.

## Documentation officielle

Pour plus d'informations: https://defillama.com/docs/api
