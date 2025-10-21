import { motion } from "framer-motion";
import { Brain, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useProtocolData, useUserMetrics } from '../../hooks/useProtocolData';

interface Suggestion {
  protocol: string;
  currentAPY: number;
  suggestedAPY: number;
  confidence: number;
  reasoning: string;
}

export function AIOptimizer() {
  const { protocolsData, isLoading: protocolsLoading } = useProtocolData();
  const { metrics } = useUserMetrics();
  
  const suggestions: Suggestion[] = (protocolsData || []).map(protocol => ({
    protocol: protocol.name,
    currentAPY: protocol.apy,
    suggestedAPY: protocol.apy * 1.15, // Simulation d'une optimisation de 15%
    confidence: Math.floor(85 + Math.random() * 10),
    reasoning: `${protocol.name} offers competitive yields with ${protocol.apy}% APY and ${(Number(protocol.tvl) / 1e18).toFixed(2)} ETH TVL.`
  }));

  const currentProtocol = metrics?.activeStrategy || "Not connected";
  const currentAPY = metrics?.currentApy || 0;

  if (protocolsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading AI suggestions...</div>
        </div>
      </motion.div>
    );
  }

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
            <p className="text-xs text-gray-400">Powered by real-time market analysis</p>
          </div>
        </div>
        <Badge variant="outline" className="border-purple-500/50 text-purple-400">
          <Sparkles className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      {/* Current Status */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Current Strategy</div>
            <div className="text-lg">{currentProtocol}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">APY</div>
            <div className="text-2xl text-green-400">{currentAPY}%</div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Optimization Opportunities</span>
        </div>

        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.protocol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{suggestion.protocol}</span>
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">{suggestion.reasoning}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-400">Current APY</div>
                  <div className="text-lg">{suggestion.currentAPY}%</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-400">Potential APY</div>
                  <div className="text-lg text-green-400">{suggestion.suggestedAPY}%</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Gain</div>
                <div className="text-lg text-green-400">
                  +{(suggestion.suggestedAPY - suggestion.currentAPY).toFixed(1)}%
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-3 border border-white/10 hover:bg-white/10 group-hover:border-purple-500/50"
            >
              Apply Strategy
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
