import type { Timestamp } from '~/domain/shared/types'
import type {
  CompletedTrade,
  GridConfig,
  GridOrder,
  OrderId,
  VolatilityInfo,
} from '~/domain/trading/types'

// Grid config (singleton)
const gridStorage = () => useStorage('grid')

export const getGridConfig = () => gridStorage().getItem<GridConfig>('config')

export const saveGridConfig = async (config: GridConfig) => {
  await gridStorage().setItem<GridConfig>('config', config)
  return config
}

// Orders
const ordersStorage = () => useStorage('orders')

export const findAllOrders = async () => {
  const keys = await ordersStorage().getKeys()
  const items = await Promise.all(keys.map((key) => ordersStorage().getItem<GridOrder>(key)))
  return items.filter((item): item is GridOrder => item !== null)
}

export const findOrderBy = (id: OrderId) => ordersStorage().getItem<GridOrder>(id)

export const saveOrder = async (order: GridOrder) => {
  await ordersStorage().setItem<GridOrder>(order.id, order)
  return order
}

export const removeOrder = async (id: OrderId) => {
  await ordersStorage().removeItem(id)
}

// Completed trades
const tradesStorage = () => useStorage('trades')

export const findAllTrades = async () => {
  const keys = await tradesStorage().getKeys()
  const items = await Promise.all(keys.map((key) => tradesStorage().getItem<CompletedTrade>(key)))
  return items.filter((item): item is CompletedTrade => item !== null)
}

export const saveTrade = async (trade: CompletedTrade) => {
  await tradesStorage().setItem<CompletedTrade>(trade.id, trade)
  return trade
}

// Last cycle timestamp
const snapshotsStorage = () => useStorage('snapshots')

export const getLastCycleAt = () => snapshotsStorage().getItem<Timestamp>('last-cycle')

export const saveLastCycleAt = async (timestamp: Timestamp) => {
  await snapshotsStorage().setItem<Timestamp>('last-cycle', timestamp)
}

// Volatility info
export const getVolatilityInfo = () => snapshotsStorage().getItem<VolatilityInfo>('volatility')

export const saveVolatilityInfo = async (info: VolatilityInfo) => {
  await snapshotsStorage().setItem<VolatilityInfo>('volatility', info)
  return info
}
