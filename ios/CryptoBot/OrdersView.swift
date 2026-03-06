import SwiftUI

struct OrdersView: View {
    @State private var orders: [OrderData] = []
    @State private var error: String?
    @State private var loading = false

    private var sellOrders: [OrderData] {
        orders.filter { $0.side == "sell" && $0.status != "filled" }
    }

    private var buyOrders: [OrderData] {
        orders.filter { $0.side == "buy" && $0.status != "filled" }
    }

    private var filledOrders: [OrderData] {
        orders.filter { $0.status == "filled" }
    }

    var body: some View {
        Group {
            if loading && orders.isEmpty {
                ProgressView("Loading...")
            } else if !orders.isEmpty {
                ordersList
            } else if let error {
                errorView(error)
            } else {
                ContentUnavailableView(
                    "No Orders",
                    systemImage: "list.bullet",
                    description: Text("Active orders will appear here")
                )
            }
        }
        .navigationTitle("Orders")
        .refreshable { await loadOrders() }
        .task { await loadOrders() }
    }

    private var ordersList: some View {
        List {
            if !filledOrders.isEmpty {
                Section("Pending Trades") {
                    ForEach(filledOrders) { order in
                        PendingTradeRow(order: order)
                    }
                }
            }
            if !sellOrders.isEmpty {
                Section("Sell Orders") {
                    ForEach(sellOrders) { order in
                        OrderRow(order: order)
                    }
                }
            }
            if !buyOrders.isEmpty {
                Section("Buy Orders") {
                    ForEach(buyOrders) { order in
                        OrderRow(order: order)
                    }
                }
            }
        }
        .accessibilityIdentifier("orders-list")
    }

    private func errorView(_ message: String) -> some View {
        ContentUnavailableView {
            Label("Error", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        } actions: {
            Button("Retry") { Task { await loadOrders() } }
                .buttonStyle(.bordered)
        }
    }

    private func loadOrders() async {
        loading = true
        defer { loading = false }
        do {
            orders = try await APIClient.fetchOrders()
            error = nil
        } catch {
            self.orders = []
            self.error = error.localizedDescription
        }
    }
}

private struct OrderRow: View {
    let order: OrderData

    private var sideColor: Color {
        order.side == "buy" ? .green : .red
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Level \(order.level)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(sideColor.opacity(0.15))
                    .foregroundStyle(sideColor)
                    .clipShape(.capsule)

                Text(order.side.uppercased())
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(sideColor)

                Spacer()

                Text(order.price, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
            }

            HStack {
                Text(order.sizeBtc, format: .number.precision(.fractionLength(6)))
                + Text(" BTC")
                Spacer()
                Text(order.sizeUsdc, format: .currency(code: "USD"))
                    .foregroundStyle(.secondary)
            }
            .font(.subheadline)

            HStack {
                Text(order.status)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text(formatRelativeDate(order.createdAt))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

private struct PendingTradeRow: View {
    let order: OrderData

    private var isBuy: Bool { order.side == "buy" }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Level \(order.level)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(.orange.opacity(0.15))
                    .foregroundStyle(.orange)
                    .clipShape(.capsule)

                Text(isBuy ? "BOUGHT" : "SOLD")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.orange)

                Spacer()

                Text(order.price, format: .currency(code: "USD"))
                    .fontWeight(.semibold)
            }

            if let counterPrice = order.expectedCounterPrice {
                HStack {
                    Image(systemName: "arrow.right")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(isBuy ? "sell at" : "buy at")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(counterPrice, format: .currency(code: "USD"))
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }

            HStack {
                Text(order.sizeBtc, format: .number.precision(.fractionLength(6)))
                + Text(" BTC")
                Spacer()
                Text(formatRelativeDate(order.updatedAt))
                    .foregroundStyle(.secondary)
            }
            .font(.subheadline)
        }
        .padding(.vertical, 4)
    }
}
