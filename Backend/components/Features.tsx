import { motion } from "framer-motion";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCw, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Wallet Connection",
    description: "Connect Coinbase Wallet or MetaMask. No KYC, purely on-chain.",
  },
  {
    icon: ArrowDownToLine,
    title: "USDC Deposits",
    description: "Earn 5-10% APY with minimal gas fees on Base.",
  },
  {
    icon: ArrowUpFromLine,
    title: "Instant Withdrawals",
    description: "Access your funds anytime. No lock-up periods.",
  },
  {
    icon: RefreshCw,
    title: "Auto Rebalancing",
    description: "Switch protocols automatically for best yields.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track earnings with detailed charts and insights.",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Open source contract audited by the community.",
  },
];

export function Features() {
  return (
    <div id="features" className="py-32 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-5xl text-white mb-4">
            Features
          </h2>
          <p className="text-xl text-gray-500">
            Everything you need to optimize yields
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-12 bg-black hover:bg-white/[0.02] transition-colors"
            >
              <feature.icon className="w-6 h-6 text-gray-400 mb-6" />
              <h3 className="text-xl text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
