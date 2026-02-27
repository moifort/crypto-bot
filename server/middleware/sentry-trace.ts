import * as Sentry from '@sentry/bun'
import { propagationContextFromHeaders } from '@sentry/core'

export default defineEventHandler((event) => {
  const sentryTrace = getHeader(event, 'sentry-trace')
  const baggage = getHeader(event, 'baggage')
  if (!sentryTrace) return

  const propagationContext = propagationContextFromHeaders(sentryTrace, baggage)
  Sentry.getCurrentScope().setPropagationContext(propagationContext)

  Sentry.addBreadcrumb({
    type: 'http',
    category: 'request',
    data: {
      method: event.method,
      url: event.path,
    },
  })
})
