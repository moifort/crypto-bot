import { TradingCommand } from '~/domain/trading/command'

export default defineEventHandler(async () => {
  await TradingCommand.resumeTrading()
  return { status: 200, data: { state: 'active' } }
})
