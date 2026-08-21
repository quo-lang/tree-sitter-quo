import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.quo.TreeSitterQuo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterQuoTest {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterQuo.language()));
    }
}
