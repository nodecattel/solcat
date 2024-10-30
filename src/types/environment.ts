declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      HELIUS_API_KEY: string;
      BIRDEYE_API_KEY: string;
      WEBHOOK_SECRET: string;
      RPC_ENDPOINT: string;
    }
  }
}

// Export empty object to make this a module
export {};
