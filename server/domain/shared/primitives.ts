import { make } from 'ts-brand'
import { z } from 'zod'
import type {
  BtcPrice as BtcPriceType,
  Btc as BtcType,
  SignedUsdc as SignedUsdcType,
  Timestamp as TimestampType,
  Usdc as UsdcType,
} from '~/domain/shared/types'

export const Usdc = (value: unknown) => {
  const v = z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().nonnegative())
    .parse(value)
  return make<UsdcType>()(v)
}

export const SignedUsdc = (value: unknown) => {
  const v = z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().finite())
    .parse(value)
  return make<SignedUsdcType>()(v)
}

export const Btc = (value: unknown) => {
  const v = z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().nonnegative())
    .parse(value)
  return make<BtcType>()(v)
}

export const BtcPrice = (value: unknown) => {
  const v = z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().positive())
    .parse(value)
  return make<BtcPriceType>()(v)
}

export const Timestamp = (value: unknown) => {
  const v = z.string().datetime().parse(value)
  return make<TimestampType>()(v)
}

export const nowTimestamp = () => Timestamp(new Date().toISOString())
