import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes
    refreshIntervalMinutes: parseInt(process.env.REFRESH_INTERVAL_MINUTES || '2', 10),
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY === 'true',
  },
  
  // Monitoring
  metrics: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
  },
  
  // Webhooks
  webhooks: {
    url: process.env.WEBHOOK_URL,
    onError: process.env.WEBHOOK_ON_ERROR === 'true',
    onSuccess: process.env.WEBHOOK_ON_SUCCESS === 'true',
  },
  
  // DeFiLlama
  defiLlama: {
    baseUrl: 'https://yields.llama.fi',
    timeout: 30000,
    retries: 3,
  },
  
  // Gemini
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.5-flash',
    timeout: 60000,
    retries: 2,
  },
  
  // Analysis
  analysis: {
    maxPoolsToAnalyze: 100,
    minTvl: 10000,
    maxApy: 1000,
    chains: ['Base'],
    tokenFilter: 'usdc',
  },
};

// Validation
if (!config.geminiApiKey) {
  console.warn('⚠️  GEMINI_API_KEY not set. AI analysis will fail.');
}

export default config;
