import { config } from '~/system/config/index'

export default defineNitroPlugin(() => {
  const cfg = config()
  console.log('[startup] Crypto bot started', {
    gridLowerPrice: cfg.gridLowerPrice,
    gridUpperPrice: cfg.gridUpperPrice,
    gridLevels: cfg.gridLevels,
    orderSizeUsdc: cfg.orderSizeUsdc,
    sandboxMode: cfg.sandboxMode,
  })
})
