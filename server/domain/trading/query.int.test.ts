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
  test('completed trade has status completed with buyOrder and sellOrder', async () => {
    const gridId = randomGridId()
    const buyOrder = makeOrder({
      gridId,
      side: 'buy',
      level: GridLevel(2),
      status: 'traded',
      price: BtcPrice(90000),
      createdAt: Timestamp('2024-01-01T10:00:00.000Z'),
      updatedAt: Timestamp('2024-01-01T11:00:00.000Z'),
    })
    const sellOrder = makeOrder({
      gridId,
      side: 'sell',
      level: GridLevel(3),
      status: 'traded',
      price: BtcPrice(100000),
      createdAt: Timestamp('2024-01-01T11:00:00.000Z'),
      updatedAt: Timestamp('2024-01-01T14:00:00.000Z'),
    })
    await repository.saveOrder(buyOrder)
    await repository.saveOrder(sellOrder)

    const trade = makeTrade({
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyPrice: BtcPrice(90000),
      sellPrice: BtcPrice(100000),
    })
    await repository.saveTrade(trade)

    const trades = await TradingQuery.getTrades()
    const found = trades.find((t) => t.id === trade.id)
    expect(found).toBeDefined()
    expect(found?.status).toBe('completed')
    expect(found?.level).toBe(GridLevel(2))
    if (found?.status === 'completed') {
      expect(found.buyOrder.filledAt).toBe(buyOrder.updatedAt)
      expect(found.sellOrder.filledAt).toBe(sellOrder.updatedAt)
      expect(found.profitUsdc).toBe(trade.profitUsdc)
    }
  })

  test('filled buy order with matching sell → status selling', async () => {
    const gridId = randomGridId()
    const gridConfig = makeGridConfig({ id: gridId, spacing: BtcPrice(500) })
    await repository.saveGridConfig(gridConfig)

    const filledBuy = makeOrder({
      gridId,
      side: 'buy',
      level: GridLevel(3),
      status: 'filled',
      price: BtcPrice(84000),
      createdAt: Timestamp('2024-01-01T10:00:00.000Z'),
      updatedAt: Timestamp('2024-01-01T10:15:00.000Z'),
    })
    const openSell = makeOrder({
      gridId,
      side: 'sell',
      level: GridLevel(4),
      status: 'open',
      price: BtcPrice(84500),
      createdAt: Timestamp('2024-01-01T10:15:00.000Z'),
      updatedAt: Timestamp('2024-01-01T10:15:00.000Z'),
    })
    await repository.saveOrder(filledBuy)
    await repository.saveOrder(openSell)

    const trades = await TradingQuery.getTrades()
    const found = trades.find((t) => t.status === 'selling')
    expect(found).toBeDefined()
    expect(found?.status).toBe('selling')
    if (found?.status === 'selling') {
      expect(found.buyOrder.filledAt).toBe(filledBuy.updatedAt)
      expect(found.sellOrder.price).toBe(BtcPrice(84500))
    }
  })

  test('open buy order → status buying with expectedSellPrice', async () => {
    const gridConfig = makeGridConfig({ spacing: BtcPrice(500) })
    await repository.saveGridConfig(gridConfig)

    const openBuy = makeOrder({
      gridId: gridConfig.id,
      side: 'buy',
      level: GridLevel(7),
      status: 'open',
      price: BtcPrice(86000),
    })
    await repository.saveOrder(openBuy)

    const trades = await TradingQuery.getTrades()
    const found = trades.find((t) => t.status === 'buying')
    expect(found).toBeDefined()
    if (found?.status === 'buying') {
      expect(found.buyOrder.price).toBe(BtcPrice(86000))
      expect(found.expectedSellPrice).toBe(BtcPrice(86500))
    }
  })

  test('open sell standalone → status pending-sell with expectedBuyPrice', async () => {
    const gridConfig = makeGridConfig({ spacing: BtcPrice(500) })
    await repository.saveGridConfig(gridConfig)

    const openSell = makeOrder({
      gridId: gridConfig.id,
      side: 'sell',
      level: GridLevel(8),
      status: 'open',
      price: BtcPrice(86500),
    })
    await repository.saveOrder(openSell)

    const trades = await TradingQuery.getTrades()
    const found = trades.find((t) => t.status === 'pending-sell')
    expect(found).toBeDefined()
    if (found?.status === 'pending-sell') {
      expect(found.sellOrder.price).toBe(BtcPrice(86500))
      expect(found.expectedBuyPrice).toBe(BtcPrice(86000))
    }
  })

  test('excludes traded and cancelled orders from active trades', async () => {
    await repository.saveOrder(makeOrder({ status: 'cancelled', side: 'buy' }))
    await repository.saveOrder(makeOrder({ status: 'traded', side: 'buy' }))

    const trades = await TradingQuery.getTrades()
    expect(trades.filter((t) => t.status === 'buying')).toHaveLength(0)
  })

  test('sorts by updatedAt descending', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    const order1 = makeOrder({
      gridId: gridConfig.id,
      status: 'open',
      side: 'buy',
      updatedAt: Timestamp('2024-01-01T00:00:00.000Z'),
    })
    const order2 = makeOrder({
      gridId: gridConfig.id,
      status: 'open',
      side: 'buy',
      updatedAt: Timestamp('2024-01-01T00:00:01.000Z'),
    })
    await repository.saveOrder(order1)
    await repository.saveOrder(order2)

    const trades = await TradingQuery.getTrades()
    const buyingTrades = trades.filter((t) => t.status === 'buying')
    expect(buyingTrades.length).toBeGreaterThanOrEqual(2)
    expect(new Date(buyingTrades[0].updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(buyingTrades[1].updatedAt).getTime(),
    )
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
    expect(stats.pendingTradeCount).toBe(2)
    expect(stats.gridConfig).toEqual(gridConfig)
    expect(stats.sandboxMode).toBe(true)
  })
})
