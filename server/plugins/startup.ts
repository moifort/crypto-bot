import { config } from '~/system/config/index'
import { createLogger } from '~/system/logger'

const log = createLogger('startup')

export default defineNitroPlugin(() => {
  const cfg = config()
  log.info('Crypto bot started', {
    gridLowerPrice: cfg.gridLowerPrice,
    gridUpperPrice: cfg.gridUpperPrice,
    gridLevels: cfg.gridLevels,
    orderSizeUsdc: cfg.orderSizeUsdc,
    sandboxMode: cfg.sandboxMode,
    postOnly: cfg.postOnly,
    gridRecentering: cfg.gridRecentering,
    volatilityEnabled: cfg.volatilityEnabled,
  })
})
