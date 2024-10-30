export interface TokenBalanceChange {
    mint: string;
    rawTokenAmount: {
        decimals: number;
        tokenAmount: string;
    };
    tokenAccount: string;
    userAccount: string;
}

export interface AccountData {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];
}

export interface NativeTransfer {
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
}

export interface TokenTransfer {
    fromTokenAccount: string;
    fromUserAccount: string;
    mint: string;
    toTokenAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    tokenStandard: string;
}

export interface HeliusPayload {
    accountData: AccountData[];
    description: string;
    events: {
        nft?: {
            amount: number;
            buyer: string;
            description: string;
            fee: number;
            feePayer: string;
            nfts: { mint: string; tokenStandard: string }[];
            saleType: string;
            seller: string;
            signature: string;
            slot: number;
            source: string;
            timestamp: number;
            type: string;
        };
    };
    fee: number;
    feePayer: string;
    nativeTransfers: NativeTransfer[];
    signature: string;
    slot: number;
    source: string;
    timestamp: number;
    tokenTransfers: TokenTransfer[];
    type: string;
}
