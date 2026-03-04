import { TradingQuery } from '~/domain/trading/query'

export default defineEventHandler(async (event) => {
  const stats = await TradingQuery.getStats()
  if ('kind' in stats) {
    setResponseStatus(event, 503)
    return { status: 503, error: stats.kind }
  }
  return { status: 200, data: stats }
})
