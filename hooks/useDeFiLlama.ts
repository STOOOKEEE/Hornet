/**
 * Hook React pour utiliser l'API DeFiLlama
 */

import { useState, useEffect, useCallback } from 'react';
import { DeFiLlamaAPI, Pool, PoolFilter } from '@/services/defillama';

interface UseDeFiLlamaState {
  pools: Pool[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook pour récupérer tous les pools
 */
export function useAllPools() {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getAllPools();
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

/**
 * Hook pour récupérer des pools filtrés
 */
export function useFilteredPools(filter: PoolFilter) {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getFilteredPools(filter);
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filter)]);

  return state;
}

/**
 * Hook pour récupérer un pool spécifique
 */
export function usePool(poolId: string | null) {
  const [state, setState] = useState<{
    pool: Pool | null;
    loading: boolean;
    error: Error | null;
  }>({
    pool: null,
    loading: !!poolId,
    error: null,
  });

  useEffect(() => {
    if (!poolId) {
      setState({ pool: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchPool = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pool = await DeFiLlamaAPI.getPoolById(poolId);
        
        if (mounted) {
          setState({ pool, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pool: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPool();

    return () => {
      mounted = false;
    };
  }, [poolId]);

  return state;
}

/**
 * Hook pour récupérer les meilleurs pools par APY
 */
export function useTopPools(limit: number = 10, minTvl: number = 1000000) {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getTopPoolsByApy(limit, minTvl);
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, [limit, minTvl]);

  return state;
}

/**
 * Hook pour récupérer les pools stablecoins
 */
export function useStablecoinPools(minTvl: number = 100000) {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getStablecoinPools(minTvl);
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, [minTvl]);

  return state;
}

/**
 * Hook pour récupérer les pools par chaîne
 */
export function usePoolsByChain(chain: string) {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getPoolsByChain(chain);
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, [chain]);

  return state;
}

/**
 * Hook pour récupérer les pools par projet
 */
export function usePoolsByProject(project: string) {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchPools = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const pools = await DeFiLlamaAPI.getPoolsByProject(project);
        
        if (mounted) {
          setState({ pools, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            pools: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchPools();

    return () => {
      mounted = false;
    };
  }, [project]);

  return state;
}

/**
 * Hook avec méthodes de recherche personnalisées
 */
export function useDeFiLlama() {
  const [state, setState] = useState<UseDeFiLlamaState>({
    pools: [],
    loading: false,
    error: null,
  });

  const fetchAllPools = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getAllPools();
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  const fetchFilteredPools = useCallback(async (filter: PoolFilter) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getFilteredPools(filter);
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  const fetchPoolById = useCallback(async (poolId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pool = await DeFiLlamaAPI.getPoolById(poolId);
      setState(prev => ({ ...prev, loading: false, error: null }));
      return pool;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState(prev => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, []);

  const fetchTopPools = useCallback(async (limit: number = 10, minTvl: number = 1000000) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getTopPoolsByApy(limit, minTvl);
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  const fetchStablecoinPools = useCallback(async (minTvl: number = 100000) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getStablecoinPools(minTvl);
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  const fetchPoolsByChain = useCallback(async (chain: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getPoolsByChain(chain);
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  const fetchPoolsByProject = useCallback(async (project: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pools = await DeFiLlamaAPI.getPoolsByProject(project);
      setState({ pools, loading: false, error: null });
      return pools;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ pools: [], loading: false, error: err });
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchAllPools,
    fetchFilteredPools,
    fetchPoolById,
    fetchTopPools,
    fetchStablecoinPools,
    fetchPoolsByChain,
    fetchPoolsByProject,
  };
}
