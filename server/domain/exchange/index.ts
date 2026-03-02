import * as kraken from '~/domain/exchange/kraken'
import * as sandbox from '~/domain/exchange/sandbox'
import type { Exchange } from '~/domain/exchange/types'
import { config } from '~/system/config/index'

const impl = (): Exchange => (config().sandboxMode ? sandbox : kraken)

export const getTicker = (...args: Parameters<Exchange['getTicker']>) => impl().getTicker(...args)
export const getBalance = (...args: Parameters<Exchange['getBalance']>) =>
  impl().getBalance(...args)
export const placeOrder = (...args: Parameters<Exchange['placeOrder']>) =>
  impl().placeOrder(...args)
export const queryOrders = (...args: Parameters<Exchange['queryOrders']>) =>
  impl().queryOrders(...args)
export const getOpenOrders = (...args: Parameters<Exchange['getOpenOrders']>) =>
  impl().getOpenOrders(...args)
export const cancelOrder = (...args: Parameters<Exchange['cancelOrder']>) =>
  impl().cancelOrder(...args)
