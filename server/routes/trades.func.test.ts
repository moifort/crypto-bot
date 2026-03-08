import { describe, expect, test } from 'bun:test'
import { Btc, BtcPrice, nowTimestamp, SignedUsdc, Usdc } from '~/domain/shared/primitives'
import { GridLevel, randomGridId, randomOrderId, randomTradeId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import handler from '~/routes/trades.get'
import { mockEvent } from '~/test/setup'

describe('GET /trades', () => {
  test('returns { status: 200, data: [...] }', async () => {
    const gridId = randomGridId()
    const buyOrder = {
      id: randomOrderId(),
      gridId,
      side: 'buy' as const,
      price: BtcPrice(90000),
      sizeUsdc: Usdc(100),
      sizeBtc: Btc(0.00111),
      level: GridLevel(0),
      status: 'traded' as const,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    }
    const sellOrder = {
      id: randomOrderId(),
      gridId,
      side: 'sell' as const,
      price: BtcPrice(100000),
      sizeUsdc: Usdc(100),
      sizeBtc: Btc(0.001),
      level: GridLevel(1),
      status: 'traded' as const,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    }
    await repository.saveOrder(buyOrder)
    await repository.saveOrder(sellOrder)

    await repository.saveTrade({
      id: randomTradeId(),
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyPrice: BtcPrice(90000),
      sellPrice: BtcPrice(100000),
      sizeBtc: Btc(0.001),
      profitUsdc: SignedUsdc(10),
      feeUsdc: Usdc(0.5),
      completedAt: nowTimestamp(),
    })

    const result = await handler(mockEvent() as never)
    expect(result.status).toBe(200)
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].status).toBe('completed')
  })
})
