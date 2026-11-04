# Pipeline de questões oficiais de vestibular

Código em `tools/ingest/` (Python 3 + PyMuPDF, sem outras dependências). Tudo roda em desenvolvimento, na sua máquina, lendo fontes públicas. Nada é enviado ao Supabase, e nada é publicado sem passar pelos três portões descritos em `docs/licencas.md`.

## Etapas

```
discover → fetch → extract → keys → classify → difficulty → dedup → validate → (curadoria) → rights → publish → report
```

| Etapa | Módulo | O que faz |
| --- | --- | --- |
| discover | `discover_enem.py` | Lê a página oficial de cada ano do INEP e registra só URLs realmente encontradas (`sources/enem.json`). |
| fetch | `http_client.py`, `remote_zip.py` | Downloads com no mínimo 1 s entre requisições por host, até 4 tentativas com recuo, cache por ETag/Last-Modified e sha256. Dos zips de microdados lê só o `ITENS_PROVA` por faixas HTTP. |
| extract | `extract_pdf.py`, `build_question.py` | Texto nativo do PDF com geometria; colunas, caixas de largura total, subscritos, tabelas, figuras (raster e vetoriais) e fac-símile. Ignora cabeçalhos, rodapés e microimpressão. |
| keys | `keys.py` | Gabarito do PDF de cada caderno cruzado com `ITENS_PROVA`: identifica o `CO_PROVA` pela concordância das letras (mínimo 90%) e trata as três numerações de `CO_POSICAO`. |
| classify | `classify.py`, `taxonomy.json` | Léxico ponderado por sistema e tópico, com contexto humano e penalidade para contexto vegetal ou de ecologia. |
| difficulty | `difficulty.py` | Ver `docs/dificuldade.md`. |
| dedup | `dedup.py`, `enem_ingest.py` | O `CO_ITEM` oficial reúne os cadernos; shingles de 5 palavras (Jaccard ≥ 0,9) pegam repetições entre aplicações. |
| validate | `validate.py` | Rejeita item incompleto (enunciado, alternativas, gabarito, figuras, proveniência, lixo de codificação, palavras perdidas). |
| curadoria | `curation.py`, `curation/` | Texto alternativo, revisão visual, confirmação da classificação e comentário autoral, cada um com autoria e se houve revisão humana. |
| rights | `rights.py`, `rights_decisions.json` | Calcula o que o item contém e se a decisão da fonte cobre tudo. |
| publish | `publish.py` | Projeção determinística em `questions/official/` + `public/img/q/` só do que é `science_ok` e `cleared`. |
| preview | `preview.py` | Projeção restrita em `staging/preview/preview.json` para `tools/preview/server.js` (127.0.0.1). Status `preview`, sem direitos e sem comentário; itens com figura/tabela ou revisão visual aberta ficam de fora. Nunca escreve em `questions/` nem em `public/`. |
| report | `report.py` | Contagens por estágio, fonte, ano e sistema em `docs/cobertura.md`. |

## Estágios de um item

`integrity_failed`, `duplicate`, `out_of_scope`, `needs_visual_review`, `pending_science`, `science_ok`. Direitos (`rights.status`) e publicação são eixos separados; o relatório nunca conta item não publicado como disponível ao aluno.

## Verificação da extração

Cada questão guarda a lista de palavras que **não** foram recuperadas e das que sobraram, comparando o que o extrator montou com uma leitura independente das palavras da região no PDF. Qualquer palavra perdida rejeita o item. Palavras a mais mandam o item para revisão visual. O pipeline não reconstrói texto ausente.

Limitações conhecidas:

- Fontes sem mapa Unicode (alguns cadernos de 2017, 2018 e 2024) produzem texto ilegível. O item é aceito se outro caderno da mesma questão estiver legível; senão é rejeitado.
- **OCR opcional** (`ocr.py`, Tesseract com o idioma `por`): roda em página sem texto nativo (prova digitalizada) ou com camada de texto ilegível (mais de 6% de símbolos fora do alfabeto esperado). Como é lento, só o primeiro caderno de cada aplicação passa por OCR; os demais entram como cópias. Cada palavra traz a confiança do Tesseract; confiança média abaixo de 80 ou palavra abaixo de 50 rejeita a questão. Como não existe segunda leitura independente do texto, todo item vindo de OCR fica em `needs_visual_review` até uma **pessoa** conferir contra o PDF no servidor de revisão (revisão feita pelo assistente de IA não basta). Figuras dentro de páginas digitalizadas não são separadas do texto.
- **ENEM 2021 não foi recuperado.** Os PDFs de 2021 usam fontes sem mapa Unicode em quase todas as páginas. O OCR lê o texto com cerca de 96% de confiança, mas as letras das alternativas, desenhadas em círculo, saem como lixo de baixa confiança; sem elas, as alternativas não podem ser rotuladas sem adivinhar. Os 90 itens ficam em `integrity_failed`. Resolver isso exige um passo próprio (por exemplo, reconhecer o círculo como marcador e conferir a contagem de cinco alternativas com revisão humana).
- Subscritos soltos no meio de uma linha ficam como linha separada, visível na revisão.
- Questões discursivas são suportadas no servidor e na interface (`kind: "open"`), mas nenhum extrator de provas discursivas foi escrito.

## Comandos

```bash
python -I tools/ingest/run.py discover-enem --years 2015-2025
python -I tools/ingest/run.py ingest-enem   --years 2015-2025
python -I tools/ingest/run.py calibrate
python -I tools/ingest/run.py report
python -I tools/ingest/run.py publish          # só publica o que cumpre os três portões
python -I tools/ingest/run.py preview-export  # pré-visualização restrita (npm run preview)
python -I tools/ingest/review_server.py        # revisão local, só 127.0.0.1
python -m unittest discover -s tools/ingest/tests
```

## FUVEST (1ª fase)

`vest_fuvest.py` extrai a prova V (V1 desde 2025) e o gabarito oficial de cada ano em `staging/raw/fuvest/<ano>-prova.pdf` e `<ano>-gabarito.pdf` (`python -I tools/ingest/run.py ingest-fuvest --years 2019-2026`). Gera itens no mesmo formato do ENEM, então classificação, curadoria, direitos e publicação são as mesmas.

Só entra questão em texto puro: o extrator descarta (e conta) figura, gráfico e tabela na região da questão, texto sobrando depois da alternativa E, hifenização ambígua e gabarito anulado. Por isso o rendimento é baixo (cerca de 30 a 47 questões por ano, quase todas de linguagens, história e exatas; poucas de biologia humana). O gabarito vem da primeira coluna da tabela oficial e foi conferido pelo conteúdo nas questões de biologia publicadas.

Limitações: **2021 não foi recuperado** (fontes sem mapa Unicode, mesmo problema do ENEM 2021); questões com figura ficam de fora até haver texto alternativo e recorte conferido; Unicamp, Unesp e UFRGS ainda não têm extrator.

## UNICAMP (1ª fase)

`vest_unicamp.py` extrai o caderno e o gabarito oficiais da Comvest (2011 a 2015 e 2017; `staging/raw/unicamp/<ano>-prova.pdf` e `-gabarito.pdf`). Uma coluna, "QUESTÃO n", 4 alternativas (a a d). O gabarito traz uma coluna (ou página) por caderno e o PDF não diz qual é a do caderno baixado: `COLUMNS` registra a coluna por ano, decidida conferindo o conteúdo de questões de resposta conhecida (coluna 0 em todos os anos usados). Mesmas regras de descarte da FUVEST.

Fora: 2016 (gabarito não localizado), 2018 (gabarito só em imagem, exigiria leitura visual) e 2019 em diante (as páginas não listam os PDFs). A 2ª fase é discursiva e não tem extrator. O rendimento em biologia humana é baixo (poucas por ano).

**UNESP e UNIFESP**: os PDFs ficam no site da Vunesp, que responde 403 a acesso automatizado; não foi contornado. UFRGS publica Biologia por ano, mas o gabarito não está nas páginas do acervo; sem ele nada é publicado.

## Listas do Projeto Medicina (`vest_pm.py`)

Listas de exercícios em PDF aberto (`staging/raw/projetomedicina/*.pdf`: esqueleto e movimento, excreção, respiração, reprodução, histologia e sistema nervoso) com questões de vestibulares reais, a prova de origem de cada uma ("(Fuvest-1998)") e gabarito. O extrator guarda a prova informada pela lista, o endereço da lista em `source` (a questão mostra "Ver a lista de origem") e **nunca copia a resolução comentada** do site. Só entra múltipla escolha a-e em texto puro; figura, tabela e soma de proposições são descartadas.

O texto e o gabarito da lista não foram conferidos com a prova original, e o gabarito da lista **erra** em pelo menos um caso (Mack-2008, serotonina): por isso cada resposta publicada foi conferida pelo conteúdo, e o que não deu para conferir ficou fora. Sites cuja `robots.txt` declara `ai-input=no` (Toda Matéria) não são usados. As decisões de direitos `pm-<instituição>` usam a mesma base das demais (uso acadêmico, orientação verbal, sem autorização escrita).

## Revisão local

`review_server.py` escuta só em `127.0.0.1`, recusa `Host` que não seja loopback, não envia cabeçalhos CORS, exige o cabeçalho `X-Atlas-Review` e o nome de quem revisa nas escritas, e serve apenas `staging/media`. Mostra a questão como o aluno a verá (figuras, tabelas, alternativas clicáveis, gabarito) ao lado do fac-símile. Revisões feitas ali gravam `human: true`; o que o assistente de IA escreve usa `claude-assistido` e `human: false`.

O app principal **não** lê `staging/`: `bank.js` recusa pastas dentro de `staging/` e qualquer item sem `status: published`, direitos `cleared` com responsável e comentário autoral.

## Dados

- `staging/` (fora do git): PDFs brutos, `items/`, `media/`, `reports/`.
- `tools/ingest/curation/`: texto alternativo, revisão e comentários (versionado).
- `tools/ingest/rights_decisions.json`: decisões de direitos (editar à mão, só por pessoa responsável).
- `questions/official/`: itens publicados (lidos pelo servidor).
- Compatível com a tabela `answers` existente: `qid` = id do item (texto), `sel` = índice da alternativa; discursiva grava a autoavaliação com 0 pontos. Nenhuma mudança no esquema do Supabase.

## Comentário opcional e pré-visualização

- O **comentário autoral é opcional** para publicar: o portão exige integridade, classificação confirmada, texto alternativo das figuras e direitos liberados. Quando existe, precisa estar completo (um por alternativa, o do gabarito começa com "Correta") e registrar autoria. Ao aluno, o comentário só aparece se `science.explanation_human === true`; comentário elaborado com apoio de IA e sem revisão humana nunca é mostrado.
- A **pré-visualização restrita** serve para avaliar a experiência com questões reais sem publicá-las. `bank.js` aceita `problems(q, { preview: true })` só para itens com `status: "preview"`; o carregador de produção continua exigindo `published` + direitos liberados e recusa esses itens.
- A extração foi corrigida depois de uma conferência contra os PDFs (falsas tabelas, figuras que engoliam parágrafos, legendas sem símbolos, frações, pasta temporária compartilhada). O que ainda falha está em `docs/verificacao-preview.md`. A prévia só mostra item com figura ou tabela depois de uma comparação registrada em `tools/ingest/curation/preview_checks.json`; símbolo desenhado no meio do texto (`simbolo_vetorial_no_texto`) manda o item para revisão visual.
