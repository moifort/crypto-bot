import { TradingCommand } from '~/domain/trading/command'
import { log } from '~/system/logger'

export default defineNitroPlugin(async () => {
  const gridConfig = await TradingCommand.initializeGrid()
  log.info('[grid-init] Grid initialized', {
    id: gridConfig.id,
    lowerPrice: gridConfig.lowerPrice,
    upperPrice: gridConfig.upperPrice,
    levels: gridConfig.levels,
    spacing: gridConfig.spacing,
  })
})
