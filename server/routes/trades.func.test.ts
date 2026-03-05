import { describe, expect, test } from 'bun:test'
import { Btc, BtcPrice, nowTimestamp, SignedUsdc, Usdc } from '~/domain/shared/primitives'
import { randomOrderId, randomTradeId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import handler from '~/routes/trades.get'
import { mockEvent } from '~/test/setup'

describe('GET /trades', () => {
  test('returns { status: 200, data: [...] }', async () => {
    await repository.saveTrade({
      id: randomTradeId(),
      buyOrderId: randomOrderId(),
      sellOrderId: randomOrderId(),
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
  })
})
