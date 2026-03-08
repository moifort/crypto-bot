import Foundation

struct TradesResponse: Codable, Sendable {
    let status: Int
    let data: [TradeData]
}

struct OrderStepData: Codable, Sendable {
    let price: Double
    let placedAt: String
    let filledAt: String?
}

struct TradeData: Codable, Sendable, Identifiable {
    let id: String
    let level: Int
    let status: String
    let sizeBtc: Double
    let sizeUsdc: Double
    let updatedAt: String

    // buying + selling + completed
    let buyOrder: OrderStepData?
    let expectedSellPrice: Double?

    // selling + pending-sell + completed
    let sellOrder: OrderStepData?
    let expectedBuyPrice: Double?

    // completed only
    let profitUsdc: Double?
    let feeUsdc: Double?
}
