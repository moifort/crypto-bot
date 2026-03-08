import SwiftUI

struct TradesView: View {
    @State private var trades: [TradeData] = []
    @State private var error: String?
    @State private var loading = false
    @State private var expandedTradeIds: Set<String> = []

    private var activeTrades: [TradeData] {
        trades.filter { $0.status != "completed" }
    }

    private var completedTrades: [TradeData] {
        trades.filter { $0.status == "completed" }
    }

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
                    description: Text("Trades will appear here")
                )
            }
        }
        .navigationTitle("Trades")
        .refreshable { await loadTrades() }
        .task { await loadTrades() }
    }

    private var tradesList: some View {
        List {
            if !activeTrades.isEmpty {
                Section("Active") {
                    ForEach(activeTrades) { trade in
                        TradeRow(trade: trade, isExpanded: expandedTradeIds.contains(trade.id))
                            .contentShape(.rect)
                            .onTapGesture {
                                withAnimation(.easeInOut(duration: 0.25)) {
                                    if expandedTradeIds.contains(trade.id) {
                                        expandedTradeIds.remove(trade.id)
                                    } else {
                                        expandedTradeIds.insert(trade.id)
                                    }
                                }
                            }
                    }
                }
            }
            if !completedTrades.isEmpty {
                Section("Completed") {
                    ForEach(completedTrades) { trade in
                        TradeRow(trade: trade, isExpanded: expandedTradeIds.contains(trade.id))
                            .contentShape(.rect)
                            .onTapGesture {
                                withAnimation(.easeInOut(duration: 0.25)) {
                                    if expandedTradeIds.contains(trade.id) {
                                        expandedTradeIds.remove(trade.id)
                                    } else {
                                        expandedTradeIds.insert(trade.id)
                                    }
                                }
                            }
                    }
                }
            }
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
            expandedTradeIds = Set(trades.filter { $0.status == "pending-sell" }.map(\.id))
            error = nil
        } catch {
            self.trades = []
            self.error = error.localizedDescription
        }
    }
}

// MARK: - TradeRow

private struct TradeRow: View {
    let trade: TradeData
    let isExpanded: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            compactRow
            if isExpanded {
                timelineView
                    .padding(.top, 4)
            }
        }
        .padding(.vertical, 4)
    }

    private var compactRow: some View {
        HStack {
            Text("Level \(trade.level)")
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(statusColor.opacity(0.15))
                .foregroundStyle(statusColor)
                .clipShape(.capsule)

            Text(statusLabel)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(statusColor)

            Spacer()

            trailingContent
        }
    }

    @ViewBuilder
    private var trailingContent: some View {
        switch trade.status {
        case "completed":
            if let profit = trade.profitUsdc {
                Text(profit, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
                    .foregroundStyle(profit >= 0 ? .green : .red)
            }
        case "buying":
            if let price = trade.buyOrder?.price {
                Text(price, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
            }
        case "selling":
            if let buyPrice = trade.buyOrder?.price, let sellPrice = trade.sellOrder?.price {
                HStack(spacing: 4) {
                    Text(buyPrice, format: .currency(code: "USD"))
                        .foregroundStyle(.green)
                    Image(systemName: "arrow.right")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(sellPrice, format: .currency(code: "USD"))
                        .foregroundStyle(.red)
                }
                .font(.subheadline)
            }
        case "pending-sell":
            if let price = trade.sellOrder?.price {
                Text(price, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
            }
        default:
            EmptyView()
        }
    }

    private var timelineView: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(timelineSteps.enumerated()), id: \.offset) { index, step in
                TimelineStepView(
                    label: step.label,
                    time: step.time,
                    isCompleted: step.isCompleted,
                    isCurrent: step.isCurrent,
                    isLast: index == timelineSteps.count - 1
                )
            }
        }
    }

    private var timelineSteps: [TimelineStep] {
        switch trade.status {
        case "buying":
            return [
                TimelineStep(
                    label: "Buy at \(formatPrice(trade.buyOrder?.price))",
                    time: formatTime(trade.buyOrder?.placedAt),
                    isCompleted: false,
                    isCurrent: true
                ),
                TimelineStep(
                    label: "Sell at \(formatPrice(trade.expectedSellPrice))",
                    time: nil,
                    isCompleted: false,
                    isCurrent: false
                ),
            ]
        case "selling":
            return [
                TimelineStep(
                    label: "Buy at \(formatPrice(trade.buyOrder?.price))",
                    time: formatTime(trade.buyOrder?.placedAt),
                    isCompleted: true,
                    isCurrent: false
                ),
                TimelineStep(
                    label: "Bought",
                    time: formatTime(trade.buyOrder?.filledAt),
                    isCompleted: true,
                    isCurrent: false
                ),
                TimelineStep(
                    label: "Sell at \(formatPrice(trade.sellOrder?.price))",
                    time: formatTime(trade.sellOrder?.placedAt),
                    isCompleted: false,
                    isCurrent: true
                ),
                TimelineStep(
                    label: "Sold",
                    time: nil,
                    isCompleted: false,
                    isCurrent: false
                ),
            ]
        case "pending-sell":
            return [
                TimelineStep(
                    label: "Sell at \(formatPrice(trade.sellOrder?.price))",
                    time: formatTime(trade.sellOrder?.placedAt),
                    isCompleted: false,
                    isCurrent: true
                ),
                TimelineStep(
                    label: "Buy at \(formatPrice(trade.expectedBuyPrice))",
                    time: nil,
                    isCompleted: false,
                    isCurrent: false
                ),
            ]
        case "completed":
            return [
                TimelineStep(
                    label: "Buy at \(formatPrice(trade.buyOrder?.price))",
                    time: formatTime(trade.buyOrder?.placedAt),
                    isCompleted: true,
                    isCurrent: false
                ),
                TimelineStep(
                    label: "Bought",
                    time: formatTime(trade.buyOrder?.filledAt),
                    isCompleted: true,
                    isCurrent: false
                ),
                TimelineStep(
                    label: "Sell at \(formatPrice(trade.sellOrder?.price))",
                    time: formatTime(trade.sellOrder?.placedAt),
                    isCompleted: true,
                    isCurrent: false
                ),
                TimelineStep(
                    label: "Sold",
                    time: formatTime(trade.sellOrder?.filledAt),
                    isCompleted: true,
                    isCurrent: false
                ),
            ]
        default:
            return []
        }
    }

    private var statusColor: Color {
        switch trade.status {
        case "buying": .blue
        case "selling": .orange
        case "pending-sell": .purple
        case "completed": .green
        default: .secondary
        }
    }

    private var statusLabel: String {
        switch trade.status {
        case "buying": "Buying"
        case "selling": "Selling"
        case "pending-sell": "Pending"
        case "completed": "Completed"
        default: trade.status
        }
    }
}

// MARK: - TimelineStep

private struct TimelineStep {
    let label: String
    let time: String?
    let isCompleted: Bool
    let isCurrent: Bool
}

// MARK: - TimelineStepView

private struct TimelineStepView: View {
    let label: String
    let time: String?
    let isCompleted: Bool
    let isCurrent: Bool
    let isLast: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(spacing: 0) {
                Circle()
                    .fill(isCompleted ? .blue : isCurrent ? .blue.opacity(0.5) : .clear)
                    .overlay(Circle().stroke(isCompleted || isCurrent ? .blue : .gray.opacity(0.4), lineWidth: 2))
                    .frame(width: 10, height: 10)
                if !isLast {
                    Rectangle()
                        .fill(isCompleted ? .blue : .gray.opacity(0.2))
                        .frame(width: 2, height: 16)
                }
            }
            HStack {
                Text(label).font(.caption)
                Spacer()
                if let time {
                    Text(time)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Helpers

private func formatPrice(_ value: Double?) -> String {
    guard let value else { return "–" }
    return value.formatted(.currency(code: "USD"))
}

private func formatTime(_ iso: String?) -> String? {
    guard let iso else { return nil }
    return formatRelativeDate(iso)
}
