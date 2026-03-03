import { SignedUsdc } from '~/domain/shared/primitives'
import type { CompletedTrade } from '~/domain/trading/types'
import { createLogger } from '~/system/logger'
import { MigrationName, MigrationVersion } from '../primitives'
import type { Migration } from '../types'

const log = createLogger('migration:0001')

export const migration0001: Migration = {
  version: MigrationVersion(1),
  name: MigrationName('Recalculate trade profits'),
  async migrate(ctx) {
    const storage = ctx.storage('trades')
    const keys = await storage.getKeys()
    const trades = await Promise.all(keys.map((key) => storage.getItem<CompletedTrade>(key)))

    const results = await Promise.all(
      trades
        .filter((trade): trade is CompletedTrade => trade !== null)
        .map(async (trade) => {
          const profit = (trade.sellPrice - trade.buyPrice) * trade.sizeBtc - trade.feeUsdc
          if (trade.profitUsdc === profit) return false
          await storage.setItem(trade.id, { ...trade, profitUsdc: SignedUsdc(profit) })
          log.info(
            `Trade ${trade.id}: ${trade.profitUsdc} -> ${profit} (buy@${trade.buyPrice} sell@${trade.sellPrice})`,
          )
          return true
        }),
    )

    return { outcome: 'ok' as const, transformed: results.filter(Boolean).length }
  },
}
