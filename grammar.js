/**
 * @file Quo language
 * @author Vlad Krupinskii <vladkrupinskii@gmail.com>
 * @license ZLib
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "quo",

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) => choice($.return_statement),

    return_statement: ($) => seq("return", $.expression),

    expression: ($) =>
      choice(
        $.identifier,
        $.number,
        // TODO: other kinds of expressions
      ),

    identifier: ($) => /[a-z]+/,
    number: ($) => /\d+/,
  },
});
