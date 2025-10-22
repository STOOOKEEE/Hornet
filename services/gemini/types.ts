/**
 * Types pour l'API Gemini (Google AI)
 */

import { Pool } from '../defillama/types';

/**
 * Configuration de l'API Gemini
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Structure d'un message Gemini
 */
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/**
 * Configuration de génération pour Gemini
 */
export interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

/**
 * Requête à l'API Gemini
 */
export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: GenerationConfig;
}

/**
 * Candidat de réponse Gemini
 */
export interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>;
    role: string;
  };
  finishReason?: string;
  index?: number;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

/**
 * Réponse de l'API Gemini
 */
export interface GeminiResponse {
  candidates: GeminiCandidate[];
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

/**
 * Critères d'analyse des pools
 */
export interface PoolAnalysisCriteria {
  riskTolerance?: 'low' | 'medium' | 'high';
  preferStablecoins?: boolean;
  minTvl?: number;
  preferredChains?: string[];
  investmentAmount?: number;
}

/**
 * Requête d'analyse de pools
 */
export interface PoolAnalysisRequest {
  pools: Pool[];
  criteria?: PoolAnalysisCriteria;
  customPrompt?: string;
}

/**
 * Recommandation de pool
 */
export interface PoolRecommendation {
  pool: Pool;
  score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Réponse d'analyse de pools
 */
export interface PoolAnalysisResponse {
  recommendations: PoolRecommendation[];
  summary: string;
  marketInsights: string;
  warnings: string[];
  rawResponse: string;
}
