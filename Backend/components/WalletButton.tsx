"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Wallet } from "lucide-react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={() => open()}
      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      <span className="text-sm font-medium">
        {isConnected && address ? formatAddress(address) : 'Connect Wallet'}
      </span>
      {isConnected && (
        <div className="w-2 h-2 rounded-full bg-green-500" />
      )}
    </button>
  );
}
