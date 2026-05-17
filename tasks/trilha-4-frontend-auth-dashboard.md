# Trilha 4 — Frontend: Autenticação, Checkout PIX e Features de IA

**Responsável:** Dev 4
**Branch:** `feature/frontend-auth-dashboard`
**Base:** `develop` (após merge da Trilha 1)
**Estimativa:** 4–5 dias
**Pré-requisito:** Trilha 1 concluída (Next.js 16.2 + Jest configurados)

> Esta trilha pode rodar em paralelo com as Trilhas 2 e 3.
> Usar dados mock para desenvolver o frontend enquanto o backend não está pronto.
> A integração real acontece na Trilha 5.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

**MVP Lean:** Dashboard administrativo removido — gestão via Prisma Studio.
JWT único com expiração de 7 dias armazenado em `localStorage`. Sem refresh token.
Carrinho 100% em `localStorage` via Zustand (sem sync com backend).
Ver `docs/ADR.md` ADR-007 a ADR-010 para contexto completo.

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

JWT único de 7 dias, armazenado em `localStorage`. Sem refresh token, sem cookie.
Em 401 o utilizador é redirecionado para /login pelo AuthContext.

```typescript
/**
 * Cliente HTTP centralizado com suporte a JWT.
 * Token único de 7 dias armazenado em localStorage.
 * Todas as chamadas à API devem usar este módulo.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'mercadex_token';

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Faz uma requisição autenticada para a API.
 * Token JWT lido do localStorage em cada chamada.
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

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }

  return res.json();
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
import { apiRequest, setToken } from '../api-client';

export const authApi = {
  async login(email: string, password: string) {
    const res = await apiRequest<{
      success: boolean;
      data: { token: string; user: { id: string; name: string; role: string } };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setToken(res.data.token);
    return res.data;
  },

  async register(name: string, email: string, password: string) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      skipAuth: true,
    });
  },

  logout() {
    setToken(null);
  },
};
```

**Commit:**
```bash
git add src/shared/lib/api-client.ts src/shared/lib/api/
git commit -m "feat: api-client com JWT via localStorage"
```

---

## Tarefa 4.2 — Contexto de Autenticação

**Tempo:** 3 horas
**Arquivo:** `frontend/src/features/auth/model/auth-context.tsx`

Token JWT de 7 dias e dados do usuário armazenados em `localStorage`.
Restauração ao montar via `useEffect` (evita SSR mismatch).
Sem chamada a `/api/auth/me` — sessão é local até o token expirar.

```typescript
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '@/shared/lib/api/auth';
import { getToken, setToken } from '@/shared/lib/api-client';

const USER_KEY = 'mercadex_user';

interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sessão a partir do localStorage após montagem (SSR-safe)
  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem(USER_KEY);
    if (token && stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        setToken(null);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user as User);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem(USER_KEY);
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

Como o JWT está em `localStorage` (inacessível no servidor), a proteção real de rotas
autenticadas é feita pelo AuthContext no cliente. O middleware limita-se a redirecionar
rotas de auth para `/` quando o utilizador já tem sessão (via cookie de convenção que o
AuthProvider pode opcionalmente definir) e a excluir assets estáticos do matcher.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de roteamento simplificado.
 * Proteção de rotas autenticadas é feita no lado do cliente (AuthContext).
 * O middleware apenas exclui arquivos estáticos do processamento.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
```

**Commit:**
```bash
git add src/middleware.ts
git commit -m "feat: middleware de roteamento (protecao client-side via AuthContext)"
```

---

## Tarefa 4.5 — Página de Checkout PIX

**Tempo:** 1 dia
**Arquivo:** `frontend/src/app/checkout/page.tsx`

Exibe itens do carrinho (Zustand), formulário de endereço, chave PIX estática + QR code
e botão de confirmação que faz POST /api/orders.

### Estrutura de arquivos

```
frontend/src/
├── app/
│   └── checkout/
│       └── page.tsx
└── features/
    └── checkout/
        └── components/
            ├── checkout-page.tsx
            ├── checkout-page.test.tsx
            └── pix-display.tsx
```

### checkout-page.tsx

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/features/cart/model/cart-context';
import { useAuth } from '@/features/auth/model/auth-context';
import { PixDisplay } from './pix-display';
import { apiRequest } from '@/shared/lib/api-client';

interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}

const STATIC_PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? '00020126360014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913Mercadex MVP6009SAO PAULO62070503***63041D3D';

/**
 * Página de checkout com endereço, PIX estático e confirmação de pedido.
 * Após confirmação, limpa o carrinho e redireciona para /orders/:id.
 */
export function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState<ShippingAddress>({
    cep: '', street: '', number: '', city: '', state: '',
  });
  const [step, setStep] = useState<'address' | 'pix'>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!user) {
    router.push('/login?redirect=/checkout');
    return null;
  }

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: { id: string } }>(
        '/api/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
            shippingAddress: address,
          }),
        }
      );
      clearCart();
      router.push(`/orders/${res.data.id}`);
    } catch {
      setError('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Finalizar Compra</h1>
      {step === 'address' && (
        <section aria-label="Endereço de entrega">
          {/* Campos de endereço omitidos por brevidade — seguir padrão shadcn/Input */}
          <button onClick={() => setStep('pix')} disabled={!address.cep || !address.street}>
            Continuar para pagamento
          </button>
        </section>
      )}
      {step === 'pix' && (
        <section aria-label="Pagamento via PIX">
          <PixDisplay pixCode={STATIC_PIX_KEY} total={total} />
          {error && <p role="alert">{error}</p>}
          <button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Confirmando...' : 'Confirmar Pedido'}
          </button>
        </section>
      )}
    </main>
  );
}
```

### pix-display.tsx

```tsx
'use client';

import { useState } from 'react';

interface PixDisplayProps {
  pixCode: string;
  total: number;
}

/**
 * Exibe a chave PIX estática, QR code (via API externa) e botão de cópia.
 */
export function PixDisplay({ pixCode, total }: PixDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;

  return (
    <div>
      <p>Total: <strong>R$ {total.toFixed(2)}</strong></p>
      <p>Escaneie o QR code ou copie a chave PIX:</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl} alt="QR code PIX" width={200} height={200} />
      <code>{pixCode.slice(0, 40)}…</code>
      <button onClick={handleCopy} aria-label="Copiar chave PIX">
        {copied ? 'Copiado!' : 'Copiar Chave'}
      </button>
    </div>
  );
}
```

### checkout-page.test.tsx

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutPage } from './checkout-page';

jest.mock('@/features/cart/model/cart-context', () => ({
  useCartStore: () => ({
    items: [{ id: 'p1', title: 'iPhone', price: 4999, quantity: 1 }],
    clearCart: jest.fn(),
  }),
}));
jest.mock('@/features/auth/model/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Ana', role: 'CUSTOMER' } }),
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('CheckoutPage', () => {
  it('renderiza etapa de endereco por padrao', () => {
    render(<CheckoutPage />);
    expect(screen.getByLabelText(/endereco/i)).toBeInTheDocument();
  });
});
```

**Commit:**
```bash
git add src/app/checkout/ src/features/checkout/
git commit -m "feat: pagina de checkout com PIX estatico e confirmacao de pedido"
```

---

## Tarefa 4.6 — Review UI

**Tempo:** 4 horas

### Estrutura de arquivos

```
frontend/src/features/product-detail/components/
├── review-form.tsx
├── review-form.test.tsx
├── review-list.tsx
└── review-list.test.tsx
```

### review-form.tsx

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/model/auth-context';
import { apiRequest } from '@/shared/lib/api-client';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

/**
 * Formulário autenticado para submissão de review.
 * Visível apenas para utilizadores com sessão ativa.
 * Rating de 1 a 5 estrelas; título e corpo obrigatórios.
 */
export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <p>Faça login para deixar uma avaliação.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await apiRequest(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, title, body }),
      });
      onSuccess();
    } catch {
      setError('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de avaliação">
      <div>
        <label htmlFor="rating">Nota (1–5)</label>
        <input
          id="rating"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label htmlFor="review-title">Título</label>
        <input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="review-body">Avaliação</label>
        <textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}
```

### review-list.tsx

```tsx
interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  user: { name: string };
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

/**
 * Lista de avaliações com média de rating calculada localmente.
 */
export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return <p>Nenhuma avaliação ainda.</p>;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section aria-label="Avaliações do produto">
      <p>Média: {avg.toFixed(1)} ⭐ ({reviews.length} avaliações)</p>
      <ul>
        {reviews.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong> — {r.rating}★
            <p>{r.body}</p>
            <small>{r.user.name} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Commit:**
```bash
git add src/features/product-detail/components/review-form.tsx src/features/product-detail/components/review-list.tsx
git commit -m "feat: UI de reviews com formulario e listagem"
```

---

## Tarefa 4.7 — AI Features UI (Resumo IA + Chat)

**Tempo:** 1 dia

### Estrutura de arquivos

```
frontend/src/features/product-detail/components/
├── ai-summary-button.tsx
├── ai-summary-button.test.tsx
├── product-chat-drawer.tsx
└── product-chat-drawer.test.tsx
```

### ai-summary-button.tsx

```tsx
'use client';

import { useState } from 'react';
import { apiRequest } from '@/shared/lib/api-client';

interface AiSummaryButtonProps {
  productId: string;
}

/**
 * Botão que busca e exibe o resumo de reviews gerado por IA.
 * GET /api/products/:id/ai-summary
 */
export function AiSummaryButton({ productId }: AiSummaryButtonProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: { summary: string } }>(
        `/api/products/${productId}/ai-summary`,
        { skipAuth: true }
      );
      setSummary(res.data.summary);
    } catch {
      setError('Não foi possível gerar o resumo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!summary && (
        <button onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Gerando resumo...' : '✨ Ver Insight da IA'}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {summary && (
        <blockquote aria-label="Resumo gerado por IA">
          <p>{summary}</p>
        </blockquote>
      )}
    </div>
  );
}
```

### product-chat-drawer.tsx

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '@/shared/lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProductChatDrawerProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

/**
 * Chat stateless com IA sobre o produto.
 * Histórico mantido apenas em estado React — descartado ao fechar.
 * POST /api/products/:id/chat com { message, history[] }
 */
export function ProductChatDrawer({ productId, productTitle, onClose }: ProductChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiRequest<{ success: boolean; data: { reply: string } }>(
        `/api/products/${productId}/chat`,
        {
          method: 'POST',
          body: JSON.stringify({ message: userMessage.content, history: messages }),
          skipAuth: true,
        }
      );
      setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Erro ao conectar com a IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside aria-label={`Chat sobre ${productTitle}`} role="complementary">
      <header>
        <h2>Tirar Dúvida — {productTitle}</h2>
        <button onClick={onClose} aria-label="Fechar chat">✕</button>
      </header>
      <div role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} data-role={m.role}>
            <strong>{m.role === 'user' ? 'Você' : 'IA'}:</strong> {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        aria-label="Enviar mensagem"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
    </aside>
  );
}
```

**Commit:**
```bash
git add src/features/product-detail/components/
git commit -m "feat: AI summary button e chat drawer no detalhe do produto"
```

---

## Checklist Final da Trilha 4

- [ ] api-client.ts com JWT via localStorage (sem refresh token)
- [ ] AuthProvider e useAuth funcionando com restauração via localStorage
- [ ] Páginas de login e registro com testes
- [ ] Middleware simplificado (proteção de rotas client-side)
- [ ] Página de checkout PIX com endereço + QR + confirmação
- [ ] Review form e review list com testes
- [ ] AiSummaryButton funcional (GET /ai-summary)
- [ ] ProductChatDrawer funcional (POST /chat, histórico React-only)
- [ ] `npm run test` passando
- [ ] `npm run build` passando
- [ ] PR aberto para `develop`

**Título do PR:** `feat: frontend auth (login/registro), checkout PIX e features de IA`

