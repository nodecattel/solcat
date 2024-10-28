# 🐱 SolCat Monitor

A real-time Solana transaction monitor that tracks wallet activities with detailed token insights using Helius and Birdeye APIs.

## 🌟 Features

- 🔄 Real-time transaction monitoring
- 💎 Detailed token insights from Birdeye
- 👛 Multiple wallet tracking with labels
- 💱 Swap transaction analysis
- 💸 Transfer tracking
- 🏷️ Custom wallet labeling
- ⏰ UTC timestamp for all transactions
- 📊 Price and market data for tokens

## 📋 Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- [Helius API Key](https://dev.helius.xyz/dashboard/app)
- [Birdeye API Key](https://birdeye.so/apis)

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solcat.git
cd solcat
```

2. Install dependencies:
```bash
yarn install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your API keys and settings.

5. Start the monitor:
```bash
yarn start
```

## ⚙️ Configuration

Create a `.env` file with the following configuration:

```env
PORT=5430
HELIUS_API_KEY=your_helius_api_key_here
BIRDEYE_API_KEY=your_birdeye_api_key_here
HELIUS_AUTH_HEADER=your_webhook_auth_header
WEBHOOK_URL=http://your-domain:5430/webhook-handler
WALLETS=LABEL1 WALLET1_ADDRESS, LABEL2 WALLET2_ADDRESS
```

Example wallet configuration:
```env
WALLETS=ME D64YBJW4FeR8czFX4hahX5N8AT9Wr5gDnp7dkqxQFReE, BOB 5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE
```

## 📝 Sample Output

```
🔄 New SWAP Transaction
----------------------------------------
🔍 4avXtQDu...4aHv9uha
⏰ 2024-10-28 15:47:20 UTC

📤 Sold:
3.478143 Es9v...
📊 USDC (USDC)
💰 Price: $1.00
📈 1h: ⚪ 0.00% | 24h: ⚪ 0.00%
💎 MC: 23.4B | Vol: 123.4M

📥 Received:
3.0 Ay43...
📊 ai16z (AI16Z)
💰 Price: $0.0305
📈 1h: 🔴 -7.61% | 24h: 🔴 -48.95%
💎 MC: 35.01M | Vol: 22.30M

🏢 Source: JUPITER
----------------------------------------
```

## 🛠️ Development

```bash
# Install dependencies
yarn install

# Start in development mode
yarn dev

# Start in production mode
yarn start
```

## 📚 API Documentation

- [Helius API Docs](https://docs.helius.dev/)
- [Birdeye API Docs](https://docs.birdeye.so/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Helius](https://helius.dev/) for Solana transaction webhooks
- [Birdeye](https://birdeye.so/) for token market data
