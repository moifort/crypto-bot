import * as Sentry from '@sentry/bun'
import { config } from '~/system/config/index'

export default defineNitroPlugin((nitroApp) => {
  if (typeof Bun === 'undefined') return
  const { sentryDsn } = config()
  if (!sentryDsn) return
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  })

  nitroApp.hooks.hook('error', (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode && statusCode >= 400 && statusCode < 500) return

    Sentry.captureException(error, {
      extra: {
        path: event?.path,
        method: event?.method,
      },
    })
  })
})
