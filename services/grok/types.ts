/**
 * Types pour l'API Grok (xAI)
 */

import { Pool } from '../defillama/types';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PoolAnalysisRequest {
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

export interface PoolRecommendation {
  pool: Pool;
  score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PoolAnalysisResponse {
  recommendations: PoolRecommendation[];
  summary: string;
  marketInsights: string;
  warnings: string[];
  rawResponse?: string;
}

export interface GrokConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}
