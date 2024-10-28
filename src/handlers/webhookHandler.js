import { logger } from "../utils/logger.js";
import { getTokenInfo, formatTokenInsights } from "../services/birdeyeService.js";

// Parse wallet labels from env
const walletLabels = new Map(
    (process.env.WALLETS || "").split(',').map(entry => {
        const [label, address] = entry.trim().split(' ');
        return [address, label];
    })
);

function formatAmount(amount, decimals) {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
}

function formatAddress(address) {
    const label = walletLabels.get(address);
    if (label) {
        return `${label} (${address.slice(0, 4)}...${address.slice(-4)})`;
    }
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function summarizeSwap(tokenBalanceChanges) {
    const summary = {
        sold: [],
        received: []
    };

    tokenBalanceChanges.forEach(account => {
        if (!account.tokenBalanceChanges) return;
        
        account.tokenBalanceChanges.forEach(token => {
            const amount = Number(token.rawTokenAmount.tokenAmount) / Math.pow(10, token.rawTokenAmount.decimals);
            if (amount < 0) {
                summary.sold.push({
                    amount: Math.abs(amount),
                    mint: token.mint,
                    decimals: token.rawTokenAmount.decimals
                });
            } else if (amount > 0) {
                summary.received.push({
                    amount: amount,
                    mint: token.mint,
                    decimals: token.rawTokenAmount.decimals
                });
            }
        });
    });

    return summary;
}

export const webhookHandler = async (req, res) => {
    try {
        const transactions = Array.isArray(req.body) ? req.body : [req.body];

        for (const tx of transactions) {
            const emoji = tx.type === 'SWAP' ? '🔄' : '💸';
            logger.info(`\n${emoji} New ${tx.type} Transaction`);
            logger.info('----------------------------------------');
            logger.info(`🔍 ${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)}`);
            logger.info(`⏰ ${formatTimestamp(tx.timestamp)}`);

            if (tx.type === 'SWAP') {
                const summary = summarizeSwap(tx.accountData);
                
                // Process sold tokens
                if (summary.sold.length > 0) {
                    logger.info('\n📤 Sold:');
                    for (const token of summary.sold) {
                        logger.info(`${token.amount} ${token.mint.slice(0, 4)}...`);
                        const insights = await getTokenInfo(token.mint);
                        if (insights) {
                            const formatted = formatTokenInsights(insights);
                            logger.info(`📊 ${formatted.name}`);
                            logger.info(`💰 Price: ${formatted.price}`);
                            logger.info(`📈 1h: ${formatted.changes['1h']} | 24h: ${formatted.changes['24h']}`);
                            logger.info(`💎 MC: ${formatted.marketCap} | Vol: ${formatted.volume24h}`);
                        }
                    }
                }

                // Process received tokens
                if (summary.received.length > 0) {
                    logger.info('\n📥 Received:');
                    for (const token of summary.received) {
                        logger.info(`${token.amount} ${token.mint.slice(0, 4)}...`);
                        const insights = await getTokenInfo(token.mint);
                        if (insights) {
                            const formatted = formatTokenInsights(insights);
                            logger.info(`📊 ${formatted.name}`);
                            logger.info(`💰 Price: ${formatted.price}`);
                            logger.info(`📈 1h: ${formatted.changes['1h']} | 24h: ${formatted.changes['24h']}`);
                            logger.info(`💎 MC: ${formatted.marketCap} | Vol: ${formatted.volume24h}`);
                        }
                    }
                }
            }

            // Process SOL transfers
            if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
                logger.info('\n💰 SOL Transfers:');
                tx.nativeTransfers.forEach(transfer => {
                    const from = formatAddress(transfer.fromUserAccount);
                    const to = formatAddress(transfer.toUserAccount);
                    const amount = formatAmount(transfer.amount, 9);
                    logger.info(`${from} ➡️ ${to}: ${amount} SOL`);
                });
            }

            // Process token transfers
            if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                logger.info('\n🪙 Token Transfers:');
                for (const transfer of tx.tokenTransfers) {
                    const from = formatAddress(transfer.fromUserAccount);
                    const to = formatAddress(transfer.toUserAccount);
                    const amount = formatAmount(transfer.tokenAmount, transfer.decimals);
                    logger.info(`${from} ➡️ ${to}: ${amount}`);
                    
                    if (transfer.decimals > 0) {  // Skip NFTs
                        const tokenInfo = await getTokenInfo(transfer.mint);
                        if (tokenInfo) {
                            const insights = formatTokenInsights(tokenInfo);
                            logger.info('Token Insights:');
                            logger.info(`📊 ${insights.name}`);
                            logger.info(`💰 Price: ${insights.price}`);
                            logger.info(`📈 1h: ${insights.changes['1h']} | 24h: ${insights.changes['24h']}`);
                            logger.info(`💎 MC: ${insights.marketCap} | Vol: ${insights.volume24h}`);
                        }
                    }
                }
            }

            // Process account balance changes
            const significantChanges = tx.accountData
                .filter(account => Math.abs(account.nativeBalanceChange) > 0.000001 * 1e9)
                .map(account => ({
                    address: formatAddress(account.account),
                    change: formatAmount(account.nativeBalanceChange, 9)
                }));

            if (significantChanges.length > 0) {
                logger.info('\n📊 Balance Changes:');
                significantChanges.forEach(({ address, change }) => {
                    const emoji = Number(change) > 0 ? '📈' : '📉';
                    logger.info(`${emoji} ${address}: ${change} SOL`);
                });
            }

            if (tx.source) {
                logger.info(`\n🏢 Source: ${tx.source}`);
            }
            logger.info('----------------------------------------');
        }

        res.status(200).json({ status: "success" });
    } catch (error) {
        logger.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
