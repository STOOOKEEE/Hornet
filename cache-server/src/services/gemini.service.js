import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { retryWithBackoff } from '../utils/retry.js';

class GeminiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.model = config.gemini.model;
    this.baseUrl = config.gemini.baseUrl;
  }

  /**
   * Send request to Gemini API
   */
  async sendRequest(prompt, systemInstruction) {
    return retryWithBackoff(
      async () => {
        const contents = [];

        if (systemInstruction) {
          contents.push({
            role: 'user',
            parts: [{ text: systemInstruction }],
          });
          contents.push({
            role: 'model',
            parts: [{ text: 'Compris, je vais suivre ces instructions.' }],
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

        logger.info('Sending request to Gemini...', { model: this.model });
        const startTime = Date.now();

        const response = await axios.post(
          url,
          {
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          },
          {
            timeout: config.gemini.timeout,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const duration = Date.now() - startTime;

        if (!response.data.candidates || response.data.candidates.length === 0) {
          throw new Error('No candidates in Gemini response');
        }

        const candidate = response.data.candidates[0];

        // Check for safety blocks
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`Gemini response blocked: ${candidate.finishReason}`);
        }

        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error('No content in Gemini response');
        }

        const text = candidate.content.parts[0].text;
        logger.info(`Gemini response received in ${duration}ms`);

        return text;
      },
      config.gemini.retries,
      2000,
      'Gemini sendRequest'
    );
  }

  /**
   * Analyze pools and get recommendations
   */
  async analyzePools(pools, riskLevel = 'medium') {
    try {
      logger.info(`Analyzing ${pools.length} pools with Gemini (risk: ${riskLevel})...`);

      // Prepare pool data
      const poolsData = pools.map((pool) => ({
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
      }));

      const systemInstruction = `Tu es un expert DeFi. Analyse les pools et recommande le meilleur pour chaque niveau de risque.

Réponds UNIQUEMENT en JSON valide (pas de markdown):
{
  "recommendations": [
    {
      "poolId": "id-exact",
      "score": 85,
      "reasoning": "1 phrase courte",
      "pros": ["2-3 pros max"],
      "cons": ["1-2 cons max"],
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": "1 phrase de résumé",
  "warnings": ["avertissements si nécessaire"]
}`;

      const userPrompt = `Analyse ces pools USDC sur Base et recommande le meilleur pour chaque niveau de risque.

CRITÈRES:
- Low Risk: TVL > $1M, APY 3-10%, protocoles établis (Aave, Morpho, Merkl)
- Medium Risk: TVL > $500K, APY 8-20%, équilibre rendement/sécurité
- High Risk: TVL > $100K, APY 15-50%, potentiel élevé

RÉPONSE CONCISE:
- Score (0-100)
- 2-3 pros maximum
- 1-2 cons maximum
- 1 phrase courte

Pools (${pools.length}):
${JSON.stringify(poolsData, null, 2)}`;

      const response = await this.sendRequest(userPrompt, systemInstruction);

      // Parse JSON response
      let jsonContent = response.trim();

      // Remove markdown if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonContent);

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendations format');
      }

      // Enrich recommendations with full pool data
      const recommendations = parsed.recommendations
        .map((rec) => {
          const pool = pools.find((p) => p.pool === rec.poolId);
          if (!pool) {
            logger.warn(`Pool ${rec.poolId} not found in original data`);
            return null;
          }

          return {
            pool,
            score: rec.score || 0,
            reasoning: rec.reasoning || 'No explanation provided',
            pros: Array.isArray(rec.pros) ? rec.pros : [],
            cons: Array.isArray(rec.cons) ? rec.cons : [],
            riskLevel: rec.riskLevel || 'medium',
          };
        })
        .filter(Boolean);

      // Organize by risk level
      const strategies = {
        low: recommendations.filter((r) => r.riskLevel === 'low').slice(0, 1),
        medium: recommendations.filter((r) => r.riskLevel === 'medium').slice(0, 1),
        high: recommendations.filter((r) => r.riskLevel === 'high').slice(0, 1),
        best: recommendations[0] || null,
      };

      logger.info('Gemini analysis completed successfully');

      return {
        success: true,
        strategies,
        summary: parsed.summary || 'Analysis completed',
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        totalPoolsAnalyzed: pools.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to analyze pools with Gemini', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze pools for all risk levels
   */
  async analyzeAllRiskLevels(pools) {
    try {
      const analysis = await this.analyzePools(pools);
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze all risk levels', { error: error.message });
      throw error;
    }
  }
}

export default new GeminiService();
