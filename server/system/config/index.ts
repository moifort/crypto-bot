import { BtcPrice, Usdc } from '~/domain/shared/primitives'
import { ApiToken, KrakenApiKey, KrakenPrivateKey } from '~/system/config/primitives'

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
    sandboxMode: runtimeConfig.sandboxMode === 'true',
  }
}
