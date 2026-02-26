import * as kraken from '~/domain/exchange/kraken'
import { Usdc } from '~/domain/shared/primitives'
import * as repository from '~/domain/trading/repository'
import { config } from '~/system/config/index'

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
    const totalFeesUsdc = trades.reduce((sum, trade) => sum + Number(trade.feeUsdc ?? 0), 0)

    const { sandboxMode } = config()
    const sommeMiseUsdc = sandboxMode
      ? Usdc(gridConfig.levels * gridConfig.orderSizeUsdc)
      : Usdc(balance.usdc + balance.btc * ticker.last - totalProfitUsdc)

    return {
      totalProfitUsdc: Usdc(totalProfitUsdc),
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
