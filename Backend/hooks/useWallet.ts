import { useAccount, useBalance, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: bigint | undefined, decimals: number = 18) => {
    if (!bal) return '0.00';
    return (Number(bal) / Math.pow(10, decimals)).toFixed(2);
  };

  return {
    address,
    isConnected,
    chain,
    balance,
    isBalanceLoading,
    disconnect,
    formatAddress,
    formatBalance,
    shortAddress: formatAddress(address),
    formattedBalance: formatBalance(balance?.value, balance?.decimals),
  };
}
