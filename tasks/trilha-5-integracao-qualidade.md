# Trilha 5 — Integração, Qualidade e CI/CD

**Responsável:** Dev 5
**Branch:** `feature/integracao-qualidade`
**Base:** `develop` (após merge das Trilhas 2, 3 e 4)
**Estimativa:** 5–6 dias
**Pré-requisito:** Trilhas 2, 3 e 4 todas mergeadas em `develop`

> Esta é a trilha de fechamento. Conecta frontend e backend, garante
> qualidade com testes e JSDoc, e configura o CI/CD final.

---

## Contexto

Neste ponto, o projeto tem:
- Backend com Auth, Produtos, Carrinho, Pedidos e Stripe (Trilhas 2 e 3)
- Frontend com Login, Registro e Dashboard Admin usando mocks (Trilha 4)

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

### 5.1.2 — API de Carrinho

Criar `frontend/src/shared/lib/api/cart.ts`:

```typescript
import { apiRequest } from '../api-client';

export const cartApi = {
  get: () => apiRequest<{ success: boolean; data: { items: CartItem[]; total: number } }>('/api/cart'),

  addItem: (productId: string, quantity: number) =>
    apiRequest('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (itemId: string, quantity: number) =>
    apiRequest(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    apiRequest(`/api/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: () => apiRequest('/api/cart', { method: 'DELETE' }),
};
```

### 5.1.3 — Atualizar hooks do admin para usar API real

Atualizar `frontend/src/features/admin/model/use-products-admin.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi, type Product } from '@/shared/lib/api/products';

export function useProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.list({ limit: 100 });
      setProducts(res.data);
    } catch {
      setError('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id: string) => {
    await productsApi.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createProduct = async (data: Parameters<typeof productsApi.create>[0]) => {
    const res = await productsApi.create(data);
    setProducts((prev) => [...prev, res.data]);
    return res.data;
  };

  return { products, isLoading, error, deleteProduct, createProduct, refetch: fetchProducts };
}
```

### 5.1.4 — Atualizar CartContext para usar API real

Modificar `frontend/src/features/cart/model/cart-context.tsx` para sincronizar
com o backend quando o usuário estiver logado, mantendo localStorage como fallback
para usuários não autenticados.

**Commit:**
```bash
git add src/shared/lib/api/ src/features/admin/model/ src/features/cart/
git commit -m "feat: integra frontend com API real (produtos, carrinho, pedidos)"
```

---

## Tarefa 5.2 — Integração Stripe no Frontend

**Tempo:** 1 dia

### Instalação

```bash
cd frontend
npm install @stripe/stripe-js@^5.0.0 @stripe/react-stripe-js@^3.0.0
```

### Variável de ambiente

```bash
# frontend/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### stripe-payment-form.tsx

```tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { apiRequest } from '@/shared/lib/api-client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  onSuccess: () => void;
}

function CheckoutForm({ clientSecret, orderId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pedido/${orderId}/confirmacao`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Erro no pagamento');
      setIsLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isLoading || !stripe}>
        {isLoading ? 'Processando...' : 'Confirmar pagamento'}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  shippingAddress: object;
  onSuccess: () => void;
}

export function StripePaymentForm({ shippingAddress, onSuccess }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const initCheckout = async () => {
    setIsCreating(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        data: { clientSecret: string; orderId: string };
      }>('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress }),
      });
      setClientSecret(res.data.clientSecret);
      setOrderId(res.data.orderId);
    } finally {
      setIsCreating(false);
    }
  };

  if (!clientSecret) {
    return (
      <button onClick={initCheckout} disabled={isCreating}>
        {isCreating ? 'Preparando pagamento...' : 'Ir para pagamento'}
      </button>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        clientSecret={clientSecret}
        orderId={orderId}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
```

**Commit:**
```bash
git add src/features/checkout/
git commit -m "feat: formulario de pagamento Stripe (cartao e PIX)"
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
└── admin/
    ├── components/product-form.test.tsx
    ├── components/products-table.test.tsx
    └── model/use-products-admin.test.ts
```

### auth-context.test.tsx

```tsx
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';

// Mock da API
jest.mock('@/shared/lib/api/auth', () => ({
  authApi: {
    me: jest.fn().mockRejectedValue(new Error('Not authenticated')),
    login: jest.fn().mockResolvedValue({ user: { id: '1', name: 'Test', role: 'CUSTOMER' } }),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined),
  },
}));

function TestComponent() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p>Carregando</p>;
  return <p>{user ? `Logado: ${user.name}` : 'Não logado'}</p>;
}

describe('AuthContext', () => {
  it('inicia sem usuario autenticado', async () => {
    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(screen.getByText('Não logado')).toBeInTheDocument();
  });
});
```

### use-products-admin.test.ts

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProductsAdmin } from './use-products-admin';

jest.mock('@/shared/lib/api/products', () => ({
  productsApi: {
    list: jest.fn().mockResolvedValue({
      data: [{ id: '1', title: 'iPhone', price: 4999, stock: 10 }],
    }),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useProductsAdmin', () => {
  it('carrega produtos da API', async () => {
    const { result } = renderHook(() => useProductsAdmin());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].title).toBe('iPhone');
  });

  it('remove produto da lista ao deletar', async () => {
    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.deleteProduct('1');

    expect(result.current.products).toHaveLength(0);
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
git add src/features/auth/model/ src/features/admin/
git commit -m "test: cobertura de testes >= 80% para auth e admin"
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
          DATABASE_URL: postgresql://mercadex:mercadex_test@localhost:5432/mercadex_test

      - name: Testes com cobertura
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://mercadex:mercadex_test@localhost:5432/mercadex_test
          JWT_SECRET: ci_test_secret_nao_usar_em_producao
          JWT_REFRESH_SECRET: ci_test_refresh_secret_nao_usar_em_producao
          NODE_ENV: test
```

**Commit:**
```bash
git add .github/workflows/ci.yml
git commit -m "ci: atualiza pipeline com backend, Jest e PostgreSQL no CI"
```

---

## Tarefa 5.6 — Variáveis de ambiente documentadas

**Tempo:** 1 hora

Criar `.env.example` na raiz do projeto:

```bash
# ─── Frontend ────────────────────────────────────────────────────────────────
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Chave pública do Stripe (segura para expor no frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ─── Backend ─────────────────────────────────────────────────────────────────
# Banco de dados PostgreSQL local
DATABASE_URL=postgresql://mercadex:mercadex_dev@localhost:5432/mercadex

# JWT — gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe — obter em dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

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

- [ ] Mocks substituídos pela API real (produtos, carrinho, pedidos)
- [ ] Stripe integrado no frontend (formulário de pagamento)
- [ ] JSDoc adicionado em todos os arquivos
- [ ] Cobertura de testes ≥ 80% (frontend e backend)
- [ ] CI/CD atualizado com job de backend + PostgreSQL
- [ ] `.env.example` documentado
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
