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
      const result = await TradingCommand.executeCycle()
      if (result && 'kind' in result) {
        log.error(`Cycle failed: ${result.kind}`)
        Sentry.captureMessage(`Cycle failed: ${result.kind}`)
        return { result: 'error', error: result.kind }
      }
      return { result: 'ok' }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error(`Error: ${message}`)
      Sentry.captureException(error)
      return { result: 'error', error: message }
    }
  },
})
