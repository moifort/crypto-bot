import { TradingQuery } from '~/domain/trading/query'

export default defineEventHandler(async () => {
  const trades = await TradingQuery.getTrades()
  return { status: 200, data: trades }
})
