import { describe, expect, test } from 'bun:test'
import { Btc, BtcPrice, nowTimestamp, Usdc } from '~/domain/shared/primitives'
import { GridLevel, randomGridId, randomOrderId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import handler from '~/routes/orders.get'
import { mockEvent } from '~/test/setup'

describe('GET /orders', () => {
  test('returns { status: 200, data: [...] }', async () => {
    await repository.saveOrder({
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
    })

    const result = await handler(mockEvent() as never)
    expect(result.status).toBe(200)
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
