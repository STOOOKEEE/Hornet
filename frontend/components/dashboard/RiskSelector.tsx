"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

export type RiskLevel = "low" | "medium" | "high";

interface RiskOption {
  level: RiskLevel;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  expectedAPY: string;
}

const riskOptions: RiskOption[] = [
  {
    level: "low",
    label: "Low Risk",
    description: "Stable and secure strategies with established protocols",
    icon: Shield,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    expectedAPY: "5-7%",
  },
  {
    level: "medium",
    label: "Moderate Risk",
    description: "Balance between security and optimized yield",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    expectedAPY: "7-10%",
  },
  {
    level: "high",
    label: "High Risk",
    description: "Maximize returns with aggressive strategies",
    icon: Zap,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    expectedAPY: "10-15%",
  },
];

interface RiskSelectorProps {
  onRiskChange?: (risk: RiskLevel) => void;
  defaultRisk?: RiskLevel;
}

export function RiskSelector({ onRiskChange, defaultRisk = "medium" }: RiskSelectorProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>(defaultRisk);

  const handleRiskChange = (risk: RiskLevel) => {
    setSelectedRisk(risk);
    onRiskChange?.(risk);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl mb-2">Risk Level</h3>
        <p className="text-sm text-gray-400">
          Select your risk profile to adapt optimization strategies
        </p>
      </div>

      {/* Risk Options */}
      <div className="space-y-3">
        {riskOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRisk === option.level;

          return (
            <motion.button
              key={option.level}
              onClick={() => handleRiskChange(option.level)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-xl border transition-all ${
                isSelected
                  ? `${option.bgColor} ${option.borderColor} border-2`
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${option.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${option.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{option.label}</span>
                    <span className={`text-sm font-medium ${option.color}`}>
                      APY: {option.expectedAPY}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{option.description}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex-shrink-0 w-5 h-5 rounded-full ${option.bgColor} border-2 ${option.borderColor} flex items-center justify-center`}
                  >
                    <div className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
            <span className="text-blue-400 text-xs">ℹ</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-400/90">
              The system will automatically adjust its recommendations based on your risk profile.
              The indicated APYs are estimates based on historical performance.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
