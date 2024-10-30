import type { BirdeyeResponse } from '../types/index.js';
import type WalletService from '../services/walletService.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

async function fetchTokenInfo(mintAddress: string): Promise<BirdeyeResponse | null> {
    try {
        const response = await fetch(
            `https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`,
            {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'x-chain': 'solana',
                    'X-API-KEY': config.BIRDEYE_API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Birdeye API error: ${response.status}`);
        }

        const data = await response.json() as BirdeyeResponse;
        if (!data.success) {
            throw new Error('Birdeye API returned unsuccessful response');
        }

        return data;
    } catch (error) {
        logger.error('Error fetching token info:', { mintAddress, error });
        return null;
    }
}

export async function processSwapTransaction(transaction: any, walletService: typeof WalletService) {
    logger.info('Raw SWAP Transaction:', JSON.stringify(transaction, null, 2));
    
    const { signature, feePayer } = transaction;
    const walletLabel = walletService.getLabel(feePayer) || 'ANON';

    // Extract swap info from events
    const swapEvent = transaction.events?.swap;
    if (!swapEvent) {
        logger.error('No swap event found:', { signature });
        return null;
    }

    // Get input/output amounts
    let inputAmount, inputMint, outputAmount, outputMint;

    // Check for native SOL input
    if (swapEvent.nativeInput) {
        inputAmount = swapEvent.nativeInput.amount / 1e9; // Convert lamports to SOL
        inputMint = "So11111111111111111111111111111111111111112";
    } else if (swapEvent.tokenInputs?.[0]) {
        const input = swapEvent.tokenInputs[0];
        inputAmount = input.tokenAmount;
        inputMint = input.mint;
    }

    // Get token output
    if (swapEvent.tokenOutputs?.[0]) {
        const output = swapEvent.tokenOutputs[0];
        outputAmount = output.tokenAmount;
        outputMint = output.mint;
    }

    if (!inputMint || !outputMint) {
        logger.error('Missing input/output info:', { signature, inputMint, outputMint });
        return null;
    }

    // Get token info from Birdeye
    const tokenInfo = await fetchTokenInfo(outputMint);
    if (!tokenInfo?.success) {
        return `🔄 SWAP on ${transaction.events?.swap?.innerSwaps?.[0]?.programInfo?.source || 'Unknown'}
${walletLabel} (${feePayer.substring(0, 4)}...${feePayer.slice(-4)})
🔹 Swapped ${inputAmount} SOL for ${outputAmount} Unknown Token
🔗 [Transaction](https://solscan.io/tx/${signature})`;
    }

    const { data } = tokenInfo;
    const outputUSDValue = outputAmount * data.price;

    // Calculate buy/sell percentages
    const totalTrades24h = data.trade24h;
    const buyPercentage = (data.buy24h / totalTrades24h * 100).toFixed(1);
    const sellPercentage = (data.sell24h / totalTrades24h * 100).toFixed(1);

    const inputSymbol = inputMint === "So11111111111111111111111111111111111111112" ? 
        "[SOL](https://birdeye.so/token/So11111111111111111111111111111111111111112?chain=solana)" : 
        `[Unknown](https://birdeye.so/token/${inputMint}?chain=solana)`;
    const outputSymbol = `[${data.symbol}](https://birdeye.so/token/${outputMint}?chain=solana)`;

    return `🔄 SWAP on ${transaction.events?.swap?.innerSwaps?.[0]?.programInfo?.source || 'Unknown'}
${walletLabel} (${feePayer.substring(0, 4)}...${feePayer.slice(-4)})
🔹 Swapped ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}
💰 Value: $${outputUSDValue.toFixed(2)} (@$${data.price.toFixed(6)})

📊 Price Action:
1h: ${data.priceChange1hPercent > 0 ? '🟢' : '🔴'}${data.priceChange1hPercent.toFixed(2)}%
4h: ${data.priceChange4hPercent > 0 ? '🟢' : '🔴'}${data.priceChange4hPercent.toFixed(2)}%
24h: ${data.priceChange24hPercent > 0 ? '🟢' : '🔴'}${data.priceChange24hPercent.toFixed(2)}%

💎 Token Metrics:
MC: $${(data.mc / 1e6).toFixed(2)}M
Liquidity: $${(data.liquidity / 1e6).toFixed(2)}M
Holders: ${data.holder.toLocaleString()}

📈 Volume (USD):
1h: $${(data.v1hUSD / 1e3).toFixed(1)}K
4h: $${(data.v4hUSD / 1e3).toFixed(1)}K
24h: $${(data.v24hUSD / 1e6).toFixed(2)}M

🔄 24h Trading Activity:
Total Trades: ${data.trade24h.toLocaleString()}
Buy: ${buyPercentage}% (${data.buy24h.toLocaleString()} trades)
Sell: ${sellPercentage}% (${data.sell24h.toLocaleString()} trades)

💧 Liquidity: $${(data.liquidity).toFixed(2)}
Last Trade: ${data.lastTradeHumanTime}

🔗 [Transaction](https://solscan.io/tx/${signature})`
        .trim();
}

export async function processTransferTransaction(transaction: any, walletService: typeof WalletService) {
    logger.info('Raw TRANSFER Transaction:', JSON.stringify(transaction, null, 2));
    
    const { signature, nativeTransfers, tokenTransfers } = transaction;

    // Handle native SOL transfers
    if (nativeTransfers && nativeTransfers.length > 0) {
        const transfer = nativeTransfers[0];
        const fromLabel = walletService.getLabel(transfer.fromUserAccount) || 'Unknown';
        const toLabel = walletService.getLabel(transfer.toUserAccount) || 'Unknown';
        const solAmount = (transfer.amount / 1e9).toFixed(4);

        return `💸 [SOL](https://birdeye.so/token/So11111111111111111111111111111111111111112?chain=solana) Transfer: ${solAmount} SOL
From: ${fromLabel} (${transfer.fromUserAccount.substring(0, 4)}...${transfer.fromUserAccount.slice(-4)})
To: ${toLabel} (${transfer.toUserAccount.substring(0, 4)}...${transfer.toUserAccount.slice(-4)})
🔗 [Transaction](https://solscan.io/tx/${signature})`;
    }

    // Handle token transfers
    if (tokenTransfers && tokenTransfers.length > 0) {
        const transfer = tokenTransfers[0];
        const fromLabel = walletService.getLabel(transfer.fromUserAccount) || 'Unknown';
        const toLabel = walletService.getLabel(transfer.toUserAccount) || 'Unknown';

        // Get token info from Birdeye
        const tokenInfo = await fetchTokenInfo(transfer.mint);
        let tokenDetails = '';
        let tokenSymbol = '';

        if (tokenInfo?.success) {
            const { data } = tokenInfo;
            tokenSymbol = `[${data.symbol}](https://birdeye.so/token/${transfer.mint}?chain=solana)`;

            // Calculate buy/sell percentages
            const totalTrades24h = data.trade24h;
            const buyPercentage = (data.buy24h / totalTrades24h * 100).toFixed(1);
            const sellPercentage = (data.sell24h / totalTrades24h * 100).toFixed(1);

            tokenDetails = `
📊 Price: $${data.price.toFixed(6)}
Price Action:
1h: ${data.priceChange1hPercent > 0 ? '🟢' : '🔴'}${data.priceChange1hPercent.toFixed(2)}%
4h: ${data.priceChange4hPercent > 0 ? '🟢' : '🔴'}${data.priceChange4hPercent.toFixed(2)}%
24h: ${data.priceChange24hPercent > 0 ? '🟢' : '🔴'}${data.priceChange24hPercent.toFixed(2)}%

💎 Token Metrics:
MC: $${(data.mc / 1e6).toFixed(2)}M
Liquidity: $${(data.liquidity / 1e6).toFixed(2)}M
Holders: ${data.holder.toLocaleString()}

📈 Volume (USD):
1h: $${(data.v1hUSD / 1e3).toFixed(1)}K
4h: $${(data.v4hUSD / 1e3).toFixed(1)}K
24h: $${(data.v24hUSD / 1e6).toFixed(2)}M

🔄 24h Trading:
Trades: ${data.trade24h.toLocaleString()}
Buy/Sell: ${buyPercentage}%/${sellPercentage}%

💧 Liquidity: $${(data.liquidity).toFixed(2)}
Last Trade: ${data.lastTradeHumanTime}`;
        } else {
            tokenSymbol = `[${transfer.symbol || transfer.tokenStandard}](https://birdeye.so/token/${transfer.mint}?chain=solana)`;
        }

        return `💸 Token Transfer: ${transfer.tokenAmount} ${tokenSymbol}
From: ${fromLabel} (${transfer.fromUserAccount.substring(0, 4)}...${transfer.fromUserAccount.slice(-4)})
To: ${toLabel} (${transfer.toUserAccount.substring(0, 4)}...${transfer.toUserAccount.slice(-4)})${tokenDetails}
🔗 [Transaction](https://solscan.io/tx/${signature})`;
    }

    return null;
}
