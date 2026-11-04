# Licenças e direitos de reprodução

Este documento registra o que foi verificado sobre os direitos de cada fonte antes de qualquer questão oficial ser publicada no app, e o que ainda depende de autorização. **Não é parecer jurídico.** Evidências coletadas em 30/10/2026; a decisão de liberar é da pessoa responsável pelo projeto e fica registrada em `tools/ingest/rights_decisions.json`.

## Regra do projeto

Uma questão oficial só chega aos alunos quando passa por três etapas independentes:

1. integridade da extração (texto, figuras e gabarito conferidos com a prova oficial);
2. etapa científica (classificação confirmada e comentário autoral, com a autoria registrada);
3. direitos de reprodução liberados por uma pessoa, com `decided_by`, `decided_on`, `basis` e a lista de materiais cobertos (`text`, `figures`, `third_party_text`).

O pipeline nunca libera direitos sozinho. Itens que não cumprem as três ficam em `staging/`, pasta que não é versionada nem servida (ver `docs/pipeline.md`).

## Resumo por fonte

| Fonte | Situação | O que impede ou permite |
| --- | --- | --- |
| ENEM (INEP) | **Exige autorização** | Não há licença de reuso publicada para as provas. O site do INEP declara CC BY-ND 3.0, mas os PDFs ficam em outro domínio e os itens trazem material de terceiros. |
| FUVEST | **Bloqueado para verificação** | `fuvest.br/acervo-vestibular-2026/` responde HTTP 403 também no navegador. Termos não lidos. |
| UNICAMP (Comvest) | **Exige autorização** | Provas publicadas no site; licença de reprodução não localizada. |
| UNESP (VUNESP) | **Exige autorização** | Página de estatísticas só tem relatórios; provas ficam em páginas dinâmicas da área do candidato. Termos não localizados. |
| OpenStax Anatomia e Fisiologia 2e | **Só consulta e citação** | CC BY-NC-SA 4.0. Nenhum texto ou imagem foi importado. |
| Oregon State A&P | **Só citação** | Acesso automatizado bloqueado (403); licença não conferida. |
| BVS/Ministério da Saúde | **Só consulta e citação** | Publicações oficiais; sem importação. |
| Imagens do atlas e das aulas | **Publicável com crédito** | BodyParts3D (© DBCLS, CC BY 4.0), diagramas do Wikimedia Commons com licença indicada em cada figura. |

## ENEM: o que foi encontrado

- Texto de licença localizado: *"Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada"* (CC BY-ND 3.0), na página dos microdados do ENEM em `gov.br/inep`. Essa licença permite redistribuir **sem alterações** e com atribuição; veda obras derivadas.
- Os PDFs de provas e gabaritos estão em `download.inep.gov.br`. Não foi encontrado aviso equivalente nesses arquivos, nem no edital e no *Leia-me* do ENEM 2023 (microdados).
- Cada item pode conter textos, charges, fotografias e gráficos de terceiros (linhas "Disponível em…", "Adaptado de…"). O INEP não licencia esse material. A Lei 9.610/1998, art. 46, VIII, admite a reprodução de pequenos trechos de obras preexistentes sob condições; imagens e obras integrais exigem autorização do titular.
- O texto e as figuras de um item reapresentado em outro layout, com comentário próprio, podem ou não ser tratados como "adaptação" pela licença CC BY-ND. Isso precisa ser confirmado.

**Caminho para liberar:** pedir confirmação por escrito ao INEP (Fala.BR) sobre a reprodução integral, com atribuição, em plataforma educacional gratuita e sobre o material de terceiros. Registrar protocolo e resposta em `rights_decisions.json`, preenchendo `covers` com o que foi autorizado. Um item só é considerado liberado se a decisão cobrir todos os materiais que ele contém: um item só de texto precisa de `text`; um item com figura, também de `figures`; um item com linha de fonte, também de `third_party_text`.

## FUVEST, UNICAMP e UNESP

- **FUVEST:** o endereço do acervo respondeu 403 ao pipeline e ao navegador. Sem acesso, nada foi extraído, e não há como afirmar o que os termos permitem.
- **UNICAMP:** os PDFs de provas e gabaritos aparecem nas páginas de cada ano (por exemplo, "Provas Q e Y", "Gabarito Q e Z" e "Respostas esperadas" da segunda fase). Alguns links da página de 2025 apontam para arquivos enviados em 2023: é necessário conferir o ano no próprio PDF antes de usar. Termos de reprodução não localizados.
- **UNESP/VUNESP:** o endereço informado é de relatórios estatísticos. As provas estão nas páginas "Provas e Gabaritos" da área do candidato de cada vestibular, que clientes automatizados não conseguem acessar (HTTP 403). O pipeline não contorna esse bloqueio.

Em todos os casos o caminho é pedir autorização escrita à instituição e registrar a decisão.

## Fontes de conteúdo das aulas

As aulas são texto original em português. Os fatos foram conferidos nas referências listadas ao fim de cada aula; nenhum texto, tabela ou figura foi copiado.

- **OpenStax, Anatomia e Fisiologia 2e:** a página do livro indica CC BY-NC-SA 4.0 (atribuição, uso não comercial, compartilhamento pela mesma licença). Reproduzir ou adaptar trechos tornaria o material derivado sujeito a NC-SA. Por isso as aulas apenas citam o livro. Restrições específicas ao uso por IA não foram encontradas no texto da licença; não foi feita consulta ao termo de uso do site.
- **Oregon State:** o endereço informado responde 403 a clientes automatizados; licença não conferida.
- **Ministério da Saúde (BVS):** usado como fonte de política pública (calendário vacinal, Guia Alimentar, saneamento). Sem cópia de trechos.

## Imagens

Registradas em `public/lessons.js` (`IMG`) com autor e licença na legenda. As figuras das aulas aprofundadas reutilizam essas imagens; nenhuma figura nova foi adicionada. Figuras extraídas de provas ficam em `staging/media` e só vão para `public/img/q/` junto com a questão, depois da liberação.


## Investigação de 2026-11-01 (continuação)

Consultas feitas nas páginas oficiais; nenhuma decisão de direitos foi alterada em `rights_decisions.json` (todas seguem `needs_authorization`).

| Fonte | O que a página oficial diz | Consequência |
| --- | --- | --- |
| INEP (`gov.br/inep`), Plano de Dados Abertos | Rodapé: "Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada". A página não lista provas ou gabaritos como conjunto de dados abertos (só microdados, Inep Data e sinopses) e não diz se a licença cobre os PDFs em `download.inep.gov.br`. | A licença do site não basta como base: precisa de confirmação escrita do INEP para os PDFs e para o material de terceiros dentro dos itens. |
| UNICAMP (Comvest) | Rodapé: "© 2026 COMVEST. Todos os Direitos Reservados." Sem termos de uso para provas anteriores. | Exige autorização escrita (contato: Fale Conosco / vestibular@unicamp.br). |
| FUVEST | A busca encontrou o acervo (provas desde 1977) mas nenhum termo de reprodução; o acesso automatizado segue bloqueado (403). | Exige autorização escrita. |
| UNESP (VUNESP) | Sem termos localizados; acesso automatizado bloqueado. | Exige autorização escrita. |

**O que dá para liberar primeiro, se o INEP autorizar.** Dos 95 itens que hoje aparecem na pré-visualização restrita (biologia humana), **53 só têm texto** (a decisão precisa cobrir apenas `text`), **24 trazem linha de fonte** de terceiros (também `third_party_text`) e **18 têm figura** (também `figures`, e a figura costuma ser de terceiros). Três itens com figura seguem retidos por defeito de extração. O texto do pedido está em `docs/pedido-autorizacao.md`, para a pessoa responsável enviar pelo Fala.BR.

**Bloqueio atual:** nenhuma questão real chega ao aluno. A pré-visualização existe só para avaliar a experiência e a fidelidade da extração, em 127.0.0.1.
