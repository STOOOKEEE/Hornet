# Logique de Sélection Automatique des Meilleures Pools

## Vue d'Ensemble

Le système sélectionne automatiquement **la pool la plus sûre** dans chaque catégorie de risque basée sur l'APY et un **score de sécurité**.

## Catégories de Risque (basées sur l'APY)

### 🛡️ Safe (4-7% APY)
- **Objectif** : Préserver le capital avec des rendements stables
- **APY Range** : 4% - 7%
- **Profil** : Investisseurs conservateurs
- **Exemples** : Pools de stablecoins, paires très liquides

### ⚖️ Medium (7-12% APY)
- **Objectif** : Balance entre risque et rendement
- **APY Range** : 7% - 12%
- **Profil** : Investisseurs modérés
- **Exemples** : Paires majeures avec volume élevé

### 🔥 Risky (12-20% APY)
- **Objectif** : Maximiser les rendements
- **APY Range** : 12% - 20%
- **Profil** : Investisseurs agressifs
- **Exemples** : Nouvelles paires, tokens volatils

> **Note** : Les pools avec APY > 20% sont **exclues** car considérées comme trop risquées.

## Score de Sécurité (0-100 points)

Le système calcule un score pour chaque pool basé sur plusieurs critères :

### 1. TVL (Total Value Locked) - Max 40 points
```
TVL > $10M  → 40 points (Excellent)
TVL > $5M   → 35 points (Très bon)
TVL > $1M   → 25 points (Bon)
TVL > $500K → 15 points (Acceptable)
TVL > $100K → 5 points  (Minimum requis)
TVL < $100K → Exclu
```

**Pourquoi ?** Un TVL élevé signifie :
- Plus de liquidité
- Moins de slippage
- Pool établie et testée
- Confiance de la communauté

### 2. Volume Trading - Max 30 points
Ratio Volume 24h / TVL :
```
> 50% → 30 points (Très actif)
> 20% → 25 points (Actif)
> 10% → 20 points (Bon)
> 5%  → 15 points (Acceptable)
> 1%  → 10 points (Faible)
< 1%  → 0 points
```

**Pourquoi ?** Un volume élevé indique :
- Liquidité active
- Facilité d'entrée/sortie
- Génération de fees constante
- Intérêt du marché

### 3. Risque d'Impermanent Loss - 15 points
```
IL Risk = "no" → +15 points
IL Risk = "yes" → 0 points
```

**Pourquoi ?** Les pools sans IL :
- Généralement des stablecoins
- Pas de perte due à la volatilité
- Rendements plus prévisibles

### 4. Type de Pool (Stablecoin) - 10 points
```
Stablecoin pool → +10 points
Regular pool → 0 points
```

**Pourquoi ?** Les pools de stablecoins :
- Volatilité minimale
- Risque de liquidation quasi nul
- APY plus stable

### 5. Stabilité de l'APY - Max 5 points
```
Variation < 10% sur 30 jours → +5 points
Variation < 20% sur 30 jours → +3 points
Variation > 20% → 0 points
```

**Pourquoi ?** Un APY stable indique :
- Rendements prévisibles
- Pool mature
- Moins de volatilité de fees

## Logique de Sélection

### Étape 1 : Filtrage Initial
```typescript
Pools valides = pools.filter(pool => 
  pool.apy > 0 &&
  pool.tvlUsd > $100,000 &&
  pool.volumeUsd1d > 0
);
```

### Étape 2 : Classification par Risque
Chaque pool est classée selon son APY :
- 4-7% → Safe
- 7-12% → Medium
- 12-20% → Risky
- Autres → Exclue

### Étape 3 : Calcul du Score de Sécurité
Pour chaque pool, calcul du score total (0-100) basé sur les 5 critères.

### Étape 4 : Tri par Sécurité
Dans chaque catégorie, tri des pools par score **décroissant** :
```typescript
pools.sort((a, b) => b.score - a.score);
```

### Étape 5 : Sélection Finale
**La pool avec le score le plus élevé** dans chaque catégorie est sélectionnée.

## Exemple Concret

### Scénario : Catégorie Safe (4-7% APY)

**Pool A** :
- Symbol: USDC-USDT
- APY: 5.2%
- TVL: $12M → 40 points
- Volume/TVL: 25% → 25 points
- IL Risk: No → 15 points
- Stablecoin: Yes → 10 points
- APY stable: Yes → 5 points
- **Score Total: 95/100** ✅ **SÉLECTIONNÉE**

**Pool B** :
- Symbol: DAI-USDC
- APY: 6.8%
- TVL: $3M → 35 points
- Volume/TVL: 15% → 20 points
- IL Risk: No → 15 points
- Stablecoin: Yes → 10 points
- APY stable: Yes → 5 points
- **Score Total: 85/100**

**Pool C** :
- Symbol: ETH-USDC
- APY: 5.5%
- TVL: $8M → 40 points
- Volume/TVL: 30% → 30 points
- IL Risk: Yes → 0 points
- Stablecoin: No → 0 points
- APY stable: No → 0 points
- **Score Total: 70/100**

**Résultat** : Pool A est sélectionnée car elle a le score le plus élevé (95).

## Code d'Utilisation

```typescript
import { useUniswapPools } from '../hooks/useUniswapPools';
import { selectBestPools } from '../hooks/usePoolSelector';

function MyComponent() {
  const { allUniswapPools } = useUniswapPools();
  const bestPools = selectBestPools(allUniswapPools);

  console.log('Best Safe Pool:', bestPools.safe?.pool.symbol);
  console.log('Safety Score:', bestPools.safe?.score);
  console.log('APY:', bestPools.safe?.pool.apy);
}
```

## Composant UI

Le composant `PoolRecommendations` affiche automatiquement les 3 meilleures pools :

```tsx
import { PoolRecommendations } from '../components/dashboard/PoolRecommendations';

<PoolRecommendations />
```

Affiche :
- 🛡️ Carte Safe (verte)
- ⚖️ Carte Medium (jaune)
- 🔥 Carte Risky (rouge)

Chaque carte inclut :
- Score de sécurité
- APY et range
- TVL et volume
- Raisons de sélection
- Lien vers Uniswap

## Console Logs

Le système affiche automatiquement dans la console :

```
🎯 Pool Selection Summary:
Safe pools found: 12
Medium pools found: 8
Risky pools found: 5

✅ Best SAFE pool: {
  symbol: 'USDC-USDT',
  apy: '5.20%',
  tvl: '$12.50M',
  safetyScore: 95,
  ilRisk: 'no',
  stablecoin: true
}

⚠️ Best MEDIUM pool: {
  symbol: 'ETH-USDC',
  apy: '9.80%',
  tvl: '$8.20M',
  safetyScore: 70
}

🔥 Best RISKY pool: {
  symbol: 'PEPE-WETH',
  apy: '15.50%',
  tvl: '$2.10M',
  safetyScore: 45
}
```

## Personnalisation

Pour ajuster les critères, modifiez `frontend/hooks/usePoolSelector.ts` :

```typescript
const RISK_CRITERIA = {
  safe: {
    minAPY: 4,    // Modifier ici
    maxAPY: 7,    // Modifier ici
  },
  // ...
};
```

Pour ajuster les poids du score :

```typescript
function calculateSafetyScore(pool) {
  // TVL weight: Modifier le max points
  if (pool.tvlUsd > 10000000) score += 40; // ← Ajuster ici
  
  // Volume weight: Modifier le max points
  if (volumeRatio > 0.5) score += 30; // ← Ajuster ici
  
  // ...
}
```

## Avantages de cette Approche

1. **Objectif** : Basé sur des métriques quantifiables
2. **Sécurité prioritaire** : Le score garantit la sélection des pools les plus sûres
3. **Transparent** : Explications claires pour chaque sélection
4. **Flexible** : Critères facilement ajustables
5. **Automatique** : Pas besoin d'analyse manuelle

## Limites

- Ne prend pas en compte les facteurs qualitatifs (réputation du protocole, audits)
- L'APY affiché peut varier dans le temps
- Les pools très récentes peuvent manquer de données historiques
- Le score ne garantit pas l'absence de risque

## Recommandation Finale

**Toujours faire vos propres recherches (DYOR)** avant d'investir dans une pool, même si elle a un score élevé.
