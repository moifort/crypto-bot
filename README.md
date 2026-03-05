# Crypto Bot

Grid trading bot for BTC/USDC on Kraken.

<p align="center">
  <img src="docs/screenshots/ios-app.png" width="300" alt="iOS app">
  <img src="docs/screenshots/ios-widget.png" width="300" alt="iOS widget">
</p>

## How it works

The bot exploits natural Bitcoin price oscillations to generate profits automatically.

It places a **grid of orders** around the current price: buy orders below and sell orders above. Each time the price moves up then back down (or vice versa), a buy and a sell are triggered — the difference between the two is the profit.

The trading cycle runs every 30 seconds: the bot checks the price, adjusts the grid if needed, and executes orders.

### Concrete example

With a grid between 80,000 and 100,000 USDC, 10 levels, 50 USDC per order:

1. The bot places buy orders at 80k, 82k, 84k… and sell orders at 92k, 94k, 96k…
2. Price drops to 84k → a buy order is filled
3. Price climbs back to 86k → a sell order is filled
4. The bot pockets the difference (~2k USDC spread × the BTC quantity)

## Prerequisites

- A [Kraken](https://www.kraken.com) account with API keys (permissions: query balances, create orders)
- [Docker](https://www.docker.com) installed on the machine that will host the bot

## Installation

1. Create a `.env` file with your configuration:

```env
# Kraken API keys
NITRO_KRAKEN_API_KEY=your-api-key
NITRO_KRAKEN_PRIVATE_KEY=your-private-key

# Dashboard access protection (optional)
NITRO_API_TOKEN=a-secret-token

# Grid parameters
NITRO_GRID_LOWER_PRICE=80000
NITRO_GRID_UPPER_PRICE=100000
NITRO_GRID_LEVELS=10
NITRO_ORDER_SIZE_USDC=50

# Sandbox mode: test without placing real orders
NITRO_SANDBOX_MODE=true
```

2. Start the bot:

```bash
docker compose up -d
```

The dashboard is available at `http://localhost:3100/stats`.

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `NITRO_GRID_LOWER_PRICE` | Lower bound of the grid (in USDC) | `80000` |
| `NITRO_GRID_UPPER_PRICE` | Upper bound of the grid (in USDC) | `100000` |
| `NITRO_GRID_LEVELS` | Number of levels in the grid | `10` |
| `NITRO_ORDER_SIZE_USDC` | Amount per order (in USDC) | `50` |
| `NITRO_SANDBOX_MODE` | `true` = orders are validated by Kraken but not executed | `true` |

## Getting started gradually

It's recommended to start cautiously:

1. **Sandbox** — Keep `SANDBOX_MODE=true` to verify everything works without risk. Orders are validated by Kraken but never executed.
2. **Micro-live** — Go live with minimal parameters: 3 levels, 10 USDC per order (~30 USDC committed total).
3. **Production** — Once confident, scale up to 10 levels and 50 USDC per order.

## iOS app

A companion iOS app lets you monitor the bot's performance (P&L, trades, open orders, balances) directly from your iPhone, with a home screen widget.


