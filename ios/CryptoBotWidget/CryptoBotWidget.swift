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
        Group {
            switch family {
            case .systemMedium:
                MediumWidgetView(entry: entry)
            default:
                SmallWidgetView(entry: entry)
            }
        }
        .containerBackground(for: .widget) {
            Color.clear
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let entry: StatsEntry

    var body: some View {
        if let stats = entry.stats {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 2) {
                    Text(formatPercentage(profit: stats.totalProfitUsdc, sommeMise: stats.sommeMiseUsdc))
                        .foregroundStyle(stats.totalProfitUsdc >= 0 ? .green : .red)
                }
                .font(.system(size: 87, weight: .regular, design: .default))
                .padding(.top, -15)
                .padding(.bottom, -12)

                Spacer()

                HStack(spacing: 2) {
                    Text(formatProfitWithSign(stats.totalProfitUsdc))
                    Text("·")
                    Text(formatPortfolioValue(stats.sommeMiseUsdc + stats.totalProfitUsdc))
                }
                .font(.caption)
                .foregroundStyle(.secondary)


                HStack(spacing: 2) {
                    Image(systemName: "clock.arrow.circlepath")
                    Text("\(stats.tradeCount)")
                    Text("·")
                    Image(systemName: "hourglass")
                    Text("\(stats.openBuyOrders + stats.openSellOrders)")
                    Text("·")
                    Text("\(formatUsdc(stats.totalFeesUsdc)) fees")
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                HStack {
                    if let relative = formatRelativeDate(stats.lastCycleAt) {
                        Text(relative)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    if stats.sandboxMode {
                        Spacer()
                        Text("SANDBOX")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.orange)
                    }
                }
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
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 2) {
                    Text(formatPercentage(profit: stats.totalProfitUsdc, sommeMise: stats.sommeMiseUsdc))
                        .foregroundStyle(stats.totalProfitUsdc >= 0 ? .green : .red)
                }
                .font(.system(size: 100, weight: .regular, design: .default))
                .padding(.top, -22)
                .padding(.bottom, -13)


                HStack(spacing: 4) {
                    Text(formatProfitWithSign(stats.totalProfitUsdc))
                    Text("·")
                    Text(formatPortfolioValue(stats.sommeMiseUsdc + stats.totalProfitUsdc))
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                HStack(spacing: 4) {
                    Image(systemName: "clock.arrow.circlepath")
                    Text("\(stats.tradeCount)")
                    Text("·")
                    Image(systemName: "hourglass")
                    Text("\(stats.openBuyOrders + stats.openSellOrders)")
                    Text("·")
                    Text("\(formatUsdc(stats.totalFeesUsdc)) fees")
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                HStack {
                    HStack(spacing: 2) {
                        Text("\(stats.openBuyOrders) buy")
                        Text("·")
                        Text("\(stats.openSellOrders) sell")
                        Text("·")
                        Text("\(stats.openBuyOrders + stats.openSellOrders)")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    Spacer()

                    if stats.sandboxMode {
                        Text("SANDBOX")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.orange)
                    }

                    if let relative = formatRelativeDate(stats.lastCycleAt) {
                        Text(relative)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
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

private func formatProfit(_ value: Double) -> String {
    formatUsdc(value)
}

private func formatProfitWithSign(_ value: Double) -> String {
    let sign = value >= 0 ? "+" : "-"
    return "\(sign)\(formatUsdc(value))"
}

private func formatUsdc(_ value: Double) -> String {
    String(format: "$%.0f", abs(value))
}

private func formatPortfolioValue(_ total: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.maximumFractionDigits = 0
    formatter.groupingSeparator = "\u{202F}"
    let formatted = formatter.string(from: NSNumber(value: total)) ?? "\(Int(total))"
    return "$\(formatted)"
}

private func formatRelativeDate(_ isoString: String?) -> String? {
    guard let isoString else { return nil }
    let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    guard let date = isoFormatter.date(from: isoString) else { return nil }
    let formatter = RelativeDateTimeFormatter()
    formatter.locale = Locale(identifier: "fr_FR")
    formatter.unitsStyle = .full
    return formatter.localizedString(for: date, relativeTo: .now)
}

private func formatPercentage(profit: Double, sommeMise: Double) -> AttributedString {
    guard sommeMise > 0 else {
        var result = AttributedString("0")
        var percentSymbol = AttributedString("%")
        percentSymbol.font = .system(size: 25).bold()
        result.append(percentSymbol)
        return result
    }
    let percentage = (profit / sommeMise) * 100
    let numberString = String(format: "%.0f", abs(percentage))

    var result = AttributedString(numberString)
    var percentSymbol = AttributedString("%")
    percentSymbol.font = .system(size: 25).bold()
    result.append(percentSymbol)

    return result
}

// MARK: - Placeholder

extension StatsData {
    static let placeholder = StatsData(
        totalProfitUsdc: 1242.50,
        totalFeesUsdc: 42.0,
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
            version: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
            recenteredAt: nil
        ),
        lastCycleAt: "2026-02-25T12:00:00.000Z",
        sandboxMode: true,
        sommeMiseUsdc: 5000.0
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
