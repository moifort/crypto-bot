import { make } from 'ts-brand'
import { z } from 'zod'
import type {
  ApiToken as ApiTokenType,
  KrakenApiKey as KrakenApiKeyType,
  KrakenPrivateKey as KrakenPrivateKeyType,
} from '~/system/config/types'

export const KrakenApiKey = (value: unknown) => {
  const v = z.string().min(1).parse(value)
  return make<KrakenApiKeyType>()(v)
}

export const KrakenPrivateKey = (value: unknown) => {
  const v = z.string().min(1).parse(value)
  return make<KrakenPrivateKeyType>()(v)
}

export const ApiToken = (value: unknown) => {
  const v = z.string().min(1).parse(value)
  return make<ApiTokenType>()(v)
}
