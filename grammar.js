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

    _statement: ($) => choice($.var_statement, $.return_statement),

    var_statement: ($) =>
      seq("var", $.identifier, optional(seq("=", $.expression))),

    return_statement: ($) => seq("return", $.expression),

    expression: ($) => choice($.identifier, $.string, $.number),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,

    string: (_) => /"([^"\\]|\\.)*"/,
    number: ($) => /\d[_\d]*(\.\d[_\d]*)?/,

    line_comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
