import { useAccount, useReadContracts, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';

// Adresses sur Base Mainnet
const AAVE_V3_POOL = '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as `0x${string}`;
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const AAVE_USDC_TOKEN = '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB' as `0x${string}`; // aBasUSDC

// Uniswap V3 sur Base
const UNISWAP_V3_NFT_MANAGER = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1' as `0x${string}`;
const UNISWAP_V3_FACTORY = '0x33128a8fC17869897dcE68Ed026d694621f6FDfD' as `0x${string}`;

// ABIs minimales nécessaires
const AAVE_POOL_ABI = [
  {
    name: 'getUserAccountData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
  },
  {
    name: 'getReserveData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'configuration', type: 'uint256' },
          { name: 'liquidityIndex', type: 'uint128' },
          { name: 'currentLiquidityRate', type: 'uint128' },
          { name: 'variableBorrowIndex', type: 'uint128' },
          { name: 'currentVariableBorrowRate', type: 'uint128' },
          { name: 'currentStableBorrowRate', type: 'uint128' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'id', type: 'uint16' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' },
        ],
      },
    ],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const UNISWAP_V3_NFT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
] as const;

export interface UserMetrics {
  totalValueLocked: bigint;
  totalEarned: bigint;
  currentApy: string;
  activeStrategy: string;
  historicalBalances: Array<{
    timestamp: number;
    value: string;
    tvl: string;
    portfolio: string;
  }>;
}

interface APYData {
  usdc: number;
  usdt: number;
  dai: number;
  allPools: Array<{
    pool: string;
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase: number;
    apyReward: number;
  }>;
}

interface ETHPriceHistory {
  [timestamp: number]: number;
}

/**
 * Hook qui lit les données EN TEMPS RÉEL depuis Aave V3 sur Base
 * Aucun backend, aucune base de données, aucun smart contract custom nécessaire !
 */
export function useRealTimeData() {
  const { address, isConnected } = useAccount();
  const [apyData, setApyData] = useState<APYData | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{ timestamp: number; value: string; tvl: string; portfolio: string }>>([]);
  const [ethPriceHistory, setEthPriceHistory] = useState<ETHPriceHistory>({});

  // Lire le solde USDC du wallet
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_BASE,
  });

  // Lire le solde ETH du wallet pour afficher quelque chose
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Lire les données Aave V3
  const { data: contractData, isLoading } = useReadContracts({
    contracts: [
      // Balance dans Aave (aTokens)
      {
        address: AAVE_USDC_TOKEN,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
      // Données du compte utilisateur
      {
        address: AAVE_V3_POOL,
        abi: AAVE_POOL_ABI,
        functionName: 'getUserAccountData',
        args: address ? [address] : undefined,
      },
      // APY actuel d'Aave pour USDC
      {
        address: AAVE_V3_POOL,
        abi: AAVE_POOL_ABI,
        functionName: 'getReserveData',
        args: [USDC_BASE],
      },
    ],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Récupérer les prix historiques de l'ETH
  useEffect(() => {
    const fetchETHPriceHistory = async () => {
      try {
        // CoinGecko API pour les prix historiques sur 1 an
        // Format: vs_currency=usd, days=365, interval=daily
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily'
        );
        const data = await response.json();
        
        // Convertir en objet timestamp -> price
        const priceMap: ETHPriceHistory = {};
        data.prices.forEach(([timestamp, price]: [number, number]) => {
          priceMap[timestamp] = price;
        });
        
        console.log('ETH price history loaded:', Object.keys(priceMap).length, 'days');
        setEthPriceHistory(priceMap);
      } catch (error) {
        console.error('Error fetching ETH price history:', error);
        // En cas d'erreur, utiliser un prix fixe (fallback)
        const fallbackPrice = 2500;
        const now = Date.now();
        const priceMap: ETHPriceHistory = {};
        for (let i = 365; i >= 0; i--) {
          const timestamp = now - (i * 24 * 60 * 60 * 1000);
          priceMap[timestamp] = fallbackPrice;
        }
        setEthPriceHistory(priceMap);
      }
    };

    fetchETHPriceHistory();
    // Rafraîchir une fois par heure
    const interval = setInterval(fetchETHPriceHistory, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Récupérer les APY depuis DeFiLlama (API publique gratuite)
  useEffect(() => {
    const fetchAPYs = async () => {
      try {
        // API DeFiLlama pour TOUTES les pools sur Base
        const response = await fetch('https://yields.llama.fi/pools');
        const data = await response.json();
        
        // Filtrer toutes les pools sur Base
        const basePools = data.data.filter((pool: any) => 
          pool.chain === 'Base' && pool.tvlUsd > 100000 // Minimum 100k TVL
        );

        // Pools Aave V3 sur Base
        const aaveBasePools = basePools.filter((pool: any) => 
          pool.project === 'aave-v3'
        );

        const usdcPool = aaveBasePools.find((p: any) => 
          p.symbol.toUpperCase().includes('USDC')
        );
        
        console.log('DeFiLlama - Base pools loaded:', basePools.length);
        console.log('DeFiLlama - Aave USDC APY:', usdcPool?.apy);
        
        // Afficher les pools les plus intéressantes
        const topPools = basePools
          .sort((a: any, b: any) => b.apy - a.apy)
          .slice(0, 10);
        
        console.log('📊 Top 10 Protocols on Base by APY:');
        console.table(topPools.map((pool: any) => ({
          Protocol: pool.project,
          Pool: pool.symbol,
          APY: `${pool.apy?.toFixed(2) || 0}%`,
          TVL: `$${(pool.tvlUsd / 1000000).toFixed(2)}M`,
        })));
        
        setApyData({
          usdc: usdcPool?.apy || 5.2,
          usdt: 5.0,
          dai: 4.8,
          allPools: basePools.map((pool: any) => ({
            pool: pool.pool,
            chain: pool.chain,
            project: pool.project,
            symbol: pool.symbol,
            tvlUsd: pool.tvlUsd,
            apy: pool.apy || 0,
            apyBase: pool.apyBase || 0,
            apyReward: pool.apyReward || 0,
          })),
        });
      } catch (error) {
        console.error('Error fetching APYs:', error);
        // Valeurs par défaut si l'API échoue
        setApyData({
          usdc: 5.2,
          usdt: 5.0,
          dai: 4.8,
          allPools: [],
        });
      }
    };

    fetchAPYs();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchAPYs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Générer des données historiques basées sur le solde actuel
  useEffect(() => {
    // Attendre que les prix ETH soient chargés
    if (Object.keys(ethPriceHistory).length === 0) {
      return;
    }

    const aaveBalance = contractData?.[0]?.result as bigint || BigInt(0);
    const walletUSDC = usdcBalance?.value || BigInt(0);
    const walletETH = ethBalance?.value || BigInt(0);
    
    // TVL = Seulement protocoles (Aave)
    const tvlBalance = aaveBalance;
    
    if (tvlBalance === BigInt(0) && walletUSDC === BigInt(0) && walletETH === BigInt(0)) {
      // Générer des données à 0 pour le graphique
      const data = [];
      const now = Date.now();
      
      for (let i = 365; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp,
          value: "0",
          tvl: "0",
          portfolio: "0"
        });
      }
      setHistoricalData(data);
      return;
    }

    const data = [];
    const now = Date.now();
    
    // Utiliser l'APY réel si disponible
    const actualAPY = apyData?.usdc || 5.2;
    const dailyRate = actualAPY / 365 / 100; // Taux journalier
    
    console.log('Generating historical data - TVL:', tvlBalance.toString(), 'Wallet ETH:', walletETH.toString(), 'APY:', actualAPY);
    
    // Obtenir le prix actuel de l'ETH (le plus récent dans l'historique)
    const ethPriceTimestamps = Object.keys(ethPriceHistory).map(Number).sort((a, b) => b - a);
    const currentEthPrice = ethPriceHistory[ethPriceTimestamps[0]] || 2500;
    
    console.log('Current ETH price:', currentEthPrice);
    
    // Générer 365 jours d'historique
    for (let i = 365; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const daysAgo = 365 - i;
      
      // Trouver le prix de l'ETH le plus proche pour ce timestamp
      let closestTimestamp = ethPriceTimestamps[0];
      let minDiff = Math.abs(timestamp - closestTimestamp);
      
      for (const ts of ethPriceTimestamps) {
        const diff = Math.abs(timestamp - ts);
        if (diff < minDiff) {
          minDiff = diff;
          closestTimestamp = ts;
        }
      }
      
      const historicalEthPrice = ethPriceHistory[closestTimestamp] || currentEthPrice;
      
      // Calculer la valeur historique de l'ETH en USDC
      // ETH a 18 décimales, USDC a 6 décimales
      // Conversion: (ETH_wei * price) / 1e18 = valeur en USD
      // Ensuite * 1e6 pour avoir en USDC (6 décimales)
      const ethInUSDC = walletETH > BigInt(0)
        ? (walletETH * BigInt(Math.floor(historicalEthPrice * 1e6))) / BigInt(1e18)
        : BigInt(0);
      
      // Calculer la croissance pour TVL (avec APY)
      const growthFactor = Math.pow(1 + dailyRate, daysAgo);
      const historicalTVL = Number(tvlBalance) / growthFactor;
      
      // Portfolio = TVL + wallet USDC + wallet ETH (avec prix historique)
      // Tous en format USDC (6 décimales)
      const historicalPortfolio = historicalTVL + Number(walletUSDC) + Number(ethInUSDC);
      
      data.push({
        timestamp,
        value: BigInt(Math.floor(historicalPortfolio)).toString(), // Compat avec ancien code
        tvl: BigInt(Math.floor(historicalTVL)).toString(),
        portfolio: BigInt(Math.floor(historicalPortfolio)).toString()
      });
    }
    
    console.log('Generated', data.length, 'historical data points with real ETH prices');
    setHistoricalData(data);
  }, [contractData, apyData, usdcBalance, ethBalance, ethPriceHistory]);

  // Parser les données
  const aaveBalance = contractData?.[0]?.result as bigint || BigInt(0);
  const userAccountData = contractData?.[1]?.result;
  const reserveData = contractData?.[2]?.result;

  // TVL = SEULEMENT les fonds déposés dans les protocoles (pas le wallet)
  const totalValueLocked = aaveBalance; // Seulement Aave, pas le wallet

  // Balance du wallet pour affichage séparé
  const walletUSDCBalance = usdcBalance?.value || BigInt(0);
  const walletETHBalance = ethBalance?.value || BigInt(0);

  console.log('Balances:', {
    tvl: totalValueLocked.toString(), // Seulement protocoles
    aave: aaveBalance.toString(),
    walletUSDC: walletUSDCBalance.toString(),
    walletETH: walletETHBalance.toString(),
  });

  // Calculer les intérêts gagnés (approximation)
  // En supposant qu'ils ont déposé il y a X temps avec Y APY
  const estimatedInitialDeposit = aaveBalance; // Simplification
  const totalEarned = aaveBalance > estimatedInitialDeposit 
    ? aaveBalance - estimatedInitialDeposit 
    : BigInt(0);

  // Extraire l'APY depuis les données Aave (en ray: 1e27)
  let currentApy = '0';
  
  // Si l'utilisateur a des fonds dans un protocole, afficher l'APY
  if (aaveBalance > BigInt(0)) {
    if (apyData && apyData.usdc) {
      // Utiliser l'APY de DeFiLlama (le plus fiable)
      currentApy = apyData.usdc.toFixed(2);
    } else if (reserveData && Array.isArray(reserveData) && reserveData[2]) {
      // Fallback: calculer depuis le contrat Aave
      const liquidityRate = reserveData[2] as bigint;
      // Convertir de ray (1e27) vers pourcentage annuel
      const apyValue = (Number(liquidityRate) / 1e25).toFixed(2);
      currentApy = apyValue;
    } else {
      // Fallback final pour Aave
      currentApy = '5.20';
    }
  }
  // Sinon currentApy reste à '0' si aucun protocole détecté

  console.log('Current APY:', currentApy, 'Has funds in protocol:', aaveBalance > BigInt(0));

  // Déterminer la stratégie active
  let activeStrategy = 'None';
  if (aaveBalance > BigInt(0)) {
    activeStrategy = 'Aave V3';
  } else if (walletUSDCBalance > BigInt(0) || walletETHBalance > BigInt(0)) {
    activeStrategy = 'Wallet (Ready to deploy)';
  }

  const metrics: UserMetrics = {
    totalValueLocked,
    totalEarned,
    currentApy,
    activeStrategy,
    historicalBalances: historicalData,
  };

  return {
    metrics,
    isLoading,
    isConnected,
    address,
    // Données supplémentaires utiles
    aaveBalance,
    walletUSDCBalance,
    walletETHBalance,
    apyData,
  };
}
