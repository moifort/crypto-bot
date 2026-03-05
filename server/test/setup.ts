import { afterEach, mock } from 'bun:test'

type StorageItem = { base: string; key: string; value: unknown }

const stores = new Map<string, Map<string, unknown>>()

export const getStore = (namespace: string) => {
  if (!stores.has(namespace)) stores.set(namespace, new Map())
  // biome-ignore lint/style/noNonNullAssertion: guaranteed by the line above
  return stores.get(namespace)!
}

export const clearAllStores = () => {
  stores.forEach((store) => {
    store.clear()
  })
  stores.clear()
}

const createMockStorage = (namespace: string) => {
  const store = getStore(namespace)
  return {
    getItem: async <T>(key: string) => (store.get(key) as T) ?? null,
    setItem: async <T>(_key: string, value: T) => {
      store.set(_key, value)
    },
    removeItem: async (key: string) => {
      store.delete(key)
    },
    getKeys: async (base?: string) => {
      const keys = [...store.keys()]
      return base ? keys.filter((k) => k.startsWith(`${base}:`)) : keys
    },
    getItems: async <T>(keys: string[]) =>
      keys
        .filter((key) => store.has(key))
        .map((key) => ({
          base: namespace,
          key,
          value: store.get(key) as T,
        })) as StorageItem[],
  }
}

// @ts-expect-error — global mock for Nitro's useStorage
globalThis.useStorage = (namespace: string) => createMockStorage(namespace)

// @ts-expect-error — global mock for Nitro's defineEventHandler
globalThis.defineEventHandler = (handler: (...args: never[]) => unknown) => handler

// @ts-expect-error — global mock for Nitro's createError
globalThis.createError = (opts: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(opts.statusMessage), opts)

// @ts-expect-error — global mock for h3's readBody
globalThis.readBody = (_event: MockEvent) => Promise.resolve(_event.__body)

// @ts-expect-error — global mock for h3's getQuery
globalThis.getQuery = (_event: MockEvent) => _event.__query ?? {}

// @ts-expect-error — global mock for h3's getRouterParam
globalThis.getRouterParam = (_event: MockEvent, name: string) => _event.__params?.[name]

// @ts-expect-error — global mock for h3's getHeader
globalThis.getHeader = (_event: MockEvent, name: string) => _event.__headers?.[name]

// @ts-expect-error — global mock for Nitro's useRuntimeConfig
globalThis.useRuntimeConfig = () => ({
  krakenApiKey: 'test-api-key',
  krakenPrivateKey: 'test-private-key',
  apiToken: '',
  gridLowerPrice: '80000',
  gridUpperPrice: '120000',
  gridLevels: '5',
  orderSizeUsdc: '100',
  sandboxMode: 'true',
  postOnly: 'true',
  volatilityEnabled: '',
  atrPeriod: '',
  spacingMinMultiplier: '',
  spacingMaxMultiplier: '',
  sentryDsn: '',
})

type MockEvent = {
  __body?: unknown
  __query?: Record<string, string>
  __params?: Record<string, string>
  __headers?: Record<string, string>
}

export const mockEvent = (opts?: {
  body?: unknown
  query?: Record<string, string>
  params?: Record<string, string>
  headers?: Record<string, string>
}): MockEvent => ({
  __body: opts?.body,
  __query: opts?.query,
  __params: opts?.params,
  __headers: opts?.headers,
})

mock.module('~/system/logger', () => ({
  createLogger: () => ({
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  }),
}))

// Default exchange mock — tests can override via exchangeMocks
export const exchangeMocks = {
  getTicker: mock(() => Promise.resolve({ ask: 100100, bid: 99900, last: 100000 })),
  getBalance: mock(() => Promise.resolve({ usdc: 5000, btc: 0.1 })),
  placeOrder: mock(() =>
    Promise.resolve({ kind: 'placed', orderId: 'KRAKEN-001', description: 'test' }),
  ),
  queryOrders: mock(() => Promise.resolve([] as unknown[])),
  getOpenOrders: mock(() => Promise.resolve([] as unknown[])),
  cancelOrder: mock(() => Promise.resolve()),
  getOHLC: mock(() => Promise.resolve([])),
}

mock.module('~/domain/exchange', () => ({
  getTicker: (...args: unknown[]) => exchangeMocks.getTicker(...(args as [])),
  getBalance: (...args: unknown[]) => exchangeMocks.getBalance(...(args as [])),
  placeOrder: (...args: unknown[]) => exchangeMocks.placeOrder(...(args as [])),
  queryOrders: (...args: unknown[]) => exchangeMocks.queryOrders(...(args as [])),
  getOpenOrders: (...args: unknown[]) => exchangeMocks.getOpenOrders(...(args as [])),
  cancelOrder: (...args: unknown[]) => exchangeMocks.cancelOrder(...(args as [])),
  getOHLC: (...args: unknown[]) => exchangeMocks.getOHLC(...(args as [])),
}))

mock.module('~/system/config/index', () => ({
  config: () => ({
    krakenApiKey: 'test-api-key',
    krakenPrivateKey: 'test-private-key',
    apiToken: undefined,
    gridLowerPrice: 80000,
    gridUpperPrice: 120000,
    gridLevels: 5,
    orderSizeUsdc: 100,
    sandboxMode: true,
    postOnly: true,
    volatilityEnabled: false,
    atrPeriod: 14,
    spacingMinMultiplier: 0.5,
    spacingMaxMultiplier: 2.0,
    sentryDsn: undefined,
  }),
}))

afterEach(() => {
  clearAllStores()
})
