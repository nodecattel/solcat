import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

export async function getTokenInfo(tokenAddress) {
    try {
        if (!BIRDEYE_API_KEY) {
            throw new Error('BIRDEYE_API_KEY is not set in environment variables');
        }

        const options = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': BIRDEYE_API_KEY
            }
        };

        const response = await fetch(
            `https://public-api.birdeye.so/defi/token_overview?address=${tokenAddress}`,
            options
        );

        const data = await response.json();
        if (!data.success) {
            throw new Error(`Failed to fetch token info: ${data.message || 'Unknown error'}`);
        }

        return data.data;
    } catch (error) {
        logger.error(`Failed to fetch token info for ${tokenAddress}:`, error);
        return null;
    }
}

function formatPrice(price) {
    if (price < 0.000001) return price.toExponential(4);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
}

function formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
}

function formatPriceChange(change) {
    if (!change && change !== 0) return '⚫ N/A';
    if (change > 0) return `🟢 +${change.toFixed(2)}%`;
    if (change < 0) return `🔴 ${change.toFixed(2)}%`;
    return `⚪ ${change.toFixed(2)}%`;
}

export function formatTokenInsights(tokenInfo) {
    if (!tokenInfo) return 'Token info not available';

    return {
        name: `${tokenInfo.name || 'Unknown'} (${tokenInfo.symbol || 'Unknown'})`,
        price: `$${formatPrice(tokenInfo.price)}`,
        changes: {
            '30m': formatPriceChange(tokenInfo.priceChange30mPercent),
            '1h': formatPriceChange(tokenInfo.priceChange1hPercent),
            '24h': formatPriceChange(tokenInfo.priceChange24hPercent)
        },
        volume24h: formatNumber(tokenInfo.v24hUSD),
        marketCap: formatNumber(tokenInfo.realMc),
        holders: formatNumber(tokenInfo.holder),
        uniqueTraders24h: formatNumber(tokenInfo.uniqueWallet24h),
        trades24h: formatNumber(tokenInfo.trade24h),
        buys24h: formatNumber(tokenInfo.buy24h),
        sells24h: formatNumber(tokenInfo.sell24h)
    };
}
