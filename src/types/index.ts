import { LogLevel, TransactionType, TokenStandard } from './enums.js';
import type { 
    TokenBalanceChange,
    AccountData,
    NativeTransfer,
    TokenTransfer,
    HeliusPayload 
} from './HeliusPayload.js';

export type {
    TokenBalanceChange,
    AccountData,
    NativeTransfer,
    TokenTransfer,
    HeliusPayload
};

export interface WalletData {
    address: string;
    label: string;
}

export interface Transaction {
    type: TransactionType;
    tokenAddress: string;
    amount: number;
    timestamp: number;
    signature: string;
    slot: number;
    signer: string;
}

export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    standard: TokenStandard;
    price?: {
        value: number;
        updateTime: number;
    };
}

export interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: Date;
    data?: unknown;
}

export interface BirdeyeResponse {
    success: boolean;
    data: {
        symbol: string;
        name: string;
        decimals: number;
        price: number;
        mc: number;
        v1hUSD: number;
        v4hUSD: number;
        v24hUSD: number;
        priceChange1hPercent: number;
        priceChange4hPercent: number;
        priceChange24hPercent: number;
        lastTradeUnixTime: number;
        holder: number;
        trade24h: number;
        buy24h: number;
        sell24h: number;
        liquidity: number;
        updateTime: number;
        address: string;
        lastTradeHumanTime: string;
    };
}

export interface HeliusWebhookPayload extends HeliusPayload {
    webhookId: string;
    accountAddresses: string[];
}

export interface TokenData {
    mint: string;
    symbol: string;
    amount: number;
}

export interface SwapTransaction {
    type: 'SWAP';
    signature: string;
    feePayer: string;
    source: string;
    inputToken: TokenData;
    outputToken: TokenData;
}

export type HeliusTransactionType = 'SWAP' | 'TRANSFER' | 'NFT_SALE' | 'NFT_LISTING' | 'NFT_CANCEL_LISTING';

export interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    HELIUS_API_KEY: string;
    BIRDEYE_API_KEY: string;
    WEBHOOK_SECRET?: string;
    WALLETS_CSV_PATH: string;
    RPC_ENDPOINT?: string;
}
