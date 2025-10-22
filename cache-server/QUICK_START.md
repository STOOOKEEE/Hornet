# ⚡ Quick Start Guide

## 🚀 Démarrage en 5 minutes

### 1. Installation

```bash
cd cache-server
npm install
```

### 2. Configuration

```bash
cp .env.example .env
```

Éditer `.env`:
```bash
GEMINI_API_KEY=votre_cle_ici
```

### 3. Démarrer Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Démarrer le serveur

```bash
npm start
```

### 5. Tester

```bash
# Health check
curl http://localhost:3001/api/health

# Attendre 2 minutes pour le premier refresh, ou trigger manuellement:
curl -X POST http://localhost:3001/api/refresh

# Get analysis
curl http://localhost:3001/api/analysis
```

---

## 🐳 Démarrage avec Docker (le plus simple)

```bash
cd cache-server
cp .env.example .env
# Éditer .env avec votre clé Gemini

docker-compose up -d
```

C'est tout ! Le serveur et Redis sont prêts.

---

## 📊 Vérifier que ça fonctionne

### 1. Health check

```bash
curl http://localhost:3001/api/health
```

Devrait retourner:
```json
{
  "success": true,
  "healthy": true,
  "cache": { "healthy": true },
  "redis": { "connected": true },
  "scheduler": { "isRunning": true }
}
```

### 2. Trigger un refresh

```bash
curl -X POST http://localhost:3001/api/refresh
```

Attendre ~10 secondes (temps de fetch DeFiLlama + Gemini).

### 3. Get l'analyse

```bash
curl http://localhost:3001/api/analysis | jq
```

Devrait retourner les stratégies AI.

---

## 🔗 Intégrer avec votre frontend

### Option 1: Modifier l'API route existante

Remplacer `/pages/api/ai/analyze-strategies.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Appeler le cache server au lieu de faire les requêtes
    const response = await fetch('http://localhost:3001/api/analysis');
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch analysis');
    }

    // Retourner le même format que avant
    res.status(200).json({
      success: true,
      strategies: data.data.strategies,
      summary: data.data.summary,
      marketInsights: data.data.marketInsights || '',
      warnings: data.data.warnings,
      totalPoolsAnalyzed: data.data.totalPoolsAnalyzed,
      totalPoolsAvailable: data.metadata.totalPools,
    });
  } catch (error) {
    console.error('Error fetching from cache server:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

### Option 2: Appeler directement depuis le frontend

Modifier `/components/dashboard/AIOptimizer.tsx`:

```typescript
const handleSearch = async () => {
  try {
    setIsSearching(true);
    setError(null);

    // Appeler directement le cache server
    const response = await fetch('http://localhost:3001/api/analysis');
    
    if (!response.ok) {
      throw new Error('Failed to fetch analysis');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Analysis failed');
    }

    // Adapter le format si nécessaire
    setAnalysis({
      strategies: data.data.strategies,
      summary: data.data.summary,
      marketInsights: data.data.marketInsights || '',
      warnings: data.data.warnings,
      totalPoolsAnalyzed: data.data.totalPoolsAnalyzed,
    });
  } catch (err) {
    console.error('Search error:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsSearching(false);
  }
};
```

---

## 🌐 Déployer en production

### Railway (recommandé, gratuit)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd cache-server
railway init
railway add redis
railway up

# Configurer les variables d'environnement dans le dashboard
```

### Render (gratuit aussi)

1. Push votre code sur GitHub
2. Aller sur render.com
3. New > Web Service
4. Connecter votre repo
5. Ajouter Redis service
6. Configurer les variables d'environnement

### VPS (DigitalOcean, Linode, etc.)

```bash
# Sur votre VPS
git clone <your-repo>
cd cache-server
npm install

# Installer PM2
npm install -g pm2

# Démarrer
npm run pm2:start

# Configurer pour démarrer au boot
pm2 startup
pm2 save
```

---

## 📈 Monitoring

### Logs en temps réel

```bash
# Avec PM2
pm2 logs hornet-cache

# Avec Docker
docker-compose logs -f cache-server
```

### Métriques

```bash
# Stats du serveur
curl http://localhost:3001/api/stats | jq

# Metadata du cache
curl http://localhost:3001/api/metadata | jq
```

---

## 🔧 Configuration avancée

### Changer l'intervalle de refresh

Dans `.env`:
```bash
REFRESH_INTERVAL_MINUTES=5  # Refresh toutes les 5 minutes
```

### Augmenter le nombre de pools analysés

Dans `src/config/index.js`:
```javascript
analysis: {
  maxPoolsToAnalyze: 200,  // Analyser 200 pools au lieu de 100
}
```

### Activer le mode debug

Dans `.env`:
```bash
LOG_LEVEL=debug
LOG_PRETTY=true
```

---

## ❓ FAQ

### Q: Combien coûte le serveur ?

**R:** Gratuit sur Railway/Render (avec limites), ou ~$5-10/mois sur un VPS.

### Q: Combien coûte l'API Gemini ?

**R:** Avec un refresh toutes les 2 minutes:
- 30 requêtes/heure
- 720 requêtes/jour
- ~$0.50-1/jour selon le modèle

Vs sans cache: ~$50-100/jour si 100 utilisateurs.

### Q: Peut-on utiliser plusieurs chaînes ?

**R:** Oui, modifier `src/config/index.js`:
```javascript
analysis: {
  chains: ['Base', 'Ethereum', 'Arbitrum'],
}
```

### Q: Comment ajouter un webhook ?

**R:** Dans `.env`:
```bash
WEBHOOK_URL=https://your-webhook.com
WEBHOOK_ON_ERROR=true
WEBHOOK_ON_SUCCESS=false
```

---

## 🎉 C'est tout !

Votre serveur de cache est prêt. Les utilisateurs auront maintenant des réponses instantanées au lieu d'attendre 8-12 secondes.

**Économies:**
- ⚡ 99% plus rapide (< 50ms vs 8-12s)
- 💰 99% moins cher (1 requête/2min vs 1 requête/utilisateur)
- 🎯 Meilleure UX (pas d'attente)
