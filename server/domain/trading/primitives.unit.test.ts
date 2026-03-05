import { describe, expect, test } from 'bun:test'
import {
  GridId,
  GridLevel,
  KrakenOrderId,
  OrderId,
  randomGridId,
  randomOrderId,
  randomTradeId,
  TradeId,
} from '~/domain/trading/primitives'

describe('GridId', () => {
  test('accepts a valid UUID', () => {
    const uuid = crypto.randomUUID()
    expect(GridId(uuid)).toBe(GridId(uuid))
  })

  test('rejects a non-UUID string', () => {
    expect(() => GridId('not-a-uuid')).toThrow()
  })
})

describe('randomGridId', () => {
  test('returns a valid UUID', () => {
    expect(() => GridId(randomGridId())).not.toThrow()
  })
})

describe('OrderId', () => {
  test('accepts a valid UUID', () => {
    const uuid = crypto.randomUUID()
    expect(OrderId(uuid)).toBe(OrderId(uuid))
  })

  test('rejects a non-UUID string', () => {
    expect(() => OrderId('not-a-uuid')).toThrow()
  })
})

describe('randomOrderId', () => {
  test('returns a valid UUID', () => {
    expect(() => OrderId(randomOrderId())).not.toThrow()
  })
})

describe('TradeId', () => {
  test('accepts a valid UUID', () => {
    const uuid = crypto.randomUUID()
    expect(TradeId(uuid)).toBe(TradeId(uuid))
  })

  test('rejects a non-UUID string', () => {
    expect(() => TradeId('not-a-uuid')).toThrow()
  })
})

describe('randomTradeId', () => {
  test('returns a valid UUID', () => {
    expect(() => TradeId(randomTradeId())).not.toThrow()
  })
})

describe('KrakenOrderId', () => {
  test('accepts a non-empty string', () => {
    expect(KrakenOrderId('OQCLML-BW3P3-BUCMWZ')).toBe(KrakenOrderId('OQCLML-BW3P3-BUCMWZ'))
  })

  test('rejects an empty string', () => {
    expect(() => KrakenOrderId('')).toThrow()
  })
})

describe('GridLevel', () => {
  test('accepts zero', () => {
    expect(GridLevel(0)).toBe(GridLevel(0))
  })

  test('accepts a positive integer', () => {
    expect(GridLevel(5)).toBe(GridLevel(5))
  })

  test('coerces a string to number', () => {
    expect(GridLevel('3')).toBe(GridLevel(3))
  })

  test('rejects a negative number', () => {
    expect(() => GridLevel(-1)).toThrow()
  })

  test('rejects a float', () => {
    expect(() => GridLevel(1.5)).toThrow()
  })
})
