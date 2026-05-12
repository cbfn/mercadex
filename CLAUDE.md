# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mercadex** é um marketplace de eletrônicos em MVP, com arquitetura monolítica modular separando frontend e backend. O projeto é um e-commerce com funcionalidades de catálogo, carrinho de compras, e checkout.

**Status atual (Fase 2 - Frontend migrado):**
- Frontend: Next.js 14 (App Router) + TypeScript + CSS Modules customizados (`frontend/`)
- Backend: Estrutura preparada (Node.js + TypeScript + Express), ainda sem implementação
- Banco de dados: PostgreSQL (planejado)
- CI: GitHub Actions (`.github/workflows/ci.yml`) com cobertura mínima de 80%

Ver `docs/ADR.md` para decisões arquiteturais completas.

## Tech Stack

### Frontend (Atual - Next.js 14)
- **Next.js 14** com App Router e `"use client"` para componentes interativos
- **React 18** + **TypeScript** (strict)
- **CSS Modules** customizados (`src/app/globals.css`) — sem Tailwind nem Shadcn/ui
- **Vitest 2** + **React Testing Library** para testes unitários
- **@vitest/coverage-v8** para cobertura, thresholds em 80% (lines/functions/branches/statements)
- Estrutura Feature-Sliced: `src/features/`, `src/shared/`, `src/app/`

### Backend (Planned - Fase 2)
- Node.js 20+ com TypeScript
- Express.js para API REST
- PostgreSQL 15+
- TypeORM/Prisma para ORM
- JWT para autenticação
- Redis para cache e async jobs (Bull)

## Running the Project

### Frontend Development

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run test     # Vitest (watch)
npm run test:coverage  # Vitest com relatório de cobertura (threshold 80%)
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
│   │   └── providers.tsx     # CartProvider wrapper
│   ├── features/
│   │   ├── cart/
│   │   │   ├── components/cart-drawer.tsx   # Drawer com fluxo de checkout 4 etapas
│   │   │   └── model/cart-context.tsx       # Reducer + Context + localStorage
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
├── vitest.config.ts
└── vitest.setup.ts
```

**Padrões de estado:**
- `CartContext` (useReducer): gerencia itens, etapas de checkout, produto selecionado
- `localStorage` restaurado apenas após montagem (evita hydration mismatch SSR)
- `useCatalogFilters`: filtragem por categoria, busca e ordenação

## Architecture Decisions

**Monolítica Modular:** Frontend separado do Backend permite deploy independente. Backend estruturado em módulos por domínio (auth, users, products, cart, orders).

**Escolhas principais:**
- TypeScript em ambos frontend/backend (type safety, reduz bugs)
- Vanilla JS no frontend (MVP rápido) → React/Next.js depois
- Express.js para API (minimalista, maduro)
- PostgreSQL (ACID, JSON nativo, escalável)

Ver `docs/ADR.md` para contexto completo de cada decisão, riscos, e mitigações.

## File Locations

- **Documentação:** `docs/` (ADR.md com decisões, DIAGRAMAS.md)
- **Frontend:** `frontend/` (HTML/CSS/JS estático)
- **Backend:** `backend/src/` (módulos: auth, users, products, cart, orders; shared: middleware, utils, errors)
- **Testes backend:** `backend/tests/`

## Key Patterns

### Frontend React/Next.js
- **State management:** `useReducer` + React Context (`CartContext`); sem Redux nem Zustand
- **Hydration safety:** `useReducer` inicializa com `initialState`; `localStorage` restaurado via `useEffect` com action `RESTORE` após montagem
- **Feature-Sliced Design:** `features/<nome>/components/` e `features/<nome>/model/` por domínio
- **UI primitivos:** Componentes em `shared/ui/` sem dependência de biblioteca de componentes externa
- **Testes:** Cada componente/hook tem arquivo `.test.tsx` ou `.test.ts` co-localizado

### Backend (Planned)
- **Módulos DDD light:** Cada módulo com controllers → services → repositories → entities
- **Error handling:** Custom exceptions (não throw strings)
- **API responses:** Formato padrão com `success`, `data`, `error` fields (ver ADR seção 5)

## Important Notes

1. **Fase 2 em andamento:** Frontend Next.js 14 implementado e com CI. Backend ainda não implementado.

2. **Cobertura mínima:** `vitest.config.ts` enforça 80% para lines/functions/branches/statements via `@vitest/coverage-v8`.

3. **Security:** JWT + refresh tokens (planned backend), HTTPS obrigatório, CORS whitelist, rate limiting (ver ADR seção 6).

4. **Deployment:** Frontend Next.js pronto para deploy em Vercel. Backend aguarda implementação.

5. **No package.json no backend yet:** Estrutura criada mas dependências não instaladas (aguardando setup inicial).

6. **Frontend `node_modules` na raiz:** O `node_modules/` da raiz não deve ser rastreado pelo git (`.gitignore` adicionado). Dependências do frontend ficam em `frontend/node_modules/`.

## Development Flow

```
main branch (produção)
  ↓
develop branch (integração)
  ↓
feature/* branches (isolamento)
  ↓
PR review → GitHub Actions (lint, type-check, tests) → merge
```

Sempre de `develop` para PRs internas, `develop` merges em `main` para release.
