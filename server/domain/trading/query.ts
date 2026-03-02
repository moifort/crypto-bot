import * as kraken from '~/domain/exchange/kraken'
import { SignedUsdc, Usdc } from '~/domain/shared/primitives'
import * as repository from '~/domain/trading/repository'
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

  export const getStats = async () => {
    const gridConfig = await repository.getGridConfig()
    if (!gridConfig) throw new Error('Grid not initialized')

    const [trades, orders, ticker, balance, lastCycleAt] = await Promise.all([
      repository.findAllTrades(),
      repository.findAllOrders(),
      kraken.getTicker(),
      kraken.getBalance(),
      repository.getLastCycleAt(),
    ])

    const activeOrders = orders.filter(
      (order) => order.status === 'open' || order.status === 'pending',
    )
    const totalProfitUsdc = trades.reduce((sum, trade) => sum + Number(trade.profitUsdc), 0)
    const totalFeesUsdc = trades.reduce((sum, trade) => sum + Number(trade.feeUsdc ?? 0), 0)

    const { sandboxMode } = config()
    const sommeMiseUsdc = SignedUsdc(
      sandboxMode
        ? gridConfig.levels * gridConfig.orderSizeUsdc
        : balance.usdc + balance.btc * ticker.last - totalProfitUsdc,
    )

    return {
      totalProfitUsdc: SignedUsdc(totalProfitUsdc),
      totalFeesUsdc: Usdc(totalFeesUsdc),
      tradeCount: trades.length,
      openBuyOrders: activeOrders.filter((o) => o.side === 'buy').length,
      openSellOrders: activeOrders.filter((o) => o.side === 'sell').length,
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
