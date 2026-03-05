import type {
  KrakenBalance,
  KrakenOrderInfo,
  KrakenOrderResult,
  KrakenOrderStatus,
  OHLCCandle,
  Ticker,
} from '~/domain/exchange/types'
import { Btc, BtcPrice, Usdc } from '~/domain/shared/primitives'
import type { BtcPrice as BtcPriceType, Btc as BtcType } from '~/domain/shared/types'
import { KrakenOrderId as KrakenOrderIdPrimitive } from '~/domain/trading/primitives'
import type { KrakenOrderId, OrderSide } from '~/domain/trading/types'
import { config } from '~/system/config/index'

type KrakenRawOrder = {
  status: KrakenOrderStatus
  vol: string
  vol_exec: string
  fee: string
  descr: { type: string; price: string }
}

const KRAKEN_BASE_URL = 'https://api.kraken.com'
const PAIR = 'XBTUSDC'
const FETCH_TIMEOUT_MS = 10_000

const getSignature = async (path: string, nonce: number, postData: string) => {
  const { krakenPrivateKey } = config()
  const message = nonce + postData
  const msgBuffer = new TextEncoder().encode(message)
  const msgHash = await crypto.subtle.digest('SHA-256', msgBuffer)
  const pathBuffer = new TextEncoder().encode(path)
  const combined = new Uint8Array(pathBuffer.length + msgHash.byteLength)
  combined.set(pathBuffer)
  combined.set(new Uint8Array(msgHash), pathBuffer.length)
  const keyBuffer = Uint8Array.from(atob(String(krakenPrivateKey)), (c) => c.charCodeAt(0))
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', hmacKey, combined)
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

const publicRequest = async (endpoint: string) => {
  const response = await fetch(`${KRAKEN_BASE_URL}/0/public/${endpoint}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Kraken HTTP ${response.status}: ${response.statusText}`)
  const data = await response.json()
  if (data.error?.length > 0) throw new Error(`Kraken API error: ${data.error.join(', ')}`)
  return data.result
}

const privateRequest = async (endpoint: string, params: Record<string, string> = {}) => {
  const { krakenApiKey } = config()
  const path = `/0/private/${endpoint}`
  const nonce = Date.now() * 1000
  const postData = new URLSearchParams({ nonce: String(nonce), ...params }).toString()
  const signature = await getSignature(path, nonce, postData)
  const response = await fetch(`${KRAKEN_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'API-Key': String(krakenApiKey),
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Kraken HTTP ${response.status}: ${response.statusText}`)
  const data = await response.json()
  if (data.error?.length > 0) throw new Error(`Kraken API error: ${data.error.join(', ')}`)
  return data.result
}

export const getTicker = async (): Promise<Ticker> => {
  const result = await publicRequest(`Ticker?pair=${PAIR}`)
  const ticker = result[Object.keys(result)[0]]
  return {
    ask: BtcPrice(ticker.a[0]),
    bid: BtcPrice(ticker.b[0]),
    last: BtcPrice(ticker.c[0]),
  }
}

export const getBalance = async (): Promise<KrakenBalance> => {
  const result = await privateRequest('Balance')
  return {
    usdc: Usdc(result.USDC ?? '0'),
    btc: Btc(result.XXBT ?? result.XBT ?? '0'),
  }
}

export const validateOrder = async (
  side: OrderSide,
  price: BtcPriceType,
  volume: BtcType,
): Promise<{ description: string }> => {
  const result = await privateRequest('AddOrder', {
    pair: PAIR,
    type: side,
    ordertype: 'limit',
    price: Number(price).toFixed(1),
    volume: Number(volume).toFixed(8),
    validate: 'true',
  })
  return { description: result.descr.order }
}

export const placeOrder = async (
  side: OrderSide,
  price: BtcPriceType,
  volume: BtcType,
): Promise<KrakenOrderResult> => {
  const { postOnly } = config()
  const params: Record<string, string> = {
    pair: PAIR,
    type: side,
    ordertype: 'limit',
    price: Number(price).toFixed(1),
    volume: Number(volume).toFixed(8),
  }
  if (postOnly) params.oflags = 'post'

  try {
    const result = await privateRequest('AddOrder', params)
    return {
      kind: 'placed',
      orderId: KrakenOrderIdPrimitive(result.txid[0]),
      description: result.descr.order,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (postOnly && message.includes('EOrder:Post only order')) {
      return { kind: 'post-only-rejected' }
    }
    throw error
  }
}

export const queryOrders = async (orderIds: KrakenOrderId[]): Promise<KrakenOrderInfo[]> => {
  if (orderIds.length === 0) return []
  const result = await privateRequest('QueryOrders', {
    txid: orderIds.join(','),
  })
  return Object.entries(result as Record<string, KrakenRawOrder>).map(([id, order]) => ({
    orderId: KrakenOrderIdPrimitive(id),
    status: order.status,
    side: order.descr.type as OrderSide,
    price: BtcPrice(order.descr.price),
    volume: Btc(order.vol),
    volumeExecuted: Btc(order.vol_exec),
    fee: Usdc(order.fee),
  }))
}

export const getOpenOrders = async (): Promise<KrakenOrderInfo[]> => {
  const result = await privateRequest('OpenOrders')
  const open = (result.open ?? {}) as Record<string, KrakenRawOrder>
  return Object.entries(open).map(([id, order]) => ({
    orderId: KrakenOrderIdPrimitive(id),
    status: order.status,
    side: order.descr.type as OrderSide,
    price: BtcPrice(order.descr.price),
    volume: Btc(order.vol),
    volumeExecuted: Btc(order.vol_exec),
    fee: Usdc(order.fee),
  }))
}

export const cancelOrder = async (orderId: KrakenOrderId) => {
  await privateRequest('CancelOrder', { txid: String(orderId) })
}

export const getOHLC = async (): Promise<OHLCCandle[]> => {
  const result = await publicRequest(`OHLC?pair=${PAIR}&interval=60`)
  const candles = result[Object.keys(result).find((k) => k !== 'last') ?? ''] as unknown[][]
  return candles.map((c) => ({
    time: Number(c[0]),
    open: BtcPrice(c[1]),
    high: BtcPrice(c[2]),
    low: BtcPrice(c[3]),
    close: BtcPrice(c[4]),
  }))
}
