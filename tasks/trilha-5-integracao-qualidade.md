# Trilha 5 — Integração, Qualidade e CI/CD

**Responsável:** Dev 5
**Branch:** `feature/integracao-qualidade`
**Base:** `develop` (após merge das Trilhas 2, 3 e 4)
**Estimativa:** 5–6 dias
**Pré-requisito:** Trilhas 2, 3 e 4 todas mergeadas em `develop`

> Esta é a trilha de fechamento. Conecta frontend e backend, garante
> qualidade com testes e JSDoc, e configura o CI/CD final.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

---

## Contexto

Neste ponto, o projeto tem:
- Backend com Auth, Produtos, Pedidos, Reviews e AI (Trilhas 2 e 3)
- Frontend com Login, Registro, Checkout PIX, Reviews e Chat IA usando mocks (Trilha 4)

**MVP Lean:** sem Stripe, sem carrinho no backend (localStorage), sem dashboard admin.
Ver `docs/ADR.md` ADR-007 a ADR-010.

Esta trilha substitui os mocks pela API real, adiciona JSDoc, garante
cobertura de testes ≥ 80% e atualiza o CI/CD.

---

## Tarefa 5.1 — Integração Frontend ↔ Backend

**Tempo:** 2 dias

### 5.1.1 — API de Produtos (substituir mocks)

Criar `frontend/src/shared/lib/api/products.ts`:

```typescript
import { apiRequest } from '../api-client';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  condition: 'NOVO' | 'EXCELENTE' | 'BOM' | 'USADO';
  images: string[];
  stock: number;
  category: { id: string; name: string };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    return apiRequest<{ success: boolean; data: Product[]; meta: { total: number; page: number } }>(
      `/api/products?${params}`,
      { skipAuth: true }
    );
  },

  get: (id: string) =>
    apiRequest<{ success: boolean; data: Product }>(`/api/products/${id}`, { skipAuth: true }),

  create: (data: Omit<Product, 'id' | 'category'> & { categoryId: string }) =>
    apiRequest<{ success: boolean; data: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Product>) =>
    apiRequest<{ success: boolean; data: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/products/${id}`, { method: 'DELETE' }),
};
```

### 5.1.2 — API de Reviews e Chat

Criar `frontend/src/shared/lib/api/reviews.ts`:

```typescript
import { apiRequest } from '../api-client';

export interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  user: { name: string };
  createdAt: string;
}

export const reviewsApi = {
  list: (productId: string) =>
    apiRequest<{ success: boolean; data: Review[] }>(
      `/api/products/${productId}/reviews`,
      { skipAuth: true }
    ),

  create: (productId: string, data: { title: string; body: string; rating: number }) =>
    apiRequest<{ success: boolean; data: Review }>(
      `/api/products/${productId}/reviews`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  delete: (reviewId: string) =>
    apiRequest(`/api/reviews/${reviewId}`, { method: 'DELETE' }),
};
```

Criar `frontend/src/shared/lib/api/chat.ts`:

```typescript
import { apiRequest } from '../api-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatApi = {
  send: (productId: string, message: string, history: ChatMessage[]) =>
    apiRequest<{ success: boolean; data: { reply: string } }>(
      `/api/products/${productId}/chat`,
      { method: 'POST', body: JSON.stringify({ message, history }), skipAuth: true }
    ),

  getAiSummary: (productId: string) =>
    apiRequest<{ success: boolean; data: { summary: string } }>(
      `/api/products/${productId}/ai-summary`,
      { skipAuth: true }
    ),
};
```

### 5.1.3 — CartContext mantém-se 100% localStorage (sem sync com backend)

O `frontend/src/features/cart/model/cart-context.tsx` **não precisa de alterações**.
O carrinho é totalmente client-side via Zustand + localStorage (ADR-007).
O checkout cria o pedido via `POST /api/orders` com os itens do store.

**Commit:**
```bash
git add src/shared/lib/api/ src/features/
git commit -m "feat: integra frontend com API real (produtos, reviews, chat, pedidos)"
```

---

## Tarefa 5.3 — JSDoc em todos os arquivos

**Tempo:** 1 dia

Adicionar JSDoc em todos os arquivos TypeScript/TSX. Prioridade:

1. `shared/lib/` — utilitários puros
2. `features/*/model/` — hooks e contexts
3. `features/*/components/` — componentes
4. `shared/ui/` — primitivos UI
5. `backend/src/modules/*/` — controllers, services, repositories

**Padrão obrigatório para funções:**

```typescript
/**
 * Breve descrição do que a função faz.
 *
 * @param paramName - Descrição do parâmetro
 * @returns Descrição do retorno
 *
 * @example
 * const result = minhaFuncao('valor');
 * // result === 'esperado'
 */
```

**Padrão para componentes React:**

```tsx
/**
 * Exibe o formulário de login com validação client-side.
 *
 * @example
 * <LoginForm />
 */
export function LoginForm() { ... }
```

**Padrão para interfaces/types:**

```typescript
/**
 * Representa um item no carrinho de compras.
 */
export interface CartItem {
  /** ID único do item */
  id: string;
  /** ID do produto */
  productId: string;
  /** Quantidade selecionada */
  quantity: number;
  /** Preço unitário no momento da adição */
  price: number;
}
```

**Commit:**
```bash
git add -A
git commit -m "docs: adiciona JSDoc em todos os arquivos TypeScript/TSX"
```

---

## Tarefa 5.4 — Cobertura de testes Jest ≥ 80%

**Tempo:** 2 dias

### Testes a criar no frontend

```
frontend/src/features/
├── auth/
│   ├── components/login-form.test.tsx      ← já criado na Trilha 4
│   ├── components/register-form.test.tsx   ← já criado na Trilha 4
│   └── model/auth-context.test.tsx
├── product-detail/
│   ├── components/review-form.test.tsx
│   ├── components/review-list.test.tsx
│   ├── components/ai-summary-button.test.tsx
│   └── components/product-chat-drawer.test.tsx
└── checkout/
    └── components/checkout-page.test.tsx    ← já criado na Trilha 4
```

### auth-context.test.tsx

```tsx
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';

jest.mock('@/shared/lib/api/auth', () => ({
  authApi: {
    login: jest.fn().mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Test', role: 'CUSTOMER' } }),
    logout: jest.fn(),
    register: jest.fn().mockResolvedValue(undefined),
  },
}));

function TestComponent() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p>Carregando</p>;
  return <p>{user ? `Logado: ${user.name}` : 'Não logado'}</p>;
}

describe('AuthContext', () => {
  it('inicia sem usuario autenticado quando localStorage está vazio', async () => {
    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByText('Não logado')).toBeInTheDocument();
  });
});
```

**Verificar cobertura:**

```bash
cd frontend
npm run test:coverage
# Deve mostrar >= 80% em lines, functions, branches, statements
```

**Commit:**
```bash
git add src/features/
git commit -m "test: cobertura de testes >= 80% para auth, reviews e chat"
```

---

## Tarefa 5.5 — CI/CD atualizado

**Tempo:** 4 horas
**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend:
    name: Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Testes unitários com cobertura
        run: npm run test:coverage

      - name: Build de produção
        run: npm run build

      - name: Instalar browsers Playwright
        run: npx playwright install --with-deps chromium

      - name: Testes E2E
        run: npm run test:e2e

      - name: Upload relatório Playwright
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 7

  backend:
    name: Backend
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: mercadex_test
          POSTGRES_USER: mercadex
          POSTGRES_PASSWORD: mercadex_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Executar migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Testes com cobertura
        run: npm run test:coverage
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ci_test_secret_nao_usar_em_producao
          NODE_ENV: test
```

**Commit:**
```bash
git add .github/workflows/ci.yml
git commit -m "ci: atualiza pipeline com backend, Jest e Neon no CI"
```

---

## Tarefa 5.6 — Variáveis de ambiente documentadas

**Tempo:** 1 hora

Criar `.env.example` na raiz do projeto:

```bash
# ─── Frontend ────────────────────────────────────────────────────────────────
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Chave PIX estática (fake para MVP)
NEXT_PUBLIC_PIX_KEY=00020126360014br.gov.bcb.pix...

# ─── Backend ─────────────────────────────────────────────────────────────────
# Neon Postgres
DATABASE_URL=postgresql://USER:PASSWORD@ep-your-project-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT — gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
JWT_EXPIRES_IN=7d

# LLM Provider (para features de IA)
LLM_PROVIDER_API_KEY=
LLM_PROVIDER_MODEL=gpt-4o-mini

# Servidor
PORT=3001
NODE_ENV=development
```

**Commit:**
```bash
git add .env.example
git commit -m "docs: documenta todas as variaveis de ambiente necessarias"
```

---

## Checklist Final da Trilha 5

- [ ] Mocks substituídos pela API real (produtos, reviews, chat, pedidos)
- [ ] API de reviews e chat integrados no frontend
- [ ] JSDoc adicionado em todos os arquivos
- [ ] Cobertura de testes ≥ 80% (frontend e backend)
- [ ] CI/CD atualizado com job de backend + Neon
- [ ] `.env.example` documentado (sem Stripe, com LLM_PROVIDER)
- [ ] `npm run build` passando (frontend)
- [ ] `npm run test:coverage` passando (frontend e backend)
- [ ] Nenhuma secret commitada
- [ ] PR aberto para `develop`
- [ ] Após aprovação do PR, abrir PR de `develop` para `main`

**Título do PR:** `feat: integracao completa frontend-backend, JSDoc, testes e CI/CD`

---

## Merge Final

Após aprovação do PR da Trilha 5 em `develop`:

```bash
# Criar PR de develop para main
# Título: "release: v1.0.0 — Mercadex MVP completo"
# Descrição: resumo de todas as funcionalidades implementadas
```

O merge em `main` representa o MVP completo do Mercadex.
