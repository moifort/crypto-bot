# Crypto Bot

Grid trading bot BTC/USDC sur Kraken.

Place automatiquement des ordres d'achat en dessous du prix actuel et des ordres de vente au-dessus. Chaque oscillation de prix = un petit profit automatique.

## Stack

Bun · Nitro · TypeScript strict · ts-brand · Zod · Kraken REST API

## Setup

```bash
cp .env.example .env
# Remplir les clés API Kraken et paramètres de grid
bun install
bun run dev
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NITRO_KRAKEN_API_KEY` | Clé API Kraken | |
| `NITRO_KRAKEN_PRIVATE_KEY` | Clé privée Kraken | |
| `NITRO_API_TOKEN` | Token Bearer pour `/stats` (optionnel) | |
| `NITRO_GRID_LOWER_PRICE` | Prix bas de la grille (USDC) | `80000` |
| `NITRO_GRID_UPPER_PRICE` | Prix haut de la grille (USDC) | `100000` |
| `NITRO_GRID_LEVELS` | Nombre de niveaux | `10` |
| `NITRO_ORDER_SIZE_USDC` | Taille par ordre (USDC) | `50` |
| `NITRO_SANDBOX_MODE` | Valide les ordres sans exécuter | `true` |

## Endpoints

- `GET /stats` — P&L, trades, ordres ouverts, balances, prix actuel, config grille

## Docker

```bash
docker compose up
```

Port 3100 → 3000. Données persistées dans `./data`.

## Phases de test

1. **Sandbox** (`SANDBOX_MODE=true`) — ordres validés par Kraken mais non exécutés
2. **Micro-live** — `ORDER_SIZE_USDC=10`, 3 niveaux, ~30$ total
3. **Production** — 10 niveaux, 50 USDC/ordre
