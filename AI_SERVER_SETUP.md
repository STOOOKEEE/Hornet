# 🤖 Configuration du Serveur AI

## Vue d'ensemble

Le composant **AI Yield Optimizer** récupère ses données depuis un serveur backend qui analyse les opportunités de yield farming en temps réel.

## Format de l'API

### Endpoint

```
GET /api/optimize?address={wallet_address}
```

### Paramètres

- `address` (string, requis) : L'adresse du wallet de l'utilisateur

### Réponse Attendue

```json
{
  "strategies": [
    {
      "protocol": "Moonwell",
      "currentAPY": 7.2,
      "suggestedAPY": 8.28,
      "confidence": 88,
      "reasoning": "Moonwell offers competitive yields with 7.2% APY and 1.23 ETH TVL.",
      "tvl": "1.23 ETH",
      "gain": "+1.1%"
    },
    {
      "protocol": "Aerodrome Finance",
      "currentAPY": 9.5,
      "suggestedAPY": 10.92,
      "confidence": 90,
      "reasoning": "Aerodrome Finance offers competitive yields with 9.5% APY and 2.35 ETH TVL.",
      "tvl": "2.35 ETH",
      "gain": "+1.4%"
    }
  ],
  "currentStrategy": "None",
  "currentAPY": 0
}
```

### Champs de Données

#### Strategy Object

| Champ | Type | Description |
|-------|------|-------------|
| `protocol` | string | Nom du protocole (ex: "Moonwell", "Aerodrome Finance") |
| `currentAPY` | number | APY actuel du protocole (%) |
| `suggestedAPY` | number | APY potentiel suggéré (%) |
| `confidence` | number | Niveau de confiance de la recommandation (0-100) |
| `reasoning` | string | Explication de la recommandation |
| `tvl` | string | Total Value Locked formaté (ex: "1.23 ETH") |
| `gain` | string | Gain potentiel formaté (ex: "+1.1%") |

#### Response Root

| Champ | Type | Description |
|-------|------|-------------|
| `strategies` | Strategy[] | Liste des stratégies recommandées |
| `currentStrategy` | string | Stratégie actuellement active |
| `currentAPY` | number | APY actuel de l'utilisateur |

## Configuration

### 1. Variable d'Environnement

Ajoutez dans `.env.local` :

```bash
NEXT_PUBLIC_AI_SERVER_URL=http://votre-serveur.com/api
```

### 2. Exemple de Serveur Node.js

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/optimize', async (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

  // Votre logique AI ici
  const strategies = await analyzeYieldOpportunities(address);
  
  res.json({
    strategies,
    currentStrategy: await getCurrentStrategy(address),
    currentAPY: await getCurrentAPY(address)
  });
});

async function analyzeYieldOpportunities(address) {
  // Implémentez votre logique d'analyse AI
  // Exemple : appel à un modèle ML, analyse de données on-chain, etc.
  
  return [
    {
      protocol: "Moonwell",
      currentAPY: 7.2,
      suggestedAPY: 8.28,
      confidence: 88,
      reasoning: "Moonwell offers competitive yields...",
      tvl: "1.23 ETH",
      gain: "+1.1%"
    }
  ];
}

app.listen(3001, () => {
  console.log('AI Server running on port 3001');
});
```

### 3. Exemple avec Python/Flask

```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/optimize')
def optimize():
    address = request.args.get('address')
    
    if not address:
        return jsonify({'error': 'Address required'}), 400
    
    # Votre logique AI
    strategies = analyze_yield_opportunities(address)
    
    return jsonify({
        'strategies': strategies,
        'currentStrategy': get_current_strategy(address),
        'currentAPY': get_current_apy(address)
    })

def analyze_yield_opportunities(address):
    # Implémentez votre modèle ML ici
    return [
        {
            'protocol': 'Moonwell',
            'currentAPY': 7.2,
            'suggestedAPY': 8.28,
            'confidence': 88,
            'reasoning': 'Moonwell offers competitive yields...',
            'tvl': '1.23 ETH',
            'gain': '+1.1%'
        }
    ]

if __name__ == '__main__':
    app.run(port=3001)
```

## Fonctionnalités du Hook

### Auto-Refresh

Le hook `useAIOptimizer` rafraîchit automatiquement les données toutes les **30 secondes**.

### Fallback

Si le serveur n'est pas disponible, le hook utilise des **données de fallback** pour éviter les erreurs.

### Gestion d'Erreurs

- Affiche un message de chargement pendant la récupération
- Gère les erreurs réseau gracieusement
- Log les erreurs dans la console pour le debugging

## Logique Métier Suggérée

Votre serveur AI devrait :

1. **Analyser les protocoles DeFi** sur Base Network
2. **Calculer les APY réels** en temps réel
3. **Évaluer les risques** (smart contract audits, TVL, etc.)
4. **Générer des recommandations** basées sur :
   - Le profil de risque de l'utilisateur
   - Les conditions de marché actuelles
   - L'historique des performances
   - Les événements on-chain

## Sécurité

⚠️ **Important** :

- Ne jamais exposer de clés privées
- Valider toutes les adresses wallet
- Implémenter un rate limiting
- Utiliser HTTPS en production
- Authentifier les requêtes si nécessaire

## Testing

Pour tester sans serveur, le hook utilise automatiquement des données de fallback. Vous pouvez développer le frontend sans avoir besoin d'un serveur backend immédiatement.

## Déploiement

### Options de Déploiement

1. **Vercel/Netlify Functions** - Serverless
2. **Railway/Render** - Container hosting
3. **AWS Lambda** - Serverless
4. **Google Cloud Run** - Container
5. **Votre propre VPS** - Self-hosted

## Monitoring

Recommandations :
- Logger toutes les requêtes
- Monitorer les temps de réponse
- Alerter en cas d'erreurs
- Tracker les performances du modèle AI

## Prochaines Étapes

1. Développer votre modèle d'analyse AI
2. Déployer le serveur backend
3. Configurer `NEXT_PUBLIC_AI_SERVER_URL`
4. Tester avec de vraies données
5. Monitorer et optimiser

---

**Note** : Le frontend fonctionne déjà avec des données de fallback. Vous pouvez développer le serveur AI progressivement sans bloquer le développement frontend.
