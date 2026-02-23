import * as kraken from '~/domain/exchange/kraken'
import { Usdc } from '~/domain/shared/primitives'
import * as repository from '~/domain/trading/repository'

export namespace TradingQuery {
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

    return {
      totalProfitUsdc: Usdc(totalProfitUsdc),
      tradeCount: trades.length,
      openBuyOrders: activeOrders.filter((o) => o.side === 'buy').length,
      openSellOrders: activeOrders.filter((o) => o.side === 'sell').length,
      balanceUsdc: balance.usdc,
      balanceBtc: balance.btc,
      currentPrice: ticker.last,
      gridConfig,
      lastCycleAt: lastCycleAt ?? undefined,
    }
  }
}
