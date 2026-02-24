import SwiftUI

@main
struct CryptoBotApp: App {
    @Environment(\.scenePhase) private var scenePhase

    init() {
        UserDefaults.standard.register(defaults: [
            APIClient.serverURLKey: APIClient.defaultServerURL
        ])
        Self.syncSettings()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                Self.syncSettings()
            }
        }
    }

    /// Bridge Settings.bundle values (standard UserDefaults) to App Group for widget access
    private static func syncSettings() {
        let url = UserDefaults.standard.string(forKey: APIClient.serverURLKey)
            ?? APIClient.defaultServerURL
        UserDefaults(suiteName: APIClient.appGroupId)?.set(url, forKey: APIClient.serverURLKey)
    }
}
