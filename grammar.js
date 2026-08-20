/**
 * @file Quo language
 * @author Vlad Krupinskii <vladkrupinskii@gmail.com>
 * @license ZLib
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "quo",
  extras: ($) => [
    /\s/, // whitespace
    $.line_comment,
  ],
  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.var_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
      ),

    var_statement: ($) =>
      seq(
        "var",
        field("name", $.identifier),
        optional(seq("=", field("value", $.expression))),
      ),

    return_statement: ($) => seq("return", optional($.expression)),
    break_statement: (_) => seq("break"),
    continue_statement: (_) => seq("continue"),

    expression: ($) => choice($.literal),

    // Literals
    literal: ($) => choice($.string, $.number, $.boolean, $.nil),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,
    string: (_) => /"([^"\\]|\\.)*"/,
    number: (_) => /\d[_\d]*(\.\d[_\d]*)?/,
    boolean: (_) => token(choice("true", "false")),
    nil: (_) => "nil",

    line_comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
