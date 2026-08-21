/**
 * @file Quo language
 * @author Vlad Krupinskii <vladkrupinskii@gmail.com>
 * @license ZLib
 */

/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  ternary: 1,
  or: 2,
  and: 3,
  equality: 4,
  comparison: 5,
  term: 6,
  factor: 7,
  unary: 8,
  call: 9,
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
        $.if_statement,
        $.loop_statement,
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
    if_statement: ($) =>
      seq(
        "if",
        field("condition", $.expression),
        field("consequence", $.block_statement),
        optional(
          seq(
            "else",
            field("alternative", choice($.if_statement, $.block_statement)),
          ),
        ),
      ),
    loop_statement: ($) =>
      seq(
        "loop",
        "(",
        optional(field("initializer", $.statement)),
        ",",
        optional(field("condition", $.expression)),
        ",",
        optional(field("increment", $.statement)),
        ")",
        field("body", $.block_statement),
      ),

    expression_statement: ($) => prec(0, $.expression),

    // Expressions
    expression: ($) =>
      choice(
        $.unary_expression,
        $.binary_expression,
        $.grouping_expression,
        $.ternary_expression,
        $.assignment_expression,
        $.function_expression,
        $.call_expression,
        $.member_access_expression,
        $.literal_expression,
      ),

    unary_expression: ($) =>
      prec(
        PREC.unary,
        seq(
          field("operator", choice("!", "-")),
          field("operand", $.expression),
        ),
      ),

    binary_expression: ($) => {
      const table = [
        ["or", PREC.or],
        ["and", PREC.and],
        [choice("==", "!="), PREC.equality],
        [choice("<", ">", "<=", ">="), PREC.comparison],
        [choice("+", "-"), PREC.term],
        [choice("*", "/", "%"), PREC.factor],
      ];

      return choice(
        ...table.map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field("left", $.expression),
              field("operator", operator),
              field("right", $.expression),
            ),
          ),
        ),
      );
    },

    grouping_expression: ($) => seq("(", $.expression, ")"),

    assignment_expression: ($) =>
      prec.right(
        2,
        seq(
          field("left", $.identifier),
          field("operator", choice("=", "+=", "-=", "*=", "/=")),
          field("right", $.expression),
        ),
      ),

    ternary_expression: ($) =>
      prec.right(
        PREC.ternary,
        seq(
          field("condition", $.expression),
          "?",
          field("consequence", $.expression),
          ":",
          field("alternative", $.expression),
        ),
      ),

    function_expression: ($) =>
      seq("fn", seq("(", commaSeparate($.identifier), ")"), $.statement),

    member_access_expression: ($) =>
      prec(
        PREC.call,
        seq(
          field("object", choice($.identifier, $.member_access_expression)),
          ".",
          field("member", $.identifier),
        ),
      ),

    call_expression: ($) =>
      prec(
        PREC.call,
        seq(
          field("function", choice($.identifier, $.member_access_expression)),
          field("arguments", seq("(", commaSeparate($.expression), ")")),
        ),
      ),

    // Literals
    literal_expression: ($) =>
      choice($.string, $.number, $.true, $.false, $.nil, $.array, $.dictionary),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,
    string: (_) => /"([^"\\]|\\.)*"/,
    number: (_) => /\d[_\d]*(\.\d[_\d]*)?/,
    nil: (_) => "nil",
    true: (_) => "true",
    false: (_) => "false",
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
