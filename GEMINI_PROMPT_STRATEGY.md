# 🤖 Stratégie de Prompt pour Gemini

## 📊 Données envoyées à Gemini

### Source: API DefiLlama
**Endpoint:** `https://yields.llama.fi/pools`

### Filtrage appliqué
Les pools sont filtrés pour ne garder que:
1. ✅ **Blockchain:** Base uniquement
2. ✅ **Token:** Contient "USDC" dans le symbole
3. ✅ **TVL minimum:** $10,000 (pour éviter les pools trop petits)
4. ✅ **APY valide:** Entre 0% et 1000% (pour éviter les valeurs aberrantes)

### Structure des données envoyées

```typescript
{
  id: string,              // ID unique du pool
  project: string,         // Nom du protocole (ex: "uniswap-v3", "aerodrome")
  symbol: string,          // Paire de tokens (ex: "USDC-WETH")
  chain: "Base",          // Toujours "Base"
  apy: number,            // APY total en %
  apyBase: number,        // APY de base (sans rewards)
  apyReward: number,      // APY des rewards
  tvlUsd: number,         // Total Value Locked en USD
  stablecoin: boolean,    // Si c'est un pool stablecoin
  ilRisk: string,         // Risque d'impermanent loss ("no", "low", "medium", "high")
  exposure: string,       // Type d'exposition ("single", "multi")
  rewardTokens: string[]  // Liste des tokens de reward
}
```

---

## 📝 Prompt actuel (dans analyze-strategies.ts)

### Objectif
Analyser les pools USDC sur Base et recommander les 3 meilleures stratégies par niveau de risque.

### Prompt système
```
Tu es un expert en finance décentralisée (DeFi) spécialisé dans l'analyse des pools de liquidité et l'optimisation des rendements.
Tu dois analyser les pools fournis et recommander les meilleurs en fonction des critères donnés.

Réponds TOUJOURS au format JSON suivant (sans markdown, juste le JSON brut):
{
  "recommendations": [
    {
      "poolId": "id du pool",
      "score": 0-100,
      "reasoning": "explication détaillée",
      "pros": ["avantage 1", "avantage 2"],
      "cons": ["inconvénient 1", "inconvénient 2"],
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": "résumé général de l'analyse",
  "marketInsights": "insights sur le marché actuel",
  "warnings": ["avertissement 1", "avertissement 2"]
}
```

### Prompt utilisateur
```
Analyse ces pools de liquidité USDC sur Base et recommande les 3 meilleures stratégies pour chaque niveau de risque:

1. **Stratégie Faible Risque** (conservative): Pools stables avec TVL élevé et protocoles établis
2. **Stratégie Risque Modéré** (moderate): Équilibre entre rendement et sécurité
3. **Stratégie Risque Élevé** (aggressive): Maximisation du rendement avec des protocoles plus récents ou innovants

Pour chaque stratégie, fournis:
- Le pool recommandé
- L'APY attendu
- Le niveau de confiance (0-100)
- Les avantages et inconvénients
- Une explication détaillée

Concentre-toi sur les pools avec le meilleur rapport rendement/risque pour chaque catégorie.

Critères à considérer:
- Tolérance au risque: [conservative|moderate|aggressive]
- Préférence pour les stablecoins
- TVL minimum: $10,000
- Chaînes préférées: Base

Voici les données des pools (X pools):
[JSON des pools filtrés]
```

---

## ✅ Le prompt actuel est-il bon ?

### Points forts ✅
1. **Structure claire** - Format JSON bien défini
2. **Critères précis** - Niveaux de risque explicites
3. **Contexte complet** - Toutes les données nécessaires fournies
4. **Instructions détaillées** - Ce qu'on attend de Gemini est clair

### Points à améliorer 🔧

#### 1. Ajouter des exemples de réponse
```json
"recommendations": [
  {
    "poolId": "abc-123-def",
    "score": 85,
    "reasoning": "Pool Uniswap V3 USDC-WETH avec TVL de $50M et APY stable de 8%",
    "pros": [
      "Protocole établi et audité",
      "TVL élevé garantissant la liquidité",
      "APY stable sur 30 jours"
    ],
    "cons": [
      "Risque d'impermanent loss modéré",
      "APY inférieur aux pools plus risqués"
    ],
    "riskLevel": "low"
  }
]
```

#### 2. Préciser les critères de scoring
Ajouter au prompt:
```
Le score (0-100) doit être calculé selon:
- TVL (30 points): Plus élevé = meilleur
- APY (25 points): Équilibre rendement/réalisme
- Protocole (20 points): Réputation et audits
- Liquidité (15 points): Facilité d'entrée/sortie
- Stabilité (10 points): Variance APY sur 30j
```

#### 3. Ajouter des garde-fous
```
IMPORTANT:
- Ne recommande JAMAIS un pool avec TVL < $50,000
- Évite les pools avec APY > 100% sauf si justifié
- Privilégie les protocoles avec audits de sécurité
- Vérifie que le pool a au moins 30 jours d'historique
```

---

## 🎯 Prompt amélioré recommandé

### Option 1: Prompt détaillé (pour meilleure qualité)

```typescript
customPrompt: `Tu es un expert DeFi analysant des pools USDC sur Base.

OBJECTIF: Recommander les 3 meilleurs pools pour chaque profil de risque.

CRITÈRES DE SÉLECTION:
1. **Faible Risque (Conservative)**
   - TVL > $1M
   - Protocoles établis (Uniswap, Aave, Compound)
   - APY réaliste (3-10%)
   - Audits de sécurité multiples
   - Historique stable > 6 mois

2. **Risque Modéré (Moderate)**
   - TVL > $500K
   - Protocoles reconnus ou émergents prometteurs
   - APY attractif (8-20%)
   - Au moins 1 audit de sécurité
   - Historique > 3 mois

3. **Risque Élevé (Aggressive)**
   - TVL > $100K
   - Nouveaux protocoles ou stratégies innovantes
   - APY élevé (15-50%)
   - Peut être récent mais avec fondamentaux solides
   - Potentiel de croissance important

SCORING (0-100):
- TVL et liquidité: 30 points
- APY et rendement: 25 points
- Réputation du protocole: 20 points
- Stabilité historique: 15 points
- Sécurité et audits: 10 points

GARDE-FOUS:
- Rejette les pools avec TVL < $50K
- Méfie-toi des APY > 100% (sauf si bien justifié)
- Privilégie les pools avec volume de trading régulier
- Évite les pools avec forte variance APY (>50% en 7j)

FORMAT DE RÉPONSE:
Retourne UNIQUEMENT du JSON valide (pas de markdown):
{
  "recommendations": [
    {
      "poolId": "id-exact-du-pool",
      "score": 85,
      "reasoning": "Explication détaillée de 2-3 phrases",
      "pros": ["3-5 avantages concrets"],
      "cons": ["2-3 inconvénients honnêtes"],
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": "Vue d'ensemble du marché USDC sur Base",
  "marketInsights": "Tendances et opportunités actuelles",
  "warnings": ["Risques généraux à surveiller"]
}

DONNÉES DES POOLS:
${JSON.stringify(poolsData, null, 2)}`
```

### Option 2: Prompt concis (pour rapidité)

```typescript
customPrompt: `Analyse ces pools USDC sur Base et recommande le meilleur pour chaque profil:

LOW RISK: TVL>$1M, protocole établi, APY 3-10%
MEDIUM RISK: TVL>$500K, APY 8-20%, bon équilibre
HIGH RISK: TVL>$100K, APY 15-50%, potentiel élevé

Score chaque pool /100 selon: TVL(30), APY(25), Protocole(20), Stabilité(15), Sécurité(10)

Retourne JSON uniquement:
{
  "recommendations": [{"poolId":"", "score":0, "reasoning":"", "pros":[], "cons":[], "riskLevel":""}],
  "summary": "",
  "marketInsights": "",
  "warnings": []
}

Pools: ${JSON.stringify(poolsData, null, 2)}`
```

---

## 🔄 Flux de données complet

```
1. Frontend (Dashboard)
   └─> Sélectionne niveau de risque (low/medium/high)

2. API Route: /api/pools/usdc-base
   └─> Récupère tous les pools DefiLlama
   └─> Filtre: Base + USDC + TVL>$10K + APY<1000%
   └─> Retourne ~100-200 pools filtrés

3. API Route: /api/ai/analyze-strategies
   └─> Reçoit les pools filtrés
   └─> Envoie à Gemini avec prompt personnalisé
   └─> Gemini analyse et retourne recommandations
   └─> Parse le JSON de Gemini
   └─> Organise par niveau de risque
   └─> Retourne au frontend

4. Frontend (AIOptimizer)
   └─> Affiche les 3 meilleures stratégies
   └─> Montre détails, pros/cons, score
   └─> Permet de sélectionner et investir
```

---

## 💡 Recommandation finale

**OUI, le prompt actuel est bon mais peut être amélioré.**

### Actions recommandées:

1. ✅ **Garder la structure actuelle** - Elle fonctionne bien
2. 🔧 **Ajouter les critères de scoring** - Pour plus de cohérence
3. 🔧 **Ajouter les garde-fous** - Pour éviter les mauvaises recommandations
4. 🔧 **Préciser les exemples** - Pour guider Gemini
5. ✅ **Tester avec le nouveau modèle** - gemini-1.5-flash est plus rapide

### Priorité immédiate:
Redémarrer le serveur pour que le changement de modèle prenne effet:
```bash
# Arrêter le serveur (Ctrl+C)
# Nettoyer le cache Next.js
rm -rf .next
# Redémarrer
npm run dev
```

Une fois que ça fonctionne, on pourra affiner le prompt si nécessaire.
