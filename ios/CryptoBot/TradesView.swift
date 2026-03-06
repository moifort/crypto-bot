import SwiftUI

struct TradesView: View {
    @State private var trades: [TradeData] = []
    @State private var error: String?
    @State private var loading = false

    var body: some View {
        Group {
            if loading && trades.isEmpty {
                ProgressView("Loading...")
            } else if !trades.isEmpty {
                tradesList
            } else if let error {
                errorView(error)
            } else {
                ContentUnavailableView(
                    "No Trades",
                    systemImage: "arrow.left.arrow.right",
                    description: Text("Completed trades will appear here")
                )
            }
        }
        .navigationTitle("Trades")
        .refreshable { await loadTrades() }
        .task { await loadTrades() }
    }

    private var tradesList: some View {
        List(trades) { trade in
            TradeRow(trade: trade)
        }
        .accessibilityIdentifier("trades-list")
    }

    private func errorView(_ message: String) -> some View {
        ContentUnavailableView {
            Label("Error", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        } actions: {
            Button("Retry") { Task { await loadTrades() } }
                .buttonStyle(.bordered)
        }
    }

    private func loadTrades() async {
        loading = true
        defer { loading = false }
        do {
            trades = try await APIClient.fetchTrades()
            error = nil
        } catch {
            self.trades = []
            self.error = error.localizedDescription
        }
    }
}

private struct TradeRow: View {
    let trade: TradeData

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                if let level = trade.level {
                    Text("Level \(level)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(.blue.opacity(0.15))
                        .foregroundStyle(.blue)
                        .clipShape(.capsule)
                }
                Spacer()
                Text(trade.profitUsdc, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
                    .foregroundStyle(trade.profitUsdc >= 0 ? .green : .red)
            }

            HStack(spacing: 4) {
                Text(trade.buyPrice, format: .currency(code: "USD"))
                    .foregroundStyle(.green)
                Image(systemName: "arrow.right")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(trade.sellPrice, format: .currency(code: "USD"))
                    .foregroundStyle(.red)
            }
            .font(.subheadline)

            HStack {
                Text(trade.sizeBtc, format: .number.precision(.fractionLength(6)))
                + Text(" BTC")
                Spacer()
                Text(formatRelativeDate(trade.completedAt))
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}
