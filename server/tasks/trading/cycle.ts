import { TradingCommand } from '~/domain/trading/command'

export default defineTask({
  meta: {
    name: 'trading:cycle',
    description: 'Execute one grid trading cycle',
  },
  async run() {
    try {
      await TradingCommand.executeCycle()
      return { result: 'ok' }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[task:cycle] Error: ${message}`)
      return { result: 'error', error: message }
    }
  },
})
