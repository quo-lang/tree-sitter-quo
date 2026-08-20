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

    integer_literal: (_) => /[0-9][0-9_]*/,
    float_literal: (_) => {
      const decimal_digits = /[0-9_]+/;
      const leading_decimal_digit = /[0-9]/;
      const end = seq(".", decimal_digits);
      return token(
        choice(seq(leading_decimal_digit, optional(decimal_digits), end), end),
      );
    },
    number: ($) => choice($.integer_literal, $.float_literal),

    line_comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
