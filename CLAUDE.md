# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mercadex** é um marketplace de eletrônicos em MVP Lean, com arquitetura monolítica modular separando frontend e backend. O projeto é um e-commerce com catálogo, carrinho, checkout PIX estático, reviews e features de IA.

**Status atual (Fase 3 - Backend em andamento):**
- Frontend: Next.js 16.2 (App Router) + TypeScript + Tailwind CSS + componentes shadcn-style (`frontend/`)
- Backend: Node.js + TypeScript + Express com auth, produtos e Prisma/Neon iniciados
- Banco de dados: Neon Postgres com Prisma 7.8.0
- CI: GitHub Actions (`ci-frontend.yml` e `ci-backend.yml`) ativados na branch `develop`, com cobertura mínima de 80%

**MVP Lean (pivô ativo):**
- JWT único com expiração de 7 dias armazenado em `localStorage` (sem refresh token)
- Carrinho 100% client-side via Zustand + `localStorage` (sem Cart/CartItem no banco)
- Checkout: PIX estático fake — chave estática + QR code + `POST /api/orders` com status `PENDING_PIX`
- Admin via Prisma Studio (sem frontend administrativo)
- Features de IA: reviews, resumo IA, chat stateless por produto

Ver `docs/ADR.md` para decisões arquiteturais completas (ADR-007 a ADR-010 para o pivot).
Ver `docs/DESIGN_SYSTEM.md` para padrões visuais, tipografia e UX writing do frontend.

## Tech Stack

### Frontend (Atual - Next.js 16.2)
- **Next.js 16.2** com App Router e `"use client"` para componentes interativos
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS** com tokens globais em `src/app/globals.css`
- **Componentes shadcn-style** em `src/shared/ui/`
- **Tipografia padrão:** Inter
- **Jest 30** + **React Testing Library** para testes unitários
- Cobertura com thresholds em 80% (lines/functions/branches/statements)
- Estrutura Feature-Sliced: `src/features/`, `src/shared/`, `src/app/`

### Backend (Em andamento)
- Node.js 20+ com TypeScript
- Express.js para API REST
- Neon Postgres
- Prisma 7.8.0
- JWT único com expiração de 7 dias (sem refresh token)
- LLM Provider via `LLM_PROVIDER_API_KEY` + `LLM_PROVIDER_MODEL` (para features de IA)

## Coding Standards

- Documente novos módulos, funções públicas, contratos de API e utilitários compartilhados com JSDoc.
- Prefira commits pequenos e descritivos.
- Mantenha o backend modular em `backend/src/modules/`.

## Running the Project

### Frontend Development

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run test     # Jest (execução única)
npm run test:watch  # Jest (watch)
npm run test:coverage  # Jest com relatório de cobertura (threshold 80%)
npm run build    # Build de produção Next.js
```

### Estrutura Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # Estilos globais (CSS customizado)
│   │   ├── layout.tsx        # Root layout (providers)
│   │   ├── page.tsx          # Página principal
│   │   └── products/[id]/page.tsx  # Página de produto
│   ├── features/
│   │   ├── cart/
│   │   │   ├── components/cart-drawer.tsx   # Drawer com fluxo de checkout 4 etapas
│   │   │   └── model/cart-context.tsx       # Zustand + persistência local
│   │   ├── catalog/
│   │   │   └── model/use-catalog-filters.ts # Hook de filtragem/ordenação
│   │   ├── product-detail/
│   │   │   └── components/product-modal.tsx # Modal de detalhe do produto
│   │   └── storefront/
│   │       └── components/storefront-page.tsx  # Página principal do catálogo
│   └── shared/
│       ├── lib/               # Utilitários puros (cart, catalog, cn, currency)
│       ├── mocks/products.ts  # Dados mock de produtos e categorias
│       ├── types/             # Tipos TypeScript (cart, catalog)
│       └── ui/                # Componentes UI primitivos (button, card, drawer, input, modal, select, badge, tabs)
├── assets/
│   └── logo-mercadex.png
├── jest.config.js
└── jest.setup.ts
```

**Padrões de estado:**
- Store global com Zustand para itens, etapas de checkout e estado de UI do carrinho
- Persistência local de estado via `localStorage`
- `useCatalogFilters`: filtragem por categoria, busca e ordenação

## Architecture Decisions

**Monolítica Modular:** Frontend separado do Backend permite deploy independente. Backend estruturado em módulos por domínio (auth, users, products, orders, reviews, ai).

**Escolhas principais:**
- TypeScript em ambos frontend/backend (type safety, reduz bugs)
- Frontend evoluiu de protótipo HTML/CSS/JS (Fase 1) para React/Next.js (Fase 2)
- Express.js para API (minimalista, maduro)
- PostgreSQL (ACID, JSON nativo, escalável)
- Cart/CartItem: comentados como `@legacy` no schema Prisma (ADR-007)
- Stripe: movido para `backend/src/legacy/` (ADR-008)

Ver `docs/ADR.md` para contexto completo de cada decisão, riscos, e mitigações.

## File Locations

- **Documentação:** `docs/` (ADR.md com decisões, DIAGRAMAS.md)
- **Frontend:** `frontend/` (Next.js 16.2 + TypeScript)
- **Backend:** `backend/src/` (módulos: auth, users, products, orders, reviews, ai; shared: middleware, utils, errors)
- **Backend @legacy:** `backend/src/legacy/` (cart, stripe — não deletar)
- **Testes backend:** `backend/tests/`

## Key Patterns

### Frontend React/Next.js
- **State management:** Zustand em `features/cart/model/cart-context.tsx` (cart 100% localStorage)
- **Auth token:** JWT armazenado em `localStorage` via `shared/lib/api-client.ts`; restaurado no `useEffect` após montagem (SSR-safe)
- **Hydration safety:** estado persistido no store com integração de `localStorage`
- **Feature-Sliced Design:** `features/<nome>/components/` e `features/<nome>/model/` por domínio
- **UI primitivos:** Componentes em `shared/ui/` com padrão shadcn-style + Tailwind
- **Design source of truth:** seguir `docs/DESIGN_SYSTEM.md` para qualquer tarefa visual
- **Testes:** Cada componente/hook tem arquivo `.test.tsx` ou `.test.ts` co-localizado

### Backend
- **Módulos DDD light:** Cada módulo com controllers → services → repositories → entities
- **Error handling:** Custom exceptions (não throw strings)
- **API responses:** Formato padrão com `success`, `data`, `error` fields (ver ADR seção 5)
- **Endpoints ativos:**
  - `POST /api/auth/login` — retorna `{ token, user }`
  - `POST /api/auth/register`
  - `GET /api/products`, `GET /api/products/:id`
  - `POST /api/orders` — recebe array de itens do frontend (localStorage)
  - `GET /api/orders`, `GET /api/orders/:id`
  - `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews`
  - `DELETE /api/reviews/:id`
  - `GET /api/products/:id/ai-summary`
  - `POST /api/products/:id/chat`

## Important Notes

1. **Fase atual:** Frontend Next.js 16.2 estabilizado e backend em implementação com Prisma/Neon.

2. **Cobertura mínima:** Jest enforça 80% para lines/functions/branches/statements.

3. **Security:** JWT único 7d no backend, HTTPS obrigatório, CORS whitelist, rate limiting (ver ADR seção 6).

4. **Deployment:** Frontend Next.js pronto para deploy em Vercel. Backend em evolução, com Prisma e Neon já alinhados.

5. **Backend estruturado:** `backend/package.json`, `backend/tsconfig.json` e o schema Prisma já existem e são a base das próximas trilhas.

6. **Frontend `node_modules` na raiz:** O `node_modules/` da raiz não deve ser rastreado pelo git (`.gitignore` adicionado). Dependências do frontend ficam em `frontend/node_modules/`.

7. **Documentação:** novos módulos, funções públicas, contratos de API e utilitários compartilhados devem usar JSDoc.

8. **Schema Prisma:** `Cart` e `CartItem` comentados como `// @legacy Cart`. `Review` adicionado. `OrderStatus` inclui `PENDING_PIX`. Campos Stripe comentados como `// @legacy Stripe`.

9. **Admin:** Gestão de produtos e pedidos via `npx prisma studio` (porta 5555). Sem rota `/admin` no frontend.

## CI/CD

O projeto usa GitHub Actions com dois workflows separados, ativados apenas na branch `develop` (push direto ou PR direcionado a `develop`). Mudanças em `main` **não** disparam CI automaticamente.

### Workflows

| Arquivo | Trigger | Path monitorado |
|---|---|---|
| `.github/workflows/ci-frontend.yml` | push/PR → `develop` | `frontend/**` |
| `.github/workflows/ci-backend.yml` | push/PR → `develop` | `backend/**` |

### Pipeline Frontend (`ci-frontend.yml`)

**Job `ci-frontend`** — roda em todo push/PR:
1. Setup Node.js 20 + `npm ci`
2. Lint (`npm run lint`)
3. Type check (`tsc --noEmit`)
4. Testes unitários com cobertura (threshold 80%)
5. Detecta funções adicionadas no PR sem cobertura (`.github/scripts/detect-uncovered.js`)
6. Gera comentário automático no PR com tabela de métricas (`.github/scripts/generate-comment.js`)
7. Upload do artefato `coverage-frontend` (retenção: 14 dias)
8. Commit automático em `RELATORIO_TESTES.md` com `[skip ci]`

**Job `e2e-frontend`** — roda apenas em PRs ou branch `develop`:
1. Build de produção Next.js
2. Instala Playwright (chromium only)
3. Executa `npm run test:e2e`
4. Gera comentário E2E no PR com breakdown por spec file (`.github/scripts/generate-e2e-comment.js`)
5. Upload do relatório HTML do Playwright (retenção: 7 dias)

### Pipeline Backend (`ci-backend.yml`)

**Job `ci-backend`** — roda em todo push/PR:
1. Setup Node.js 20
2. Cria `.env` de teste com variáveis CI (`DATABASE_URL`, `JWT_SECRET`, `LLM_PROVIDER_API_KEY`, etc.)
3. Type check (`tsc --noEmit`)
4. Testes com cobertura (threshold 80%)
5. Detecta funções adicionadas no PR sem cobertura
6. Gera comentário automático no PR com tabela de métricas
7. Upload do artefato `coverage-backend` (retenção: 14 dias)
8. Commit automático em `RELATORIO_TESTES.md` com `[skip ci]`

### Scripts de CI (`.github/scripts/`)

- **`detect-uncovered.js`** — lê `coverage-final.json` (Istanbul) e `git diff origin/BASE...HEAD` para identificar funções novas com contador de execução = 0; exporta `uncovered.json`
- **`generate-comment.js`** — gera corpo do comentário de PR com tabela de cobertura (Statements, Branches, Functions, Lines vs threshold) e lista de métodos sem cobertura (informativo, não bloqueia)
- **`generate-e2e-comment.js`** — gera relatório Playwright com tabela por spec file (total/passed/failed/skipped/flaky/duration) e seção de erros
- **`update-report.js`** — insere entrada no `RELATORIO_TESTES.md` com métricas, status e link para a execução; remove entradas duplicadas do mesmo projeto para evitar acúmulo

### Artefatos gerados

| Artefato | Retenção | Workflow |
|---|---|---|
| `coverage-frontend` (HTML + JSON) | 14 dias | ci-frontend |
| `coverage-backend` (HTML + JSON) | 14 dias | ci-backend |
| Playwright HTML report | 7 dias | e2e-frontend |
| `RELATORIO_TESTES.md` | permanente (no repo) | ambos |

### Pull Request Template (`.github/pull_request_template.md`)

Todo PR deve preencher: descrição da mudança, o que mudou, e checklist de validação:
- Testes ou verificações relevantes foram rodados
- Mudança está alinhada com `docs/ADR.md` e estrutura do repo
- Branch segue git-flow (`feature/<name>`, `hotfix/<name>`)
- Mensagem de commit é semântica (`feat: add X`, `fix: resolve Y`)

### Regras de Contribuição (`.github/copilot-instructions.md`)

- Commits no formato semântico: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Branches git-flow: `feature/<name>`, `fix/<name>`, `hotfix/<name>`
- Testes escritos antes ou junto com o código; padrão AAA (Arrange, Act, Assert)
- `docs/ADR.md` é source of truth — qualquer decisão arquitetural deve estar lá
- Menor changeset possível por PR

## Development Flow

```
main branch (produção — CI não dispara automaticamente)
  ↑
develop branch (integração — CI ativo: lint, types, unit tests, E2E)
  ↑
feature/* branches (desenvolvimento isolado)
  ↑
PR → GitHub Actions → aprovação → merge em develop → release → main
```

Sempre abrir PRs de `feature/*` para `develop`. Merge de `develop` para `main` marca um release.
