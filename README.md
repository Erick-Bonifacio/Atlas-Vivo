# Atlas Vivo

Atlas 3D do corpo humano com aula, quizzes comentados e gamificação. Projeto da disciplina de Computação Aplicada à Educação.

## Como rodar

Precisa do Node.js 22.13 ou mais novo.

```
npm install
npm start
```

Abra http://localhost:8765. Para outra porta: `PORT=3000 npm start`.

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
- **Aulas**: 13 aulas, uma para cada sistema e etapa da trilha, com figuras, síntese e flashcards.
- **Contas**: cadastro, login, edição de dados, troca de senha e exclusão da conta.
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

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `server.js` | API (`/api/*`) e, no uso local, servidor dos arquivos de `public/` |
| `api/index.js`, `vercel.json` | Entrada da API como função do Vercel e regras de encaminhamento |
| `quizzes.js` | Banco de questões. Fica só no servidor; o gabarito é enviado depois da resposta |
| `public/index.html` | Interface (template e lógica do componente) |
| `public/lessons.js` | Conteúdo das aulas, vistas do modelo 3D por seção e registro das imagens com créditos |
| `public/img/` | Renders do modelo 3D, diagramas do Wikimedia Commons e logos |
| `public/atlas3d-v2.js` | Cena 3D |
| `public/atlas2/`, `public/fonts/`, `public/vendor/` | Malhas, fontes e bibliotecas |
| `test.js` | Teste de ponta a ponta da API: `npm test`. Usa o esquema `atlasvivo_test`, criado e apagado pelo teste; não toca nos dados reais |

## Imagens

Os renders (`public/img/r-*.jpg`) foram gerados pelo próprio Atlas a partir do BodyParts3D (© DBCLS, CC BY 4.0). Os diagramas (`public/img/*.svg`) vêm do Wikimedia Commons, em domínio público ou licença Creative Commons; em alguns, os rótulos foram traduzidos para o português. Autor e licença de cada um aparecem na legenda da figura e na página "Sobre o projeto".

Os ícones da interface são do Lucide (lucide.dev, licença ISC), embutidos no CSS de `public/index.html`. A logo do projeto está em `public/img/logo.png` e `public/img/logo-full.png`; as placas da UNIFEI e do IMC na cena 3D, em `public/img/unifei.png` e `public/img/imc.png`.

Para acrescentar questões, edite `quizzes.js` e reinicie o servidor. Para editar aulas, edite `public/lessons.js`: além do texto, ele define o que o modelo 3D mostra em cada seção (`VIEW`) e quais termos viram link para o modelo (`TERMS`). Questões de modelo ficam no fim de `quizzes.js` (`mq`). `npm test` confere se cada questão tem gabarito válido e um comentário por alternativa.

## Segurança

Senhas guardadas como hash scrypt com sal. Sessão em cookie `HttpOnly` e `SameSite=Lax`. Limite de 8 tentativas de login erradas a cada 10 minutos. Atrás de HTTPS, o cookie sai também com `Secure`. Só o que está em `public/` é servido; `quizzes.js`, com os gabaritos, fica no servidor.

A cena 3D carrega three.js de cdn.jsdelivr.net, então o atlas precisa de internet.
