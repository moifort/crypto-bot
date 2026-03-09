import * as Sentry from '@sentry/bun'
import { TradingCommand } from '~/domain/trading/command'
import { createLogger } from '~/system/logger'

const log = createLogger('task:cycle')

const isTransientNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes('unable to connect') ||
    msg.includes('failed to fetch') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    error.name === 'TimeoutError' ||
    msg.includes('kraken http 502') ||
    msg.includes('kraken http 503') ||
    msg.includes('kraken http 504')
  )
}

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
      if (!isTransientNetworkError(error)) {
        Sentry.captureException(error)
      }
      return { result: 'error', error: message }
    }
  },
})
