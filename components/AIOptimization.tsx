import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AIOptimization() {
  return (
    <div className="py-32 px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl text-white mb-6">
              AI-Powered
              <br />
              <span className="text-gray-500">Optimization</span>
            </h2>

            <p className="text-xl text-gray-400 mb-12">
              Advanced algorithms analyze real-time APY data across Base protocols to maximize your returns automatically.
            </p>

            <div className="space-y-8">
              <div>
                <h4 className="text-white mb-2">Smart Rebalancing</h4>
                <p className="text-gray-500">Increase yields by 1-5% on average</p>
              </div>

              <div>
                <h4 className="text-white mb-2">Continuous Monitoring</h4>
                <p className="text-gray-500">24/7 analysis of Moonwell, Aerodrome & more</p>
              </div>

              <div>
                <h4 className="text-white mb-2">Predictive ML</h4>
                <p className="text-gray-500">Advanced models for proactive optimization</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
              <div className="p-8 rounded-xl bg-black">
                <div className="space-y-6">
                  <div className="p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">Current</span>
                      <span className="text-white">Moonwell</span>
                    </div>
                    <div className="text-3xl text-white">6.2% APY</div>
                  </div>

                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex justify-center"
                  >
                    <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                  </motion.div>

                  <motion.div 
                    animate={{ 
                      borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-6 rounded-xl border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">AI Suggests</span>
                      <span className="text-white">Aerodrome</span>
                    </div>
                    <div className="text-3xl text-white mb-2">8.5% APY</div>
                    <div className="text-sm text-green-400">+2.3% increase</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
