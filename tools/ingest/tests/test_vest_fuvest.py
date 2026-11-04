import sys
import unittest
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from atlas_ingest import vest_fuvest as v


class FuvestExtractor(unittest.TestCase):
    def test_clean_remove_marcas_e_espacos(self):
        self.assertEqual(v.clean("a¬ b   c #####"), "a b c")

    def test_gabarito_usa_a_primeira_coluna_e_deixa_anulada_de_fora(self):
        doc = pymupdf.open()
        page = doc.new_page()
        # linha 1: V (1-C, 46-E), K (1-D, 46-A); linha 3: V anulada ("*"), K responde
        text = "GABARITO\nPROVA V\nPROVA K\n1 C\n46 E\n1 D\n46 A\n2 B\n47 A\n2 E\n47 C\n3 *\n48 D E\n3 A\n48 B\n"
        page.insert_text((50, 80), text, fontsize=9)
        key = v.parse_key(doc)
        self.assertEqual(key[1], "C")
        self.assertEqual(key[46], "E")
        self.assertEqual(key[2], "B")
        self.assertIsNone(key[3], "anulada nunca vira resposta")
        self.assertIsNone(key[48], "duas letras = anulada")


if __name__ == "__main__":
    unittest.main()
