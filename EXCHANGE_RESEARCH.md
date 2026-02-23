# Cryptocurrency Exchange Research for Trading Bot (BTC/ETH <-> Stablecoins)

> Research date: February 2026
> Target: Trading bot operating from France/EU, trading BTC and ETH against stablecoins

---

## CRITICAL: USDT is No Longer Available in the EU

**Before diving into individual exchanges, the single most important finding:**

Under MiCA (Markets in Crypto-Assets) regulation, **USDT (Tether) has been effectively banned from EU exchanges** since March-July 2025. Tether has not pursued MiCA compliance, and all major exchanges have delisted USDT for EEA users:

- **Kraken**: USDT placed in "sell-only" mode March 24, 2025; fully disabled March 31, 2025
- **Binance**: Delisted USDT spot trading pairs for EEA users (March 2025)
- **Crypto.com**: Stopped offering USDT by January 31, 2025
- **OKX / Revolut**: Also delisted

**Consequence for your bot: You should focus on USDC pairs (BTC/USDC, ETH/USDC) and EUR pairs (BTC/EUR, ETH/EUR) instead of USDT.**

USDC (issued by Circle) is MiCA-compliant and remains fully available on all EU exchanges.

---

## 1. Kraken

### Regulation & EU/France Availability
- **MiCA Licensed**: Yes - Kraken is live across all 30 EEA countries under MiCA (via Central Bank of Ireland license, Payward Europe Solutions Limited, Reg No. C468360)
- **France**: Fully available. Previously held PSAN registration, now operating under unified MiCA license
- **Additional licenses**: EMI license (March 2025), MiFID license (February 2025)
- **Verdict**: **Excellent regulatory standing in France/EU**

### Trading Fees
| Volume (30-day) | Maker | Taker |
|-----------------|-------|-------|
| $0 - $10,000 | 0.25% | 0.40% |
| $10,001 - $50,000 | 0.20% | 0.35% |
| $50,001 - $100,000 | 0.14% | 0.24% |
| $100,001 - $250,000 | 0.12% | 0.22% |
| $250,001 - $500,000 | 0.10% | 0.20% |
| $500,001 - $1,000,000 | 0.08% | 0.18% |
| $1M+ | 0.06% | 0.16% |
| $10M+ | 0.00% | 0.10% |

- **Kraken+ membership**: $4.99/month for zero-fee trading up to $20,000 monthly volume
- **Stablecoin pairs**: Generally lower fees (some at 0.20%/0.20%)

### Available Trading Pairs (EU)
- BTC/USDC, ETH/USDC (available)
- BTC/EUR, ETH/EUR (available, high liquidity)
- ~~BTC/USDT, ETH/USDT~~ (no longer available for EU users)

### Minimum Trade Amounts
- BTC: 0.0001 BTC (~$10 at current prices)
- ETH: 0.01 ETH (~$27 at current prices)
- General minimum: ~1 USD equivalent

### API Quality
- **REST API**: Full-featured, well-documented at docs.kraken.com
- **WebSocket API v2**: Real-time orderbook, trades, OHLC, own orders/trades
- **Rate Limits**: Reasonable, with separate limits for public/private endpoints
- **Documentation**: Excellent - comprehensive API center with examples

### Sandbox/Testnet
- **Available**: Yes, Kraken provides a sandbox environment for testing API integrations

### Node.js/TypeScript SDKs
- `@siebly/kraken-api` - Complete REST + WebSocket, TypeScript, well-tested (actively maintained)
- `node-kraken-api` - Typed REST/WS client
- `ts-kraken` - Strongly typed TypeScript library
- `kraken-com-api-node-ts` - Async client with TypeScript
- Also supported by **CCXT** (unified multi-exchange library)

### Kraken Score: 9/10
Pros: MiCA licensed, great API docs, good fees, sandbox, multiple TS SDKs
Cons: Fees slightly higher than Binance at low volumes

---

## 2. Binance

### Regulation & EU/France Availability
- **MiCA Status**: **Uncertain/Problematic**. As of mid-2025, Binance was notably absent from the list of 53 firms with MiCA licenses. The French ACPR flagged Binance for compliance issues in late 2024.
- **France**: Under scrutiny by French regulators (ACPR). Binance must secure compliance by July 1, 2026 deadline or cease EU operations.
- **Current status**: Operating under transitional provisions, but regulatory future in EU is uncertain
- **Verdict**: **Regulatory risk for EU-based bot operations**

### Trading Fees
| Volume (30-day) | Maker | Taker |
|-----------------|-------|-------|
| < $1M (Regular) | 0.10% | 0.10% |
| $1M - $5M (VIP 1) | 0.09% | 0.10% |
| $5M - $10M (VIP 2) | 0.08% | 0.10% |
| Higher VIP levels | down to 0.02% | down to 0.04% |

- **BNB discount**: ~25% off fees when paying with BNB
- **USDC pairs**: Taker may drop to 0.095%
- **Zero-fee promotions**: Binance periodically offers zero-fee BTC trading

### Available Trading Pairs (EU)
- BTC/USDC, ETH/USDC (available)
- BTC/EUR, ETH/EUR (available)
- ~~BTC/USDT, ETH/USDT~~ (delisted for EEA users as of March 2025)

### Minimum Trade Amounts
- Generally ~10 USDC or equivalent per trade
- BTC: ~0.00001 BTC (very low)

### API Quality
- **REST API**: Very comprehensive, well-documented
- **WebSocket Streams**: Excellent real-time data (orderbook, trades, klines, user data)
- **Rate Limits**: Generous but complex weight system
- **Documentation**: Excellent - Binance Open Platform with detailed docs

### Sandbox/Testnet
- **Available**: Yes - `https://testnet.binance.vision` for spot
- **Demo Trading**: Uses real market data with simulated trading (set `demoTrading: true`)
- Very well-maintained testnet environment

### Node.js/TypeScript SDKs
- `binance` (by tiagosiebler) - Full REST + WebSocket, TypeScript, actively maintained, testnet support built-in
- `binance-api-node` - Popular, TypeScript support
- `node-binance-api` - Mature library with testnet support
- Also supported by **CCXT**

### Binance Score: 7/10
Pros: Lowest base fees, best API/SDK ecosystem, excellent testnet, highest liquidity
Cons: **Major regulatory uncertainty in EU**, USDT delisted, may lose EU access by July 2026

---

## 3. Coinbase Advanced Trade

### Regulation & EU/France Availability
- **MiCA/EU Licensed**: Yes - Coinbase Financial Services Europe Ltd. (CySEC License 374/19)
- **France**: Available for EU/EEA customers
- **Additional**: Strong regulatory compliance track record globally
- **Verdict**: **Strong regulatory standing in EU**

### Trading Fees
| Volume (30-day) | Maker | Taker |
|-----------------|-------|-------|
| < $1K | 0.60% | 1.20% |
| $1K - $10K | 0.40% | 0.60% |
| $10K - $50K | 0.25% | 0.40% |
| $50K - $100K | 0.15% | 0.25% |
| $100K - $500K | 0.10% | 0.18% |
| $500K+ | 0.08% | 0.15% |
| $250M+ | 0.00% | 0.05% |

- **Stablecoin pairs**: Maker starts at 0.00%, taker 0.10%-0.45%
- **Volume upgrade program**: Fast-track to 0.0% maker with proof of $500K+ monthly volume on another exchange

### Available Trading Pairs (EU)
- BTC/USDC, ETH/USDC (available - USDC is Coinbase/Circle's own stablecoin)
- BTC/EUR, ETH/EUR (available)
- Particularly strong USDC liquidity (Circle/Coinbase partnership)

### Minimum Trade Amounts
- Generally ~1 USD equivalent
- Very accessible minimums

### API Quality
- **REST API**: Well-documented Advanced Trade API
- **WebSocket**: Real-time market data and order updates
- **Documentation**: Good - Coinbase Developer Platform (docs.cdp.coinbase.com)
- **Note**: API was migrated from Coinbase Pro; some older docs may reference deprecated endpoints

### Sandbox/Testnet
- **Available**: Yes - `https://api-sandbox.coinbase.com/api/v3`
- Uses testnet Bitcoin (no real funds needed)
- Mimics live API structure accurately

### Node.js/TypeScript SDKs
- `coinbase-api` (by tiagosiebler) - REST + WebSocket, TypeScript, actively maintained
- `coinbase-advanced-node` - TypeScript, tested
- `coinbase-sdk-nodejs` - Official Coinbase SDK
- Also supported by **CCXT**

### Coinbase Score: 7.5/10
Pros: Best for USDC pairs (0% maker), strong regulation, good sandbox, official SDK
Cons: **Highest fees at low volumes** (0.60%/1.20% under $1K), fee structure complex

---

## 4. Bitstamp

### Regulation & EU/France Availability
- **MiCA/EU Licensed**: Yes - Bitstamp is a fully MiFID MTF-licensed platform (2024), preparing derivative trading in Europe
- **France**: Available for EU/EEA customers
- **History**: One of the oldest exchanges (founded 2011), Luxembourg-based, strong EU roots
- **Note**: Delisted USDT for EU users (converted to USDC) in May 2025
- **Verdict**: **Very strong regulatory standing, EU-native exchange**

### Trading Fees
| Volume (30-day) | Maker | Taker |
|-----------------|-------|-------|
| < $10,000 | 0.30% | 0.40% |
| $10,000 - $20,000 | 0.24% | 0.34% |
| $20,000 - $100,000 | 0.16% | 0.24% |
| $100,000 - $200,000 | 0.12% | 0.22% |
| $200,000 - $600,000 | 0.08% | 0.15% |
| $600,000 - $2M | 0.06% | 0.13% |
| $2M+ | 0.04% | 0.10% |
| $1B+ | 0.00% | 0.03% |

### Available Trading Pairs (EU)
- BTC/USDC, ETH/USDC (available)
- BTC/EUR, ETH/EUR (available, good liquidity)
- ~~BTC/USDT, ETH/USDT~~ (USDT converted to USDC for EU users, May 2025)

### Minimum Trade Amounts
- Generally around 10-25 USD/EUR equivalent
- Varies by trading pair

### API Quality
- **REST API v2**: Functional but somewhat dated compared to competitors
- **WebSocket**: Available for real-time data
- **Documentation**: Adequate but not as polished as Kraken or Binance
- **Rate Limits**: Standard

### Sandbox/Testnet
- **Available**: Yes - Bitstamp provides a sandbox that mimics the live API structure with separate keys

### Node.js/TypeScript SDKs
- `node-bitstamp` - REST + WebSocket client (community maintained)
- `bitstamp` - Basic REST wrapper
- `bitstamp-api` - Another community wrapper
- **TypeScript support**: Limited/unclear in dedicated packages
- Supported by **CCXT** (recommended approach)

### Bitstamp Score: 6.5/10
Pros: Oldest EU exchange, strong regulation, proactive on MiCA compliance
Cons: API docs less polished, limited TypeScript SDKs, higher minimum fees, lower liquidity than top exchanges

---

## 5. KuCoin

### Regulation & EU/France Availability
- **MiCA Licensed**: Yes - KuCoin EU Exchange GmbH obtained MiCAR license in Austria (November 2025)
- **France**: Covered under the MiCA passporting to 29 EEA countries including France
- **Note**: Malta is excluded from their license
- **Verdict**: **Recently licensed, legitimate EU access**

### Trading Fees
| Volume (30-day) | Maker | Taker |
|-----------------|-------|-------|
| < $50K (Level 0) | 0.10% | 0.12% |
| $50K - $500K (Level 1) | 0.08% | 0.10% |
| $500K - $2M (Level 2) | 0.06% | 0.08% |
| Higher levels | down to 0.00% | down to 0.04% |

- **KCS token discount**: 1-20% off trading fees
- Base fees are very competitive

### Available Trading Pairs (EU)
- BTC/USDC, ETH/USDC (available)
- BTC/EUR, ETH/EUR (likely available under EU platform)
- USDT pairs may be restricted for EU users under MiCA

### Minimum Trade Amounts
- Generally very low (~0.1 USDC or equivalent)
- KuCoin is known for low minimums

### API Quality
- **REST API v3**: Well-documented, comprehensive
- **WebSocket**: Full real-time data support
- **Documentation**: Good - recently revamped API docs
- **Rate Limits**: Reasonable

### Sandbox/Testnet
- **Available**: Yes - `sandbox.kucoin.com` with separate API keys
- Well-documented sandbox environment

### Node.js/TypeScript SDKs
- KuCoin provides official API documentation with examples
- Community SDKs available on npm
- Supported by **CCXT** (recommended approach)

### KuCoin Score: 7.5/10
Pros: Lowest base fees, good sandbox, recently MiCA-licensed, good API
Cons: Newer to EU regulation, less established than Kraken/Coinbase in EU

---

## Trading Strategies Overview

### 1. DCA (Dollar Cost Averaging)
- **How it works**: Buy a fixed EUR/USDC amount of BTC or ETH at regular intervals (hourly, daily, weekly) regardless of price
- **Complexity**: Very Low - simplest strategy to implement
- **Risk**: Low - smooths out volatility over time
- **Best for**: Long-term accumulation, beginners
- **Implementation**: Simple cron job + market/limit order
- **Bot requirements**: Scheduled execution, basic order placement
- **Typical returns**: Matches market average over time

### 2. Grid Trading
- **How it works**: Place buy and sell limit orders at predefined price intervals (a "grid") within a price range. Buy when price drops to a grid level, sell when it rises to the next level
- **Complexity**: Medium - needs price range definition and grid management
- **Risk**: Medium - works well in sideways/ranging markets, loses in strong trends
- **Best for**: Sideways markets, generating small consistent profits
- **Bot requirements**: Multiple limit order management, price monitoring, grid recalculation
- **Typical grid**: 10-20 levels, 0.5%-2% spacing

### 3. Simple Moving Average (SMA) Crossover
- **How it works**: Buy when short-term MA (e.g., 20-period) crosses above long-term MA (e.g., 50-period); sell when it crosses below
- **Complexity**: Medium - needs historical data, MA calculation, signal detection
- **Risk**: Medium-High - subject to false signals in choppy markets ("whipsaws")
- **Best for**: Trending markets
- **Bot requirements**: OHLC data collection, indicator calculation, signal generation
- **Common pairs**: SMA(20)/SMA(50), SMA(50)/SMA(200) ("Golden Cross"/"Death Cross")

### 4. RSI-Based Trading
- **How it works**: Buy when RSI drops below 30 (oversold), sell when RSI exceeds 70 (overbought)
- **Complexity**: Medium - needs RSI calculation (14-period standard)
- **Risk**: Medium - RSI can stay overbought/oversold for extended periods in strong trends
- **Best for**: Range-bound markets, mean-reversion plays
- **Bot requirements**: OHLC data, RSI calculation, threshold monitoring
- **Enhancements**: Combine with other indicators (MACD, volume) for confirmation

### Strategy Recommendation for Beginners
Start with **DCA** for safety and simplicity, then graduate to **Grid Trading** on USDC pairs for more active profit generation. The technical indicator strategies (SMA, RSI) require more backtesting and tuning.

---

## Comparison Summary Table

| Feature | Kraken | Binance | Coinbase | Bitstamp | KuCoin |
|---------|--------|---------|----------|----------|--------|
| **Base Maker Fee** | 0.25% | 0.10% | 0.40-0.60% | 0.30% | 0.10% |
| **Base Taker Fee** | 0.40% | 0.10% | 0.60-1.20% | 0.40% | 0.12% |
| **USDC Pairs** | Yes | Yes | Yes (best) | Yes | Yes |
| **EUR Pairs** | Yes | Yes | Yes | Yes | Yes |
| **EU/France Legal** | Yes (MiCA) | Uncertain | Yes (CySEC) | Yes (MiFID) | Yes (MiCA) |
| **Sandbox/Testnet** | Yes | Yes (best) | Yes | Yes | Yes |
| **TypeScript SDK** | Good | Excellent | Good | Limited | Moderate |
| **API Docs Quality** | Excellent | Excellent | Good | Adequate | Good |
| **WebSocket API** | Yes (v2) | Yes | Yes | Yes | Yes |
| **Liquidity** | High | Highest | High | Medium | High |
| **CCXT Support** | Yes | Yes | Yes | Yes | Yes |
| **Overall Score** | 9/10 | 7/10 | 7.5/10 | 6.5/10 | 7.5/10 |

---

## Final Recommendation for France-Based Bot Developer

### Primary Choice: Kraken (Recommended)

**Why Kraken wins for your use case:**

1. **Regulatory excellence**: Full MiCA license, operating legally across all 30 EEA countries. No regulatory uncertainty. Already held PSAN in France before MiCA.

2. **Good fee structure**: 0.25%/0.40% base isn't the cheapest, but the **Kraken+ membership at 4.99 EUR/month gives zero fees up to 20,000 EUR** monthly volume - which is outstanding for a starting bot.

3. **USDC pairs available**: BTC/USDC, ETH/USDC, plus strong BTC/EUR and ETH/EUR liquidity.

4. **API quality**: Excellent REST + WebSocket v2 APIs with comprehensive documentation. Multiple well-maintained TypeScript SDKs available.

5. **Sandbox for development**: Test your bot safely before going live.

6. **EUR banking**: Smooth SEPA deposits/withdrawals for French bank accounts.

### Secondary Choice: KuCoin (Best Fees)

If raw fee minimization is the priority, KuCoin offers 0.10%/0.12% base fees (lowest available) and now has a MiCA license. However, it's newer to EU regulation.

### For USDC-Heavy Trading: Coinbase Advanced Trade

If you'll primarily trade USDC pairs, Coinbase's 0.00% maker fee on stablecoin pairs is unbeatable. But general fees are the highest of all options.

### Avoid for EU: Binance

Despite having the best overall API ecosystem and competitive fees, **Binance's regulatory situation in France/EU is too uncertain** to build a long-term bot around. If they fail to secure MiCA compliance by July 2026, your bot would stop working.

### Recommended Architecture

```
Primary Exchange:  Kraken (regulated, good fees with Kraken+, great API)
Stablecoin:        USDC (MiCA compliant, not USDT)
Trading Pairs:     BTC/USDC, ETH/USDC, BTC/EUR, ETH/EUR
Library:           CCXT (unified API, supports all exchanges, TypeScript)
                   OR @siebly/kraken-api (Kraken-specific, TypeScript)
Strategy (start):  DCA -> then Grid Trading
Testnet:           Kraken sandbox for initial development
```

### Suggested Tech Stack

```
Runtime:           Node.js (LTS)
Language:          TypeScript
Exchange Library:  ccxt (npm) - supports 100+ exchanges with unified API
                   Allows easy switching between exchanges later
HTTP Client:       Built into ccxt / axios for custom calls
WebSocket:         Built into ccxt / ws for custom streams
Scheduling:        node-cron for DCA intervals
Database:          SQLite (via better-sqlite3) for trade history
Indicators:        technicalindicators (npm) for SMA, RSI, etc.
```

---

## Sources

- [Kraken Fee Schedule](https://www.kraken.com/features/fee-schedule)
- [Kraken API Center](https://docs.kraken.com/)
- [Kraken MiCA License Announcement](https://blog.kraken.com/news/all-30-eea-countries-mica)
- [Kraken AMF White List](https://www.amf-france.org/en/warnings/white-lists/daspcasp/payward-europe-solutions-limited-kraken-digital-asset-exchange-kraken)
- [Binance EU MiCA Status](https://cryptoslate.com/eu-grants-mica-licenses-to-53-crypto-firms-tether-binance-left-behind/)
- [Binance France ACPR Issues](https://finance.yahoo.com/news/binance-scrutinized-french-regulator-mica-114615977.html)
- [Binance Node.js SDK](https://github.com/tiagosiebler/binance)
- [Binance Testnet](https://developers.binance.com/docs/binance-spot-api-docs/testnet)
- [Coinbase Advanced Trade Fees](https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees)
- [Coinbase Advanced Trade API](https://www.coinbase.com/developer-platform/products/advanced-trade-api)
- [Coinbase API Sandbox](https://docs.cdp.coinbase.com/coinbase-app/docs/trade/rest-api-sandbox)
- [Coinbase Node.js SDK](https://github.com/tiagosiebler/coinbase-api)
- [Bitstamp Fee Schedule](https://www.bitstamp.net/fee-schedule/)
- [Bitstamp API](https://www.bitstamp.net/api/)
- [Bitstamp MiCA Compliance](https://cryptoslate.com/crypto-exchanges/bitstamp-exchange-review/)
- [KuCoin Fee Schedule](https://tradersunion.com/brokers/crypto/view/kucoin/fees/)
- [KuCoin API Docs](https://www.kucoin.com/docs-new/introduction)
- [KuCoin Sandbox](https://www.kucoin.com/docs/beginners/sandbox)
- [KuCoin MiCA License](https://www.kucoin.com/blog/en-kucoin-secures-landmark-micar-license-expanding-regulated-digital-asset-services-across-europe)
- [USDT EU Ban / MiCA](https://coredo.eu/why-usdt-are-banned-in-the-eu/)
- [USDT Delisting Overview](https://vaultody.com/blog/296-what-mica-means-for-tether-usdt-delistings-custody-and-the-future-of-stablecoins-in-the-eea)
- [CCXT Library](https://github.com/ccxt/ccxt)
- [MiCA Regulation Guide](https://fintechobserve.com/mica-eu-crypto-regulation-guide/)
- [Trading Bot Strategies](https://arbitragescanner.io/blog/trading-bot-strategies-how-to-automate-profitable-cryptocurrency-trading)
