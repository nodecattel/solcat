# Solcat

Solana transaction tracker with Helius SDK

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solcat.git
cd solcat
```

2. Install dependencies:
```bash
yarn install
```

3. Copy the example environment file and update with your values:
```bash
cp .env.example .env
```

4. Update your wallet addresses in `wallets.csv`

5. Build the project:
```bash
yarn build
```

6. Start the server:
```bash
yarn start
```

## Docker

To run with Docker:

```bash
# Build the image
docker build -t solcat .

# Run the container
docker run -p 5430:5430 --env-file .env solcat
```

Or using docker-compose:

```bash
docker-compose up -d
```

## Development

```bash
# Start in development mode with hot reload
yarn dev

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix

# Build for production
yarn build
```

## Environment Variables

- `PORT`: Server port (default: 5430)
- `HELIUS_API_KEY`: Your Helius API key
- `BIRDEYE_API_KEY`: Your Birdeye API key
- `HELIUS_AUTH_HEADER`: Webhook authentication header
- `WEBHOOK_URL`: Your webhook URL
- `WALLET_CSV_PATH`: Path to wallets CSV file
