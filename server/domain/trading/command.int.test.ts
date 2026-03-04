import { beforeEach, describe, expect, test } from 'bun:test'
import type { KrakenOrderInfo, KrakenOrderResult } from '~/domain/exchange/types'
import { Btc, BtcPrice, nowTimestamp, Usdc } from '~/domain/shared/primitives'
import { TradingCommand } from '~/domain/trading/command'
import { GridLevel, KrakenOrderId, randomGridId, randomOrderId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import type { GridConfig, GridOrder } from '~/domain/trading/types'
import { exchangeMocks } from '~/test/setup'

const makeGridConfig = (overrides?: Partial<GridConfig>): GridConfig => ({
  id: randomGridId(),
  lowerPrice: BtcPrice(80000),
  upperPrice: BtcPrice(120000),
  levels: 5,
  orderSizeUsdc: Usdc(100),
  spacing: BtcPrice(10000),
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

beforeEach(() => {
  exchangeMocks.getTicker.mockClear()
  exchangeMocks.queryOrders.mockClear()
  exchangeMocks.placeOrder.mockClear()
  exchangeMocks.getTicker.mockImplementation(() =>
    Promise.resolve({ ask: BtcPrice(100100), bid: BtcPrice(99900), last: BtcPrice(100000) }),
  )
  exchangeMocks.queryOrders.mockImplementation(() => Promise.resolve([]))
  exchangeMocks.placeOrder.mockImplementation(() =>
    Promise.resolve({
      orderId: 'KRAKEN-001',
      description: 'test',
    } as unknown as KrakenOrderResult),
  )
})

describe('initializeGrid', () => {
  test('creates config from env when none exists', async () => {
    const result = await TradingCommand.initializeGrid()
    expect(result).not.toHaveProperty('kind')
    const config = result as Exclude<typeof result, { kind: string }>
    expect(config.lowerPrice).toBe(BtcPrice(80000))
    expect(config.upperPrice).toBe(BtcPrice(120000))
    expect(config.levels).toBe(5)
    expect(config.orderSizeUsdc).toBe(Usdc(100))
    expect(config.spacing).toBe(BtcPrice(10000))
  })

  test('returns existing config if already present', async () => {
    const existing = makeGridConfig()
    await repository.saveGridConfig(existing)
    const result = await TradingCommand.initializeGrid()
    expect(result).not.toHaveProperty('kind')
    expect(result).toEqual(existing)
  })
})

describe('executeCycle', () => {
  test('reconciles filled orders', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    const order = makeOrder({
      gridId: gridConfig.id,
      krakenOrderId: KrakenOrderId('KRAKEN-001'),
      status: 'open',
      side: 'buy',
      level: GridLevel(1),
    })
    await repository.saveOrder(order)

    exchangeMocks.queryOrders.mockImplementation(() =>
      Promise.resolve([
        {
          orderId: 'KRAKEN-001',
          status: 'closed',
          side: 'buy',
          price: BtcPrice(90000),
          volume: Btc(0.00111),
          volumeExecuted: Btc(0.00111),
          fee: Usdc(0.1),
        } as KrakenOrderInfo,
      ]),
    )

    await TradingCommand.executeCycle()

    const orders = await repository.findAllOrders()
    const filledOrder = orders.find((o) => o.id === order.id)
    expect(filledOrder?.status).toBe('filled')
    expect(filledOrder?.fee).toBe(Usdc(0.1))
  })

  test('matches trades when buy and sell are filled at adjacent levels', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    const buyOrder = makeOrder({
      gridId: gridConfig.id,
      krakenOrderId: KrakenOrderId('KRAKEN-BUY'),
      side: 'buy',
      price: BtcPrice(90000),
      level: GridLevel(1),
      status: 'open',
    })

    const sellOrder = makeOrder({
      gridId: gridConfig.id,
      side: 'sell',
      price: BtcPrice(100000),
      level: GridLevel(2),
      status: 'filled',
      fee: Usdc(0.2),
    })

    await repository.saveOrder(buyOrder)
    await repository.saveOrder(sellOrder)

    exchangeMocks.queryOrders.mockImplementation(() =>
      Promise.resolve([
        {
          orderId: 'KRAKEN-BUY',
          status: 'closed',
          side: 'buy',
          price: BtcPrice(90000),
          volume: Btc(0.00111),
          volumeExecuted: Btc(0.00111),
          fee: Usdc(0.1),
        } as KrakenOrderInfo,
      ]),
    )

    await TradingCommand.executeCycle()

    const trades = await repository.findAllTrades()
    expect(trades).toHaveLength(1)
    expect(trades[0].buyOrderId).toBe(buyOrder.id)
    expect(trades[0].sellOrderId).toBe(sellOrder.id)

    const orders = await repository.findAllOrders()
    const updatedBuy = orders.find((o) => o.id === buyOrder.id)
    const updatedSell = orders.find((o) => o.id === sellOrder.id)
    expect(updatedBuy?.status).toBe('traded')
    expect(updatedSell?.status).toBe('traded')
  })

  test('places orders at grid levels', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    await TradingCommand.executeCycle()

    expect(exchangeMocks.placeOrder).toHaveBeenCalled()
    const orders = await repository.findAllOrders()
    expect(orders.length).toBeGreaterThan(0)

    const buys = orders.filter((o) => o.side === 'buy')
    const sells = orders.filter((o) => o.side === 'sell')
    buys.forEach((o) => {
      expect(Number(o.price)).toBeLessThan(100000)
    })
    sells.forEach((o) => {
      expect(Number(o.price)).toBeGreaterThan(100000)
    })
  })

  test('skips levels with active orders', async () => {
    const gridConfig = makeGridConfig()
    await repository.saveGridConfig(gridConfig)

    const existingOrder = makeOrder({
      gridId: gridConfig.id,
      side: 'buy',
      price: BtcPrice(80000),
      level: GridLevel(0),
      status: 'open',
    })
    await repository.saveOrder(existingOrder)

    await TradingCommand.executeCycle()

    const orders = await repository.findAllOrders()
    const level0Orders = orders.filter((o) => o.level === GridLevel(0))
    expect(level0Orders).toHaveLength(1)
  })
})
