// Define precedence levels BEFORE the grammar
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

module.exports = grammar({
  name: "quo",

  extras: ($) => [/\s/, $.comment],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.variable_declaration,
        $.function_definition,
        $.return_statement,
        $.if_statement,
        $.loop_statement,
        $.break_statement,
        $.continue_statement,
        $.expression_statement,
        $.block,
      ),

    // Variable declaration
    variable_declaration: ($) =>
      seq(
        "var",
        field("name", $.identifier),
        optional(seq("=", field("value", $.expression))),
      ),

    // Function definition
    function_definition: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameters),
        field("body", $.block),
      ),

    // Function expression (anonymous)
    function_expression: ($) =>
      seq("fn", field("parameters", $.parameters), field("body", $.block)),

    parameters: ($) => seq("(", commaSep($.identifier), ")"),

    // Return statement
    return_statement: ($) => prec.right(seq("return", optional($.expression))),

    // If statement
    if_statement: ($) =>
      seq(
        "if",
        field("condition", $.expression),
        field("consequence", $.block),
        optional(
          seq("else", field("alternative", choice($.if_statement, $.block))),
        ),
      ),

    // Loop statement
    loop_statement: ($) =>
      seq(
        "loop",
        "(",
        optional($._statement),
        ",",
        optional($.expression),
        ",",
        optional($._statement),
        ")",
        field("body", $.block),
      ),

    break_statement: ($) => "break",
    continue_statement: ($) => "continue",

    // Block - FIX: Higher precedence to resolve conflict with dictionary
    block: ($) => prec(1, seq("{", repeat($._statement), "}")),

    // Expression statement
    expression_statement: ($) => prec(1, $.expression),

    // Expressions
    expression: ($) =>
      choice(
        $.assignment,
        $.ternary,
        $.binary,
        $.unary,
        $.call,
        $.member_access,
        $.grouping,
        $.literal,
        $.identifier,
      ),

    assignment: ($) =>
      prec.right(
        2,
        seq(
          field("left", $.identifier),
          field("operator", choice("=", "+=", "-=", "*=", "/=")),
          field("right", $.expression),
        ),
      ),

    ternary: ($) =>
      prec.right(
        seq(
          field("condition", $.expression),
          "?",
          field("consequence", $.expression),
          ":",
          field("alternative", $.expression),
        ),
      ),

    binary: ($) => {
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

    unary: ($) =>
      prec(
        PREC.unary,
        seq(
          field("operator", choice("!", "-")),
          field("operand", $.expression),
        ),
      ),

    // Call with higher precedence
    call: ($) =>
      prec(
        PREC.call,
        seq(field("function", $.expression), field("arguments", $.arguments)),
      ),

    arguments: ($) => seq("(", commaSep($.expression), ")"),

    member_access: ($) =>
      prec(
        PREC.call,
        seq(field("object", $.expression), ".", field("member", $.identifier)),
      ),

    grouping: ($) => seq("(", $.expression, ")"),

    literal: ($) =>
      choice(
        $.number,
        $.string,
        $.boolean,
        $.nil,
        $.array,
        $.dictionary,
        $.function_expression,
      ),

    number: ($) => /\d[_\d]*(\.\d[_\d]*)?/,
    string: ($) => /"([^"\\]|\\.)*"/,
    boolean: ($) => choice("true", "false"),
    nil: ($) => "nil",

    array: ($) => seq("[", commaSep($.expression), "]"),

    // Dictionary - FIX: Lower precedence than block
    dictionary: ($) =>
      seq(
        "{",
        commaSep(
          seq(field("key", $.expression), ":", field("value", $.expression)),
        ),
        "}",
      ),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    comment: ($) => token(choice(seq("#", /.*/), seq("#|", /(.|\n)*?/, "|#"))),
  },
});

function commaSep(rule) {
  return optional(seq(rule, repeat(seq(",", rule)), optional(",")));
}
