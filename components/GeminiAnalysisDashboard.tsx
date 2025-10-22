/**
 * Dashboard pour l'analyse des pools avec Gemini
 */

import React, { useState } from 'react';
import { useTopPools } from '@/hooks/useDeFiLlama';
import { useGeminiAnalysis } from '@/hooks/useGeminiAnalysis';
import { Pool } from '@/services/defillama/types';
import { PoolRecommendation } from '@/services/gemini/types';

/**
 * Composant pour afficher une recommandation
 */
const RecommendationCard: React.FC<{ recommendation: PoolRecommendation; rank: number }> = ({
  recommendation,
  rank,
}) => {
  const { pool, score, reasoning, pros, cons, riskLevel } = recommendation;

  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {rank}
          </div>
          <div>
            <h3 className="font-bold text-xl">{pool.symbol}</h3>
            <p className="text-sm text-gray-600">{pool.project}</p>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded mt-1 inline-block">
              {pool.chain}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">APY</p>
          <p className="text-xl font-semibold text-green-600">{pool.apy.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">TVL</p>
          <p className="text-xl font-semibold">${(pool.tvlUsd / 1e6).toFixed(2)}M</p>
        </div>
      </div>

      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[riskLevel]}`}>
          Risque: {riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-green-700 mb-2">✅ Avantages</p>
          <ul className="space-y-1">
            {pros.map((pro, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Inconvénients</p>
          <ul className="space-y-1">
            {cons.map((con, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard principal
 */
export const GeminiAnalysisDashboard: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [preferStablecoins, setPreferStablecoins] = useState(false);
  const [minTvl, setMinTvl] = useState(1000000);

  const { pools, loading: loadingPools, error: poolsError } = useTopPools(30, 500000);
  const { analyzePools, loading: geminiLoading, error: geminiError } = useGeminiAnalysis();

  const handleAnalyze = async () => {
    if (pools.length === 0) return;

    setAnalyzing(true);
    const result = await analyzePools({
      pools,
      criteria: {
        riskTolerance,
        preferStablecoins,
        minTvl,
      },
    });

    if (result) {
      setAnalysis(result);
    }
    setAnalyzing(false);
  };

  if (loadingPools) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des pools...</p>
        </div>
      </div>
    );
  }

  if (poolsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Erreur</h2>
          <p className="text-red-700">{poolsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analyse IA des Pools DeFi
          </h1>
          <p className="text-gray-600">
            Powered by Gemini AI - Recommandations intelligentes basées sur vos critères
          </p>
        </header>

        {/* Contrôles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Critères d'analyse</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tolérance au risque</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">TVL Minimum ($)</label>
              <input
                type="number"
                value={minTvl}
                onChange={(e) => setMinTvl(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferStablecoins}
                  onChange={(e) => setPreferStablecoins(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Préférer les stablecoins</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || geminiLoading || pools.length === 0}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg"
            >
              {analyzing || geminiLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyse en cours...
                </span>
              ) : (
                `🤖 Analyser ${pools.length} pools avec Gemini AI`
              )}
            </button>
          </div>

          {geminiError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Erreur:</strong> {geminiError.message}
              </p>
            </div>
          )}
        </div>

        {/* Résultats */}
        {analysis && (
          <div className="space-y-6">
            {/* Résumé et Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Résumé de l'analyse
                </h2>
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Insights du marché
                </h2>
                <p className="text-gray-700 leading-relaxed">{analysis.marketInsights}</p>
              </div>
            </div>

            {/* Avertissements */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-yellow-800">
                  <span className="mr-2">⚠️</span>
                  Avertissements
                </h2>
                <ul className="space-y-2">
                  {analysis.warnings.map((warning: string, i: number) => (
                    <li key={i} className="text-yellow-800 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommandations */}
            <div>
              <h2 className="text-2xl font-bold mb-6">🎯 Recommandations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.recommendations.map((rec: PoolRecommendation, i: number) => (
                  <RecommendationCard key={rec.pool.pool} recommendation={rec} rank={i + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* État initial */}
        {!analysis && !analyzing && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">Prêt à analyser</h2>
            <p className="text-gray-600">
              Configurez vos critères et cliquez sur le bouton d'analyse pour obtenir des recommandations IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiAnalysisDashboard;
