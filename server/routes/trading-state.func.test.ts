import { describe, expect, test } from 'bun:test'
import * as repository from '~/domain/trading/repository'
import getHandler from '~/routes/trading-state.get'
import postHandler from '~/routes/trading-state.post'
import { mockEvent } from '~/test/setup'

describe('GET /trading-state', () => {
  test('returns active state by default', async () => {
    const result = await getHandler(mockEvent() as never)
    expect(result).toEqual({ status: 200, data: { state: 'active' } })
  })

  test('returns stopped-loss when set', async () => {
    await repository.saveTradingState('stopped-loss')
    const result = await getHandler(mockEvent() as never)
    expect(result).toEqual({ status: 200, data: { state: 'stopped-loss' } })
  })
})

describe('POST /trading-state', () => {
  test('resumes trading', async () => {
    await repository.saveTradingState('stopped-profit')
    const result = await postHandler(mockEvent() as never)
    expect(result).toEqual({ status: 200, data: { state: 'active' } })

    const state = await repository.getTradingState()
    expect(state).toBe('active')
  })
})
