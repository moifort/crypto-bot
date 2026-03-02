import Foundation

func formatRelativeDate(_ iso: String) -> String {
    let formatter = ISO8601DateFormatter()
    guard let date = formatter.date(from: iso) else { return iso }
    let relative = RelativeDateTimeFormatter()
    relative.unitsStyle = .abbreviated
    return relative.localizedString(for: date, relativeTo: .now)
}
