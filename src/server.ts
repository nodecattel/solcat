import express from 'express';
import axios from 'axios';
import { webhookHandler } from './handlers/webhookHandler.js';
import { logger } from './utils/logger.js';
import config from './config/index.js';
import walletService from './services/walletService.js';

const app = express();

// Middleware
app.use(express.json({
    verify: (_req, _res, buf) => {  // Add underscore to unused parameters
        (_req as any).rawBody = buf;
    }
}));

// Function to get the public IP address
async function getPublicIpAddress(): Promise<string> {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        logger.error("Couldn't retrieve public IP address", error);
        return '127.0.0.1';  // Default to localhost if the request fails
    }
}

// Initialize services
async function initServices() {
    try {
        await walletService.init();
        logger.info('Configuration loaded:', {
            NODE_ENV: config.NODE_ENV,
            PORT: config.PORT,
            BIRDEYE_API_KEY: 'exists: ' + !!config.BIRDEYE_API_KEY,
            HELIUS_API_KEY: 'exists: ' + !!config.HELIUS_API_KEY,
            WALLETS_CSV_PATH: config.WALLETS_CSV_PATH,
            WEBHOOK_SECRET: 'exists: ' + !!config.WEBHOOK_SECRET
        });
        logger.info('Services initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize services', error);
        process.exit(1);
    }
}

// Routes
app.post('/webhook', webhookHandler);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Start server
async function startServer() {
    try {
        await initServices();
        
        app.listen(config.PORT, async () => {
            const ipAddress = await getPublicIpAddress();
            const webhookURL = `http://${ipAddress}:${config.PORT}/webhook`;
            
            logger.info(`Server is running on port ${config.PORT}`);
            logger.info(`Environment: ${config.NODE_ENV}`);
            logger.info(`Webhook endpoint: ${webhookURL}`);
            
            // Test the health endpoint
            try {
                const healthResponse = await axios.get(`http://localhost:${config.PORT}/health`);
                logger.info(`Health check response: ${healthResponse.data.status}`);
                
                // Log tracked wallets
                const wallets = walletService.getAllWallets();
                logger.info('Currently tracking wallets:', {
                    count: wallets.length,
                    wallets: wallets.map(w => ({
                        address: `${w.address.slice(0, 4)}...${w.address.slice(-4)}`,
                        label: w.label
                    }))
                });
            } catch (error) {
                logger.error('Health check failed', error);
            }
        });
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    walletService.dispose();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    walletService.dispose();
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Start the server
startServer().catch(error => {
    logger.error('Failed to start server', error);
    process.exit(1);
});

export default app;
