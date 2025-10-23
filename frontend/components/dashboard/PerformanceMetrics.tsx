import { motion } from "framer-motion";
import { TrendingUp, Activity, DollarSign, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useUserMetrics } from '../../hooks/useProtocolData';
import { useState } from 'react';

type TimePeriod = '1W' | '1M' | '3M' | '1Y';

export function PerformanceMetrics() {
  const { metrics, isLoading } = useUserMetrics();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  
  const formattedMetrics = [
    {
      label: "Total Value Locked",
      value: metrics ? `$${(Number(metrics.totalValueLocked) / 1e18).toFixed(2)}` : "$0.00",
      change: "0%",
      positive: true,
      icon: DollarSign,
    },
    {
      label: "Current APY",
      value: metrics ? `${metrics.currentApy}%` : "0%",
      change: "0%",
      positive: true,
      icon: Percent,
    },
    {
      label: "Total Earned",
      value: metrics ? `$${(Number(metrics.totalEarned) / 1e18).toFixed(2)}` : "$0.00",
      change: "0%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Active Strategy",
      value: metrics?.activeStrategy || "None",
      change: "",
      positive: true,
      icon: Activity,
    },
  ];

  // Filtrer les données selon la période sélectionnée
  const filterDataByPeriod = (period: TimePeriod) => {
    if (!metrics?.historicalBalances || metrics.historicalBalances.length === 0) {
      return [{ date: "Now", value: 0 }];
    }

    const now = Date.now();
    let cutoffTime: number;

    switch (period) {
      case '1W':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '3M':
        cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '1Y':
        cutoffTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
    }

    const filtered = metrics.historicalBalances.filter(
      (item) => item.timestamp >= cutoffTime
    );

    return filtered.map((item) => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      value: Number(item.value) / 1e18
    }));
  };

  const displayChartData = filterDataByPeriod(selectedPeriod);

  // Calculer les métriques basées sur les données réelles de l'utilisateur
  const calculateAverageAPY = () => {
    if (!metrics) return "0";
    return metrics.currentApy.toFixed(1);
  };

  const calculateTotalReturn = () => {
    if (!metrics || !metrics.historicalBalances || metrics.historicalBalances.length === 0) {
      return { value: "0", positive: true };
    }
    
    const firstBalance = Number(metrics.historicalBalances[0].value) / 1e18;
    const lastBalance = Number(metrics.historicalBalances[metrics.historicalBalances.length - 1].value) / 1e18;
    
    if (firstBalance === 0) return { value: "0", positive: true };
    
    const returnPercentage = ((lastBalance - firstBalance) / firstBalance) * 100;
    return {
      value: returnPercentage.toFixed(1),
      positive: returnPercentage >= 0
    };
  };

  const calculateDaysActive = () => {
    if (!metrics || !metrics.historicalBalances || metrics.historicalBalances.length === 0) {
      return "0";
    }
    
    const firstTimestamp = metrics.historicalBalances[0].timestamp;
    const lastTimestamp = metrics.historicalBalances[metrics.historicalBalances.length - 1].timestamp;
    const daysDiff = Math.floor((lastTimestamp - firstTimestamp) / (24 * 60 * 60 * 1000));
    
    return daysDiff.toString();
  };

  const totalReturn = calculateTotalReturn();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formattedMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-gray-400">{metric.label}</div>
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-2xl mb-1">{metric.value}</div>
              <div
                className={`text-xs ${
                  metric.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {metric.change}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl">Portfolio Growth</h3>
          <div className="flex gap-2">
            {(['1W', '1M', '3M', '1Y'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Average APY</div>
            <div className="text-lg">{calculateAverageAPY()}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Total Return</div>
            <div className={`text-lg ${totalReturn.positive ? 'text-green-400' : 'text-red-400'}`}>
              {totalReturn.positive ? '+' : ''}{totalReturn.value}%
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Days Active</div>
            <div className="text-lg">{calculateDaysActive()}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
