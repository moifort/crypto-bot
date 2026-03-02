import type { Btc, BtcPrice, Usdc } from '~/domain/shared/types'
import type { KrakenOrderId, OrderSide } from '~/domain/trading/types'

export type Exchange = {
  getTicker: () => Promise<Ticker>
  getBalance: () => Promise<KrakenBalance>
  placeOrder: (side: OrderSide, price: BtcPrice, volume: Btc) => Promise<KrakenOrderResult>
  queryOrders: (orderIds: KrakenOrderId[]) => Promise<KrakenOrderInfo[]>
  getOpenOrders: () => Promise<KrakenOrderInfo[]>
  cancelOrder: (orderId: KrakenOrderId) => Promise<void>
}

export type Ticker = {
  ask: BtcPrice
  bid: BtcPrice
  last: BtcPrice
}

export type KrakenBalance = {
  usdc: Usdc
  btc: Btc
}

export type KrakenOrderResult = {
  orderId: KrakenOrderId
  description: string
}

export type KrakenOrderStatus = 'pending' | 'open' | 'closed' | 'canceled' | 'expired'

export type KrakenOrderInfo = {
  orderId: KrakenOrderId
  status: KrakenOrderStatus
  side: OrderSide
  price: BtcPrice
  volume: Btc
  volumeExecuted: Btc
  fee: Usdc
}
