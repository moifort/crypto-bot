import { TradingQuery } from '~/domain/trading/query'

export default defineEventHandler(async () => {
  const stats = await TradingQuery.getStats()
  return { status: 200, data: stats }
})
