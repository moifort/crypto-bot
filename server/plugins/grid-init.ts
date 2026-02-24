import { TradingCommand } from '~/domain/trading/command'

export default defineNitroPlugin(async () => {
    const gridConfig = await TradingCommand.initializeGrid()
    console.log('[grid-init] Grid initialized', {
      id: gridConfig.id,
      lowerPrice: gridConfig.lowerPrice,
      upperPrice: gridConfig.upperPrice,
      levels: gridConfig.levels,
      spacing: gridConfig.spacing,
    })
})
