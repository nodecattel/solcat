import fs from 'fs/promises';
import { createReadStream, watch } from 'fs';
import { FSWatcher } from 'fs';
import csv from 'csv-parser';
import { logger } from '../utils/logger.js';
import { WalletData } from '../types/index.js';
import config from '../config/index.js';

class WalletService {
    private wallets: Map<string, WalletData> = new Map();
    private isInitialized = false;
    private fileWatcher: FSWatcher | null = null;

    async init(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            await this.loadWallets();
            this.isInitialized = true;

            // Set up file watcher for auto-reload in development
            if (config.isDevelopment) {
                this.watchWalletsFile();
            }
        } catch (error) {
            logger.error('Failed to initialize WalletService', error);
            throw error;
        }
    }

    private watchWalletsFile(): void {
        this.fileWatcher = watch(config.WALLETS_CSV_PATH, async () => {
            logger.info('Wallets file changed, reloading...');
            try {
                await this.loadWallets();
            } catch (error) {
                logger.error('Error reloading wallets file', error);
            }
        });

        process.on('SIGINT', () => {
            this.fileWatcher?.close();
            process.exit(0);
        });
    }

    async loadWallets(): Promise<void> {
        try {
            await fs.access(config.WALLETS_CSV_PATH);

            const results: WalletData[] = [];

            await new Promise<void>((resolve, reject) => {
                createReadStream(config.WALLETS_CSV_PATH)
                    .pipe(csv({
                        mapValues: ({ value }) => value.trim()
                    }))
                    .on('data', (data: any) => {
                        if (!data.address || !data.label) {
                            logger.warn('Found invalid row in wallets.csv', data);
                            return;
                        }

                        results.push({
                            address: data.address.trim(),
                            label: data.label.trim()
                        });
                    })
                    .on('end', () => {
                        this.wallets.clear();
                        results.forEach(wallet => {
                            this.wallets.set(wallet.address.toLowerCase(), wallet);
                        });
                        logger.info(`Loaded ${this.wallets.size} wallets from CSV`);
                        resolve();
                    })
                    .on('error', reject);
            });
        } catch (error) {
            const err = error as { code?: string };
            if (err.code === 'ENOENT') {
                logger.warn(`Wallets file not found at ${config.WALLETS_CSV_PATH}, creating empty file`);
                await this.createEmptyWalletsFile();
            } else {
                logger.error('Error loading wallets from CSV', error);
                throw error;
            }
        }
    }

    private async createEmptyWalletsFile(): Promise<void> {
        const header = 'address,label\n';
        await fs.writeFile(config.WALLETS_CSV_PATH, header);
        this.wallets.clear();
    }

    isTrackedWallet(address: string): boolean {
        return this.wallets.has(address.toLowerCase());
    }

    getLabel(address: string): string | undefined {
        const wallet = this.wallets.get(address.toLowerCase());
        return wallet?.label;
    }

    getAllWallets(): WalletData[] {
        return Array.from(this.wallets.values());
    }

    async addWallet(address: string, label: string): Promise<void> {
        try {
            const normalizedAddress = address.toLowerCase();

            if (this.wallets.has(normalizedAddress)) {
                throw new Error(`Wallet ${address} already exists`);
            }

            const wallet: WalletData = { 
                address: address.trim(), 
                label: label.trim() 
            };

            const wallets = this.getAllWallets();
            wallets.push(wallet);
            
            // Sort wallets by address for consistency
            wallets.sort((a, b) => a.address.localeCompare(b.address));
            
            const csvContent = wallets
                .map(w => `${w.address},${w.label}`)
                .join('\n');
            
            await fs.writeFile(
                config.WALLETS_CSV_PATH, 
                'address,label\n' + csvContent
            );
            
            this.wallets.set(normalizedAddress, wallet);
            logger.info(`Added new wallet: ${address} (${label})`);
        } catch (error) {
            logger.error('Error adding wallet', error);
            throw error;
        }
    }

    dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.close();
            this.fileWatcher = null;
        }
    }
}

export default new WalletService();
