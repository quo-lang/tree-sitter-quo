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
    break_statement: (_) => "break",
    continue_statement: (_) => "continue",

    expression: ($) => choice($.identifier, $.string, $.number),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,

    string: (_) => /"([^"\\]|\\.)*"/,
    number: ($) => /\d[_\d]*(\.\d[_\d]*)?/,

    line_comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
