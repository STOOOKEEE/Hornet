/**
 * Hook React pour utiliser l'API Gemini via les routes API
 */

import { useState, useCallback } from 'react';
import { Pool } from '@/services/defillama/types';
import { PoolAnalysisResponse, PoolAnalysisRequest } from '@/services/gemini/types';

interface UseGeminiAnalysisState {
  loading: boolean;
  error: Error | null;
}

/**
 * Hook pour analyser les pools avec Gemini
 */
export function useGeminiAnalysis() {
  const [state, setState] = useState<UseGeminiAnalysisState>({
    loading: false,
    error: null,
  });

  const analyzePools = useCallback(async (request: PoolAnalysisRequest): Promise<PoolAnalysisResponse | null> => {
    try {
      setState({ loading: true, error: null });

      const response = await fetch('/api/gemini/analyze-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze pools');
      }

      const data: PoolAnalysisResponse = await response.json();
      setState({ loading: false, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ loading: false, error: err });
      return null;
    }
  }, []);

  const comparePools = useCallback(async (pool1: Pool, pool2: Pool): Promise<string | null> => {
    try {
      setState({ loading: true, error: null });

      const response = await fetch('/api/gemini/compare-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pool1, pool2 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare pools');
      }

      const data = await response.json();
      setState({ loading: false, error: null });
      return data.comparison;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ loading: false, error: err });
      return null;
    }
  }, []);

  const getMarketInsights = useCallback(async (pools: Pool[]): Promise<string | null> => {
    try {
      setState({ loading: true, error: null });

      const response = await fetch('/api/gemini/market-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pools }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get market insights');
      }

      const data = await response.json();
      setState({ loading: false, error: null });
      return data.insights;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ loading: false, error: err });
      return null;
    }
  }, []);

  const evaluatePoolRisk = useCallback(async (pool: Pool): Promise<string | null> => {
    try {
      setState({ loading: true, error: null });

      const response = await fetch('/api/gemini/evaluate-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pool }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to evaluate pool risk');
      }

      const data = await response.json();
      setState({ loading: false, error: null });
      return data.riskAnalysis;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ loading: false, error: err });
      return null;
    }
  }, []);

  const generateStrategy = useCallback(async (
    pools: Pool[],
    budget: number,
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  ): Promise<string | null> => {
    try {
      setState({ loading: true, error: null });

      const response = await fetch('/api/gemini/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pools, budget, riskProfile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate strategy');
      }

      const data = await response.json();
      setState({ loading: false, error: null });
      return data.strategy;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ loading: false, error: err });
      return null;
    }
  }, []);

  return {
    ...state,
    analyzePools,
    comparePools,
    getMarketInsights,
    evaluatePoolRisk,
    generateStrategy,
  };
}
