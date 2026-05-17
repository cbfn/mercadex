# Mercadex — Marketplace de Eletrônicos

[![Status](https://img.shields.io/badge/status-MVP%20Phase%202-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Frontend CI](https://github.com/cbfn/mercadex/actions/workflows/ci.yml/badge.svg)](https://github.com/cbfn/mercadex/actions/workflows/ci.yml)

## 📋 Sobre o Projeto

**Mercadex** é um marketplace de eletrônicos em desenvolvimento, construído como MVP (Produto Mínimo Viável) com arquitetura monolítica modular. O projeto separa claramente frontend e backend, permitindo evolução independente de cada camada.

**Objetivo:** Validar fluxos de compra e UX antes de escalar para produção. O frontend da Fase 2 está consolidado e o backend já possui autenticação, catálogo de produtos, busca assistida e persistência com Prisma/Postgres.

**Padrão de documentação:** novos módulos, funções públicas, contratos de API e utilitários compartilhados devem usar JSDoc.

---

## 🚀 Funcionalidades

### Frontend (Fase 2 - Concluído em 2026-05-11)
- ✅ **Catálogo Dinâmico:** Listagem de eletrônicos com filtragem por categoria, busca e ordenação
- ✅ **Modal de Detalhes:** Visualização completa de especificações, preços e avaliações
- ✅ **Carrinho Interativo:** Adicionar, alterar quantidades, remover itens com atualização em tempo real
- ✅ **Checkout Multi-Etapa:** Entrega → Pagamento (PIX) → Confirmação
- ✅ **Assistente Virtual:** Busca produtos por linguagem natural e abre a página do item selecionado
- ✅ **Persistência de Carrinho:** Estado restaurado do `localStorage` após navegação (sem SSR mismatch)
- ✅ **Testes Automatizados:** 165 testes unitários com cobertura ≥ 80% (Jest + React Testing Library)
- ✅ **CI Integrado:** GitHub Actions valida lint, type-check e testes a cada push
- ✅ **Design Responsivo:** Layout fluido para mobile, tablet e desktop (Tailwind CSS + tokens do design system)

### Backend (autenticação e produtos implementados)
- ✅ API REST em Node.js + TypeScript + Express.js
- ✅ Autenticação com JWT, refresh tokens e middleware de autorização
- ✅ Persistência em Neon Postgres + Prisma 7.8.0
- ✅ Módulo de produtos com CRUD, categorias, busca dedicada e testes
- ✅ Busca assistida com IA para produtos e perguntas institucionais da loja
- ⬜ Módulos de carrinho, pedidos e pagamentos ainda em evolução
- ⬜ Cache com Redis e jobs assíncronos ainda não implementados

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
| **Jest** | 30 | Testes unitários (22 suítes, 165 testes) |
| **React Testing Library** | 16 | Testes de componentes orientados a comportamento |
| **Playwright** | — | Testes E2E (configurado, fluxos críticos) |
| **lucide-react** | — | Ícones SVG |

### Backend (atual)
```
Node.js 20+ (runtime)
├── TypeScript (type safety)
├── Express.js (API REST)
├── Neon Postgres (persistência)
├── Prisma 7.8.0 (ORM)
├── JWT (autenticação)
├── Zod (validação de inputs)
└── OpenAI (interpretação de busca assistida)
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
│   ├── jest.config.cjs              # Jest + coverage threshold 80%
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
├── backend/                         # Node.js + Express (auth/produtos implementados)
│   └── src/
│       ├── modules/                 # auth e products prontos; cart/users/orders em andamento
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

### Backend (Express + Prisma)

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Configure o .env com DATABASE_URL, JWT_SECRET e JWT_REFRESH_SECRET

# 4. Rode o servidor de desenvolvimento
npm run dev

# 5. Build de produção
npm run build && npm start

# 6. Executar migrações e seeds
npm run db:migrate
npm run db:seed
npm run db:import:products
```

### Testes

```bash
cd frontend

# Unitários (Jest + React Testing Library)
npm run test            # execução única
npm run test:watch      # modo watch

# Cobertura (threshold: 80% em lines/functions/branches/statements)
npm run test:coverage

# E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui     # com interface visual
```

### Testes do Backend

```bash
cd backend

npm run test
npm run test:coverage
npm run build
```

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

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Next.js) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint com zero warnings |
| `npm run test` | Testes unitários (Jest) |
| `npm run test:coverage` | Cobertura (threshold 80%) |
| `npm run test:e2e` | Testes E2E (Playwright) |

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

---

## ❓ FAQ / Troubleshooting

**P: Erro de hidratação SSR no carrinho?**
- R: O estado do `localStorage` é restaurado apenas em `useEffect` após montagem. Não inicialize o estado com `localStorage` diretamente no `useState`/`useReducer`.

**P: Os testes estão falhando com erro de `CartProvider`?**
- R: Componentes que usam `useCart` precisam ser renderizados dentro de `CartProvider`. Use o wrapper nas chamadas de `render()`.

**P: Posso rodar o backend agora?**
- R: Sim. Os módulos `auth` e `products` estão implementados e testados; `cart`, `users` e `orders` ainda estão em evolução.

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
| **4** | 📋 Planejado | Integração completa frontend ↔ backend, carrinho, pedidos e pagamentos | Ago 2026 |

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

**Última atualização:** Maio 2026 | Mercadex em evolução — frontend consolidado, backend auth/produtos implementados
