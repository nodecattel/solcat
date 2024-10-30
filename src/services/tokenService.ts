import { logger } from '../utils/logger.js';
import { TokenInfo, BirdeyeResponse } from '../types/index.js';
import config from '../config/index.js';
import { TokenStandard } from '../types/enums.js';

class TokenService {
    private cache: Map<string, { info: TokenInfo; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 1000 * 60 * 15; // 15 minutes
    private readonly BATCH_SIZE = 100;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000; // 1 second

    async getTokenInfo(address: string): Promise<TokenInfo | null> {
        const now = Date.now();
        const cached = this.cache.get(address);

        if (cached && now - cached.timestamp < this.CACHE_TTL) {
            return cached.info;
        }

        try {
            const info = await this.fetchTokenInfoWithRetry(address);
            if (info) {
                this.cache.set(address, { info, timestamp: now });
            }
            return info;
        } catch (error) {
            logger.error(`Error fetching token info for ${address}`, error);
            return null;
        }
    }

    async getMultipleTokenInfo(addresses: string[]): Promise<Map<string, TokenInfo>> {
        const result = new Map<string, TokenInfo>();
        const uncachedAddresses: string[] = [];

        // Check cache first
        addresses.forEach(address => {
            const cached = this.cache.get(address);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                result.set(address, cached.info);
            } else {
                uncachedAddresses.push(address);
            }
        });

        // Fetch uncached tokens in batches
        for (let i = 0; i < uncachedAddresses.length; i += this.BATCH_SIZE) {
            const batch = uncachedAddresses.slice(i, i + this.BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(address => this.fetchTokenInfoWithRetry(address))
            );

            batchResults.forEach((promiseResult, index) => {
                if (promiseResult.status === 'fulfilled' && promiseResult.value) {
                    result.set(batch[index], promiseResult.value);
                }
            });
        }

        return result;
    }

    private async fetchTokenInfoWithRetry(address: string, attempt = 1): Promise<TokenInfo | null> {
        try {
            const response = await fetch(
                `https://api.birdeye.so/v1/token/${address}`,
                {
                    headers: {
                        'X-API-KEY': config.BIRDEYE_API_KEY,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const data = responseData as BirdeyeResponse;
            
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }

            return {
                address,
                symbol: data.data.symbol,
                name: data.data.name,
                decimals: data.data.decimals,
                standard: TokenStandard.SPL,
                price: {
                    value: data.data.price,
                    updateTime: data.data.updateTime
                }
            };
        } catch (error) {
            if (attempt < this.MAX_RETRIES) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.RETRY_DELAY * attempt)
                );
                return this.fetchTokenInfoWithRetry(address, attempt + 1);
            }
            
            logger.error(`Failed to fetch token info for ${address} after ${attempt} attempts`, error);
            return null;
        }
    }

    clearCache(): void {
        this.cache.clear();
        logger.info('Token cache cleared');
    }
}

export default new TokenService();
