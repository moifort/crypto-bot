import Foundation

struct TradesResponse: Codable, Sendable {
    let status: Int
    let data: [TradeData]
}

struct TradeData: Codable, Sendable, Identifiable {
    let id: String
    let buyOrderId: String
    let sellOrderId: String
    let buyPrice: Double
    let sellPrice: Double
    let sizeBtc: Double
    let profitUsdc: Double
    let feeUsdc: Double
    let completedAt: String
    let level: Int?
    let buyFilledAt: String?
    let sellFilledAt: String?
}
