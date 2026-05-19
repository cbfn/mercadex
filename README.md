# Mercadex — Marketplace de Eletrônicos

[![Status](https://img.shields.io/badge/status-MVP%20Lean%20Phase%203-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Frontend CI](https://github.com/cbfn/mercadex/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/cbfn/mercadex/actions/workflows/ci-frontend.yml)
[![Backend CI](https://github.com/cbfn/mercadex/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/cbfn/mercadex/actions/workflows/ci-backend.yml)

## 📋 Sobre o Projeto

**Mercadex** é um marketplace de eletrônicos em MVP Lean, construido como protótipo rápido com arquitetura monolítica modular. O projeto separa claramente frontend e backend, permitindo evolução independente de cada camada.

**Objetivo:** Validar fluxos de compra e UX antes de escalar para produção. A Fase 2 foi concluída com frontend React/Next.js 16.2 e testes automatizados; a Fase 3 está em andamento com consolidação do backend, reviews e features de IA.

**MVP Lean:** JWT único 7d (sem refresh), carrinho 100% localStorage, checkout PIX estático fake, admin via Prisma Studio, features de IA (reviews, resumo, chat).

**Padrão de documentação:** novos módulos, funções públicas, contratos de API e utilitários compartilhados devem usar JSDoc.

## Governança de Entrega

- Commits devem seguir semantic commit (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Pull Requests devem preencher completamente o template em `.github/pull_request_template.md`.
- Tarefas com uso de IA devem registrar evidência de prompt seguindo `docs/PROMPT_TEMPLATE.md`.
- Documentos canônicos para auditoria técnica:
  - `docs/PRD.md`
  - `docs/VIABILIDADE.md`
  - `docs/ADR.md`
  - `docs/PR_EVIDENCIAS.md`

---

## 🚀 Funcionalidades

### Frontend (Fase 2 - Concluído em 2026-05-11)
- ✅ **Catálogo Dinâmico:** Listagem de eletrônicos com filtragem por categoria, busca e ordenação
- ✅ **Modal de Detalhes:** Visualização completa de especificações, preços e avaliações
- ✅ **Carrinho Interativo:** Adicionar, alterar quantidades, remover itens com atualização em tempo real
- ✅ **Checkout Multi-Etapa:** Entrega → Pagamento (PIX) → Confirmação
- ✅ **Persistência de Carrinho:** Estado restaurado do `localStorage` após navegação (sem SSR mismatch)
- ✅ **Testes Automatizados:** 273 testes unitários com cobertura ≥ 99% (Jest + React Testing Library)
- ✅ **CI Integrado:** GitHub Actions valida lint, type-check e testes a cada push
- ✅ **Design Responsivo:** Layout fluido para mobile, tablet e desktop (Tailwind CSS + tokens do design system)

### Backend (Fase 3 - Em andamento)
- 🔄 API REST em Node.js + TypeScript + Express.js
- 🟡 Autenticação com JWT único 7 dias em `localStorage` (sem refresh token, iniciado)
- 🟡 Persistência em Neon Postgres + Prisma 7.8.0 (iniciado)
- 🟡 Módulo de produtos com rotas e testes (iniciado)
- ⬜ Módulos de reviews e pedidos (planejado)
- ⬜ Checkout PIX estático fake — chave estática + QR code + `PENDING_PIX` (planejado)
- ⬜ Features de IA: resumo de reviews + chat stateless por produto (planejado)
- ⬜ Admin via Prisma Studio (sem dashboard no frontend)
- ✅ Documentação interativa da API via Swagger UI (`/api-docs`)

---

## 🛠 Tech Stack

### Frontend (Fase 2 - Atual)
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Next.js** | 16.2 (App Router) | Meta-framework React, SSR, file-based routing |
| **React** | 19 | Componentes UI reativos |
| **TypeScript** | strict | Type safety, reduz bugs em produção |
| **Tailwind CSS** | globals.css + tailwind.config.ts | Estilos utilitários + tokens semânticos |
| **UI shadcn-style** | src/shared/ui | Componentes reutilizáveis com padrão visual único |
| **Jest** | 30 | Testes unitários (31 suítes, 273 testes) |
| **React Testing Library** | 16 | Testes de componentes orientados a comportamento |
| **Playwright** | — | Testes E2E (configurado, fluxos críticos) |
| **lucide-react** | — | Ícones SVG |

### Backend (Fase 3 - Atual)
```
Node.js 20+ (runtime)
├── TypeScript (type safety)
├── Express.js (API REST)
├── Neon Postgres (persistência)
├── Prisma 7.8.0 (ORM)
├── JWT único 7d em localStorage (autenticação)
├── LLM Provider (features de IA — via LLM_PROVIDER_API_KEY)
└── Zod (validação de inputs)
```

---

## 📁 Estrutura do Projeto

```
mercadex/
├── README.md
├── CLAUDE.md                        # Guia para Claude Code
│
├── frontend/                        # Next.js 16.2 (App Router) + TypeScript
│   ├── next.config.mjs
│   ├── jest.config.js               # Jest + coverage threshold 80%
│   ├── playwright.config.ts         # Testes E2E
│   └── src/
│       ├── app/
│       │   ├── globals.css          # Tokens e estilos globais (Tailwind)
│       │   ├── layout.tsx           # Root layout com providers
│       │   ├── page.tsx             # Página principal
│       │   └── providers.tsx        # CartProvider wrapper
│       ├── features/                # Feature-Sliced Design
│       │   ├── cart/
│       │   │   ├── components/cart-drawer.tsx   # Drawer + fluxo de checkout
│       │   │   └── model/cart-context.tsx       # Zustand + persist middleware (localStorage)
│       │   ├── catalog/
│       │   │   └── model/use-catalog-filters.ts # Hook de filtragem/ordenação
│       │   ├── product-detail/
│       │   │   └── components/product-modal.tsx
│       │   └── storefront/
│       │       └── components/storefront-page.tsx
│       └── shared/
│           ├── lib/                 # Utilitários puros (cart, catalog, cn, currency)
│           ├── mocks/products.ts    # Dados mock (produtos e categorias)
│           ├── types/               # Tipos TypeScript (cart, catalog)
│           └── ui/                  # Primitivos UI próprios (Button, Card, Drawer,
│                                    #   Input, Modal, Select, Badge, Tabs)
│
├── backend/                         # Node.js + Express (Fase 3 em andamento)
│   └── src/
│       ├── modules/                 # auth e products implementados; cart/users/orders em andamento
│       ├── shared/                  # middleware, errors, utils
│       └── config/
│
└── docs/                            # Documentação técnica
    ├── ADR.md                       # Decisões arquiteturais
    ├── DIAGRAMAS.md
    ├── BACKLOG.md
    ├── USER_STORIES.md
    └── PRD_CHECKOUT.md
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Node.js 20+** e **npm**
- **Git**

### Frontend (Next.js 16.2)

```bash
# 1. Clone o repositório
git clone https://github.com/cbfn/mercadex.git
cd mercadex/frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000

# 4. Build de produção
npm run build && npm start
```

### Backend (Node.js + Express)

> Pré-requisito: arquivo `.env` com `DATABASE_URL` (Neon Postgres) e `JWT_SECRET`.

```bash
cd backend

# 1. Instale as dependências
npm install

# 2. Aplique as migrations do banco
npx prisma migrate deploy

# 3. Inicie o servidor de desenvolvimento
npm run dev
# API disponível em: http://localhost:3001
# Swagger UI em:     http://localhost:3001/api-docs
```

---

## 🧪 Testes

O projeto mantém suítes de testes independentes para frontend e backend, ambas com threshold mínimo de **80% de cobertura** validado no CI.

### Frontend — Jest + React Testing Library

```bash
cd frontend

# Executa todos os testes uma vez
npm test

# Modo watch (ideal para desenvolvimento)
npm run test:watch

# Gera relatório de cobertura com threshold 80%
npm run test:coverage

# Testes E2E com Playwright
npm run test:e2e
npm run test:e2e:ui     # com interface visual Playwright
```

**Cobertura atual (273 testes · 31 suítes):**

| Métrica     | Resultado |
|-------------|-----------|
| Statements  | 99.10%    |
| Branches    | 95.62%    |
| Funções     | 98.60%    |
| Linhas      | 99.25%    |

O que é testado:
- Lógica de carrinho (`cart.ts`, `cart-context.tsx`) — add, remove, update, derivados
- Catálogo (`catalog.ts`, `use-catalog-filters.ts`) — filtro, busca, ordenação, desconto
- Autenticação (`auth-context.tsx`, `login-form`, `register-form`) — fluxo completo + erros
- Cliente HTTP (`api-client.ts`) — token em memória, refresh 401, ApiError
- Módulos de API (`api/auth`, `api/products`, `api/cart`) — todos os endpoints mockados
- Hook admin (`use-products-admin.ts`) — CRUD com otimismo local
- Componentes UI — Button, Card, Drawer, Input, Modal, Select, Badge
- Etapas do checkout — entrega, pagamento PIX, confirmação de pedido
- Sincronização do carrinho com backend quando usuário autentica

📄 **Relatório detalhado:** [`frontend/RELATORIO_TESTES.md`](./frontend/RELATORIO_TESTES.md)

---

### Backend — Jest + Supertest

```bash
cd backend

# Executa todos os testes uma vez
npm test

# Gera relatório de cobertura
npm run test:coverage
```

O que é testado:
- Módulo `auth` — registro, login, validação de JWT
- Módulo `products` — listagem, detalhe, criação, atualização
- Middleware de autenticação e tratamento de erros
- Servidor Express — rotas e respostas padrão

📄 **Relatório detalhado:** [`backend/RELATORIO_TESTES.md`](./backend/RELATORIO_TESTES.md)

---

## 📖 Como Usar o Mercadex

### Fluxo do Cliente

1. **Navegação:** Browse produtos por categoria, busca e ordenação
2. **Detalhes:** Clique em um produto para modal com especificações completas
3. **Carrinho:** Adicione itens, ajuste quantidades — estado persiste no `localStorage`
4. **Checkout:** Preencha entrega, realize o pagamento via PIX, veja confirmação

### Gerenciamento de Estado (Cart Store)

```typescript
// Estado gerenciado via Zustand + persist middleware
// frontend/src/features/cart/model/cart-context.tsx
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, qty = 1) => {
        const items = addItem(get().items, product, qty);
        set(withDerived(items));
      }
    }),
    {
      name: "mercadex:cart-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

---

## 🔧 Desenvolvimento

### Design System (Obrigatório)

- O frontend deve seguir o padrão definido em `docs/DESIGN_SYSTEM.md`.
- Toda solicitação de UI nova, ajuste visual ou componente deve reutilizar os estilos e decisões desse documento.
- Tipografia padrão do projeto: **Inter**.

### Convenções Frontend

**Feature-Sliced Design:**
```
src/features/<nome>/
├── components/   # UI do domínio
└── model/        # hooks, context, reducers
```

**Componentes server vs client:**
```tsx
// "use client" apenas quando necessário (hooks ou browser APIs)
"use client";
export function CartDrawer() { ... }

// server component por padrão (sem diretiva)
export default function Page() { ... }
```

**Padrão de testes (AAA):**
```tsx
it("adds item to cart when button is clicked", async () => {
  // Arrange
  const user = userEvent.setup();
  render(<StorefrontPage />, { wrapper: CartProvider });

  // Act
  await user.click(screen.getByRole("button", { name: /adicionar/i }));

  // Assert
  expect(screen.getByText("1")).toBeInTheDocument();
});
```

### Scripts disponíveis

**Frontend (`cd frontend`):**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento Next.js (porta 3000) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint com zero warnings |
| `npm test` | Testes unitários — execução única |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Cobertura com threshold 80% |
| `npm run test:e2e` | Testes E2E (Playwright) |

**Backend (`cd backend`):**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento Express (porta 3001) |
| `npm run build` | Compilação TypeScript |
| `npm test` | Testes unitários — execução única |
| `npm run test:coverage` | Cobertura com threshold 80% |
| `npx prisma studio` | Interface visual do banco (porta 5555) |

---

## 🤝 Como Contribuir

### Workflow Git

```
main (produção)
 ↓
develop (integração)
 ↓
feature/nome-curto (seu trabalho)
```

### Passos para Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/SEU_USER/mercadex.git`
3. **Crie branch:** `git checkout -b feature/descricao-curta`
4. **Commit com mensagens descritivas:** `git commit -m "feat: adiciona filtro por preço"`
5. **Push:** `git push origin feature/descricao-curta`
6. **Abra Pull Request** contra `develop`

### Convenções

- **Commits semânticos:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- **Branches git-flow:** `feature/`, `bugfix/`, `hotfix/`, `release/`
- **Code style:** ESLint + TypeScript strict (sem `any`)

---

## 📚 Documentação

- **[CLAUDE.md](./CLAUDE.md)** - Instruções para Claude Code e arquitetura geral
- **[docs/ADR.md](./docs/ADR.md)** - Decisões arquiteturais e trade-offs
- **[docs/DIAGRAMAS.md](./docs/DIAGRAMAS.md)** - Fluxogramas de negócio
- **[docs/USER_STORIES.md](./docs/USER_STORIES.md)** - Histórias de usuário
- **[docs/BACKLOG.md](./docs/BACKLOG.md)** - Roadmap e prioridades
- **[docs/BRUNO_COLLECTION.md](./docs/BRUNO_COLLECTION.md)** - Coleção Bruno para testes da API
- **[frontend/RELATORIO_TESTES.md](./frontend/RELATORIO_TESTES.md)** - Relatório de cobertura do frontend (273 testes)
- **[backend/RELATORIO_TESTES.md](./backend/RELATORIO_TESTES.md)** - Relatório de cobertura do backend
- **Swagger UI** — `http://localhost:3001/api-docs` (backend rodando)

---

## ❓ FAQ / Troubleshooting

**P: Erro de hidratação SSR no carrinho?**
- R: O estado do `localStorage` é restaurado apenas em `useEffect` após montagem. Não inicialize o estado com `localStorage` diretamente no `useState`/`useReducer`.

**P: Os testes estão falhando com erro de `CartProvider`?**
- R: Componentes que usam `useCart` precisam ser renderizados dentro de `CartProvider`. Use o wrapper nas chamadas de `render()`.

**P: Posso rodar o backend agora?**
- R: Parcialmente. Os módulos `auth` e `products` estão implementados e já expõem rotas; `cart`, `users` e `orders` ainda estão em evolução.

**P: Como exploro os endpoints do backend?**
- R: Com o backend rodando (`npm run dev` na pasta `backend`), acesse `http://localhost:3001/api-docs` para a documentação interativa via Swagger UI. Também está disponível a coleção Bruno em `backend/bruno/`.

**P: Como limpo o carrinho no desenvolvimento?**
- R: Console do navegador: `localStorage.removeItem("cart")` e recarregue a página.

**P: Qual é o plano pós-MVP?**
- R: Ver [docs/BACKLOG.md](./docs/BACKLOG.md) para roadmap completo.

---

## 📊 Roadmap

| Fase | Status | Foco | Conclusão |
|------|--------|------|-----------|
| **1** | ✅ Concluído | Prototipagem frontend (HTML/CSS/JS Vanilla) | Abr 2026 |
| **2** | ✅ Concluído | Frontend Next.js 16.2 + testes (Jest + Playwright) | Mai 2026 |
| **3** | 🔄 Em andamento | Backend API REST (Node.js + TypeScript + Neon Postgres + Prisma) | Jun-Jul 2026 |
| **4** | 📋 Planejado | Integração frontend ↔ backend, autenticação, pagamentos | Ago 2026 |

---

## 📄 Licença

Este projeto é licenciado sob a **MIT License** - veja [LICENSE](./LICENSE) para detalhes.

---

## 👤 Autor

**Leandro Prado Pires**
- Email: leandropradopires02@gmail.com
- GitHub: [@cbfn](https://github.com/cbfn)

---

## 🙋 Suporte

Encontrou um bug ou tem uma sugestão?
- **Issues:** [GitHub Issues](https://github.com/cbfn/mercadex/issues)
- **Discussões:** [GitHub Discussions](https://github.com/cbfn/mercadex/discussions)

---

**Última atualização:** Maio 2026 | Mercadex MVP Phase 3 — Backend Node.js + Neon Postgres + Testes 99%
