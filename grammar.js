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
    identifier: ($) => /[a-z]+/,
    number: ($) => /\d+/,
  },
});
