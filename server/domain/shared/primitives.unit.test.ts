import { describe, expect, test } from 'bun:test'
import {
  Btc,
  BtcPrice,
  nowTimestamp,
  SignedUsdc,
  Timestamp,
  Usdc,
} from '~/domain/shared/primitives'

describe('Usdc', () => {
  test('accepts zero', () => {
    expect(Usdc(0)).toBe(Usdc(0))
  })

  test('accepts a positive number', () => {
    expect(Usdc(100.5)).toBe(Usdc(100.5))
  })

  test('coerces a string to number', () => {
    expect(Usdc('42.5')).toBe(Usdc(42.5))
  })

  test('rejects a negative number', () => {
    expect(() => Usdc(-1)).toThrow()
  })
})

describe('SignedUsdc', () => {
  test('accepts a negative number', () => {
    expect(SignedUsdc(-10)).toBe(SignedUsdc(-10))
  })

  test('accepts zero', () => {
    expect(SignedUsdc(0)).toBe(SignedUsdc(0))
  })

  test('accepts a positive number', () => {
    expect(SignedUsdc(50)).toBe(SignedUsdc(50))
  })

  test('coerces a string to number', () => {
    expect(SignedUsdc('12.5')).toBe(SignedUsdc(12.5))
  })

  test('rejects non-finite', () => {
    expect(() => SignedUsdc(Number.POSITIVE_INFINITY)).toThrow()
  })
})

describe('Btc', () => {
  test('accepts zero', () => {
    expect(Btc(0)).toBe(Btc(0))
  })

  test('accepts a positive number', () => {
    expect(Btc(0.001)).toBe(Btc(0.001))
  })

  test('rejects a negative number', () => {
    expect(() => Btc(-1)).toThrow()
  })
})

describe('BtcPrice', () => {
  test('accepts a positive number', () => {
    expect(BtcPrice(90000)).toBe(BtcPrice(90000))
  })

  test('rejects zero', () => {
    expect(() => BtcPrice(0)).toThrow()
  })

  test('rejects a negative number', () => {
    expect(() => BtcPrice(-1)).toThrow()
  })
})

describe('Timestamp', () => {
  test('accepts a valid ISO datetime', () => {
    const iso = '2024-01-01T00:00:00.000Z'
    expect(Timestamp(iso)).toBe(Timestamp(iso))
  })

  test('rejects an invalid string', () => {
    expect(() => Timestamp('not-a-date')).toThrow()
  })
})

describe('nowTimestamp', () => {
  test('returns a valid Timestamp', () => {
    const ts = nowTimestamp()
    expect(() => Timestamp(ts)).not.toThrow()
  })
})
