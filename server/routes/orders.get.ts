import { TradingQuery } from '~/domain/trading/query'

export default defineEventHandler(async () => {
  const orders = await TradingQuery.getOrders()
  return { status: 200, data: orders }
})
