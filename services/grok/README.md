# Service Grok pour l'analyse des pools DeFiLlama

Ce service utilise l'API Grok (xAI) pour analyser les données des pools de liquidité DeFiLlama et fournir des recommandations intelligentes basées sur l'IA.

## Configuration

### 1. Obtenir une clé API Grok

Visitez [console.x.ai](https://console.x.ai) pour obtenir votre clé API.

### 2. Configurer la clé API

Ajoutez votre clé API dans votre fichier `.env.local`:

```env
GROK_API_KEY=votre_cle_api_ici
```

## Installation

Aucune dépendance supplémentaire requise. Le service utilise l'API fetch native.

## Utilisation

### Initialisation

```typescript
import { GrokAPI } from '@/services/grok';

const grok = new GrokAPI({
  apiKey: process.env.GROK_API_KEY || '',
  model: 'grok-beta', // optionnel
});
```

### 1. Analyser les pools et obtenir des recommandations

```typescript
import { DeFiLlamaAPI } from '@/services/defillama';
import { GrokAPI } from '@/services/grok';

// Récupérer les pools
const pools = await DeFiLlamaAPI.getTopPoolsByApy(20, 1000000);

// Analyser avec Grok
const grok = new GrokAPI({ apiKey: process.env.GROK_API_KEY });

const analysis = await grok.analyzePools({
  pools,
  criteria: {
    riskTolerance: 'medium',
    preferStablecoins: false,
    minTvl: 1000000,
    preferredChains: ['Ethereum', 'Arbitrum'],
    investmentAmount: 10000,
  },
});

// Afficher les recommandations
console.log('Résumé:', analysis.summary);
console.log('Insights:', analysis.marketInsights);

analysis.recommendations.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.pool.symbol}`);
  console.log(`   Score: ${rec.score}/100`);
  console.log(`   APY: ${rec.pool.apy}%`);
  console.log(`   Risque: ${rec.riskLevel}`);
  console.log(`   Analyse: ${rec.reasoning}`);
});
```

### 2. Comparer deux pools

```typescript
const pool1 = await DeFiLlamaAPI.getPoolById('pool-id-1');
const pool2 = await DeFiLlamaAPI.getPoolById('pool-id-2');

if (pool1 && pool2) {
  const comparison = await grok.comparePools(pool1, pool2);
  console.log(comparison);
}
```

### 3. Obtenir des insights sur le marché

```typescript
// Analyser tout le marché
const allPools = await DeFiLlamaAPI.getAllPools();
const insights = await grok.getMarketInsights(allPools);
console.log(insights);

// Ou analyser une chaîne spécifique
const ethPools = await DeFiLlamaAPI.getPoolsByChain('Ethereum');
const ethInsights = await grok.getMarketInsights(ethPools);
console.log(ethInsights);
```

### 4. Évaluer le risque d'un pool

```typescript
const pool = await DeFiLlamaAPI.getPoolById('pool-id');

if (pool) {
  const riskAnalysis = await grok.evaluatePoolRisk(pool);
  console.log(riskAnalysis);
}
```

### 5. Générer une stratégie d'investissement

```typescript
// Récupérer des pools adaptés au profil
const pools = await DeFiLlamaAPI.getTopPoolsByApy(30, 500000);

// Générer la stratégie
const strategy = await grok.generateInvestmentStrategy(
  pools,
  10000, // Budget en USD
  'moderate' // 'conservative' | 'moderate' | 'aggressive'
);

console.log(strategy);
```

## Exemples complets

### Workflow complet: De la recherche à la recommandation

```typescript
import { completeWorkflow } from '@/services/grok/examples';

const result = await completeWorkflow(process.env.GROK_API_KEY);

// Résultat contient:
// - analysis: Analyse complète avec recommandations
// - riskEvaluation: Évaluation détaillée du meilleur pool
// - strategy: Stratégie d'investissement personnalisée
```

### Analyser les meilleurs pools

```typescript
import { analyzeTopPools } from '@/services/grok/examples';

const analysis = await analyzeTopPools(process.env.GROK_API_KEY);
```

### Analyser les pools stablecoins

```typescript
import { analyzeStablecoinPools } from '@/services/grok/examples';

const analysis = await analyzeStablecoinPools(process.env.GROK_API_KEY);
```

## Types de données

### PoolAnalysisRequest

```typescript
interface PoolAnalysisRequest {
  pools: Pool[];
  criteria?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    preferStablecoins?: boolean;
    minTvl?: number;
    preferredChains?: string[];
    investmentAmount?: number;
  };
  customPrompt?: string;
}
```

### PoolAnalysisResponse

```typescript
interface PoolAnalysisResponse {
  recommendations: PoolRecommendation[];
  summary: string;
  marketInsights: string;
  warnings: string[];
  rawResponse?: string;
}
```

### PoolRecommendation

```typescript
interface PoolRecommendation {
  pool: Pool;
  score: number; // 0-100
  reasoning: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
```

## Cas d'usage

### 1. Investisseur conservateur

```typescript
const stablePools = await DeFiLlamaAPI.getStablecoinPools(1000000);

const analysis = await grok.analyzePools({
  pools: stablePools,
  criteria: {
    riskTolerance: 'low',
    preferStablecoins: true,
    minTvl: 1000000,
  },
  customPrompt: 'Recommande les pools les plus sûrs avec un rendement stable.',
});
```

### 2. Investisseur agressif

```typescript
const highYieldPools = await DeFiLlamaAPI.getTopPoolsByApy(50, 100000);

const analysis = await grok.analyzePools({
  pools: highYieldPools,
  criteria: {
    riskTolerance: 'high',
    minTvl: 100000,
  },
  customPrompt: 'Recommande les pools avec le meilleur potentiel de rendement, même avec un risque élevé.',
});
```

### 3. Diversification multi-chaînes

```typescript
const chains = ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism'];
const allPools = [];

for (const chain of chains) {
  const chainPools = await DeFiLlamaAPI.getPoolsByChain(chain);
  allPools.push(...chainPools.slice(0, 10));
}

const analysis = await grok.analyzePools({
  pools: allPools,
  criteria: {
    riskTolerance: 'medium',
    preferredChains: chains,
    investmentAmount: 50000,
  },
  customPrompt: 'Crée un portefeuille diversifié sur plusieurs chaînes.',
});
```

### 4. Analyse de marché quotidienne

```typescript
// Script à exécuter quotidiennement
async function dailyMarketAnalysis() {
  const topPools = await DeFiLlamaAPI.getTopPoolsByApy(100, 500000);
  const grok = new GrokAPI({ apiKey: process.env.GROK_API_KEY });
  
  const insights = await grok.getMarketInsights(topPools);
  
  // Envoyer par email, Slack, Discord, etc.
  console.log('📊 Analyse quotidienne du marché DeFi');
  console.log(insights);
}
```

## Bonnes pratiques

### 1. Gestion des erreurs

```typescript
try {
  const analysis = await grok.analyzePools({ pools });
  // Traiter les résultats
} catch (error) {
  console.error('Erreur lors de l\'analyse:', error);
  // Gérer l'erreur (retry, fallback, notification, etc.)
}
```

### 2. Cache des résultats

```typescript
// Éviter de faire trop d'appels API
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedAnalysis: PoolAnalysisResponse | null = null;
let cacheTime = 0;

async function getCachedAnalysis(pools: Pool[]) {
  const now = Date.now();
  
  if (cachedAnalysis && (now - cacheTime) < CACHE_DURATION) {
    return cachedAnalysis;
  }
  
  cachedAnalysis = await grok.analyzePools({ pools });
  cacheTime = now;
  
  return cachedAnalysis;
}
```

### 3. Validation des données

```typescript
// Toujours vérifier que les pools ont des données valides
const validPools = pools.filter(pool => 
  pool.tvlUsd > 0 && 
  pool.apy > 0 && 
  pool.apy < 10000 // Filtrer les APY aberrants
);

const analysis = await grok.analyzePools({ pools: validPools });
```

### 4. Limiter le nombre de pools

```typescript
// Grok a une limite de tokens, ne pas envoyer trop de pools
const MAX_POOLS = 30;
const limitedPools = pools.slice(0, MAX_POOLS);

const analysis = await grok.analyzePools({ pools: limitedPools });
```

## Coûts et limites

- **Modèle**: `grok-beta`
- **Coût**: Vérifiez les tarifs sur [x.ai](https://x.ai)
- **Limite de tokens**: ~4000 tokens par réponse
- **Rate limiting**: Respectez les limites de l'API

## Sécurité

⚠️ **Important**:
- Ne jamais exposer votre clé API côté client
- Utilisez des variables d'environnement
- Créez une route API backend pour les appels Grok
- Implémentez une authentification pour vos endpoints

### Exemple de route API Next.js

```typescript
// pages/api/analyze-pools.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GrokAPI } from '@/services/grok';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pools, criteria } = req.body;
    
    const grok = new GrokAPI({
      apiKey: process.env.GROK_API_KEY!,
    });
    
    const analysis = await grok.analyzePools({ pools, criteria });
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}
```

## Dépannage

### Erreur: "Invalid API key"
- Vérifiez que votre clé API est correcte
- Assurez-vous qu'elle est bien chargée depuis `.env.local`

### Erreur: "Rate limit exceeded"
- Implémentez un système de cache
- Ajoutez des délais entre les requêtes
- Utilisez un système de queue

### Erreur: "Unable to parse response"
- Grok peut parfois retourner du texte au lieu de JSON
- Le service tente de nettoyer la réponse automatiquement
- Vérifiez `rawResponse` pour déboguer

## Support

Pour plus d'informations:
- Documentation Grok: https://docs.x.ai
- Documentation DeFiLlama: https://defillama.com/docs/api
