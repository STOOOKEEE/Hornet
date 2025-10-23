import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRealTimeData } from '../../hooks/useRealTimeData';

export function DepositWithdraw() {
  const [amount, setAmount] = useState("");
  const { metrics } = useRealTimeData();
  
  // Use real user data
  const depositedAmount = Number(metrics.totalValueLocked) / 1e6; // USDC a 6 décimales
  const earnedInterest = Number(metrics.totalEarned) / 1e6;

  const handleDeposit = () => {
    if (amount) {
      // TODO: Implement deposit transaction with useWriteContract
      console.log('Depositing:', amount);
      setAmount("");
    }
  };

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) <= depositedAmount) {
      // TODO: Implement withdraw transaction with useWriteContract
      console.log('Withdrawing:', amount);
      setAmount("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-xl mb-6">Manage Funds</h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Deposited</div>
          <div className="text-2xl">${depositedAmount.toFixed(2)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Earned Interest</div>
          <div className="text-2xl text-green-400">+${earnedInterest.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs for Deposit/Withdraw */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Amount (USDC)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAmount("100")}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              $100
            </button>
            <button
              onClick={() => setAmount("500")}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              $500
            </button>
            <button
              onClick={() => setAmount("1000")}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              $1,000
            </button>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={!amount}
            className="w-full bg-white text-black hover:bg-gray-100"
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Deposit USDC
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Earn 5-10% APY on your stablecoins with zero lock-up period
          </p>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Amount (USDC)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <button
            onClick={() => setAmount((depositedAmount + earnedInterest).toString())}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Withdraw Max: ${(depositedAmount + earnedInterest).toFixed(2)}
          </button>

          <Button
            onClick={handleWithdraw}
            disabled={!amount || parseFloat(amount) > depositedAmount}
            className="w-full bg-white text-black hover:bg-gray-100"
          >
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Withdraw USDC
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Instant liquidity • Includes earned interest
          </p>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
