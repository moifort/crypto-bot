import { config } from '~/system/config/index'
import { log } from '~/system/logger'

export default defineNitroPlugin(() => {
  const cfg = config()
  log.info('[startup] Crypto bot started', {
    gridLowerPrice: cfg.gridLowerPrice,
    gridUpperPrice: cfg.gridUpperPrice,
    gridLevels: cfg.gridLevels,
    orderSizeUsdc: cfg.orderSizeUsdc,
    sandboxMode: cfg.sandboxMode,
  })
})
