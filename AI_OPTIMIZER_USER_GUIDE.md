# Guide d'Utilisation - AI Yield Optimizer

## 🎯 Fonctionnalité

Le **AI Yield Optimizer** analyse automatiquement toutes les pools Uniswap sur Base et sélectionne les 3 meilleures pools (Safe, Medium, Risky) en utilisant un algorithme de scoring intelligent.

## 📍 Localisation

Le composant `AI Yield Optimizer` se trouve dans le Dashboard principal :
- **URL** : `http://localhost:3000/dashboard`
- **Position** : En haut de la page, sous la section "Wallet Connect"

## 🚀 Utilisation

### 1. Cliquer sur "Search Best Strategies"

Lorsque vous cliquez sur le bouton violet **"Search Best Strategies"**, le système :

1. ✅ Récupère toutes les pools Uniswap V3 et V4 sur Base depuis DeFiLlama
2. ✅ Filtre les pools avec TVL > $100k
3. ✅ Classe les pools par catégorie d'APY :
   - **Safe** : 4-7% APY
   - **Medium** : 7-12% APY
   - **Risky** : 12-20% APY
4. ✅ Calcule un score de sécurité (0-100) pour chaque pool
5. ✅ Sélectionne la pool **la plus sûre** dans chaque catégorie

### 2. Résultats Affichés

Après l'analyse (environ 1-2 secondes), vous verrez **3 cartes** :

#### 🛡️ Carte Safe (Verte)
```
SAFE
Score: 95

USDC-USDT
uniswap-v3

APY: 5.20%    TVL: $12.5M
Range: 4-7% APY

Why selected:
✓ Very high TVL: $12.5M
✓ High trading activity

[Open in Uniswap]
```

#### ⚖️ Carte Medium (Jaune)
```
MEDIUM
Score: 70

ETH-USDC
uniswap-v3

APY: 9.80%    TVL: $8.2M
Range: 7-12% APY

Why selected:
✓ Good TVL: $8.2M
✓ High trading activity

[Open in Uniswap]
```

#### 🔥 Carte Risky (Rouge)
```
RISKY
Score: 45

PEPE-WETH
uniswap-v3

APY: 15.50%   TVL: $2.1M
Range: 12-20% APY

Why selected:
✓ Good TVL: $2.1M
✓ High trading activity

[Open in Uniswap]
```

### 3. Interagir avec les Résultats

Pour chaque carte, vous pouvez :
- 📊 **Voir le score de sécurité** (0-100)
- 💰 **Voir l'APY et le TVL**
- 📝 **Lire les raisons de sélection**
- 🔗 **Cliquer sur "Open in Uniswap"** pour ouvrir la pool dans l'interface Uniswap

## 📊 Score de Sécurité

Le score est calculé sur 100 points basé sur :

| Critère | Points Max | Description |
|---------|-----------|-------------|
| **TVL** | 40 pts | Plus le TVL est élevé, plus c'est sûr |
| **Volume** | 30 pts | Ratio Volume/TVL élevé = pool active |
| **IL Risk** | 15 pts | Pas d'impermanent loss |
| **Stablecoin** | 10 pts | Pool de stablecoins |
| **APY Stable** | 5 pts | APY stable sur 30 jours |

**Exemple** :
- Score 90-100 = Excellente sécurité
- Score 70-89 = Bonne sécurité
- Score 50-69 = Sécurité acceptable
- Score < 50 = Risque élevé

## 🎨 Interface

### État Initial (Avant Recherche)
```
╔══════════════════════════════════════════════╗
║  AI Yield Optimizer                          ║
║  Powered by DeFi Llama & Gemini AI           ║
║                                              ║
║  Click "Search Best Strategies" to analyze   ║
║  USDC pools on Base                          ║
║                                              ║
║  [Search Best Strategies] ←─ Cliquez ici    ║
╚══════════════════════════════════════════════╝
```

### Pendant la Recherche
```
╔══════════════════════════════════════════════╗
║  [⟳ Analyzing...]                           ║
╚══════════════════════════════════════════════╝
```

### Résultats
```
╔══════════════════════════════════════════════╗
║  Selected Best Pools                         ║
║  42 pools analyzed                           ║
║                                              ║
║  ┌─────┐  ┌─────┐  ┌─────┐                 ║
║  │SAFE │  │MEDIUM│ │RISKY│                 ║
║  └─────┘  └─────┘  └─────┘                 ║
╚══════════════════════════════════════════════╝
```

## 🔄 Rafraîchissement

Pour obtenir les dernières données :
1. Cliquez à nouveau sur **"Search Best Strategies"**
2. Les pools sont automatiquement mises à jour toutes les 5 minutes en arrière-plan

## ⚠️ Messages d'Erreur

### "No pools available"
**Cause** : Les données DeFiLlama ne sont pas encore chargées  
**Solution** : Attendez quelques secondes et réessayez

### "No suitable pools found"
**Cause** : Aucune pool ne correspond aux critères (4-20% APY, TVL > $100k)  
**Solution** : Normal si le marché est peu actif sur Base

### "No safe/medium/risky pool found"
**Cause** : Aucune pool dans cette catégorie d'APY spécifique  
**Exemple** : Il peut ne pas y avoir de pool avec 12-20% APY

## 💡 Conseils d'Utilisation

### Pour les Investisseurs Conservateurs
👉 Regardez uniquement la carte **Safe** (verte)
- APY stable 4-7%
- Risque minimal
- Généralement des stablecoins

### Pour les Investisseurs Modérés
👉 Considérez la carte **Medium** (jaune)
- APY attractif 7-12%
- Risque/rendement équilibré
- Paires majeures

### Pour les Investisseurs Agressifs
👉 Explorez la carte **Risky** (rouge)
- APY élevé 12-20%
- Risque plus élevé
- Nouvelles paires, tokens volatils

## 🔗 Flux de Travail Complet

```
1. Dashboard
   ↓
2. Cliquer "Search Best Strategies"
   ↓
3. Analyse des pools (1-2 sec)
   ↓
4. Résultats affichés (3 cartes)
   ↓
5. Choisir une pool selon votre profil
   ↓
6. Cliquer "Open in Uniswap"
   ↓
7. Déposer vos fonds sur Uniswap
```

## 📱 Responsive

Le composant est entièrement responsive :
- **Desktop** : 3 cartes côte à côte
- **Tablet** : 3 cartes sur 1 colonne
- **Mobile** : 1 carte par ligne

## 🔍 Logs Console

Pour les développeurs, ouvrez la console pour voir :

```javascript
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
```

## 🎯 Exemple d'Utilisation Réelle

### Scénario : Je veux un rendement stable avec risque minimal

1. Ouvrez le Dashboard
2. Cliquez sur **"Search Best Strategies"**
3. Attendez l'analyse (1-2 sec)
4. Regardez la carte **SAFE** (verte)
5. Vérifiez :
   - ✓ Score élevé (90+)
   - ✓ APY acceptable (4-7%)
   - ✓ TVL important ($10M+)
6. Cliquez **"Open in Uniswap"**
7. Déposez vos fonds dans cette pool

## 🛠️ Dépannage

### Le bouton est grisé
**Cause** : Les pools sont en cours de chargement  
**Solution** : Attendez que `poolsLoading` soit terminé

### Aucun résultat après 5 secondes
**Cause** : Problème de connexion à DeFiLlama  
**Solution** : Vérifiez votre connexion internet et réessayez

### Les APY semblent incorrects
**Cause** : Les données DeFiLlama peuvent avoir un délai  
**Solution** : Les données sont rafraîchies toutes les 5 minutes automatiquement

## 📚 Documentation Technique

Pour plus de détails techniques :
- **Logique de sélection** : `POOL_SELECTION_LOGIC.md`
- **API DeFiLlama** : `UNISWAP_POOLS_GUIDE.md`
- **Code source** : `frontend/components/dashboard/AIOptimizer.tsx`

## ✨ Fonctionnalités Avancées

### Auto-refresh
Les pools sont automatiquement mises à jour toutes les 5 minutes en arrière-plan. Vous n'avez pas besoin de rafraîchir manuellement.

### Tri Intelligent
La pool sélectionnée est **toujours la plus sûre** de sa catégorie, pas simplement celle avec le meilleur APY.

### Explications Transparentes
Chaque sélection inclut les raisons précises pour lesquelles cette pool a été choisie.

---

**Note** : Les investissements en DeFi comportent des risques. Faites toujours vos propres recherches (DYOR) avant d'investir.
