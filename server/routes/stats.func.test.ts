import { describe, expect, test } from 'bun:test'
import { BtcPrice, nowTimestamp, Usdc } from '~/domain/shared/primitives'
import { GridVersion, randomGridId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import type { GridConfig } from '~/domain/trading/types'
import handler from '~/routes/stats.get'
import { mockEvent } from '~/test/setup'

describe('GET /stats', () => {
  test('returns { status: 200, data: ... } with stats shape', async () => {
    const gridConfig: GridConfig = {
      id: randomGridId(),
      lowerPrice: BtcPrice(80000),
      upperPrice: BtcPrice(120000),
      levels: 5,
      orderSizeUsdc: Usdc(100),
      spacing: BtcPrice(10000),
      version: GridVersion(1),
      createdAt: nowTimestamp(),
    }
    await repository.saveGridConfig(gridConfig)

    const result = await handler(mockEvent() as never)
    expect(result.status).toBe(200)
    expect(result.data).toHaveProperty('totalProfitUsdc')
    expect(result.data).toHaveProperty('totalFeesUsdc')
    expect(result.data).toHaveProperty('tradeCount')
    expect(result.data).toHaveProperty('openBuyOrders')
    expect(result.data).toHaveProperty('openSellOrders')
    expect(result.data).toHaveProperty('gridConfig')
    expect(result.data).toHaveProperty('currentPrice')
  })
})
