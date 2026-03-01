import * as kraken from '~/domain/exchange/kraken'
import { Btc, BtcPrice, nowTimestamp, SignedUsdc, Usdc } from '~/domain/shared/primitives'
import type { BtcPrice as BtcPriceType } from '~/domain/shared/types'
import { GridLevel, randomGridId, randomOrderId, randomTradeId } from '~/domain/trading/primitives'
import * as repository from '~/domain/trading/repository'
import type { GridConfig, GridOrder } from '~/domain/trading/types'
import { config } from '~/system/config/index'

const MAX_OPEN_ORDERS = 20

export namespace TradingCommand {
  export const initializeGrid = async () => {
    const existing = await repository.getGridConfig()
    if (existing) return existing

    const { gridLowerPrice, gridUpperPrice, gridLevels, orderSizeUsdc } = config()
    const spacing = BtcPrice((Number(gridUpperPrice) - Number(gridLowerPrice)) / (gridLevels - 1))

    const gridConfig: GridConfig = {
      id: randomGridId(),
      lowerPrice: gridLowerPrice,
      upperPrice: gridUpperPrice,
      levels: gridLevels,
      orderSizeUsdc,
      spacing,
      createdAt: nowTimestamp(),
    }

    return await repository.saveGridConfig(gridConfig)
  }

  export const executeCycle = async () => {
    const gridConfig = await repository.getGridConfig()
    if (!gridConfig) throw new Error('Grid not initialized')

    const ticker = await kraken.getTicker()
    const currentPrice = ticker.last
    console.log(`[cycle] BTC/USDC price: ${currentPrice}`)

    await reconcileOrders(currentPrice)
    await placeGridOrders(gridConfig, currentPrice)
    await repository.saveLastCycleAt(nowTimestamp())
  }

  const reconcileOrders = async (currentPrice: BtcPriceType) => {
    const orders = await repository.findAllOrders()
    const openOrders = orders.filter((order) => order.status === 'open')
    if (openOrders.length === 0) return

    const { sandboxMode } = config()

    if (sandboxMode) {
      const filledOrders = openOrders.filter(
        (order) =>
          (order.side === 'buy' && currentPrice <= order.price) ||
          (order.side === 'sell' && currentPrice >= order.price),
      )
      await Promise.all(
        filledOrders.map(async (order) => {
          const fee = Usdc(Number(order.sizeUsdc) * 0.0025)
          await repository.saveOrder({
            ...order,
            status: 'filled',
            fee,
            updatedAt: nowTimestamp(),
          })
          console.log(`[cycle] Sandbox fill: ${order.side} at ${order.price}`)
          await matchTrade({ ...order, fee })
        }),
      )
      return
    }

    const krakenOrders = openOrders.filter((order) => order.krakenOrderId)
    const krakenOrderIds = krakenOrders
      .map((order) => order.krakenOrderId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined)
    const krakenInfos = await kraken.queryOrders(krakenOrderIds)

    for (const info of krakenInfos) {
      const order = krakenOrders.find((o) => o.krakenOrderId === info.orderId)
      if (!order) continue

      if (info.status === 'closed') {
        const updatedOrder: GridOrder = {
          ...order,
          status: 'filled',
          fee: info.fee,
          updatedAt: nowTimestamp(),
        }
        await repository.saveOrder(updatedOrder)
        console.log(`[cycle] Order filled: ${order.side} at ${order.price}`)
        await matchTrade(updatedOrder)
      } else if (info.status === 'canceled' || info.status === 'expired') {
        await repository.saveOrder({ ...order, status: 'cancelled', updatedAt: nowTimestamp() })
      }
    }
  }

  const matchTrade = async (filledOrder: GridOrder) => {
    const allOrders = await repository.findAllOrders()
    const oppositeSide = filledOrder.side === 'buy' ? 'sell' : 'buy'
    const matchingOrder = allOrders.find(
      (o) => o.side === oppositeSide && o.status === 'filled' && o.level === filledOrder.level,
    )
    if (!matchingOrder) return

    const buyOrder = filledOrder.side === 'buy' ? filledOrder : matchingOrder
    const sellOrder = filledOrder.side === 'sell' ? filledOrder : matchingOrder

    const feeUsdc = Usdc(Number(buyOrder.fee ?? 0) + Number(sellOrder.fee ?? 0))
    await repository.saveTrade({
      id: randomTradeId(),
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyPrice: buyOrder.price,
      sellPrice: sellOrder.price,
      sizeBtc: buyOrder.sizeBtc,
      profitUsdc: SignedUsdc(
        Number(sellOrder.price) * Number(buyOrder.sizeBtc) -
          Number(buyOrder.price) * Number(buyOrder.sizeBtc) -
          Number(feeUsdc),
      ),
      feeUsdc,
      completedAt: nowTimestamp(),
    })
    console.log(`[cycle] Trade completed: buy@${buyOrder.price} -> sell@${sellOrder.price}`)
  }

  const placeGridOrders = async (gridConfig: GridConfig, currentPrice: BtcPriceType) => {
    const allOrders = await repository.findAllOrders()
    const activeOrders = allOrders.filter(
      (order) => order.status === 'open' || order.status === 'pending',
    )

    if (activeOrders.length >= MAX_OPEN_ORDERS) {
      console.log(`[cycle] Max open orders reached (${MAX_OPEN_ORDERS}), skipping`)
      return
    }

    const halfSpacing = Number(gridConfig.spacing) / 2
    const currentPriceNum = Number(currentPrice)

    const levels = Array.from({ length: gridConfig.levels }, (_, i) => ({
      index: i,
      price: Number(gridConfig.lowerPrice) + i * Number(gridConfig.spacing),
      level: GridLevel(i),
    }))

    const levelsToPlace = levels
      .filter(({ price }) => Math.abs(price - currentPriceNum) >= halfSpacing)
      .filter(
        ({ level }) =>
          !activeOrders.some(
            (order) =>
              order.level === level && (order.status === 'open' || order.status === 'pending'),
          ),
      )
      .slice(0, MAX_OPEN_ORDERS - activeOrders.length)

    for (const { price, level } of levelsToPlace) {
      const side = price < currentPriceNum ? 'buy' : 'sell'
      const sizeBtc = Number(gridConfig.orderSizeUsdc) / price

      try {
        const result = await kraken.placeOrder(side, BtcPrice(price), Btc(sizeBtc))
        const order: GridOrder = {
          id: randomOrderId(),
          gridId: gridConfig.id,
          krakenOrderId: result.orderId,
          side,
          price: BtcPrice(price),
          sizeUsdc: gridConfig.orderSizeUsdc,
          sizeBtc: Btc(sizeBtc),
          level,
          status: 'open',
          createdAt: nowTimestamp(),
          updatedAt: nowTimestamp(),
        }
        await repository.saveOrder(order)
        console.log(`[cycle] Placed ${side} order at ${price} (${result.description})`)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[cycle] Failed to place ${side} order at ${price}: ${message}`)
      }
    }
  }
}
