import type { GridOrder } from '~/domain/trading/types'
import { createLogger } from '~/system/logger'
import { MigrationName, MigrationVersion } from '../primitives'
import type { Migration } from '../types'

const log = createLogger('migration:0002')

export const migration0002: Migration = {
  version: MigrationVersion(2),
  name: MigrationName('Purge corrupted trades'),
  async migrate(ctx) {
    const tradesStorage = ctx.storage('trades')
    const tradeKeys = await tradesStorage.getKeys()
    await Promise.all(tradeKeys.map((key) => tradesStorage.removeItem(key)))
    log.info(`Deleted ${tradeKeys.length} corrupted trades`)

    const ordersStorage = ctx.storage('orders')
    const orderKeys = await ordersStorage.getKeys()
    const orders = await Promise.all(orderKeys.map((key) => ordersStorage.getItem<GridOrder>(key)))

    const filledOrders = orders.filter(
      (order): order is GridOrder => order !== null && order.status === 'filled',
    )
    await Promise.all(
      filledOrders.map(async (order) => {
        await ordersStorage.setItem(order.id, { ...order, status: 'cancelled' })
        log.info(`Cancelled orphan filled order ${order.id}`)
      }),
    )

    return { outcome: 'ok' as const, transformed: tradeKeys.length + filledOrders.length }
  },
}
