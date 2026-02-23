import type { Btc, BtcPrice, Usdc } from '~/domain/shared/types'
import type { KrakenOrderId, OrderSide } from '~/domain/trading/types'

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
}
