import type { Brand } from 'ts-brand'
import type { Btc, BtcPrice, SignedUsdc, Timestamp, Usdc } from '~/domain/shared/types'

export type GridId = Brand<string, 'GridId'>
export type OrderId = Brand<string, 'OrderId'>
export type TradeId = Brand<string, 'TradeId'>
export type KrakenOrderId = Brand<string, 'KrakenOrderId'>
export type GridLevel = Brand<number, 'GridLevel'>
export type GridVersion = Brand<number, 'GridVersion'>

export type OrderSide = 'buy' | 'sell'

export type GridConfig = {
  id: GridId
  lowerPrice: BtcPrice
  upperPrice: BtcPrice
  levels: number
  orderSizeUsdc: Usdc
  spacing: BtcPrice
  version: GridVersion
  createdAt: Timestamp
  recenteredAt?: Timestamp
}

export type GridOrder = {
  id: OrderId
  gridId: GridId
  krakenOrderId?: KrakenOrderId
  side: OrderSide
  price: BtcPrice
  sizeUsdc: Usdc
  sizeBtc: Btc
  level: GridLevel
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'traded'
  fee?: Usdc
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type TradingError =
  | { kind: 'grid-not-initialized' }
  | { kind: 'invalid-config'; reason: string }
  | { kind: 'recenter-in-progress' }

export type StatsResult = {
  totalProfitUsdc: SignedUsdc
  totalFeesUsdc: Usdc
  tradeCount: number
  openBuyOrders: number
  openSellOrders: number
  balanceUsdc: Usdc
  balanceBtc: Btc
  currentPrice: BtcPrice
  gridConfig: GridConfig
  lastCycleAt: Timestamp | null | undefined
  sandboxMode: boolean
  sommeMiseUsdc: SignedUsdc
}

export type VolatilityInfo = {
  atr: BtcPrice
  referenceAtr: BtcPrice
  computedAt: Timestamp
}

export type CompletedTrade = {
  id: TradeId
  buyOrderId: OrderId
  sellOrderId: OrderId
  buyPrice: BtcPrice
  sellPrice: BtcPrice
  sizeBtc: Btc
  profitUsdc: SignedUsdc
  feeUsdc: Usdc
  completedAt: Timestamp
}
