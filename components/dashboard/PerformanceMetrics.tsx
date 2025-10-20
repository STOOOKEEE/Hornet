import { motion } from "framer-motion";
import { TrendingUp, Activity, DollarSign, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useUserMetrics } from '../../hooks/useProtocolData';

export function PerformanceMetrics() {
  const { metrics, isLoading } = useUserMetrics();
  
  const formattedMetrics = [
    {
      label: "Total Value Locked",
      value: metrics ? `$${(Number(metrics.totalValueLocked) / 1e18).toFixed(2)}` : "...",
      change: "+12.5%", // TODO: Calculer le vrai changement
      positive: true,
      icon: DollarSign,
    },
    {
      label: "Current APY",
      value: metrics ? `${metrics.currentApy}%` : "...",
      change: "+0.8%", // TODO: Calculer le vrai changement
      positive: true,
      icon: Percent,
    },
    {
      label: "Total Earned",
      value: metrics ? `$${(Number(metrics.totalEarned) / 1e18).toFixed(2)}` : "...",
      change: "+$5.12", // TODO: Calculer le vrai changement
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Active Strategy",
      value: metrics?.activeStrategy || "...",
      change: "Optimized",
      positive: true,
      icon: Activity,
    },
  ];

  const chartData = [
    { date: "Jan 1", value: 1000 },
    { date: "Jan 5", value: 1015 },
    { date: "Jan 10", value: 1032 },
    { date: "Jan 15", value: 1048 },
    { date: "Jan 20", value: 1070 },
    { date: "Jan 25", value: 1095 },
    { date: "Jan 30", value: 1125 },
    { date: "Feb 4", value: 1158 },
    { date: "Feb 9", value: 1189 },
    { date: "Feb 14", value: 1235 },
  ];

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
            <button className="px-3 py-1 rounded-lg bg-white/10 text-xs hover:bg-white/20 transition-colors">
              1W
            </button>
            <button className="px-3 py-1 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-colors">
              1M
            </button>
            <button className="px-3 py-1 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-colors">
              3M
            </button>
            <button className="px-3 py-1 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-colors">
              1Y
            </button>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
            <div className="text-lg">7.5%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Total Return</div>
            <div className="text-lg text-green-400">+23.5%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Days Active</div>
            <div className="text-lg">45</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
