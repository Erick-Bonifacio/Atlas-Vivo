# Conferência da extração contra os PDFs oficiais

Duas rodadas em 2026-11-01. A comparação é do fac-símile de cada item (`staging/media/.../fac0.png`, recorte da página do PDF oficial) com o que a extração entrega ao aluno (texto, figuras, tabelas, alternativas), feita pelo assistente de IA (`human: false`). **Nenhuma pessoa conferiu** e nenhum item é tratado como verificado. O resultado de cada item com figura ou tabela está em `tools/ingest/curation/preview_checks.json`.

## Rodada 1: o que a extração fazia de errado

Nos itens com figura ou tabela, a extração era infiel mesmo passando na checagem de palavras:

| Defeito | Exemplo | Efeito para o aluno |
| --- | --- | --- |
| "Tabela" falsa: linha de texto justificado partida em palavras soltas | `enem:2019:regular:60311` | O primeiro trecho do enunciado aparecia como uma linha de tabela. 196 "tabelas" em 1035 itens; quase nenhuma era tabela. |
| Figura engolia o parágrafo | `enem:2020:ppl:61083` | Hachura do gráfico (máscara do PDF) fazia a figura cobrir o texto, que virava imagem cortada. |
| Símbolos de legenda desenhados sumiam | `enem:2020:ppl:37791`, `enem:2024:regular:141775` | A legenda ficava só com os rótulos, sem os símbolos. |
| Fração empilhada virava dois números | `enem:2020:ppl:37791` | "1 4 (25%)" em vez de ¼. |
| Aba decorativa da página virava figura | vários de 2015 a 2019 | Um bloco cinza abria o enunciado. |
| Figura de alternativa assumida como figura do enunciado | `enem:2024:regular:141775` | A alternativa A aparecia antes das outras. |
| Pasta temporária dividida entre prova impressa e digital | `enem:2025:regular:141754` | O fac-símile (e, em tese, figuras) podia vir da questão de mesmo número da outra aplicação. |

## Correções (tools/ingest/atlas_ingest)

- `extract_pdf.py`: desenhos recortados pela máscara do PDF; fração empilhada com barra desenhada vira `n⁄d` (a contagem de palavras trata a barra como espaço); linhas na mesma altura só viram tabela se parecerem tabela (duas linhas ou mais, colunas alinhadas, vão entre células), senão voltam a ser texto; símbolo desenhado colado ao texto (seta, sinal) marca `simbolo_vetorial_no_texto` e manda o item para revisão visual.
- `build_question.py`: legenda (símbolo + rótulo) entra na figura; traços finos que atravessam texto corrido são ignorados; escala de cores (figura baixa) é figura; blocos e imagens de uma cor só (abas da página) são descartados; números de eixo, rótulos curtos e título girado do eixo y entram na figura; fim de parágrafo e fonte longa não entram; figura que contém o marcador da alternativa é dessa alternativa; o recorte não invade a linha vizinha.
- `enem_ingest.py`: uma pasta temporária por PDF (prova impressa e digital).
- Resultado na reextração dos 1035 itens: "tabelas" 196 → 4; reprovados na integridade 323 → 306 (17 recuperados, 3 novos: `enem:2016:segunda:13099`, `enem:2017:regular:59829`, `enem:2024:ppl:141612`, por perda de palavras); 143 itens com símbolo vetorial no texto foram para revisão visual (a maioria fora de biologia humana).
- Testes: `tools/ingest/tests/test_extract_layout.py` (11 casos sintéticos).

## Rodada 2: itens com figura ou tabela, depois das correções

21 itens de biologia humana com figura no enunciado ou nas alternativas, comparados um a um:

- **Conferem (18):** `enem:2015:ppl:26403`, `2015:regular:39317`, `2016:segunda:32452`, `2017:regular:81971`, `2018:ppl:85474`, `2018:ppl:96317`, `2019:ppl:10529`, `2020:ppl:37791`, `2020:ppl:61083`, `2022:ppl:62871`, `2022:regular:78716`, `2022:regular:96189`, `2023:regular:60332`, `2024:ppl:117781`, `2025:regular:141671`, `2025:regular:141754`, `2025:regular:141800`, `2025:regular:54287`. Entram na prévia.
- **Defeito (3), continuam retidos:** `enem:2015:ppl:18378` (rótulos da figura ficam fora dela, como texto solto), `enem:2016:regular:96212` (última linha do parágrafo ficou dentro da imagem), `enem:2024:regular:141775` (a figura da alternativa E é cortada pelo fim da página).

## Itens só de texto

53 sem fonte e 24 com linha de fonte. **6 foram comparados visualmente** (`enem:2023:ppl:10473`, `2023:ppl:89877`, `2019:regular:117642`, `2018:regular:111720`, `2022:regular:141726`, `2025:regular:141750`): palavras, ordem, alternativas e gabarito conferem. Os outros 71 passaram só pelas verificações automáticas (palavras do PDF presentes, gabarito do caderno cruzado com os microdados, alternativas A–E em ordem).

## Limitações que continuam

- Itálico e negrito não são preservados (nomes científicos, títulos de obras, autor da fonte).
- A linha de fonte e o título do texto às vezes ficam dentro do parágrafo. A interface separa o comando da questão depois de "(adaptado)." e de "Acesso em: … aaaa.", sem alterar palavras.
- Equações que estão em linha própria no PDF aparecem seguidas no parágrafo; setas de reação são desenhos e levam o item para revisão visual.
- Figura que atravessa a quebra de página ou de coluna sai cortada.
- ENEM 2021, FUVEST, UNICAMP e UNESP: sem itens (ver `docs/pipeline.md` e `docs/licencas.md`).
