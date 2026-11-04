# Atlas Vivo

Atlas 3D do corpo humano com aula, quizzes comentados e gamificação. Projeto da disciplina de Computação Aplicada à Educação.

## Como rodar

Precisa do Node.js 22.13 ou mais novo.

```
npm install
npm start
```

Abra http://localhost:8765. Para outra porta: `PORT=3000 npm start`.

### Desenvolvimento local (Windows, Node 22 e PostgreSQL local)

Requisitos: **Node.js 22.13 ou mais novo** (`node --version`) e um **PostgreSQL local** (por exemplo, os binários portáteis; sem TLS). Nada disso toca o Supabase: os scripts abaixo leem `.env.dev`, que aponta para `127.0.0.1` e é recusado se apontar para outro host.

```
# 1. banco local (uma vez por sessão; ajuste os caminhos)
pg_ctl -D <pasta-pgdata> -o "-p 55432 -c listen_addresses=127.0.0.1" start

# 2. app com o banco OFICIAL real (hoje vazio: mostra os estados vazios honestos)
npm run dev          # http://localhost:8765

# 3. mesmo app com questões FICTÍCIAS, só para demonstrar a mecânica (faixa "DEMONSTRAÇÃO — DADOS FICTÍCIOS")
npm run dev:demo     # http://localhost:8765

# 4. pré-visualização RESTRITA com questões reais ainda sem direitos liberados (só 127.0.0.1, sem banco)
python -I tools/ingest/run.py preview-export
npm run preview      # http://127.0.0.1:8791

# 5. revisão local dos itens extraídos (fac-símile ao lado do texto)
npm run review       # http://127.0.0.1:8790
```

`.env.dev` (não versionado): `PGHOST=127.0.0.1`, `PGPORT=55432`, `PGDATABASE=postgres`, `PGUSER`, `PGPASSWORD`, `PGSSL=disable`, `PGSCHEMA=atlasvivo_dev`, `PORT=8765`. Se a porta 8765 já estiver em uso, defina `PORT` ou pare o outro servidor.

A pré-visualização (`tools/preview`) **nunca** vai para produção: não é importada por `server.js`, o deploy não inclui `tools/` nem `staging/`, ela recusa `Host` que não seja local e não grava nada em banco. Ver `docs/licencas.md`.

### Turmas e ranking

- **Professor:** marca "Sou professor(a)" no cadastro (ou em Minha conta), cria turmas em Minha conta e passa o código de 6 caracteres aos alunos. Ele aprova ou recusa cada pedido e remove alunos.
- **Aluno:** informa o código no cadastro ou em Minha conta e fica "aguardando aprovação". Com a turma aprovada, o ranking de Quizzes ganha as abas **Minha turma** e **Geral**, cada uma com a posição dele. Sem turma, só o geral.
- **Banco:** `users.professor`, `turmas` e `turma_membros` são criadas pelo servidor ao iniciar, como as outras tabelas. Excluir a conta do professor apaga as turmas dele.
- **Pontos e sons:** cada acerto soma pontos (10, 15 ou 20) e erro não tira nada. Acerto, erro e subida de nível têm som próprio (gerado no navegador), e o selo do topo anima o "+N".

## Banco de dados

PostgreSQL no Supabase. A conexão fica no arquivo `.env`:

```
PGHOST=aws-0-us-west-2.pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.<id-do-projeto>
PGPASSWORD='<senha>'
```

A porta 6543 é o pooler do Supabase em modo transação, que aguenta muitas conexões curtas (necessário no Vercel). Ao trocar a senha no Supabase, atualize `PGPASSWORD` e reinicie o servidor. Não publique o `.env`.

As tabelas (`users`, `sessions`, `answers`) são criadas sozinhas na primeira execução, no esquema `atlasvivo`. Elas ficam fora do esquema `public` de propósito: no Supabase, o que está em `public` é exposto pela API REST do projeto.

A conexão usa TLS verificado com o certificado `supabase-ca.crt`.

## Publicar no Vercel

O repositório já está preparado: `public/` vai para a CDN e `api/index.js` atende toda a API como função (`vercel.json` faz o encaminhamento).

1. Importe o repositório no Vercel com o preset **Other**. Não precisa de comando de build.
2. Em *Settings → Environment Variables*, defina `PGHOST`, `PGPORT=6543`, `PGDATABASE`, `PGUSER` e `PGPASSWORD`.
3. Faça o deploy. A função roda em `pdx1` (Portland), perto do banco em `us-west-2`; se o banco mudar de região, ajuste `regions` no `vercel.json`.

No Vercel o cookie de sessão sai com `Secure`, e o limite de tentativas de login vale por instância da função.

## O que tem

- **Explorar**: cena 3D com 931 estruturas (BodyParts3D © DBCLS, CC BY 4.0), camadas por sistema e busca.
- **Trilha de estudo**: 11 etapas. Uma etapa fica concluída quando a aula é lida e o quiz é respondido.
- **Aulas**: 13 aulas aprofundadas, uma para cada sistema e etapa da trilha, com capítulos, tabelas, mecanismos passo a passo, erros comuns, síntese, flashcards, temas cobrados em vestibulares e referências (ver `public/lessons/`). A do cardiovascular mantém a aula principal e ganha um aprofundamento aberto no encerramento.
- **Contas**: cadastro, login, edição de dados, troca de senha e exclusão da conta.
- **Banco de questões oficiais** (aba *Provas*): questões reais de vestibulares com gabarito do caderno exato, origem identificada (prova, caderno, número, página e link do PDF oficial) e resolução comentada, filtráveis por sistema, tema, prova, ano, dificuldade e tipo, com paginação. Só aparecem questões que passaram por extração conferida, comentário autoral e **direitos de reprodução liberados por uma pessoa**; hoje o banco publicado está vazio por esse último motivo (ver `docs/licencas.md` e `docs/cobertura.md`).
- **Quizzes**: 13 quizzes, 52 questões autorais. Depois de cada resposta aparecem o gabarito e um comentário para cada alternativa. Onze questões são respondidas clicando na estrutura no modelo 3D.
- **Modelo 3D integrado**: nas aulas, um painel ao lado do texto mostra o sistema de cada seção, e termos do texto destacam a estrutura no modelo. No atlas, o cartão da seleção traz o trecho da aula sobre aquela estrutura.
- **Ampliações didáticas**: duas cenas esquemáticas animadas, fora de escala: a rede capilar (aula do cardiovascular, seção "Trocas nos tecidos") e o alvéolo (aula do respiratório, seção "Ventilação e trocas").
- **Gamificação**: pontos, 8 níveis, 6 medalhas e ranking.

### Pontuação

| Ação | Pontos |
| --- | --- |
| Questão básica certa | 10 |
| Questão intermediária certa | 15 |
| Quiz completo | +20 |
| Cada aula concluída | +30 |

Vale a primeira resposta de cada questão. A cada 150 pontos, um nível.

## Testes

Precisam de Node 22.13 ou mais novo.

```
npm run test:unit   # regras, banco, vazamento de gabarito, aulas, contrato da interface e pré-visualização: sem banco de dados
npm run test:e2e    # API de ponta a ponta contra um Postgres LOCAL
python -m unittest discover -s tools/ingest/tests   # pipeline de questões
```

O teste de ponta a ponta cria e apaga o esquema `atlasvivo_test` e **recusa-se a rodar** se `PGHOST` não for `localhost`, `127.0.0.1` ou `::1`. Copie `.env.test.example` para `.env.test` e aponte para um Postgres de desenvolvimento (por exemplo, binários locais do PostgreSQL; sem TLS, com `PGSSL=disable`). Nunca use o banco do Supabase: o teste não toca nele e `npm run test:e2e` não lê o `.env`.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `server.js` | API (`/api/*`) e, no uso local, servidor dos arquivos de `public/` |
| `core.js` | Regras puras: pontuação, níveis, medalhas, saneamento do progresso, correção das respostas e o que cada questão mostra antes e depois de responder |
| `bank.js` | Carrega `questions/official/` e recusa qualquer item que não tenha passado pelos três portões (nunca lê `staging/`); consulta paginada com filtros e facetas |
| `questions/official/` | Banco publicado de questões oficiais (vazio até haver liberação de direitos) |
| `tools/ingest/` | Pipeline de extração, conferência e curadoria de questões oficiais (ver `docs/pipeline.md`) |
| `docs/` | Licenças e direitos, pipeline, dificuldade e cobertura |
| `tests/` | Testes de unidade (Node `node:test`) |
| `api/index.js`, `vercel.json` | Entrada da API como função do Vercel e regras de encaminhamento |
| `quizzes.js` | Banco de questões. Fica só no servidor; o gabarito é enviado depois da resposta |
| `public/index.html` | Interface (template e lógica do componente) |
| `public/lessons.js`, `public/lessons/` | Registro de imagens com créditos, vistas do modelo 3D e termos que viram links; o texto das aulas aprofundadas fica em `public/lessons/<aula>.js` |
| `public/img/` | Renders do modelo 3D, diagramas do Wikimedia Commons e logos |
| `public/atlas3d-v2.js` | Cena 3D |
| `public/atlas2/`, `public/fonts/`, `public/vendor/` | Malhas, fontes e bibliotecas |
| `test.js` | Teste de ponta a ponta da API (`npm run test:e2e`), só em banco local. Usa o esquema `atlasvivo_test`, criado e apagado pelo teste |

## Imagens

Os renders (`public/img/r-*.jpg`) foram gerados pelo próprio Atlas a partir do BodyParts3D (© DBCLS, CC BY 4.0). Os diagramas (`public/img/*.svg`) vêm do Wikimedia Commons, em domínio público ou licença Creative Commons; em alguns, os rótulos foram traduzidos para o português. Autor e licença de cada um aparecem na legenda da figura e na página "Sobre o projeto".

Os ícones da interface são do Lucide (lucide.dev, licença ISC), embutidos no CSS de `public/index.html`. A logo do projeto está em `public/img/logo.png` e `public/img/logo-full.png`; as placas da UNIFEI e do IMC na cena 3D, em `public/img/unifei.png` e `public/img/imc.png`.

Para acrescentar questões autorais, edite `quizzes.js` e reinicie o servidor. Para editar aulas, edite `public/lessons/<aula>.js` (blocos aceitos: `p`, `fig`, `cols`, `warn`, `recall`, `note`, `table`, `steps`, `ul`, `def`; cada seção traz `ch`, `t`, `h`, `m` e `b`). `public/lessons.js` define as imagens (`IMG`), as vistas padrão do modelo 3D (`VIEW`) e os termos que viram link (`TERMS`). Questões de modelo ficam no fim de `quizzes.js` (`mq`). `npm run test:unit` e `npm run test:e2e` conferem se cada questão tem gabarito válido e um comentário por alternativa, e se as aulas têm a estrutura esperada.

## Fontes

Títulos em Bricolage Grotesque (`public/fonts/bricolage-grotesque.woff2`, subconjunto latino), texto em Public Sans e dados em IBM Plex Mono. As três estão sob a SIL Open Font License 1.1 e são servidas do próprio site, sem pedido a terceiros.

## Segurança

Senhas guardadas como hash scrypt com sal. Sessão em cookie `HttpOnly` e `SameSite=Lax`. Limite de 8 tentativas de login erradas a cada 10 minutos. Atrás de HTTPS, o cookie sai também com `Secure`. Só o que está em `public/` é servido; `quizzes.js`, com os gabaritos, fica no servidor.

A cena 3D carrega three.js de cdn.jsdelivr.net, então o atlas precisa de internet.
