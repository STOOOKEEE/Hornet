/**
 * Service API pour Grok (xAI)
 * Documentation: https://docs.x.ai/api
 */

import { Pool } from '../defillama/types';
import {
  GrokConfig,
  GrokRequest,
  GrokResponse,
  PoolAnalysisRequest,
  PoolAnalysisResponse,
  PoolRecommendation,
} from './types';

const DEFAULT_MODEL = 'grok-beta';
const DEFAULT_BASE_URL = 'https://api.x.ai/v1';

export class GrokAPI {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: GrokConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * Envoie une requête à l'API Grok
   */
  private async sendRequest(request: GrokRequest): Promise<GrokResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Erreur API Grok: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la requête Grok:', error);
      throw error;
    }
  }

  /**
   * Analyse les pools et recommande les meilleurs
   */
  async analyzePools(request: PoolAnalysisRequest): Promise<PoolAnalysisResponse> {
    const { pools, criteria, customPrompt } = request;

    // Préparer les données des pools pour Grok
    const poolsData = pools.map(pool => ({
      id: pool.pool,
      project: pool.project,
      symbol: pool.symbol,
      chain: pool.chain,
      apy: pool.apy,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      tvlUsd: pool.tvlUsd,
      stablecoin: pool.stablecoin,
      ilRisk: pool.ilRisk,
      exposure: pool.exposure,
      rewardTokens: pool.rewardTokens,
    }));

    // Construire le prompt
    const systemPrompt = `Tu es un expert en finance décentralisée (DeFi) spécialisé dans l'analyse des pools de liquidité et l'optimisation des rendements. 
Tu dois analyser les pools fournis et recommander les meilleurs en fonction des critères donnés.

Réponds TOUJOURS au format JSON suivant (sans markdown, juste le JSON brut):
{
  "recommendations": [
    {
      "poolId": "id du pool",
      "score": 0-100,
      "reasoning": "explication détaillée",
      "pros": ["avantage 1", "avantage 2"],
      "cons": ["inconvénient 1", "inconvénient 2"],
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": "résumé général de l'analyse",
  "marketInsights": "insights sur le marché actuel",
  "warnings": ["avertissement 1", "avertissement 2"]
}`;

    let userPrompt = customPrompt || 'Analyse ces pools de liquidité et recommande les 5 meilleurs pour maximiser le yield.';
    
    // Ajouter les critères au prompt
    if (criteria) {
      userPrompt += '\n\nCritères à considérer:';
      if (criteria.riskTolerance) {
        userPrompt += `\n- Tolérance au risque: ${criteria.riskTolerance}`;
      }
      if (criteria.preferStablecoins) {
        userPrompt += '\n- Préférence pour les stablecoins';
      }
      if (criteria.minTvl) {
        userPrompt += `\n- TVL minimum: $${criteria.minTvl.toLocaleString()}`;
      }
      if (criteria.preferredChains && criteria.preferredChains.length > 0) {
        userPrompt += `\n- Chaînes préférées: ${criteria.preferredChains.join(', ')}`;
      }
      if (criteria.investmentAmount) {
        userPrompt += `\n- Montant d'investissement: $${criteria.investmentAmount.toLocaleString()}`;
      }
    }

    userPrompt += `\n\nVoici les données des pools (${pools.length} pools):\n${JSON.stringify(poolsData, null, 2)}`;

    const grokRequest: GrokRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    };

    const response = await this.sendRequest(grokRequest);
    const content = response.choices[0]?.message?.content || '';

    // Parser la réponse JSON
    try {
      // Nettoyer le contenu pour extraire le JSON
      let jsonContent = content.trim();
      
      // Retirer les balises markdown si présentes
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonContent);

      // Enrichir les recommandations avec les objets Pool complets
      const recommendations: PoolRecommendation[] = parsed.recommendations.map((rec: any) => {
        const pool = pools.find(p => p.pool === rec.poolId);
        if (!pool) {
          throw new Error(`Pool ${rec.poolId} non trouvé`);
        }
        return {
          pool,
          score: rec.score,
          reasoning: rec.reasoning,
          pros: rec.pros,
          cons: rec.cons,
          riskLevel: rec.riskLevel,
        };
      });

      return {
        recommendations,
        summary: parsed.summary,
        marketInsights: parsed.marketInsights,
        warnings: parsed.warnings || [],
        rawResponse: content,
      };
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse Grok:', error);
      console.error('Contenu reçu:', content);
      throw new Error(`Impossible de parser la réponse de Grok: ${error}`);
    }
  }

  /**
   * Compare deux pools spécifiques
   */
  async comparePools(pool1: Pool, pool2: Pool): Promise<string> {
    const systemPrompt = `Tu es un expert en DeFi. Compare ces deux pools de liquidité et explique lequel est le meilleur et pourquoi.`;
    
    const userPrompt = `Compare ces deux pools:

Pool 1:
- Projet: ${pool1.project}
- Symbole: ${pool1.symbol}
- Chain: ${pool1.chain}
- APY: ${pool1.apy}%
- TVL: $${pool1.tvlUsd.toLocaleString()}
- Stablecoin: ${pool1.stablecoin ? 'Oui' : 'Non'}

Pool 2:
- Projet: ${pool2.project}
- Symbole: ${pool2.symbol}
- Chain: ${pool2.chain}
- APY: ${pool2.apy}%
- TVL: $${pool2.tvlUsd.toLocaleString()}
- Stablecoin: ${pool2.stablecoin ? 'Oui' : 'Non'}

Donne une analyse détaillée et une recommandation.`;

    const grokRequest: GrokRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    };

    const response = await this.sendRequest(grokRequest);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Obtient des insights sur le marché DeFi
   */
  async getMarketInsights(pools: Pool[]): Promise<string> {
    const systemPrompt = `Tu es un analyste DeFi expert. Analyse les tendances du marché basées sur les pools fournis.`;
    
    // Calculer des statistiques
    const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length;
    const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
    const stablecoinCount = pools.filter(p => p.stablecoin).length;
    
    const chainDistribution = pools.reduce((acc, p) => {
      acc[p.chain] = (acc[p.chain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userPrompt = `Analyse ces statistiques du marché DeFi:

- Nombre total de pools: ${pools.length}
- APY moyen: ${avgApy.toFixed(2)}%
- TVL total: $${(totalTvl / 1e9).toFixed(2)}B
- Pools stablecoins: ${stablecoinCount} (${((stablecoinCount / pools.length) * 100).toFixed(1)}%)
- Distribution par chaîne: ${JSON.stringify(chainDistribution, null, 2)}

Donne des insights sur:
1. Les tendances actuelles du marché
2. Les opportunités à saisir
3. Les risques à surveiller
4. Les recommandations stratégiques`;

    const grokRequest: GrokRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    };

    const response = await this.sendRequest(grokRequest);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Évalue le risque d'un pool spécifique
   */
  async evaluatePoolRisk(pool: Pool): Promise<string> {
    const systemPrompt = `Tu es un expert en gestion des risques DeFi. Évalue les risques associés à ce pool de liquidité.`;
    
    const userPrompt = `Évalue les risques de ce pool:

- Projet: ${pool.project}
- Symbole: ${pool.symbol}
- Chain: ${pool.chain}
- APY: ${pool.apy}% (Base: ${pool.apyBase || 0}%, Rewards: ${pool.apyReward || 0}%)
- TVL: $${pool.tvlUsd.toLocaleString()}
- Stablecoin: ${pool.stablecoin ? 'Oui' : 'Non'}
- Risque IL: ${pool.ilRisk || 'Non spécifié'}
- Exposition: ${pool.exposure || 'Non spécifiée'}

Analyse:
1. Risque d'impermanent loss
2. Risque de smart contract
3. Risque de liquidité
4. Risque de dépeg (si stablecoin)
5. Risque de protocole
6. Note globale de risque (1-10)`;

    const grokRequest: GrokRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    };

    const response = await this.sendRequest(grokRequest);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Génère une stratégie d'investissement personnalisée
   */
  async generateInvestmentStrategy(
    pools: Pool[],
    budget: number,
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  ): Promise<string> {
    const systemPrompt = `Tu es un conseiller financier DeFi. Crée une stratégie d'investissement diversifiée.`;
    
    const userPrompt = `Crée une stratégie d'investissement avec:

Budget: $${budget.toLocaleString()}
Profil de risque: ${riskProfile}

Pools disponibles: ${pools.length}

Recommande:
1. Allocation du budget entre les pools
2. Pourcentage par pool
3. Justification de chaque choix
4. Rendement estimé
5. Niveau de risque global
6. Conseils de rééquilibrage

Pools: ${JSON.stringify(pools.slice(0, 20).map(p => ({
  project: p.project,
  symbol: p.symbol,
  chain: p.chain,
  apy: p.apy,
  tvl: p.tvlUsd,
  stablecoin: p.stablecoin,
})), null, 2)}`;

    const grokRequest: GrokRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    };

    const response = await this.sendRequest(grokRequest);
    return response.choices[0]?.message?.content || '';
  }
}
