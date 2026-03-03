import { TradingCommand } from '~/domain/trading/command'
import { createLogger } from '~/system/logger'

const log = createLogger('grid-init')

export default defineNitroPlugin(async () => {
  const gridConfig = await TradingCommand.initializeGrid()
  log.info('Grid initialized', {
    id: gridConfig.id,
    lowerPrice: gridConfig.lowerPrice,
    upperPrice: gridConfig.upperPrice,
    levels: gridConfig.levels,
    spacing: gridConfig.spacing,
  })
})
