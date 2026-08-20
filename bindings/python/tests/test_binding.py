from unittest import TestCase

from tree_sitter import Language, Parser
import tree_sitter_quo


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            Parser(Language(tree_sitter_quo.language()))
        except Exception:
            self.fail("Error loading Quo grammar")
