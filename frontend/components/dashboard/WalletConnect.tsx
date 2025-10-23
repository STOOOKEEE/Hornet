"use client";

import { motion } from "framer-motion";
import { Wallet, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { base } from 'wagmi/chains';

export function WalletConnect() {
  const [copied, setCopied] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address: address,
  });

  // Check and switch to Base network if necessary
  useEffect(() => {
    if (isConnected && chain && chain.id !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [isConnected, chain, switchChain]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: bigint | undefined) => {
    if (!bal) return "0.00";
    return (Number(bal) / 1e18).toFixed(4);
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWrongNetwork = isConnected && chain && chain.id !== base.id;

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Connect your wallet to start earning yield on your USDC
          </p>
          <button
            onClick={() => open()}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-3 font-medium"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </button>
          <div className="mt-6 text-xs text-gray-500">
            Supports all wallets via WalletConnect
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="space-y-4">
        {/* Wrong Network Warning */}
        {isWrongNetwork && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-500 text-sm font-medium">Wrong Network</p>
              <p className="text-yellow-500/80 text-xs mt-1">
                Please switch to Base network
              </p>
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="mt-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg text-xs font-medium transition-colors"
              >
                Switch to Base
              </button>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Wallet Connected</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {address && formatAddress(address)}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Info */}
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="text-sm text-white font-medium">
              {formatBalance(balance?.value)} {balance?.symbol || 'ETH'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Network</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-sm text-white font-medium">
                {chain?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => open()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Change Wallet
          </button>
          <button
            onClick={() => disconnect()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    </motion.div>
  );
}
