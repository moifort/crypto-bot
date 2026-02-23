import { TradingCommand } from '~/domain/trading/command'

export default defineNitroPlugin(async () => {
  try {
    const gridConfig = await TradingCommand.initializeGrid()
    console.log('[grid-init] Grid initialized', {
      id: gridConfig.id,
      lowerPrice: gridConfig.lowerPrice,
      upperPrice: gridConfig.upperPrice,
      levels: gridConfig.levels,
      spacing: gridConfig.spacing,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[grid-init] Failed to initialize grid: ${message}`)
  }
})
