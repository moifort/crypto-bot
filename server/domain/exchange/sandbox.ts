import * as kraken from '~/domain/exchange/kraken'
import type {
  KrakenBalance,
  KrakenOrderInfo,
  KrakenOrderResult,
  Ticker,
} from '~/domain/exchange/types'
import { Btc, Usdc } from '~/domain/shared/primitives'
import type { BtcPrice as BtcPriceType, Btc as BtcType } from '~/domain/shared/types'
import { KrakenOrderId as KrakenOrderIdPrimitive } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import type { KrakenOrderId, OrderSide } from '~/domain/trading/types'

export const getTicker = (): Promise<Ticker> => kraken.getTicker()

export const getBalance = async (): Promise<KrakenBalance> => {
  const [gridConfig, orders, trades, ticker] = await Promise.all([
    repository.getGridConfig(),
    repository.findAllOrders(),
    repository.findAllTrades(),
    kraken.getTicker(),
  ])
  if (!gridConfig) return { usdc: Usdc(0), btc: Btc(0) }

  const totalProfit = trades.reduce((sum, t) => sum + Number(t.profitUsdc), 0)
  const heldBtc = orders
    .filter((o) => o.side === 'buy' && o.status === 'filled')
    .reduce((sum, o) => sum + Number(o.sizeBtc), 0)
  const simulatedUsdc =
    gridConfig.levels * Number(gridConfig.orderSizeUsdc) +
    totalProfit -
    heldBtc * Number(ticker.last)

  return {
    usdc: Usdc(Math.max(0, simulatedUsdc)),
    btc: Btc(heldBtc),
  }
}

export const placeOrder = async (
  side: OrderSide,
  price: BtcPriceType,
  volume: BtcType,
): Promise<KrakenOrderResult> => {
  const { description } = await kraken.validateOrder(side, price, volume)
  return {
    orderId: KrakenOrderIdPrimitive(`sandbox-${Date.now()}`),
    description,
  }
}

export const queryOrders = async (orderIds: KrakenOrderId[]): Promise<KrakenOrderInfo[]> => {
  if (orderIds.length === 0) return []
  const [ticker, allOrders] = await Promise.all([kraken.getTicker(), repository.findAllOrders()])
  const currentPrice = Number(ticker.last)

  const results: KrakenOrderInfo[] = []
  for (const id of orderIds) {
    const order = allOrders.find((o) => o.krakenOrderId === id)
    if (!order) continue

    const filled =
      (order.side === 'buy' && currentPrice <= Number(order.price)) ||
      (order.side === 'sell' && currentPrice >= Number(order.price))

    results.push({
      orderId: id,
      status: filled ? 'closed' : 'open',
      side: order.side,
      price: order.price,
      volume: order.sizeBtc,
      volumeExecuted: filled ? order.sizeBtc : Btc(0),
      fee: filled ? Usdc(Number(order.sizeUsdc) * 0.0025) : Usdc(0),
    })
  }
  return results
}

export const getOpenOrders = async (): Promise<KrakenOrderInfo[]> => {
  const orders = await repository.findAllOrders()
  return orders
    .filter((o) => o.status === 'open' && o.krakenOrderId)
    .map((o) => ({
      orderId: o.krakenOrderId as KrakenOrderId,
      status: 'open' as const,
      side: o.side,
      price: o.price,
      volume: o.sizeBtc,
      volumeExecuted: Btc(0),
      fee: Usdc(0),
    }))
}

export const cancelOrder = async (_orderId: KrakenOrderId): Promise<void> => {}
