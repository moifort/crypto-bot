import { describe, expect, test } from 'bun:test'
import { Btc, BtcPrice, nowTimestamp, SignedUsdc, Usdc } from '~/domain/shared/primitives'
import {
  GridLevel,
  GridVersion,
  randomGridId,
  randomOrderId,
  randomTradeId,
} from '~/domain/trading/primitives'
import {
  findAllOrders,
  findAllTrades,
  findOrderBy,
  getGridConfig,
  getLastCycleAt,
  removeOrder,
  saveGridConfig,
  saveLastCycleAt,
  saveOrder,
  saveTrade,
} from '~/domain/trading/repository'
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

describe('grid config', () => {
  test('save and get round-trip', async () => {
    const config = makeGridConfig()
    await saveGridConfig(config)
    const retrieved = await getGridConfig()
    expect(retrieved).toEqual(config)
  })

  test('returns null when empty', async () => {
    const retrieved = await getGridConfig()
    expect(retrieved).toBeNull()
  })
})

describe('orders', () => {
  test('saveOrder and findAllOrders', async () => {
    const order = makeOrder()
    await saveOrder(order)
    const all = await findAllOrders()
    expect(all).toHaveLength(1)
    expect(all[0]).toEqual(order)
  })

  test('findOrderBy returns the correct order', async () => {
    const order = makeOrder()
    await saveOrder(order)
    const found = await findOrderBy(order.id)
    expect(found).toEqual(order)
  })

  test('findOrderBy returns null for unknown id', async () => {
    const found = await findOrderBy(randomOrderId())
    expect(found).toBeNull()
  })

  test('removeOrder deletes the order', async () => {
    const order = makeOrder()
    await saveOrder(order)
    await removeOrder(order.id)
    const all = await findAllOrders()
    expect(all).toHaveLength(0)
  })
})

describe('trades', () => {
  test('saveTrade and findAllTrades', async () => {
    const trade = makeTrade()
    await saveTrade(trade)
    const all = await findAllTrades()
    expect(all).toHaveLength(1)
    expect(all[0]).toEqual(trade)
  })
})

describe('last cycle', () => {
  test('saveLastCycleAt and getLastCycleAt', async () => {
    const ts = nowTimestamp()
    await saveLastCycleAt(ts)
    const retrieved = await getLastCycleAt()
    expect(retrieved).toBe(ts)
  })

  test('returns null when no cycle recorded', async () => {
    const retrieved = await getLastCycleAt()
    expect(retrieved).toBeNull()
  })
})
