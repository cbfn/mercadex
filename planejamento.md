# Planejamento Mercadex — Documento Principal

**Data:** 12 de Maio de 2026
**Versão:** 2.0
**Status:** Fase 1 concluída. Aguardando autorização para execução.

> ⚠️ Nenhuma alteração será feita no sistema sem autorização expressa do usuário.

---

## Visão Geral

O Mercadex é um marketplace de eletrônicos. O projeto possui um frontend Next.js 16.2
funcional com 163 testes unitários e cobertura acima de 80%, e um backend base já iniciado com Prisma 6.19.3 e Neon.
Este planejamento cobre a limpeza do repositório, atualização de dependências e
desenvolvimento completo do produto.

**Repositório:** `github.com/cbfn/mercadex`
**Branch principal:** `main`
**Branch de integração:** `develop`

---

## Estrutura de Tarefas por Pessoa

O trabalho foi dividido em 5 trilhas paralelas. Cada pessoa trabalha em sua
própria branch e abre PR para `develop`. Nenhuma trilha bloqueia outra até
a Fase de Integração (Trilha 5).

| Trilha | Responsável | Arquivo de Tarefa | Branch |
| --- | --- | --- | --- |
| 1 | Dev 1 | [tasks/trilha-1-limpeza-e-infra.md](tasks/trilha-1-limpeza-e-infra.md) | `chore/limpeza-e-infra` |
| 2 | Dev 2 | [tasks/trilha-2-backend-auth-produtos.md](tasks/trilha-2-backend-auth-produtos.md) | `feature/backend-auth-produtos` |
| 3 | Dev 3 | [tasks/trilha-3-backend-carrinho-pagamentos.md](tasks/trilha-3-backend-carrinho-pagamentos.md) | `feature/backend-carrinho-pagamentos` |
| 4 | Dev 4 | [tasks/trilha-4-frontend-auth-dashboard.md](tasks/trilha-4-frontend-auth-dashboard.md) | `feature/frontend-auth-dashboard` |
| 5 | Dev 5 | [tasks/trilha-5-integracao-qualidade.md](tasks/trilha-5-integracao-qualidade.md) | `feature/integracao-qualidade` |

---

## Dependências entre Trilhas

```
Trilha 1 (Limpeza + Infra)
    ↓ schema.prisma + estrutura de pastas prontos
Trilha 2 (Backend Auth + Produtos) ──────────────────────────────┐
Trilha 3 (Backend Carrinho + Pagamentos) ─────────────────────────┤
Trilha 4 (Frontend Auth + Dashboard) ────────────────────────────┤
    ↓ todas as trilhas 2, 3, 4 concluídas                        │
Trilha 5 (Integração + Qualidade) ←──────────────────────────────┘
```

As trilhas 2, 3 e 4 podem rodar **em paralelo** após a Trilha 1 estar concluída.
A Trilha 5 só começa quando as trilhas 2, 3 e 4 estiverem com PRs aprovados em `develop`.

---

## Workflow Git

```bash
# Cada dev cria sua branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-trilha

# Commits semânticos
git commit -m "feat: adiciona módulo de autenticação"
git commit -m "fix: corrige validação de CEP"
git commit -m "chore: remove arquivos .DS_Store"

# PR sempre para develop, nunca para main
# main recebe merge de develop apenas em releases
```

**Convenção de commits:**
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `chore:` limpeza, configuração, sem impacto funcional
- `refactor:` refatoração sem mudança de comportamento
- `test:` adição ou correção de testes
- `docs:` documentação

**Regra de documentação:**
- Todo novo módulo, função pública, contrato de API e utilitário compartilhado deve ser documentado com JSDoc.
- A documentação deve explicar intenção, parâmetros, retorno e efeitos colaterais quando existirem.

---

## Checklist de Segurança (obrigatório antes de qualquer PR)

- [ ] Branch criada a partir de `develop` atualizado
- [ ] Build passando (`npm run build`)
- [ ] Testes passando (`npm run test`)
- [ ] Lint sem warnings (`npm run lint`)
- [ ] Type-check sem erros (`npx tsc --noEmit`)
- [ ] Nenhuma secret ou `.env` commitado
- [ ] PR com descrição clara do que foi feito

---

## Estrutura Final Esperada do Repositório

Após todas as trilhas concluídas:

```
mercadex/
├── README.md
├── CLAUDE.md
├── .gitignore
├── .gitmessage.txt
├── planejamento.md
├── tasks/
│   ├── trilha-1-limpeza-e-infra.md
│   ├── trilha-2-backend-auth-produtos.md
│   ├── trilha-3-backend-carrinho-pagamentos.md
│   ├── trilha-4-frontend-auth-dashboard.md
│   └── trilha-5-integracao-qualidade.md
├── .github/
│   └── workflows/ci.yml
├── docs/
│   ├── ADR.md
│   ├── BACKLOG.md
│   ├── DESIGN_SYSTEM.md
│   ├── DIAGRAMAS.md
│   ├── PRD_CHECKOUT.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── USER_STORIES.md
│   └── fase1-prototipo/
├── frontend/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── playwright.config.ts
│   └── src/
│       ├── app/
│       │   ├── (auth)/login/page.tsx
│       │   ├── (auth)/register/page.tsx
│       │   ├── (admin)/layout.tsx
│       │   ├── (admin)/dashboard/page.tsx
│       │   ├── (admin)/products/page.tsx
│       │   ├── (admin)/orders/page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── middleware.ts
│       │   └── page.tsx
│       ├── features/
│       │   ├── auth/
│       │   ├── admin/
│       │   ├── cart/
│       │   ├── catalog/
│       │   ├── checkout/
│       │   ├── product-detail/
│       │   └── storefront/
│       └── shared/
│           ├── lib/api/
│           ├── mocks/
│           ├── types/
│           └── ui/
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── server.ts
        ├── config/
        ├── modules/
        │   ├── auth/
        │   ├── products/
        │   ├── cart/
        │   ├── orders/
        │   └── payments/
        └── shared/
            ├── middleware/
            ├── errors/
            └── utils/
```

---

## Resumo de Todas as Tarefas

| # | Trilha | Tarefa | Estimativa | Depende de |
| --- | --- | --- | --- | --- |
| 1.1 | 1 | Limpeza de arquivos de lixo | 30 min | — |
| 1.2 | 1 | Arquivamento do protótipo HTML | 30 min | 1.1 |
| 1.3 | 1 | Remoção de duplicatas | 15 min | 1.2 |
| 1.4 | 1 | Reorganização da árvore de diretórios | 1h | 1.3 |
| 1.5 | 1 | Migração Vitest → Jest | 2h | 1.4 |
| 1.6 | 1 | Atualização de dependências (Next.js 16.2, React 19) | 3h | 1.5 |
| 1.7 | 1 | Setup do backend (package.json, tsconfig, Prisma 6.19.3 + Neon) | 2h | 1.4 |
| 2.1 | 2 | Schema Prisma completo | 2h | 1.7 |
| 2.2 | 2 | Módulo Auth (register, login, JWT, middleware) | 1 dia | 2.1 |
| 2.3 | 2 | Módulo Produtos (CRUD + categorias) | 1 dia | 2.2 |
| 2.4 | 2 | Testes unitários Auth + Produtos | 1 dia | 2.3 |
| 3.1 | 3 | Módulo Carrinho (persistência no banco) | 1 dia | 2.1 |
| 3.2 | 3 | Módulo Pedidos (criação + status) | 1 dia | 3.1 |
| 3.3 | 3 | Integração Stripe (PaymentIntent + webhook) | 1 dia | 3.2 |
| 3.4 | 3 | Testes unitários Carrinho + Pedidos | 1 dia | 3.3 |
| 4.1 | 4 | api-client.ts (fetch wrapper com JWT) | 4h | 1.6 |
| 4.2 | 4 | Páginas de Login e Registro | 1 dia | 4.1 |
| 4.3 | 4 | Middleware de proteção de rotas | 2h | 4.2 |
| 4.4 | 4 | Dashboard Admin (layout + sidebar) | 1 dia | 4.3 |
| 4.5 | 4 | CRUD de Produtos no Admin | 1 dia | 4.4 |
| 4.6 | 4 | Listagem de Pedidos no Admin | 4h | 4.5 |
| 5.1 | 5 | Integração Frontend ↔ Backend (substituir mocks) | 2 dias | 2.3, 3.2, 4.6 |
| 5.2 | 5 | Integração Stripe no Frontend | 1 dia | 3.3, 5.1 |
| 5.3 | 5 | JSDoc em todos os arquivos | 1 dia | 5.1 |
| 5.4 | 5 | Cobertura de testes Jest ≥ 80% | 2 dias | 5.1 |
| 5.5 | 5 | CI/CD atualizado (backend + frontend) | 4h | 5.4 |

**Estimativa total:** 20–25 dias com 5 pessoas em paralelo → **5–6 dias reais**

---

## Links dos Arquivos de Tarefa

- [Trilha 1 — Limpeza, Infra e Setup](tasks/trilha-1-limpeza-e-infra.md)
- [Trilha 2 — Backend: Auth e Produtos](tasks/trilha-2-backend-auth-produtos.md)
- [Trilha 3 — Backend: Carrinho e Pagamentos](tasks/trilha-3-backend-carrinho-pagamentos.md)
- [Trilha 4 — Frontend: Auth e Dashboard](tasks/trilha-4-frontend-auth-dashboard.md)
- [Trilha 5 — Integração e Qualidade](tasks/trilha-5-integracao-qualidade.md)
