import XCTest

final class CryptoBotUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testDashboardLoads() {
        let dashboard = app.collectionViews["dashboard"]
        XCTAssertTrue(dashboard.waitForExistence(timeout: 15), "Dashboard should load")

        XCTAssertTrue(dashboard.staticTexts["Profit"].exists, "Should show Profit")
        XCTAssertTrue(dashboard.staticTexts["BTC Price"].exists, "Should show BTC Price")

        let errorLabel = app.staticTexts["Error"]
        XCTAssertFalse(errorLabel.exists, "Should not show error view")
    }

    func testTradesViewLoads() {
        let dashboard = app.collectionViews["dashboard"]
        XCTAssertTrue(dashboard.waitForExistence(timeout: 15))

        app.buttons["nav-trades"].tap()

        let navBar = app.navigationBars["Trades"]
        XCTAssertTrue(navBar.waitForExistence(timeout: 10), "Trades view should load")

        let errorLabel = app.staticTexts["Error"]
        XCTAssertFalse(errorLabel.exists, "Should not show error view")
    }

}
