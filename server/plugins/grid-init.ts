import { TradingCommand } from '~/domain/trading/command'
import { createLogger } from '~/system/logger'

const log = createLogger('grid-init')

export default defineNitroPlugin(async () => {
  const result = await TradingCommand.initializeGrid()
  if ('kind' in result) {
    log.error(
      `Grid initialization failed: ${result.kind === 'invalid-config' ? result.reason : result.kind}`,
    )
    return
  }
  log.info('Grid initialized', {
    id: result.id,
    lowerPrice: result.lowerPrice,
    upperPrice: result.upperPrice,
    levels: result.levels,
    spacing: result.spacing,
  })
})
