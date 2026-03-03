import * as Sentry from '@sentry/bun'
import { TradingCommand } from '~/domain/trading/command'
import { createLogger } from '~/system/logger'

const log = createLogger('task:cycle')

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
      log.error(`Error: ${message}`)
      Sentry.captureException(error)
      return { result: 'error', error: message }
    }
  },
})
