import Foundation

struct APIClient: Sendable {
    static let appGroupId = "group.com.moifort.cryptobot"
    static let serverURLKey = "serverURL"
    static let defaultServerURL = "http://localhost:3000"

    static var serverURL: String {
        let defaults = UserDefaults(suiteName: appGroupId) ?? .standard
        let url = defaults.string(forKey: serverURLKey) ?? defaultServerURL
        return url.hasSuffix("/") ? String(url.dropLast()) : url
    }

    static func fetchStats() async throws -> StatsData {
        guard let url = URL(string: "\(serverURL)/stats") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(Secrets.apiToken)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.serverError(statusCode: code)
        }

        return try JSONDecoder().decode(StatsResponse.self, from: data).data
    }

    static func fetchTrades() async throws -> [TradeData] {
        guard let url = URL(string: "\(serverURL)/trades") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(Secrets.apiToken)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.serverError(statusCode: code)
        }

        return try JSONDecoder().decode(TradesResponse.self, from: data).data
    }

    static func fetchOrders() async throws -> [OrderData] {
        guard let url = URL(string: "\(serverURL)/orders") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(Secrets.apiToken)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.serverError(statusCode: code)
        }

        return try JSONDecoder().decode(OrdersResponse.self, from: data).data
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case serverError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL: "Invalid server URL"
        case .serverError(let code): "Server error (\(code))"
        }
    }
}
