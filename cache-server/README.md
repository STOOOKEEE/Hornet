# 🚀 Hornet Cache Server

Serveur de cache autonome pour optimiser les requêtes DeFiLlama + Gemini AI.

## 📋 Fonctionnalités

- ✅ **Cache automatique** - Interroge DeFiLlama et Gemini toutes les 2 minutes
- ✅ **API ultra-rapide** - Réponses instantanées depuis Redis
- ✅ **Retry avec backoff** - Gestion robuste des erreurs
- ✅ **Rate limiting** - Protection contre les abus
- ✅ **Logging professionnel** - Pino avec pretty print
- ✅ **Health checks** - Monitoring de l'état du serveur
- ✅ **Docker ready** - Déploiement facile
- ✅ **PM2 support** - Production-ready avec PM2

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ GET /api/analysis (instant)
       ▼
┌─────────────────────────────────┐
│     Cache Server (Express)      │
│  ┌──────────────────────────┐  │
│  │   Scheduler (cron)       │  │
│  │   Every 2 minutes        │  │
│  └────┬─────────────────────┘  │
│       │                         │
│       ▼                         │
│  ┌──────────┐  ┌────────────┐  │
│  │ DeFiLlama│  │   Gemini   │  │
│  │  Service │  │   Service  │  │
│  └────┬─────┘  └─────┬──────┘  │
│       │              │          │
│       └──────┬───────┘          │
│              ▼                  │
│       ┌────────────┐            │
│       │   Redis    │            │
│       │   Cache    │            │
│       └────────────┘            │
└─────────────────────────────────┘
```

---

## 📦 Installation

### Prérequis

- Node.js >= 18
- Redis >= 7
- Clé API Gemini

### 1. Installation locale

```bash
cd cache-server
npm install
cp .env.example .env
# Éditer .env avec vos clés API
npm start
```

### 2. Installation avec Docker

```bash
cd cache-server
cp .env.example .env
# Éditer .env avec vos clés API
docker-compose up -d
```

### 3. Installation avec PM2

```bash
cd cache-server
npm install
cp .env.example .env
# Éditer .env
npm run pm2:start
```

---

## 🔧 Configuration

### Variables d'environnement

```bash
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# API Keys
GEMINI_API_KEY=your_key_here

# Cache
CACHE_TTL=300                    # 5 minutes
REFRESH_INTERVAL_MINUTES=2       # Refresh every 2 minutes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per window

# Logging
LOG_LEVEL=info
LOG_PRETTY=true
```

---

## 📡 API Endpoints

### GET /api/analysis

Récupère l'analyse AI cachée.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "strategies": {
      "low": [{
        "pool": { /* Pool data */ },
        "score": 85,
        "reasoning": "Established protocol with high TVL",
        "pros": ["High TVL", "Established protocol"],
        "cons": ["Lower APY"],
        "riskLevel": "low"
      }],
      "medium": [/* ... */],
      "high": [/* ... */],
      "best": {/* ... */}
    },
    "summary": "Analysis completed",
    "warnings": [],
    "totalPoolsAnalyzed": 100,
    "timestamp": "2025-10-22T13:00:00.000Z"
  },
  "metadata": {
    "lastUpdate": "2025-10-22T13:00:00.000Z",
    "updateCount": 42,
    "duration": 8543,
    "poolsAnalyzed": 100,
    "totalPools": 19895,
    "ttl": 180,
    "cached": true
  }
}
```

### GET /api/pools

Récupère les pools filtrés.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "pools": [/* Array of pools */],
    "totalPools": 19895,
    "filteredPools": 486,
    "analyzedPools": 100
  }
}
```

### GET /api/metadata

Récupère les métadonnées du cache.

**Réponse:**
```json
{
  "success": true,
  "metadata": {
    "lastUpdate": "2025-10-22T13:00:00.000Z",
    "updateCount": 42,
    "duration": 8543,
    "poolsAnalyzed": 100,
    "totalPools": 19895
  },
  "lastUpdate": 1729598400000,
  "ttl": 180,
  "isUpdating": false,
  "updateCount": 42,
  "errorCount": 0,
  "nextUpdate": "2025-10-22T13:02:00.000Z"
}
```

### POST /api/refresh

Déclenche manuellement un refresh du cache.

**Réponse:**
```json
{
  "success": true,
  "metadata": {
    "lastUpdate": "2025-10-22T13:00:00.000Z",
    "updateCount": 43,
    "duration": 8234,
    "poolsAnalyzed": 100,
    "totalPools": 19895
  }
}
```

### DELETE /api/cache

Vide le cache.

**Réponse:**
```json
{
  "success": true,
  "message": "Cache cleared"
}
```

### GET /api/health

Health check du serveur.

**Réponse:**
```json
{
  "success": true,
  "healthy": true,
  "timestamp": "2025-10-22T13:00:00.000Z",
  "cache": {
    "healthy": true,
    "status": {
      "hasAnalysis": true,
      "hasPools": true,
      "isUpdating": false,
      "lastUpdate": 1729598400000,
      "updateCount": 42,
      "errorCount": 0
    }
  },
  "redis": {
    "connected": true,
    "totalKeys": 4
  },
  "scheduler": {
    "isRunning": true,
    "intervalMinutes": 2,
    "cronExpression": "*/2 * * * *"
  }
}
```

### GET /api/stats

Statistiques du serveur.

**Réponse:**
```json
{
  "success": true,
  "stats": {
    "cache": {/* metadata */},
    "redis": {/* redis stats */},
    "uptime": 3600,
    "memory": {
      "rss": 52428800,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1048576
    }
  }
}
```

---

## 🚀 Déploiement

### Option 1: VPS avec PM2 et Nginx

#### 1. Installer les dépendances

```bash
# Sur votre VPS
sudo apt update
sudo apt install -y nodejs npm redis-server nginx

# Installer PM2 globalement
sudo npm install -g pm2

# Cloner le projet
git clone <your-repo>
cd cache-server
npm install
```

#### 2. Configurer Redis

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### 3. Configurer l'environnement

```bash
cp .env.example .env
nano .env
# Éditer avec vos clés
```

#### 4. Démarrer avec PM2

```bash
npm run pm2:start

# Configurer PM2 pour démarrer au boot
pm2 startup
pm2 save
```

#### 5. Configurer Nginx

```nginx
# /etc/nginx/sites-available/hornet-cache
server {
    listen 80;
    server_name cache.hornet.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hornet-cache /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Installer SSL avec Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d cache.hornet.com
```

### Option 2: Docker sur VPS

```bash
# Sur votre VPS
git clone <your-repo>
cd cache-server

# Créer .env
cp .env.example .env
nano .env

# Démarrer avec Docker Compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Option 3: Railway

1. Créer un compte sur [Railway.app](https://railway.app)
2. Installer Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

3. Déployer:
```bash
cd cache-server
railway init
railway up
```

4. Ajouter Redis:
```bash
railway add redis
```

5. Configurer les variables d'environnement dans le dashboard Railway

### Option 4: Render

1. Créer un compte sur [Render.com](https://render.com)
2. Créer un nouveau Web Service
3. Connecter votre repo GitHub
4. Configuration:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Environment:** Node
5. Ajouter Redis:
   - Créer un nouveau Redis service
   - Copier l'URL de connexion
6. Ajouter les variables d'environnement

---

## 🔍 Monitoring

### Logs avec PM2

```bash
pm2 logs hornet-cache
pm2 monit
```

### Métriques

```bash
# Stats du serveur
curl http://localhost:3001/api/stats

# Health check
curl http://localhost:3001/api/health
```

### Dashboard (optionnel)

Installer PM2 Plus pour un dashboard web:
```bash
pm2 plus
```

---

## 🧪 Tests

### Test manuel

```bash
# Health check
curl http://localhost:3001/api/health

# Get analysis
curl http://localhost:3001/api/analysis

# Trigger refresh
curl -X POST http://localhost:3001/api/refresh

# Get metadata
curl http://localhost:3001/api/metadata
```

### Load testing

```bash
# Installer Apache Bench
sudo apt install apache2-utils

# Test de charge
ab -n 1000 -c 10 http://localhost:3001/api/analysis
```

---

## 📊 Performance

### Benchmarks

- **Sans cache:** 8-12 secondes (DeFiLlama + Gemini)
- **Avec cache:** < 50ms (Redis)
- **Économie:** ~99% de réduction du temps de réponse

### Coûts API

- **Sans cache:** 1 requête Gemini par utilisateur
- **Avec cache:** 1 requête Gemini toutes les 2 minutes
- **Économie:** ~99% de réduction des coûts

---

## 🔒 Sécurité

- ✅ Helmet.js pour les headers de sécurité
- ✅ Rate limiting pour prévenir les abus
- ✅ CORS configuré
- ✅ Validation des entrées
- ✅ Logs des erreurs
- ✅ Graceful shutdown

---

## 🐛 Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier Redis
redis-cli ping
# Devrait retourner PONG

# Vérifier les logs
pm2 logs hornet-cache
```

### Pas de données dans le cache

```bash
# Vérifier le scheduler
curl http://localhost:3001/api/health

# Trigger manual refresh
curl -X POST http://localhost:3001/api/refresh
```

### Erreur Gemini API

```bash
# Vérifier la clé API
echo $GEMINI_API_KEY

# Vérifier les logs
pm2 logs hornet-cache --lines 100
```

---

## 📝 Licence

MIT

---

## 👥 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.
