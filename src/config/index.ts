import dotenv from 'dotenv';
import { baseLogger } from '../utils/baseLogger.js';
import path from 'path';

// Load environment variables
dotenv.config();

class Config {
    private validateEnvVar(key: keyof NodeJS.ProcessEnv): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }

    public readonly NODE_ENV: string = process.env.NODE_ENV || 'development';
    public readonly PORT: number = parseInt(process.env.PORT || '5420', 10);
    public readonly HELIUS_API_KEY: string = this.validateEnvVar('HELIUS_API_KEY');
    public readonly BIRDEYE_API_KEY: string = this.validateEnvVar('BIRDEYE_API_KEY');
    public readonly WEBHOOK_SECRET: string = this.validateEnvVar('WEBHOOK_SECRET');
    public readonly RPC_ENDPOINT: string = this.validateEnvVar('RPC_ENDPOINT');
    public readonly WALLETS_CSV_PATH: string = process.env.WALLETS_CSV_PATH || './wallets.csv';
    
    public readonly isDevelopment: boolean = this.NODE_ENV === 'development';
    public readonly isProduction: boolean = this.NODE_ENV === 'production';
    public readonly isTest: boolean = this.NODE_ENV === 'test';

    constructor() {
        // Resolve the wallets.csv path relative to project root
        this.WALLETS_CSV_PATH = path.resolve(process.cwd(), this.WALLETS_CSV_PATH);

        try {
            // Validate all required environment variables
            Object.values(this).forEach(value => {
                if (value === undefined) {
                    throw new Error('Configuration validation failed');
                }
            });
            
            baseLogger.info('Configuration loaded successfully', { 
                environment: this.NODE_ENV,
                port: this.PORT,
                walletsPath: this.WALLETS_CSV_PATH
            });
        } catch (error) {
            baseLogger.error('Configuration validation failed', error);
            process.exit(1);
        }
    }
}

const config = new Config();
export default config;
