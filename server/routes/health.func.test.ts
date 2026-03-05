import { describe, expect, test } from 'bun:test'
import handler from '~/routes/health.get'
import { mockEvent } from '~/test/setup'

describe('GET /health', () => {
  test('returns { status: "ok" }', () => {
    const result = handler(mockEvent() as never)
    expect(result).toEqual({ status: 'ok' })
  })
})
