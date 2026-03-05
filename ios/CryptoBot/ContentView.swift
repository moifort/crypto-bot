import SwiftUI

struct ContentView: View {
    @State private var stats: StatsData?
    @State private var tradingState: TradingStateData?
    @State private var error: String?
    @State private var loading = false
    @State private var resuming = false

    var body: some View {
        NavigationStack {
            Group {
                if loading && stats == nil {
                    ProgressView("Loading...")
                } else if let stats {
                    statsView(stats)
                } else if let error {
                    errorView(error)
                } else {
                    ContentUnavailableView(
                        "No Data",
                        systemImage: "chart.bar.xaxis",
                        description: Text("Pull to refresh")
                    )
                }
            }
            .navigationTitle("CryptoBot")
            .toolbar {
                if stats?.sandboxMode == true {
                    ToolbarItem(placement: .principal) {
                        Text("Sandbox")
                            .font(.caption).fontWeight(.semibold)
                            .padding(.horizontal, 8).padding(.vertical, 4)
                            .background(.orange.opacity(0.15))
                            .foregroundStyle(.orange)
                            .clipShape(.capsule)
                    }
                }
            }
            .refreshable { await loadStats() }
            .task { await loadStats() }
        }
    }

    private func statsView(_ stats: StatsData) -> some View {
        List {
            Section("Performance") {
                row("Profit", value: formatUsdc(stats.totalProfitUsdc),
                    color: stats.totalProfitUsdc >= 0 ? .green : .red, bold: true)
                NavigationLink {
                    TradesView()
                } label: {
                    row("Trades", value: "\(stats.tradeCount)")
                }
            }

            Section("Orders") {
                NavigationLink {
                    OrdersView()
                } label: {
                    row("Buy Orders", value: "\(stats.openBuyOrders)", color: .green)
                }
                NavigationLink {
                    OrdersView()
                } label: {
                    row("Sell Orders", value: "\(stats.openSellOrders)", color: .red)
                }
            }

            Section("Market") {
                row("BTC Price", value: formatUsdc(stats.currentPrice))
                row("Balance USDC", value: formatUsdc(stats.balanceUsdc))
                row("Balance BTC", value: formatBtc(stats.balanceBtc))
            }

            Section("Grid") {
                row("Range", value: "\(formatUsdc(stats.gridConfig.lowerPrice)) – \(formatUsdc(stats.gridConfig.upperPrice))")
                row("Levels", value: "\(stats.gridConfig.levels)")
                row("Version", value: "v\(stats.gridConfig.version)")
                if let recenteredAt = stats.gridConfig.recenteredAt {
                    row("Last Recenter", value: formatRelativeDate(recenteredAt))
                }
            }

            Section("Status") {
                if let tradingState {
                    row("State", value: tradingState.state,
                        color: tradingState.state == "active" ? .green : .red, bold: true)
                    if tradingState.state != "active" {
                        Button {
                            Task { await resumeTrading() }
                        } label: {
                            HStack {
                                Spacer()
                                if resuming {
                                    ProgressView()
                                } else {
                                    Text("Resume Trading")
                                }
                                Spacer()
                            }
                        }
                        .disabled(resuming)
                    }
                }
                if let lastCycle = stats.lastCycleAt {
                    row("Last Cycle", value: formatRelativeDate(lastCycle))
                }
            }
        }
    }

    private func row(_ title: String, value: String, color: Color = .secondary, bold: Bool = false) -> some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundStyle(color)
                .fontWeight(bold ? .semibold : .regular)
        }
    }

    private func errorView(_ message: String) -> some View {
        ContentUnavailableView {
            Label("Error", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        } actions: {
            Button("Retry") { Task { await loadStats() } }
                .buttonStyle(.bordered)
        }
    }

    private func loadStats() async {
        loading = true
        defer { loading = false }
        do {
            async let statsTask = APIClient.fetchStats()
            async let stateTask = APIClient.fetchTradingState()
            stats = try await statsTask
            tradingState = try await stateTask
            error = nil
        } catch {
            self.stats = nil
            self.error = error.localizedDescription
        }
    }

    private func resumeTrading() async {
        resuming = true
        defer { resuming = false }
        do {
            tradingState = try await APIClient.resumeTrading()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

private func formatUsdc(_ value: Double) -> String {
    String(format: "$%.2f", value)
}

private func formatBtc(_ value: Double) -> String {
    String(format: "%.6f BTC", value)
}
