import { motion } from "framer-motion";
import { ArrowLeft, Bell, Info } from "lucide-react";
import { WalletConnect } from "./dashboard/WalletConnect";
import { WalletAlert } from "./dashboard/WalletAlert";
import { WalletButton } from "./WalletButton";
import { DepositWithdraw } from "./dashboard/DepositWithdraw";
import { AIOptimizer } from "./dashboard/AIOptimizer";
import { PerformanceMetrics } from "./dashboard/PerformanceMetrics";
import { RebalanceCard } from "./dashboard/RebalanceCard";

interface DashboardPageProps {
  onBackToHome: () => void;
}

export function DashboardPage({ onBackToHome }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">H</span>
              </div>
              <span className="text-xl">Hornet</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <WalletButton />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Manage your USDC yields with AI-powered optimization
            </p>
          </motion.div>

          {/* Wallet Alert */}
          <WalletAlert />

          {/* Wallet Connection */}
          <div className="mb-6">
            <WalletConnect />
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <strong className="text-white">Getting Started:</strong> Connect your wallet,
                deposit USDC, and let our AI find the best yield opportunities across Base
                protocols. Zero lock-up periods, withdraw anytime.
              </div>
            </div>
          </motion.div>

          {/* Performance Overview */}
          <div className="mb-8">
            <PerformanceMetrics />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DepositWithdraw />
            <AIOptimizer />
          </div>

          {/* Rebalance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RebalanceCard />
            </div>

            {/* Network Info Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Network Info */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg mb-4">Network</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Blockchain</span>
                    <span className="text-white">Base</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Gas Price</span>
                    <span className="text-green-400">~$0.02</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Block Time</span>
                    <span className="text-white">~2 sec</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
