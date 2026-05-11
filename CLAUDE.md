# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mercadex** é um marketplace de eletrônicos em MVP, com arquitetura monolítica modular separando frontend e backend. O projeto é um e-commerce com funcionalidades de catálogo, carrinho de compras, e checkout.

**Status atual (Fase 1 - MVP):**
- Frontend: HTML5 + Vanilla JavaScript + Tailwind CSS (prototipagem estática, rodando)
- Backend: Estrutura preparada (Node.js + TypeScript + Express), ainda sem implementação
- Banco de dados: PostgreSQL (planejado)

Ver `docs/ADR.md` para decisões arquiteturais completas.

## Tech Stack

### Frontend (Current - Prototyping)
- **HTML5** semântico com estrutura modular
- **Vanilla JavaScript** para gerenciamento de estado (carrinho, checkout)
- **CSS3** com animações e comportamentos customizados (`frontend/css/style.css`)
- **Tailwind CSS** via CDN (utilitários de layout)
- Sem framework (planejado migrar para React + Next.js na Fase 2)

### Backend (Planned - Fase 2)
- Node.js 20+ com TypeScript
- Express.js para API REST
- PostgreSQL 15+
- TypeORM/Prisma para ORM
- JWT para autenticação
- Redis para cache e async jobs (Bull)

## Running the Project

### Frontend Development

O frontend é uma aplicação estática rodando sobre HTTP server local.

**Start dev server:**
```bash
cd /Users/leandropradopires/Projetos/ia_para_devs/mercadex
python3 -m http.server 8000
```

Acesso: http://localhost:8000/frontend/

**Importante:** Rode do diretório raiz do projeto para manter referências relativas de assets funcionando (logo em `/logo-mercadex.png`).

### Estrutura Frontend

```
frontend/
├── index.html          # HTML semântico (estrutura)
├── css/
│   └── style.css       # Animações, painel lateral, scrollbars
├── js/
│   └── main.js         # Estado, gerenciamento de carrinho, checkout
└── assets/
    └── logo-mercadex.png
```

**Principais componentes em main.js:**
- `state` objeto: gerencia carrinho, checkout (etapas), formulários
- `renderProducts()`: lista dinâmica de produtos com filtro por categoria
- `updateCart()`, `removeFromCart()`: manipulação do carrinho
- `checkoutSteps()`: fluxo multi-etapa (entrega → pagamento → confirmação)

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

### Frontend JavaScript
- **State management:** Objeto `state` global em memory (sem Redux/Context)
- **Event handling:** Event listeners em dados-attributes (`data-product-id`, etc)
- **DOM updates:** Renderização imperative em funções (não reativa)

### Backend (Planned)
- **Módulos DDD light:** Cada módulo com controllers → services → repositories → entities
- **Error handling:** Custom exceptions (não throw strings)
- **API responses:** Formato padrão com `success`, `data`, `error` fields (ver ADR seção 5)

## Important Notes

1. **Phase 1 Focus:** Frontend é prioritário (validar UX/flows). Backend é MVP com CRUD básico.

2. **Prototipagem:** Frontend atual é intencional como protótipo estático → refatorar para React quando validado.

3. **Security:** JWT + refresh tokens (planned backend), HTTPS obrigatório, CORS whitelist, rate limiting (ver ADR seção 6).

4. **Deployment:** Phase 1 é static frontend + backend simples. Fase 2 considera Railway/Heroku.

5. **No package.json no backend yet:** Estrutura criada mas dependências não instaladas (aguardando setup inicial).

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
