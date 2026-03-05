import { describe, expect, test } from 'bun:test'
import { ApiToken, KrakenApiKey, KrakenPrivateKey, SentryDsn } from '~/system/config/primitives'

describe('KrakenApiKey', () => {
  test('accepts a non-empty string', () => {
    expect(KrakenApiKey('my-api-key')).toBe(KrakenApiKey('my-api-key'))
  })

  test('rejects an empty string', () => {
    expect(() => KrakenApiKey('')).toThrow()
  })
})

describe('KrakenPrivateKey', () => {
  test('accepts a non-empty string', () => {
    expect(KrakenPrivateKey('my-private-key')).toBe(KrakenPrivateKey('my-private-key'))
  })

  test('rejects an empty string', () => {
    expect(() => KrakenPrivateKey('')).toThrow()
  })
})

describe('ApiToken', () => {
  test('accepts a non-empty string', () => {
    expect(ApiToken('my-token')).toBe(ApiToken('my-token'))
  })

  test('rejects an empty string', () => {
    expect(() => ApiToken('')).toThrow()
  })
})

describe('SentryDsn', () => {
  test('accepts a valid URL', () => {
    const url = 'https://examplePublicKey@o0.ingest.sentry.io/0'
    expect(SentryDsn(url)).toBe(SentryDsn(url))
  })

  test('rejects a non-URL string', () => {
    expect(() => SentryDsn('not-a-url')).toThrow()
  })
})
