/**
 * @file Quo language
 * @author Vlad Krupinskii <vladkrupinskii@gmail.com>
 * @license ZLib
 */

/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  or: 1,
  and: 2,
  equality: 3,
  comparison: 4,
  term: 5,
  factor: 6,
  unary: 7,
  call: 8,
};

function commaSeparate(rule) {
  return optional(seq(rule, repeat(seq(",", rule)), optional(",")));
}

export default grammar({
  name: "quo",
  extras: ($) => [
    /\s/, // whitespace
    $.line_comment,
  ],
  rules: {
    source_file: ($) => repeat($.statement),

    statement: ($) =>
      choice(
        $.var_statement,
        $.block_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.expression_statement,
      ),

    var_statement: ($) =>
      seq(
        "var",
        field("name", $.identifier),
        optional(seq("=", field("value", $.expression))),
      ),
    block_statement: ($) => prec(1, seq("{", repeat($.statement), "}")),
    return_statement: ($) => prec.right(seq("return", optional($.expression))),
    break_statement: (_) => seq("break"),
    continue_statement: (_) => seq("continue"),
    expression_statement: ($) => prec(1, $.expression),

    // Expressions
    expression: ($) => choice($.literal, $.function_expression),

    function_expression: ($) =>
      seq(
        "fn",
        field("parameters", seq("(", commaSeparate($.identifier), ")")),
        field("body", $.statement),
      ),

    // Literals
    literal: ($) =>
      choice($.string, $.number, $.boolean, $.nil, $.array, $.dictionary),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,
    string: (_) => /"([^"\\]|\\.)*"/,
    number: (_) => /\d[_\d]*(\.\d[_\d]*)?/,
    boolean: (_) => token(choice("true", "false")),
    nil: (_) => "nil",
    array: ($) => seq("[", commaSeparate($.expression), "]"),
    dictionary: ($) =>
      seq(
        "{",
        commaSeparate(
          seq(field("key", $.string), ":", field("value", $.expression)),
        ),
        "}",
      ),

    // Comments
    line_comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
