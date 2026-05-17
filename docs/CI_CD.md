# CI/CD — Mercadex

## Visão Geral

O pipeline de integração contínua do Mercadex é composto por **dois workflows GitHub Actions independentes**, um para cada projeto do monorepo. Cada workflow valida cobertura de testes Jest com threshold mínimo de **80%** e garante que código sem cobertura suficiente nunca seja mesclado.

```
mercadex/
├── .github/
│   ├── workflows/
│   │   ├── ci-frontend.yml   ← Pipeline do frontend (Jest + Playwright)
│   │   └── ci-backend.yml    ← Pipeline do backend (Jest)
│   └── scripts/
│       ├── generate-comment.js   ← Gera comentário Markdown no PR
│       ├── detect-uncovered.js   ← Detecta funções novas sem teste
│       └── update-report.js      ← Atualiza RELATORIO_TESTES.md
├── frontend/
│   ├── jest.config.js            ← coverageReporters adicionados
│   └── RELATORIO_TESTES.md       ← Atualizado automaticamente pelo CI
└── backend/
    ├── jest.config.js            ← collectCoverageFrom + coverageReporters adicionados
    └── RELATORIO_TESTES.md       ← Atualizado automaticamente pelo CI
```

### Princípio de independência

A falha em um projeto **não afeta e não bloqueia** a execução do outro. Um PR que altere apenas `backend/` nunca terá o merge bloqueado por falha no `frontend/`, e vice-versa.

---

## Workflows

### `ci-frontend.yml` — Pipeline do Frontend

**Arquivo:** `.github/workflows/ci-frontend.yml`

#### Gatilhos

| Evento | Branch | Condição de paths |
|--------|--------|-------------------|
| `push` | `main`, `develop` | Mudanças em `frontend/**` (exceto `RELATORIO_TESTES.md`) |
| `pull_request` | `main`, `develop` | Mudanças em `frontend/**` (exceto `RELATORIO_TESTES.md`) |

A exclusão de `RELATORIO_TESTES.md` dos paths evita que o commit automático do bot dispare uma nova execução infinitamente.

#### Jobs

**Job 1: `ci-frontend`** (status check obrigatório para merge)

| # | Step | O que faz |
|---|------|-----------|
| 1 | Checkout | Clona o repositório com histórico completo (`fetch-depth: 0`) para o `git diff` funcionar |
| 2 | Setup Node.js 20 | Configura o Node com cache do npm |
| 3 | Instalar dependências | `npm ci` em `frontend/` |
| 4 | Lint | `npm run lint` — falha imediata se houver erros de lint |
| 5 | Type check | `npx tsc --noEmit` — falha imediata se houver erros TypeScript |
| 6 | **Testes com cobertura** | `npm run test:coverage` com `continue-on-error: true` |
| 7 | Detectar funções sem cobertura | Executa `detect-uncovered.js` (apenas em PRs) |
| 8 | Gerar comentário de PR | Executa `generate-comment.js` (apenas em PRs) |
| 9 | Postar/atualizar comentário | Usa `actions/github-script` para criar ou atualizar o comentário no PR |
| 10 | Upload artefato HTML | Publica `frontend/coverage/lcov-report/` como artefato `coverage-report-frontend` (14 dias) |
| 11 | Atualizar RELATORIO_TESTES.md | Executa `update-report.js` (sempre, mesmo em falha) |
| 12 | Commitar relatório | Commit automático `[skip ci]` no `RELATORIO_TESTES.md` (apenas em `push`) |
| 13 | **Falhar se cobertura < 80%** | Re-emite a falha do step 6 com mensagem clara |

> O passo 6 usa `continue-on-error: true` para que os artefatos, o comentário no PR e o relatório sejam gerados mesmo quando a cobertura está abaixo do threshold. A falha é re-emitida no passo 13, após toda a coleta de evidências.

**Job 2: `e2e-frontend`** (informativo — não é status check obrigatório)

Depende do job `ci-frontend` via `needs`. Executa apenas em PRs e pushs para `main`. Faz build de produção do Next.js e roda os testes Playwright. Se falhar, gera artefato `playwright-report-frontend`.

---

### `ci-backend.yml` — Pipeline do Backend

**Arquivo:** `.github/workflows/ci-backend.yml`

#### Gatilhos

| Evento | Branch | Condição de paths |
|--------|--------|-------------------|
| `push` | `main`, `develop` | Mudanças em `backend/**` (exceto `RELATORIO_TESTES.md`) |
| `pull_request` | `main`, `develop` | Mudanças em `backend/**` (exceto `RELATORIO_TESTES.md`) |

#### Job: `ci-backend` (status check obrigatório para merge)

| # | Step | O que faz |
|---|------|-----------|
| 1 | Checkout | Clona com `fetch-depth: 0` |
| 2 | Setup Node.js 20 | Configura Node com cache do npm |
| 3 | **Criar .env para testes CI** | Cria arquivo `.env` com valores placeholder para satisfazer `dotenv/config` |
| 4 | Instalar dependências | `npm ci` em `backend/` |
| 5 | Type check | `npx tsc --noEmit` |
| 6 | **Testes com cobertura** | `npm run test:coverage` com `continue-on-error: true` |
| 7 | Detectar funções sem cobertura | Executa `detect-uncovered.js` (apenas em PRs) |
| 8 | Gerar comentário de PR | Executa `generate-comment.js` (apenas em PRs) |
| 9 | Postar/atualizar comentário | Usa `actions/github-script` para criar ou atualizar comentário |
| 10 | Upload artefato HTML | Publica `backend/coverage/lcov-report/` como `coverage-report-backend` (14 dias) |
| 11 | Atualizar RELATORIO_TESTES.md | Executa `update-report.js` (sempre) |
| 12 | Commitar relatório | Commit automático `[skip ci]` (apenas em `push`) |
| 13 | **Falhar se cobertura < 80%** | Re-emite a falha do step 6 |

> O backend usa `dotenv/config` nos `setupFiles` do Jest. Em CI, nenhuma conexão real com banco é feita — os testes mocam o Prisma. O `.env` criado no step 3 contém apenas valores placeholder para que o `dotenv/config` não lance exceção na inicialização.

---

## Scripts Auxiliares

Todos os scripts ficam em `.github/scripts/` e são executados via `node` diretamente pelos workflows. Não têm dependências externas — apenas módulos nativos do Node.js (`fs`, `path`, `child_process`).

---

### `generate-comment.js`

**Responsabilidade:** Gera o corpo do comentário Markdown que é postado/atualizado no PR com as métricas de cobertura.

**Entrada:**

| Argumento | Descrição |
|-----------|-----------|
| `--summary` | Caminho para `coverage-summary.json` gerado pelo Jest |
| `--uncovered` | Caminho para `uncovered.json` gerado por `detect-uncovered.js` (opcional) |
| `--project` | `frontend` ou `backend` |
| `--outcome` | `success` ou `failure` |
| `--run-id` | ID da execução do GitHub Actions (para gerar o link) |
| `--output` | Caminho do arquivo Markdown de saída |

**Saída:** Arquivo Markdown com:
- Status geral (passou / falhou)
- Tabela com `statements`, `branches`, `functions`, `lines` — cada linha com ícone ✅/❌ baseado no threshold de 80%
- Seção `⚠️ Novos Métodos Sem Cobertura` (se houver funções detectadas)
- Link para o artefato HTML de cobertura

**Marcador HTML:** O comentário contém `<!-- ci-frontend-coverage -->` ou `<!-- ci-backend-coverage -->`. O workflow usa esse marcador para encontrar o comentário existente e atualizá-lo em vez de criar um novo a cada push.

**Execução local (para debug):**
```bash
node .github/scripts/generate-comment.js \
  --summary=frontend/coverage/coverage-summary.json \
  --project=frontend \
  --outcome=success \
  --run-id=0 \
  --output=/tmp/comment.md

cat /tmp/comment.md
```

---

### `detect-uncovered.js`

**Responsabilidade:** Identifica funções/métodos que foram adicionados nos commits do PR mas não possuem cobertura de testes.

**Como funciona:**
1. Obtém os arquivos TypeScript alterados no PR via `git diff --name-only origin/BASE...HEAD`
2. Para cada arquivo alterado, lê as entradas correspondentes em `coverage-final.json` (formato Istanbul)
3. Itera sobre o `fnMap` (mapa de funções) e o objeto `f` (contadores de execução) do Istanbul
4. Reporta apenas funções com contador `0` cujas linhas de declaração aparecem no diff como linhas adicionadas (`+`)

**Por que filtrar por linhas do diff:** Evita alertar sobre funções pré-existentes que já estavam sem cobertura antes do PR. Apenas código novo introduzido no PR é reportado.

**Entrada:**

| Argumento | Descrição |
|-----------|-----------|
| `--coverage` | Caminho para `coverage-final.json` gerado pelo Jest |
| `--base` | Branch base do PR (ex: `develop`) |
| `--project` | `frontend` ou `backend` |
| `--output` | Caminho do JSON de saída |

**Saída:** Array JSON com objetos `{ file, name, line, type }`:
```json
[
  {
    "file": "src/features/catalog/model/use-catalog-filters.ts",
    "name": "sortProducts",
    "line": 42,
    "type": "function"
  }
]
```

**Execução local (para debug):**
```bash
# Requer que os testes com cobertura já tenham rodado
node .github/scripts/detect-uncovered.js \
  --coverage=frontend/coverage/coverage-final.json \
  --base=develop \
  --project=frontend \
  --output=/tmp/uncovered.json

cat /tmp/uncovered.json
```

> Este script **não bloqueia o merge**. Seu output é apenas informativo — exibido como alerta no comentário do PR.

---

### `update-report.js`

**Responsabilidade:** Atualiza o `RELATORIO_TESTES.md` de cada projeto com uma nova entrada gerada automaticamente pelo CI.

**Como funciona:**
1. Lê o `coverage-summary.json` para extrair as métricas de cobertura
2. Lê o `RELATORIO_TESTES.md` existente
3. Remove a entrada automática anterior do mesmo projeto (identificada pelos marcadores HTML `<!-- ci-auto-entry-start: PROJECT -->` e `<!-- ci-auto-entry-end: PROJECT -->`)
4. Insere a nova entrada logo após o título H1 do arquivo (ou no início, se não houver H1)
5. Escreve o arquivo atualizado

Essa estratégia garante que o histórico manual escrito pelo time seja preservado e que apenas a entrada mais recente do CI fique visível no topo.

**Entrada:**

| Argumento | Descrição |
|-----------|-----------|
| `--summary` | Caminho para `coverage-summary.json` |
| `--report` | Caminho para o `RELATORIO_TESTES.md` a ser atualizado |
| `--project` | `frontend` ou `backend` |
| `--outcome` | `success` ou `failure` |
| `--run-url` | URL completa da execução do GitHub Actions |

**Execução local (para debug):**
```bash
node .github/scripts/update-report.js \
  --summary=frontend/coverage/coverage-summary.json \
  --report=frontend/RELATORIO_TESTES.md \
  --project=frontend \
  --outcome=success \
  --run-url=https://github.com/owner/repo/actions/runs/0
```

---

## Fluxo de Execução Completo

### Em um Pull Request

```
Desenvolvedor abre/atualiza PR
          │
          ▼
GitHub Actions detecta paths alterados
          │
    ┌─────┴──────┐
    │            │
frontend/**   backend/**
    │            │
    ▼            ▼
ci-frontend   ci-backend
    │            │
 (paralelo)   (paralelo)
    │            │
 1. Lint         │
 2. TypeCheck  1. TypeCheck
 3. npm test   2. npm test
    │    │        │    │
  pass  fail    pass  fail
    │    │        │    │
    └────┼────────┘    │
         │             │
    Detecta funções descobertas (detect-uncovered.js)
         │
    Gera comentário (generate-comment.js)
         │
    Posta/atualiza comentário no PR ◄── comentário único por projeto,
         │                               atualizado a cada push
    Upload artefato HTML de cobertura
         │
    Atualiza RELATORIO_TESTES.md
         │
    ┌────┴────┐
    │         │
  pass      fail
    │         │
  ✅ ok    ❌ exit 1
             │
         Bloqueia merge
         (status check falhou)
```

### Em um Push para `develop` ou `main`

O fluxo é idêntico, com duas diferenças:
- Os steps de detecção de funções e comentário de PR **não executam** (são condicionais a `github.event_name == 'pull_request'`)
- O step de commit do `RELATORIO_TESTES.md` **executa** com commit `[skip ci]` para não disparar novo CI

---

## Configuração Necessária no GitHub

### Branch Protection Rules

Acesse **Settings → Branches → Add branch ruleset** para as branches `main` e `develop`:

```
Require status checks to pass before merging
  ├── ci-frontend   ← nome exato do job no ci-frontend.yml
  └── ci-backend    ← nome exato do job no ci-backend.yml

Require branches to be up to date before merging  ✅
```

> Os checks aparecem no seletor apenas após pelo menos uma execução de cada workflow. Faça um push pequeno em `frontend/` e outro em `backend/` para a primeira execução.

### Permissões do GITHUB_TOKEN

Em **Settings → Actions → General → Workflow permissions**, configure:

- **Read and write permissions** — necessário para o bot fazer `git push` do `RELATORIO_TESTES.md`
- **Allow GitHub Actions to create and approve pull requests** — necessário para comentários em PRs

Nenhum secret adicional é necessário. Tudo usa `${{ secrets.GITHUB_TOKEN }}` nativo.

---

## Executando Cobertura Localmente

Os mesmos comandos usados no CI funcionam no ambiente local:

```bash
# Frontend
cd frontend
npm run test:coverage
# Relatório HTML gerado em: frontend/coverage/lcov-report/index.html

# Backend
cd backend
npm run test:coverage
# Relatório HTML gerado em: backend/coverage/lcov-report/index.html
```

Os reporters `json-summary`, `json`, `html` e `lcov` estão configurados em ambos os `jest.config.js` — o mesmo conjunto que o CI usa para gerar artefatos e alimentar os scripts.

---

## Artefatos Gerados

| Artefato | Workflow | Conteúdo | Retenção |
|----------|----------|----------|----------|
| `coverage-report-frontend` | ci-frontend | Relatório HTML Istanbul do frontend | 14 dias |
| `coverage-report-backend` | ci-backend | Relatório HTML Istanbul do backend | 14 dias |
| `playwright-report-frontend` | ci-frontend (e2e) | Relatório Playwright (apenas em falha) | 7 dias |

Para acessar: na página da execução no GitHub Actions → aba **Artifacts**.

---

## Troubleshooting

### Status check não aparece nas Branch Protection Rules

O GitHub só exibe um status check no seletor após a primeira execução bem-sucedida do workflow. Faça um push com uma mudança qualquer em `frontend/` e outro em `backend/` para registrar os checks pela primeira vez.

### Bot não consegue fazer `git push` do `RELATORIO_TESTES.md`

Confirme que **Read and write permissions** está habilitado em Settings → Actions → General. Se `develop` tiver regra que exige PR para commits diretos, configure uma exceção para o ator `github-actions[bot]` ou desative o step de commit automático e gerencie o relatório manualmente.

### Testes do backend falham por variável de ambiente ausente

O workflow cria um `.env` com valores placeholder antes de instalar as dependências. Se um teste novo precisar de uma variável específica, adicione-a ao step "Criar .env para testes CI" no `ci-backend.yml`. Os testes unitários mockam o Prisma — nenhuma conexão real com banco é feita em CI.

### Comentário duplicado no PR

O script no `actions/github-script` identifica o comentário existente pelo marcador HTML invisível `<!-- ci-frontend-coverage -->` ou `<!-- ci-backend-coverage -->`. Se houver duplicação, verifique se o bot tem permissão `pull-requests: write` e se o comentário anterior contém o marcador correto.

### `coverage-final.json` não encontrado após falha nos testes

O Jest gera os arquivos de cobertura mesmo quando o threshold não é atingido (exit code ≠ 0). Se o arquivo estiver ausente, a falha ocorreu antes de os testes terminarem (ex: erro de compilação TypeScript). O step de TypeCheck deve capturar isso antes de chegar nos testes.

### `detect-uncovered.js` não encontra funções mesmo existindo código sem teste

Verifique se `git diff origin/BASE...HEAD` retorna os arquivos esperados. Com `fetch-depth: 0` no checkout, o histórico completo é clonado. Se a branch base não existir localmente, o `origin/BASE` não estará disponível — isso pode acontecer em forks. Para repositórios privados com PRs internos (mesma origem), o comportamento é correto.
