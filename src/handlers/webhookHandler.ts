import { Request, Response } from 'express';
import walletService from '../services/walletService.js';
import { logger } from '../utils/logger.js';
import { processTransaction } from './payloadHandler.js';

interface ProcessedMessage {
    signature: string;
    success: boolean;
    message?: string;
    error?: string;
}

export async function webhookHandler(req: Request, res: Response): Promise<void> {
    try {
        const payload = req.body;
        
        if (!Array.isArray(payload)) {
            logger.warn('Invalid payload received:', { 
                payloadType: typeof payload,
                payload 
            });
            res.status(400).json({ error: 'Invalid payload format' });
            return;
        }

        const processedMessages = await Promise.all(
            payload.map(async (tx) => {
                if (walletService.isTrackedWallet(tx.feePayer)) {
                    try {
                        const message = await processTransaction(tx, walletService);
                        if (message) {
                            logger.info(message);
                            return {
                                signature: tx.signature,
                                success: true,
                                message
                            } as ProcessedMessage;
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        logger.error('Transaction processing error:', {
                            signature: tx.signature,
                            error: errorMessage
                        });
                        return {
                            signature: tx.signature,
                            success: false,
                            error: errorMessage
                        } as ProcessedMessage;
                    }
                }
                return null;
            })
        );

        const validMessages = processedMessages.filter((msg): msg is ProcessedMessage => msg !== null);
        
        const response = {
            success: true,
            processed: validMessages.length,
            results: validMessages,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);
    } catch (error) {
        logger.error('Webhook handler error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ 
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
}
