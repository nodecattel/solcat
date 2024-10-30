```markdown
# Solcat

A real-time Solana transaction tracker built with Helius SDK. Monitor specific wallet addresses for transactions and get detailed token information through Birdeye API.

## Features

- 🔄 Real-time transaction monitoring via Helius webhooks
- 💰 Support for both SWAP and Transfer transactions
- 🔍 Detailed token information from Birdeye API including:
  - Price action (1h, 4h, 24h changes)
  - Market metrics (MC, Liquidity, Holders)
  - Trading volumes
  - Buy/Sell ratios
- 👛 CSV-based wallet management
- 🎨 Beautiful formatted output with clickable links
- 🚀 Built with TypeScript for better reliability

## Prerequisites

- Node.js >= 18.0.0
- Yarn package manager
- [Helius API Key](https://dev.helius.xyz/)
- [Birdeye API Key](https://birdeye.so/)

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/solcat.git
cd solcat
```

2. Install dependencies
```bash
yarn install && yarn build
```

3. Copy the example environment file and update it with your settings
```bash
cp .env.example .env
```

4. Update the environment variables in `.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=5420

# API Keys
HELIUS_API_KEY=your_helius_api_key_here
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Security
WEBHOOK_SECRET=your_webhook_secret_here

# RPC Configuration
RPC_ENDPOINT=https://your-rpc-endpoint.com

# File Paths
WALLETS_CSV_PATH=./wallets.csv
```

5. Add wallet addresses to track in `wallets.csv`:
```csv
address,label
FEic2a7hRTbwXBcTQxUDj5GBMQKaAwWLNb8RAtei5HBz,Wallet1
D64YBJ4FeR8czFX4hahX5N8AT9Wr5gDnp7dkqxQFReE,Wallet2
```

## Usage

### Start Node
```bash
yarn start
```
### Clean Build
```bash
yarn rebuild
```

## Project Structure
```
solcat/
├── .env                  # Environment variables
├── .gitignore           # Git ignore configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── wallets.csv          # Wallet addresses to track
└── src/
    ├── config/          # Configuration management
    ├── handlers/        # Transaction handlers
    ├── services/        # Business logic services
    ├── types/           # TypeScript type definitions
    ├── utils/           # Utility functions
    └── server.ts        # Main application entry point
```

## Example Output

### SWAP Transaction
```
🔄 SWAP on RAYDIUM
Wallet1 (FEic...5HBz)
🔹 Swapped 0.1 SOL for 10.5 TOKEN
💰 Value: $1.05 (@$0.100000)

📊 Price Action:
1h: 🟢2.50%
4h: 🔴1.20%
24h: 🟢15.80%

💎 Token Metrics:
MC: $1.2M
Liquidity: $250.5K
Holders: 1,234

📈 Volume (USD):
1h: $10.5K
4h: $45.2K
24h: $120.5K

🔄 24h Trading Activity:
Total Trades: 1,234
Buy: 55% (680 trades)
Sell: 45% (554 trades)

💧 Liquidity: $250,500.00
Last Trade: 2024-10-30T05:19:49.417Z

🔗 Transaction: https://solscan.io/tx/...
```

### Transfer Transaction
```
💸 SOL Transfer: 0.1 SOL
From: Wallet1 (FEic...5HBz)
To: Wallet2 (D64Y...FReE)
🔗 Transaction: https://solscan.io/tx/...
```

## Configuration with Helius

1. Go to [Helius Dashboard](https://dev.helius.xyz/dashboard)
2. Create a new webhook with your endpoint URL: `http://your-server:5420/webhook`
3. Add your wallet addresses
4. Select transaction types:
   - SWAP
   - TRANSFER

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

- [Helius](https://helius.dev/) - Solana blockchain data provider
- [Birdeye](https://birdeye.so/) - DeFi analytics platform
