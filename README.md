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
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres.<id-do-projeto>
PGPASSWORD='<senha>'
```

Ao trocar a senha no Supabase, atualize `PGPASSWORD` e reinicie o servidor. Não publique o `.env`.

As tabelas (`users`, `sessions`, `answers`) são criadas sozinhas na primeira execução, no esquema `atlasvivo`. Elas ficam fora do esquema `public` de propósito: no Supabase, o que está em `public` é exposto pela API REST do projeto.

A conexão usa TLS verificado com o certificado `supabase-ca.crt`.

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
| `server.js` | Servidor HTTP: arquivos estáticos e API (`/api/*`) |
| `quizzes.js` | Banco de questões. Fica só no servidor; o gabarito é enviado depois da resposta |
| `index.html` | Interface (template e lógica do componente) |
| `lessons.js` | Conteúdo das aulas e registro das imagens com créditos |
| `img/` | Renders do modelo 3D e diagramas do Wikimedia Commons |
| `atlas3d-v2.js` | Cena 3D |
| `atlas2/`, `fonts/`, `vendor/` | Malhas, fontes e bibliotecas |
| `test.js` | Teste de ponta a ponta da API: `npm test`. Usa o esquema `atlasvivo_test`, criado e apagado pelo teste; não toca nos dados reais |

## Imagens

Os renders (`img/r-*.jpg`) foram gerados pelo próprio Atlas a partir do BodyParts3D (© DBCLS, CC BY 4.0). Os diagramas (`img/*.svg`) vêm do Wikimedia Commons, em domínio público ou licença Creative Commons; em alguns, os rótulos foram traduzidos para o português. Autor e licença de cada um aparecem na legenda da figura e na página "Sobre o projeto".

Os ícones da interface são do Lucide (lucide.dev, licença ISC), embutidos no CSS de `index.html`. A logo do projeto está em `img/logo.png` e `img/logo-full.png`; as placas da UNIFEI e do IMC na cena 3D, em `img/unifei.png` e `img/imc.png`.

Para acrescentar questões, edite `quizzes.js` e reinicie o servidor. Para editar aulas, edite `lessons.js`: além do texto, ele define o que o modelo 3D mostra em cada seção (`VIEW`) e quais termos viram link para o modelo (`TERMS`). Questões de modelo ficam no fim de `quizzes.js` (`mq`). `npm test` confere se cada questão tem gabarito válido e um comentário por alternativa.

## Segurança

Senhas guardadas como hash scrypt com sal. Sessão em cookie `HttpOnly` e `SameSite=Lax`. Limite de 8 tentativas de login erradas a cada 10 minutos. Se publicar atrás de HTTPS, acrescente `; Secure` ao cookie em `server.js`.

A cena 3D carrega three.js de cdn.jsdelivr.net, então o atlas precisa de internet.
