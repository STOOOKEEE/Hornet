# AI Yield Optimizer - Guide d'utilisation

## Vue d'ensemble

Le composant **AI Yield Optimizer** utilise DeFi Llama et Gemini AI pour analyser les pools de liquidité USDC sur Base et recommander les meilleures stratégies selon votre profil de risque.

## Configuration requise

### 1. Clé API Gemini

Vous devez obtenir une clé API Gemini (Google AI) :

1. Visitez [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une clé API
3. Ajoutez-la dans votre fichier `.env.local` :

```bash
GEMINI_API_KEY=votre_clé_api_ici
```

## Fonctionnalités

### 1. Recherche de stratégies

Le bouton **"Search Best Strategies"** déclenche :

1. **Récupération des pools** : Appel à l'API DeFi Llama pour obtenir tous les pools USDC sur Base
   - Filtre : TVL minimum de $10,000
   - Filtre : APY valide (0% - 1000%)
   - Tri par TVL décroissant

2. **Analyse par Gemini AI** : Les pools sont envoyés à Gemini pour analyse
   - Évaluation du rapport rendement/risque
   - Classification par niveau de risque (Low, Medium, High)
   - Génération de recommandations détaillées

### 2. Sélection du niveau de risque

Trois profils disponibles :

- **Low Risk** : Stratégies conservatrices avec protocoles établis
- **Medium Risk** : Équilibre entre sécurité et rendement
- **High Risk** : Maximisation du rendement avec stratégies agressives

### 3. Affichage des résultats

Pour chaque stratégie recommandée :

- **Projet** : Nom du protocole DeFi
- **Symbole** : Paire de tokens
- **APY** : Rendement annuel en pourcentage
- **TVL** : Total Value Locked
- **Score de confiance** : Niveau de confiance de l'IA (0-100%)
- **Pros/Cons** : Avantages et inconvénients détaillés
- **Raisonnement** : Explication de la recommandation

## Architecture technique

### Routes API créées

#### `/api/pools/usdc-base` (GET)
Récupère les pools USDC sur Base depuis DeFi Llama.

**Réponse** :
```json
{
  "success": true,
  "count": 25,
  "pools": [...]
}
```

#### `/api/ai/analyze-strategies` (POST)
Analyse les pools avec Gemini AI.

**Requête** :
```json
{
  "pools": [...],
  "riskLevel": "medium"
}
```

**Réponse** :
```json
{
  "success": true,
  "strategies": {
    "low": [...],
    "medium": [...],
    "high": [...],
    "best": {...}
  },
  "summary": "...",
  "marketInsights": "...",
  "warnings": [...],
  "totalPoolsAnalyzed": 25
}
```

## Services utilisés

### DeFi Llama API
- **Documentation** : https://defillama.com/docs/api
- **Endpoint** : https://yields.llama.fi/pools
- **Gratuit** : Pas de clé API requise

### Gemini AI (Google)
- **Documentation** : https://ai.google.dev/docs
- **Modèle** : gemini-pro
- **Clé API requise** : Oui (gratuite avec limites)

## Limites et considérations

1. **Rate Limiting** : Gemini AI a des limites de requêtes (60 requêtes/minute en gratuit)
2. **Coût** : La version gratuite de Gemini peut avoir des limitations
3. **Données en temps réel** : Les données DeFi Llama sont mises à jour régulièrement mais peuvent avoir un léger délai
4. **Recommandations** : Les recommandations de l'IA sont à titre informatif uniquement, pas des conseils financiers

## Dépannage

### Erreur "GEMINI_API_KEY not configured"
- Vérifiez que la clé API est bien dans `.env.local`
- Redémarrez le serveur Next.js après avoir ajouté la clé

### Erreur "Failed to fetch pools"
- Vérifiez votre connexion internet
- L'API DeFi Llama peut être temporairement indisponible

### Erreur "Failed to analyze strategies"
- Vérifiez que votre clé API Gemini est valide
- Vérifiez les quotas de votre clé API

## Améliorations futures

- [ ] Cache des résultats pour réduire les appels API
- [ ] Support de plusieurs stablecoins (USDT, DAI, etc.)
- [ ] Support de plusieurs chaînes (Ethereum, Polygon, etc.)
- [ ] Historique des recommandations
- [ ] Notifications de changement de stratégie optimale
- [ ] Intégration avec les smart contracts pour application automatique
