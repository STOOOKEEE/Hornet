import { motion } from "framer-motion";
import { RefreshCw, Zap, Clock, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { Badge } from "../ui/badge";

export function RebalanceCard() {
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  const handleRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setIsRebalancing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl">Rebalancing</h3>
            <p className="text-xs text-gray-400">Optimize your yield strategy</p>
          </div>
        </div>
      </div>

      {/* Auto-rebalance Toggle */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-sm mb-1 flex items-center gap-2">
                Auto-Rebalancing
              </div>
              <div className="text-xs text-gray-400">
                Automatically switch to optimal protocols
              </div>
            </div>
          </div>
          <Switch
            checked={autoRebalance}
            onCheckedChange={setAutoRebalance}
            disabled={!autoRebalance}
          />
        </div>
      </div>

      {/* Rebalance Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-400">Last Rebalance</div>
          </div>
          <div className="text-sm">3 days ago</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-400">Total Rebalances</div>
          </div>
          <div className="text-sm">12 times</div>
        </div>
      </div>

      {/* Next Recommended Action */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <RefreshCw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm mb-1">Recommended Action</div>
            <p className="text-xs text-gray-400 mb-3">
              Move funds to Aerodrome Finance to capture +2.3% higher APY. Estimated gas:
              ~$0.02
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Moonwell → Aerodrome
              </Badge>
              <Badge variant="secondary" className="text-xs text-green-400">
                +2.3% APY
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Rebalance Button */}
      <Button
        onClick={handleRebalance}
        disabled={isRebalancing}
        className="w-full bg-white text-black hover:bg-gray-100"
      >
        {isRebalancing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Rebalancing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rebalance Now
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Performance fee: 0.5% on profits • Gas optimized on Base L2
      </p>
    </motion.div>
  );
}
