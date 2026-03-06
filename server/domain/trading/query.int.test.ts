import { describe, expect, test } from 'bun:test'
import {
  Btc,
  BtcPrice,
  nowTimestamp,
  SignedUsdc,
  Timestamp,
  Usdc,
} from '~/domain/shared/primitives'
import {
  GridLevel,
  GridVersion,
  randomGridId,
  randomOrderId,
  randomTradeId,
} from '~/domain/trading/primitives'
import { TradingQuery } from '~/domain/trading/query'
import * as repository from '~/domain/trading/repository'
import type { CompletedTrade, GridConfig, GridOrder } from '~/domain/trading/types'

const makeGridConfig = (overrides?: Partial<GridConfig>): GridConfig => ({
  id: randomGridId(),
  lowerPrice: BtcPrice(80000),
  upperPrice: BtcPrice(120000),
  levels: 5,
  orderSizeUsdc: Usdc(100),
  spacing: BtcPrice(10000),
  version: GridVersion(1),
  createdAt: nowTimestamp(),
  ...overrides,
})

const makeOrder = (overrides?: Partial<GridOrder>): GridOrder => ({
  id: randomOrderId(),
  gridId: randomGridId(),
  side: 'buy',
  price: BtcPrice(90000),
  sizeUsdc: Usdc(100),
  sizeBtc: Btc(0.00111),
  level: GridLevel(0),
  status: 'open',
  createdAt: nowTimestamp(),
  updatedAt: nowTimestamp(),
  ...overrides,
})

const makeTrade = (overrides?: Partial<CompletedTrade>): CompletedTrade => ({
  id: randomTradeId(),
  buyOrderId: randomOrderId(),
  sellOrderId: randomOrderId(),
  buyPrice: BtcPrice(90000),
  sellPrice: BtcPrice(100000),
  sizeBtc: Btc(0.001),
  profitUsdc: SignedUsdc(10),
  feeUsdc: Usdc(0.5),
  completedAt: nowTimestamp(),
  ...overrides,
})

describe('getTrades', () => {
  test('enriches trades with level and timestamps', async () => {
    const buyOrder = makeOrder({ side: 'buy', level: GridLevel(2), status: 'traded' })
    const sellOrder = makeOrder({ side: 'sell', level: GridLevel(3), status: 'traded' })
    await repository.saveOrder(buyOrder)
    await repository.saveOrder(sellOrder)

    const trade = makeTrade({
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
    })
    await repository.saveTrade(trade)

    const trades = await TradingQuery.getTrades()
    expect(trades).toHaveLength(1)
    expect(trades[0].level).toBe(GridLevel(2))
    expect(trades[0].buyFilledAt).toBe(buyOrder.updatedAt)
    expect(trades[0].sellFilledAt).toBe(sellOrder.updatedAt)
  })

  test('sorts by completedAt descending', async () => {
    const trade1 = makeTrade({ completedAt: Timestamp('2024-01-01T00:00:00.000Z') })
    const trade2 = makeTrade({ completedAt: Timestamp('2024-01-01T00:00:01.000Z') })

    await repository.saveTrade(trade1)
    await repository.saveTrade(trade2)

    const trades = await TradingQuery.getTrades()
    expect(trades).toHaveLength(2)
    expect(new Date(trades[0].completedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(trades[1].completedAt).getTime(),
    )
  })
})

describe('getOrders', () => {
  test('excludes traded and cancelled orders', async () => {
    await repository.saveOrder(makeOrder({ status: 'open' }))
    await repository.saveOrder(makeOrder({ status: 'pending' }))
    await repository.saveOrder(makeOrder({ status: 'filled' }))
    await repository.saveOrder(makeOrder({ status: 'cancelled' }))
    await repository.saveOrder(makeOrder({ status: 'traded' }))

    const orders = await TradingQuery.getOrders()
    expect(orders).toHaveLength(3)
    expect(orders.every((o) => o.status !== 'traded' && o.status !== 'cancelled')).toBe(true)
  })

  test('sorts by level ascending', async () => {
    await repository.saveOrder(makeOrder({ level: GridLevel(3), status: 'open' }))
    await repository.saveOrder(makeOrder({ level: GridLevel(1), status: 'open' }))
    await repository.saveOrder(makeOrder({ level: GridLevel(2), status: 'open' }))

    const orders = await TradingQuery.getOrders()
    expect(orders[0].level).toBe(GridLevel(1))
    expect(orders[1].level).toBe(GridLevel(2))
    expect(orders[2].level).toBe(GridLevel(3))
  })

  test('strips internal fields', async () => {
    await repository.saveOrder(makeOrder({ status: 'open' }))

    const orders = await TradingQuery.getOrders()
    expect(orders[0]).not.toHaveProperty('gridId')
    expect(orders[0]).not.toHaveProperty('krakenOrderId')
  })
})

describe('getStats', () => {
  test('returns error when grid not initialized', async () => {
    const result = await TradingQuery.getStats()
    expect(result).toEqual({ kind: 'grid-not-initialized' })
  })

  test('aggregates profit, fees, and counts', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    await repository.saveTrade(makeTrade({ profitUsdc: SignedUsdc(10), feeUsdc: Usdc(0.5) }))
    await repository.saveTrade(makeTrade({ profitUsdc: SignedUsdc(20), feeUsdc: Usdc(1.0) }))

    await repository.saveOrder(makeOrder({ status: 'open', side: 'buy' }))
    await repository.saveOrder(makeOrder({ status: 'open', side: 'sell' }))

    const result = await TradingQuery.getStats()
    expect(result).not.toHaveProperty('kind')
    const stats = result as Exclude<typeof result, { kind: string }>
    expect(stats.totalProfitUsdc).toBe(SignedUsdc(30))
    expect(stats.totalFeesUsdc).toBe(Usdc(1.5))
    expect(stats.tradeCount).toBe(2)
    expect(stats.openBuyOrders).toBe(1)
    expect(stats.openSellOrders).toBe(1)
    expect(stats.gridConfig).toEqual(gridConfig)
    expect(stats.sandboxMode).toBe(true)
  })
})
