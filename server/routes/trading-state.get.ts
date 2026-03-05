import * as repository from '~/domain/trading/repository'

export default defineEventHandler(async () => {
  const state = await repository.getTradingState()
  return { status: 200, data: { state } }
})
