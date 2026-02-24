import Foundation

struct StatsResponse: Codable, Sendable {
    let status: Int
    let data: StatsData
}

struct StatsData: Codable, Sendable {
    let totalProfitUsdc: Double
    let tradeCount: Int
    let openBuyOrders: Int
    let openSellOrders: Int
    let balanceUsdc: Double
    let balanceBtc: Double
    let currentPrice: Double
    let gridConfig: GridConfig
    let lastCycleAt: String?
}

struct GridConfig: Codable, Sendable {
    let id: String
    let lowerPrice: Double
    let upperPrice: Double
    let levels: Int
    let orderSizeUsdc: Double
    let spacing: Double
    let createdAt: String
}
