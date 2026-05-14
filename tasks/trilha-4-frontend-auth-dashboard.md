# Trilha 4 — Frontend: Autenticação e Dashboard Administrativo

**Responsável:** Dev 4
**Branch:** `feature/frontend-auth-dashboard`
**Base:** `develop` (após merge da Trilha 1)
**Estimativa:** 4–5 dias
**Pré-requisito:** Trilha 1 concluída (Next.js 16.2 + Jest configurados)

> Esta trilha pode rodar em paralelo com as Trilhas 2 e 3.
> Usar dados mock para desenvolver o frontend enquanto o backend não está pronto.
> A integração real acontece na Trilha 5.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

---

## Contexto

O frontend usa Next.js 16.2 com App Router. A estrutura segue Feature-Sliced Design:
cada feature tem `components/` e `model/` separados.

O backend ainda não está disponível durante o desenvolvimento desta trilha.
Use mocks e stubs para simular as respostas da API.

---

## Tarefa 4.1 — API Client (fetch wrapper com JWT)

**Tempo:** 4 horas
**Arquivo:** `frontend/src/shared/lib/api-client.ts`

```typescript
/**
 * Cliente HTTP centralizado com suporte a JWT e refresh automático.
 * Todas as chamadas à API devem usar este módulo.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Token de acesso armazenado em memória (não localStorage — segurança) */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Faz uma requisição autenticada para a API.
 * Renova o access token automaticamente se expirado (via refresh token em cookie).
 */
export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // envia cookies (refresh token)
  });

  // Token expirado — tentar renovar
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
      if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.json());
      return retryRes.json();
    }
    throw new ApiError(401, { error: { code: 'SESSION_EXPIRED' } });
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API Error ${status}`);
  }
}
```

Criar `frontend/src/shared/lib/api/auth.ts`:

```typescript
import { apiRequest, setAccessToken } from '../api-client';

export const authApi = {
  async login(email: string, password: string) {
    const res = await apiRequest<{
      success: boolean;
      data: { accessToken: string; user: { id: string; name: string; role: string } };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  async register(name: string, email: string, password: string) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      skipAuth: true,
    });
  },

  async logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setAccessToken(null);
  },

  async me() {
    return apiRequest<{ success: boolean; data: { id: string; name: string; role: string } }>(
      '/api/auth/me'
    );
  },
};
```

**Commit:**
```bash
git add src/shared/lib/api-client.ts src/shared/lib/api/
git commit -m "feat: api-client com JWT e refresh automatico"
```

---

## Tarefa 4.2 — Contexto de Autenticação

**Tempo:** 3 horas
**Arquivo:** `frontend/src/features/auth/model/auth-context.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '@/shared/lib/api/auth';

interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tentar restaurar sessão ao carregar
  useEffect(() => {
    authApi.me()
      .then((res) => setUser(res.data as User))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user as User);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
```

Adicionar `AuthProvider` ao `frontend/src/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/features/auth/model/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Commit:**
```bash
git add src/features/auth/ src/app/layout.tsx
git commit -m "feat: contexto de autenticacao com AuthProvider e useAuth"
```

---

## Tarefa 4.3 — Páginas de Login e Registro

**Tempo:** 1 dia

### Estrutura de arquivos

```
frontend/src/
├── app/
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx
│       └── register/
│           └── page.tsx
└── features/
    └── auth/
        └── components/
            ├── login-form.tsx
            ├── login-form.test.tsx
            ├── register-form.tsx
            └── register-form.test.tsx
```

### login-form.tsx

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../model/auth-context';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de login">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### login-form.test.tsx

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

// Mock do contexto de auth
jest.mock('../model/auth-context', () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('LoginForm', () => {
  it('renderiza campos de email e senha', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('submete o formulario com dados validos', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

### app/(auth)/login/page.tsx

```tsx
import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main>
      <h1>Entrar no Mercadex</h1>
      <LoginForm />
      <p>
        Não tem conta?{' '}
        <Link href="/register">Criar conta</Link>
      </p>
    </main>
  );
}
```

Criar `register-form.tsx` e `register-form.test.tsx` seguindo o mesmo padrão.

**Commit:**
```bash
git add src/app/\(auth\)/ src/features/auth/components/
git commit -m "feat: paginas de login e registro com testes"
```

---

## Tarefa 4.4 — Middleware de proteção de rotas

**Tempo:** 2 horas
**Arquivo:** `frontend/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — sempre acessíveis
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith('/api'))) {
    return NextResponse.next();
  }

  // Verificar se há refresh token (indica sessão ativa)
  const hasSession = request.cookies.has('refreshToken');

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
```

**Commit:**
```bash
git add src/middleware.ts
git commit -m "feat: middleware de protecao de rotas autenticadas"
```

---

## Tarefa 4.5 — Dashboard Administrativo

**Tempo:** 1 dia

### Estrutura de arquivos

```
frontend/src/
├── app/
│   └── (admin)/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx
│       └── orders/
│           └── page.tsx
└── features/
    └── admin/
        ├── components/
        │   ├── admin-sidebar.tsx
        │   ├── stats-card.tsx
        │   ├── products-table.tsx
        │   └── product-form.tsx
        └── model/
            └── use-products-admin.ts
```

### app/(admin)/layout.tsx

```tsx
'use client';

import { useAuth } from '@/features/auth/model/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Carregando...</div>;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '1rem' }}>{children}</main>
    </div>
  );
}
```

### admin-sidebar.tsx

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Produtos' },
  { href: '/admin/orders', label: 'Pedidos' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu administrativo">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### use-products-admin.ts (com mock para desenvolvimento)

```typescript
'use client';

import { useState, useEffect } from 'react';

// Mock temporário — será substituído pela API real na Trilha 5
const MOCK_PRODUCTS = [
  { id: '1', title: 'iPhone 15', price: 4999.90, stock: 10, active: true },
  { id: '2', title: 'MacBook Air', price: 8999.90, stock: 5, active: true },
];

export function useProductsAdmin() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return { products, isLoading, deleteProduct };
}
```

### products-table.tsx

```tsx
'use client';

import Link from 'next/link';
import { useProductsAdmin } from '../model/use-products-admin';

export function ProductsTable() {
  const { products, isLoading, deleteProduct } = useProductsAdmin();

  if (isLoading) return <p>Carregando produtos...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Preço</th>
          <th>Estoque</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.title}</td>
            <td>R$ {product.price.toFixed(2)}</td>
            <td>{product.stock}</td>
            <td>
              <Link href={`/admin/products/${product.id}/edit`}>Editar</Link>
              <button onClick={() => deleteProduct(product.id)}>Remover</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Commit:**
```bash
git add src/app/\(admin\)/ src/features/admin/
git commit -m "feat: dashboard administrativo com CRUD de produtos e listagem de pedidos"
```

---

## Tarefa 4.6 — Formulário de Produto (criação e edição)

**Tempo:** 4 horas
**Arquivo:** `frontend/src/features/admin/components/product-form.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: {
    id?: string;
    title: string;
    price: number;
    stock: number;
    condition: string;
    description?: string;
  };
  onSubmit: (data: FormData) => Promise<void>;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      router.push('/admin/products');
    } catch {
      setError('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de produto">
      <div>
        <label htmlFor="title">Nome do produto</label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialData?.title}
          required
          minLength={3}
        />
      </div>
      <div>
        <label htmlFor="price">Preço (R$)</label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initialData?.price}
          required
        />
      </div>
      <div>
        <label htmlFor="stock">Estoque</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          defaultValue={initialData?.stock ?? 0}
          required
        />
      </div>
      <div>
        <label htmlFor="condition">Condição</label>
        <select id="condition" name="condition" defaultValue={initialData?.condition ?? 'NOVO'}>
          <option value="NOVO">Novo</option>
          <option value="EXCELENTE">Excelente</option>
          <option value="BOM">Bom</option>
          <option value="USADO">Usado</option>
        </select>
      </div>
      <div>
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          rows={4}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : initialData?.id ? 'Atualizar' : 'Criar produto'}
      </button>
    </form>
  );
}
```

**Commit:**
```bash
git add src/features/admin/components/product-form.tsx
git commit -m "feat: formulario de produto para criacao e edicao"
```

---

## Checklist Final da Trilha 4

- [ ] api-client.ts criado com refresh automático
- [ ] AuthProvider e useAuth funcionando
- [ ] Páginas de login e registro com testes
- [ ] Middleware de proteção de rotas
- [ ] Dashboard admin com layout e sidebar
- [ ] CRUD de produtos no admin (com mocks)
- [ ] Listagem de pedidos no admin (com mocks)
- [ ] Formulário de produto (criação e edição)
- [ ] `npm run test` passando
- [ ] `npm run build` passando
- [ ] PR aberto para `develop`

**Título do PR:** `feat: frontend auth (login/registro) e dashboard administrativo`
