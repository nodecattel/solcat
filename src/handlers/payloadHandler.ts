import { processSwapTransaction, processTransferTransaction } from './transactionProcessors.js';
import type WalletService from '../services/walletService.js';
import { logger } from '../utils/logger.js';

export async function processTransaction(transaction: any, walletService: typeof WalletService) {
    try {
        const { type, signature, feePayer } = transaction;
        const walletLabel = walletService.getLabel(feePayer) || 'ANON';

        logger.info('Processing transaction details', { type, signature, feePayer, walletLabel });

        // Handle different transaction types
        switch (type) {
            case 'SWAP':
                return await processSwapTransaction(transaction, walletService);
            case 'TRANSFER':
                return await processTransferTransaction(transaction, walletService);
            default:
                logger.warn(`Unsupported transaction type: ${type}`);
                return null;
        }
    } catch (error) {
        logger.error('Error in processTransaction:', error);
        throw error;
    }
}
