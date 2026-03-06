import * as exchange from '~/domain/exchange'
import { BtcPrice, SignedUsdc, Usdc } from '~/domain/shared/primitives'
import * as repository from '~/domain/trading/repository'
import type { StatsResult, TradingError } from '~/domain/trading/types'
import { config } from '~/system/config/index'

export namespace TradingQuery {
  export const getTrades = async () => {
    const [trades, orders] = await Promise.all([
      repository.findAllTrades(),
      repository.findAllOrders(),
    ])

    const ordersById = new Map(orders.map((o) => [o.id, o]))

    return trades
      .map((trade) => {
        const buyOrder = ordersById.get(trade.buyOrderId)
        const sellOrder = ordersById.get(trade.sellOrderId)
        return {
          ...trade,
          level: buyOrder?.level ?? sellOrder?.level,
          buyFilledAt: buyOrder?.updatedAt,
          sellFilledAt: sellOrder?.updatedAt,
        }
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  }

  export const getOrders = async () => {
    const [orders, gridConfig] = await Promise.all([
      repository.findAllOrders(),
      repository.getGridConfig(),
    ])
    const spacing = gridConfig?.spacing ?? 0

    return orders
      .filter((o) => o.status !== 'traded' && o.status !== 'cancelled')
      .sort((a, b) => a.level - b.level)
      .map(({ id, side, price, sizeUsdc, sizeBtc, level, status, createdAt, updatedAt }) => ({
        id,
        side,
        price,
        sizeUsdc,
        sizeBtc,
        level,
        status,
        createdAt,
        updatedAt,
        expectedCounterPrice:
          status === 'filled'
            ? side === 'buy'
              ? BtcPrice(Number(price) + Number(spacing))
              : BtcPrice(Number(price) - Number(spacing))
            : null,
      }))
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
    const filledOrders = orders.filter((order) => order.status === 'filled')
    const totalProfitUsdc = trades.reduce((sum, trade) => sum + Number(trade.profitUsdc), 0)
    const totalFeesUsdc = trades.reduce((sum, trade) => sum + Number(trade.feeUsdc ?? 0), 0)

    const { sandboxMode } = config()
    const sommeMiseUsdc = SignedUsdc(balance.usdc + balance.btc * ticker.last - totalProfitUsdc)

    return {
      totalProfitUsdc: SignedUsdc(totalProfitUsdc),
      totalFeesUsdc: Usdc(totalFeesUsdc),
      tradeCount: trades.length,
      openBuyOrders: activeOrders.filter((o) => o.side === 'buy').length,
      openSellOrders: activeOrders.filter((o) => o.side === 'sell').length,
      filledBuyOrders: filledOrders.filter((o) => o.side === 'buy').length,
      filledSellOrders: filledOrders.filter((o) => o.side === 'sell').length,
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
