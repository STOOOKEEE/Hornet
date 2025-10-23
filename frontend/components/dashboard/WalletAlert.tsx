"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";

export function WalletAlert() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-yellow-500 font-medium mb-1">
            Wallet Not Connected
          </h4>
          <p className="text-yellow-500/80 text-sm">
            Veuillez connecter votre wallet pour utiliser l'application et accéder à toutes les fonctionnalités.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
