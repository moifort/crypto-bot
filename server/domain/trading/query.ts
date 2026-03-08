import * as exchange from '~/domain/exchange'
import { BtcPrice, SignedUsdc, Timestamp, Usdc } from '~/domain/shared/primitives'
import { TradeId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import type { OrderId, StatsResult, Trade, TradingError } from '~/domain/trading/types'
import { config } from '~/system/config/index'

export namespace TradingQuery {
  export const getTrades = async (): Promise<Trade[]> => {
    const [completedTrades, orders, gridConfig] = await Promise.all([
      repository.findAllTrades(),
      repository.findAllOrders(),
      repository.getGridConfig(),
    ])
    const spacing = gridConfig?.spacing ?? 0

    const ordersById = new Map(orders.map((o) => [o.id, o]))
    const usedOrderIds = new Set<OrderId>()

    const completed: Trade[] = completedTrades.flatMap((trade) => {
      const buyOrder = ordersById.get(trade.buyOrderId)
      const sellOrder = ordersById.get(trade.sellOrderId)
      if (!buyOrder || !sellOrder) return []
      usedOrderIds.add(trade.buyOrderId)
      usedOrderIds.add(trade.sellOrderId)
      return [
        {
          id: trade.id,
          level: buyOrder.level,
          sizeBtc: trade.sizeBtc,
          sizeUsdc: buyOrder.sizeUsdc,
          updatedAt: Timestamp(trade.completedAt),
          status: 'completed' as const,
          buyOrder: {
            price: trade.buyPrice,
            placedAt: Timestamp(buyOrder.createdAt),
            filledAt: Timestamp(buyOrder.updatedAt),
          },
          sellOrder: {
            price: trade.sellPrice,
            placedAt: Timestamp(sellOrder.createdAt),
            filledAt: Timestamp(sellOrder.updatedAt),
          },
          profitUsdc: trade.profitUsdc,
          feeUsdc: trade.feeUsdc,
        },
      ]
    })

    const activeOrders = orders.filter(
      (o) => !usedOrderIds.has(o.id) && o.status !== 'traded' && o.status !== 'cancelled',
    )

    const active: Trade[] = activeOrders.flatMap((order) => {
      if (order.side === 'buy' && order.status === 'filled') {
        const sellOrder = activeOrders.find(
          (o) =>
            o.side === 'sell' &&
            (o.status === 'open' || o.status === 'pending') &&
            o.gridId === order.gridId &&
            o.level === order.level + 1,
        )
        if (!sellOrder) return []
        usedOrderIds.add(order.id)
        usedOrderIds.add(sellOrder.id)
        return [
          {
            id: TradeId(order.id),
            level: order.level,
            sizeBtc: order.sizeBtc,
            sizeUsdc: order.sizeUsdc,
            updatedAt: Timestamp(order.updatedAt),
            status: 'selling' as const,
            buyOrder: {
              price: order.price,
              placedAt: Timestamp(order.createdAt),
              filledAt: Timestamp(order.updatedAt),
            },
            sellOrder: {
              price: sellOrder.price,
              placedAt: Timestamp(sellOrder.createdAt),
            },
          },
        ]
      }
      return []
    })

    const remainingOrders = activeOrders.filter((o) => !usedOrderIds.has(o.id))

    const buyingTrades: Trade[] = remainingOrders
      .filter((o) => o.side === 'buy' && (o.status === 'open' || o.status === 'pending'))
      .map((order) => ({
        id: TradeId(order.id),
        level: order.level,
        sizeBtc: order.sizeBtc,
        sizeUsdc: order.sizeUsdc,
        updatedAt: Timestamp(order.updatedAt),
        status: 'buying' as const,
        buyOrder: {
          price: order.price,
          placedAt: Timestamp(order.createdAt),
        },
        expectedSellPrice: BtcPrice(Number(order.price) + Number(spacing)),
      }))

    const pendingSellTrades: Trade[] = remainingOrders
      .filter((o) => o.side === 'sell' && (o.status === 'open' || o.status === 'pending'))
      .map((order) => ({
        id: TradeId(order.id),
        level: order.level,
        sizeBtc: order.sizeBtc,
        sizeUsdc: order.sizeUsdc,
        updatedAt: Timestamp(order.updatedAt),
        status: 'pending-sell' as const,
        sellOrder: {
          price: order.price,
          placedAt: Timestamp(order.createdAt),
        },
        expectedBuyPrice: BtcPrice(Number(order.price) - Number(spacing)),
      }))

    return [...completed, ...active, ...buyingTrades, ...pendingSellTrades].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  export const getStats = async (): Promise<TradingError | StatsResult> => {
    const gridConfig = await repository.getGridConfig()
    if (!gridConfig) return { kind: 'grid-not-initialized' }

    const [trades, orders, ticker, balance, lastCycleAt] = await Promise.all([
      repository.findAllTrades(),
      repository.findAllOrders(),
      exchange.getTicker(),
      exchange.getBalance(),
      repository.getLastCycleAt(),
    ])

    const activeOrders = orders.filter(
      (order) => order.status === 'open' || order.status === 'pending',
    )
    const totalProfitUsdc = trades.reduce((sum, trade) => sum + Number(trade.profitUsdc), 0)
    const totalFeesUsdc = trades.reduce((sum, trade) => sum + Number(trade.feeUsdc ?? 0), 0)

    const { sandboxMode } = config()
    const sommeMiseUsdc = SignedUsdc(balance.usdc + balance.btc * ticker.last - totalProfitUsdc)

    return {
      totalProfitUsdc: SignedUsdc(totalProfitUsdc),
      totalFeesUsdc: Usdc(totalFeesUsdc),
      tradeCount: trades.length,
      pendingTradeCount: activeOrders.length,
      balanceUsdc: balance.usdc,
      balanceBtc: balance.btc,
      currentPrice: ticker.last,
      gridConfig,
      lastCycleAt: lastCycleAt ?? undefined,
      sandboxMode,
      sommeMiseUsdc,
    }
  }
}
