import { BtcPrice, Usdc } from '~/domain/shared/primitives'
import { ApiToken, KrakenApiKey, KrakenPrivateKey, SentryDsn } from '~/system/config/primitives'

export const config = () => {
  const runtimeConfig = useRuntimeConfig()
  return {
    krakenApiKey: KrakenApiKey(runtimeConfig.krakenApiKey),
    krakenPrivateKey: KrakenPrivateKey(runtimeConfig.krakenPrivateKey),
    apiToken: runtimeConfig.apiToken ? ApiToken(runtimeConfig.apiToken) : undefined,
    gridLowerPrice: BtcPrice(runtimeConfig.gridLowerPrice),
    gridUpperPrice: BtcPrice(runtimeConfig.gridUpperPrice),
    gridLevels: Number(runtimeConfig.gridLevels),
    orderSizeUsdc: Usdc(runtimeConfig.orderSizeUsdc),
    sandboxMode: String(runtimeConfig.sandboxMode) === 'true',
    postOnly: String(runtimeConfig.postOnly ?? 'true') !== 'false',
    volatilityEnabled: String(runtimeConfig.volatilityEnabled) === 'true',
    atrPeriod: Number(runtimeConfig.atrPeriod || '14'),
    spacingMinMultiplier: Number(runtimeConfig.spacingMinMultiplier || '0.5'),
    spacingMaxMultiplier: Number(runtimeConfig.spacingMaxMultiplier || '2.0'),
    sentryDsn: runtimeConfig.sentryDsn ? SentryDsn(runtimeConfig.sentryDsn) : undefined,
  }
}
