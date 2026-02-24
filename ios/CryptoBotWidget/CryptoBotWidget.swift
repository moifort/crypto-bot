import SwiftUI
import WidgetKit

// MARK: - Timeline

struct StatsEntry: TimelineEntry {
    let date: Date
    let stats: StatsData?
    let error: String?
}

// FIXME: Workaround for TimelineProvider's non-async API in Swift 6.
// Migrate to async TimelineProvider when WidgetKit exposes one.
private struct Callback<T>: @unchecked Sendable {
    let call: (T) -> Void
}

struct StatsProvider: TimelineProvider {
    func placeholder(in context: Context) -> StatsEntry {
        StatsEntry(date: .now, stats: .placeholder, error: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (StatsEntry) -> Void) {
        if context.isPreview {
            completion(StatsEntry(date: .now, stats: .placeholder, error: nil))
            return
        }
        let cb = Callback(call: completion)
        Task { cb.call(await fetchEntry()) }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StatsEntry>) -> Void) {
        let cb = Callback(call: completion)
        Task {
            let entry = await fetchEntry()
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
            cb.call(Timeline(entries: [entry], policy: .after(nextUpdate)))
        }
    }

    private func fetchEntry() async -> StatsEntry {
        do {
            let stats = try await APIClient.fetchStats()
            return StatsEntry(date: .now, stats: stats, error: nil)
        } catch {
            return StatsEntry(date: .now, stats: nil, error: error.localizedDescription)
        }
    }
}

// MARK: - Entry View

struct WidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: StatsEntry

    var body: some View {
        switch family {
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let entry: StatsEntry

    var body: some View {
        if let stats = entry.stats {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "bitcoinsign.circle.fill")
                        .foregroundStyle(.orange)
                    Text("CryptoBot")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Text(formatUsdc(stats.totalProfitUsdc))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(stats.totalProfitUsdc >= 0 ? .green : .red)

                Label("\(stats.tradeCount) trades", systemImage: "arrow.left.arrow.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                Text(formatUsdc(stats.currentPrice))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            errorPlaceholder(entry.error)
        }
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let entry: StatsEntry

    var body: some View {
        if let stats = entry.stats {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "bitcoinsign.circle.fill")
                            .foregroundStyle(.orange)
                        Text("CryptoBot")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Text(formatUsdc(stats.totalProfitUsdc))
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(stats.totalProfitUsdc >= 0 ? .green : .red)

                    Label("\(stats.tradeCount) trades", systemImage: "arrow.left.arrow.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Spacer()

                    Text(formatUsdc(stats.currentPrice))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Divider()

                VStack(alignment: .leading, spacing: 6) {
                    Label("\(stats.openBuyOrders) buy", systemImage: "arrow.down.circle")
                        .font(.caption)
                        .foregroundStyle(.green)

                    Label("\(stats.openSellOrders) sell", systemImage: "arrow.up.circle")
                        .font(.caption)
                        .foregroundStyle(.red)

                    Spacer()

                    Text(formatUsdc(stats.balanceUsdc))
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(formatBtc(stats.balanceBtc))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            errorPlaceholder(entry.error)
        }
    }
}

// MARK: - Widget

@main
struct CryptoBotWidget: Widget {
    let kind = "CryptoBotWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StatsProvider()) { entry in
            WidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("CryptoBot")
        .description("Trading bot stats at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Helpers

private func errorPlaceholder(_ error: String?) -> some View {
    VStack(spacing: 8) {
        Image(systemName: "wifi.slash")
            .font(.title2)
            .foregroundStyle(.secondary)
        Text(error ?? "No data")
            .font(.caption)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
    }
}

private func formatUsdc(_ value: Double) -> String {
    String(format: "$%.2f", value)
}

private func formatBtc(_ value: Double) -> String {
    String(format: "%.6f BTC", value)
}

// MARK: - Placeholder

extension StatsData {
    static let placeholder = StatsData(
        totalProfitUsdc: 142.50,
        tradeCount: 28,
        openBuyOrders: 5,
        openSellOrders: 4,
        balanceUsdc: 5000.0,
        balanceBtc: 0.05,
        currentPrice: 95000.0,
        gridConfig: GridConfig(
            id: "grid-001",
            lowerPrice: 80000,
            upperPrice: 100000,
            levels: 10,
            orderSizeUsdc: 500,
            spacing: 2000,
            createdAt: "2026-01-01T00:00:00Z"
        ),
        lastCycleAt: "2026-02-24T12:00:00Z"
    )
}
// MARK: - Previews

#Preview(as: .systemSmall) {
    CryptoBotWidget()
} timeline: {
    StatsEntry(date: .now, stats: .placeholder, error: nil)
}

#Preview(as: .systemMedium) {
    CryptoBotWidget()
} timeline: {
    StatsEntry(date: .now, stats: .placeholder, error: nil)
}

#Preview("Error State", as: .systemSmall) {
    CryptoBotWidget()
} timeline: {
    StatsEntry(date: .now, stats: nil, error: "Network unavailable")
}

