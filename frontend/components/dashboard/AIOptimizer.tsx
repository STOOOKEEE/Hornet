import { motion } from "framer-motion";
import { Brain, TrendingUp, ArrowRight, Sparkles, Search, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { Pool } from '../../services/defillama/types';

interface Strategy {
  pool: Pool;
  score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface AnalysisResult {
  strategies: {
    low: Strategy[];
    medium: Strategy[];
    high: Strategy[];
    best: Strategy;
  };
  summary: string;
  marketInsights: string;
  warnings: string[];
  totalPoolsAnalyzed: number;
}

export function AIOptimizer() {
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError(null);

      // Récupérer les pools USDC sur Base
      const poolsResponse = await fetch('/api/pools/usdc-base');
      if (!poolsResponse.ok) {
        throw new Error('Failed to fetch pools');
      }
      const poolsData = await poolsResponse.json();

      if (!poolsData.success || poolsData.pools.length === 0) {
        throw new Error('No USDC pools found on Base');
      }

      // Analyser avec Gemini
      const analysisResponse = await fetch('/api/ai/analyze-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pools: poolsData.pools,
          riskLevel: selectedRisk,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze strategies');
      }

      const analysisData = await analysisResponse.json();
      if (!analysisData.success) {
        throw new Error(analysisData.message || 'Analysis failed');
      }

      setAnalysis(analysisData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const getStrategyForRisk = () => {
    if (!analysis) return null;
    const strategies = analysis.strategies[selectedRisk];
    return strategies && strategies.length > 0 ? strategies[0] : null;
  };

  const currentStrategy = getStrategyForRisk();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl">AI Yield Optimizer</h3>
            <p className="text-xs text-gray-400">Powered by DeFi Llama & Gemini AI</p>
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Best Strategies
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 text-sm font-medium">Error</p>
              <p className="text-red-500/80 text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Risk Level Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Select Risk Level</p>
              <p className="text-xs text-gray-500">{analysis.totalPoolsAnalyzed} pools analyzed</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRisk === risk
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {risk === 'low' ? 'Low Risk' : risk === 'medium' ? 'Medium Risk' : 'High Risk'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Strategy Display */}
      {currentStrategy ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4"
        >
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{currentStrategy.pool.project}</span>
              <Badge variant="secondary" className="text-xs">
                {currentStrategy.score}% confidence
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  selectedRisk === 'low'
                    ? 'border-green-500/50 text-green-400'
                    : selectedRisk === 'medium'
                    ? 'border-blue-500/50 text-blue-400'
                    : 'border-orange-500/50 text-orange-400'
                }`}
              >
                {selectedRisk === 'low' ? 'Low Risk' : selectedRisk === 'medium' ? 'Medium Risk' : 'High Risk'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mb-2">{currentStrategy.pool.symbol}</p>
            <p className="text-xs text-gray-400">{currentStrategy.reasoning}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">APY</div>
              <div className="text-2xl text-green-400">{currentStrategy.pool.apy.toFixed(2)}%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">TVL</div>
              <div className="text-2xl">${(currentStrategy.pool.tvlUsd / 1e6).toFixed(2)}M</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">Pros:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                {currentStrategy.pros.map((pro, i) => (
                  <li key={i}>• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-orange-400 font-medium mb-1">Cons:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                {currentStrategy.cons.map((con, i) => (
                  <li key={i}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              className="border border-white/10 hover:bg-white/10 hover:border-purple-500/50"
            >
              Apply Strategy
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              className="border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-400"
              onClick={() => window.open(`https://defillama.com/yields/pool/${currentStrategy.pool.pool}`, '_blank')}
            >
              View Details
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      ) : analysis ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No strategy found for {selectedRisk} risk level
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            Click "Search Best Strategies" to analyze USDC pools on Base
          </p>
        </div>
      )}

    </motion.div>
  );
}
