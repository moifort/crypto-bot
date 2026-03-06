import Foundation

struct OrdersResponse: Codable, Sendable {
    let status: Int
    let data: [OrderData]
}

struct OrderData: Codable, Sendable, Identifiable {
    let id: String
    let side: String
    let price: Double
    let sizeUsdc: Double
    let sizeBtc: Double
    let level: Int
    let status: String
    let createdAt: String
    let updatedAt: String
    let expectedCounterPrice: Double?
}
