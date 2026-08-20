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

  rules: {
    number: ($) => /\d[_\d]*(\.\d[_\d]*)?/,
    string: ($) => /"([^"\\]|\\.)*"/,
    boolean: ($) => choice("true", "false"),
    nil: ($) => "nil",
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    comment: ($) => token(choice(seq("#", /.*/))),
  },
});
