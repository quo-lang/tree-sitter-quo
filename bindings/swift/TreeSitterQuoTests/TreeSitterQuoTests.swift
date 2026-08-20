import XCTest
import SwiftTreeSitter
import TreeSitterQuo

final class TreeSitterQuoTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_quo())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Quo grammar")
    }
}
