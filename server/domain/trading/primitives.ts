import { make } from 'ts-brand'
import { z } from 'zod'
import type {
  GridId as GridIdType,
  GridLevel as GridLevelType,
  KrakenOrderId as KrakenOrderIdType,
  OrderId as OrderIdType,
  TradeId as TradeIdType,
} from '~/domain/trading/types'

export const GridId = (value: unknown) => {
  const v = z.string().uuid().parse(value)
  return make<GridIdType>()(v)
}

export const randomGridId = () => GridId(crypto.randomUUID())

export const OrderId = (value: unknown) => {
  const v = z.string().uuid().parse(value)
  return make<OrderIdType>()(v)
}

export const randomOrderId = () => OrderId(crypto.randomUUID())

export const TradeId = (value: unknown) => {
  const v = z.string().uuid().parse(value)
  return make<TradeIdType>()(v)
}

export const randomTradeId = () => TradeId(crypto.randomUUID())

export const KrakenOrderId = (value: unknown) => {
  const v = z.string().min(1).parse(value)
  return make<KrakenOrderIdType>()(v)
}

export const GridLevel = (value: unknown) => {
  const v = z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().nonnegative())
    .parse(value)
  return make<GridLevelType>()(v)
}
