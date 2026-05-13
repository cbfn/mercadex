# Trilha 2 — Backend: Autenticação e Produtos

**Responsável:** Dev 2
**Branch:** `feature/backend-auth-produtos`
**Base:** `develop` (após merge da Trilha 1)
**Estimativa:** 4–5 dias
**Pré-requisito:** Trilha 1 concluída e mergeada em `develop`

> Trabalhar sempre dentro de `backend/src/modules/`.
> Cada módulo segue o padrão: controller → service → repository → dto → routes → test.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

---

## Contexto

O backend usa Express + TypeScript + Prisma + Neon db.
A arquitetura segue DDD light: cada módulo é independente e se comunica
apenas via interfaces bem definidas.

**Padrão de resposta da API:**

```typescript
// Sucesso
{ "success": true, "data": { ... } }

// Erro
{ "success": false, "error": { "code": "INVALID_EMAIL", "message": "..." } }
```

---

## Tarefa 2.1 — Schema Prisma completo

**Tempo:** 2 horas
**Arquivo:** `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum Role {
  CUSTOMER
  ADMIN
}

enum Condition {
  NOVO
  EXCELENTE
  BOM
  USADO
}

enum OrderStatus {
  PENDENTE
  PAGO
  ENVIADO
  ENTREGUE
  CANCELADO
}

// ─── Models ──────────────────────────────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String?
  role         Role     @default(CUSTOMER)
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  orders   Order[]
  cart     Cart?
  products Product[]

  @@map("users")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  products    Product[]

  @@map("categories")
}

model Product {
  id              String    @id @default(uuid())
  sellerId        String    @map("seller_id")
  categoryId      String    @map("category_id")
  title           String
  description     String?
  price           Decimal   @db.Decimal(10, 2)
  condition       Condition
  images          Json      @default("[]")
  stock           Int       @default(0)
  active          Boolean   @default(true)
  viewsCount      Int       @default(0) @map("views_count")
  stripeProductId String?   @map("stripe_product_id")
  stripePriceId   String?   @map("stripe_price_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  seller     User        @relation(fields: [sellerId], references: [id])
  category   Category    @relation(fields: [categoryId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@map("products")
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique @map("user_id")
  sessionId String?    @map("session_id")
  updatedAt DateTime   @updatedAt @map("updated_at")

  user  User       @relation(fields: [userId], references: [id])
  items CartItem[]

  @@map("carts")
}

model CartItem {
  id        String  @id @default(uuid())
  cartId    String  @map("cart_id")
  productId String  @map("product_id")
  quantity  Int     @default(1)

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id              String      @id @default(uuid())
  buyerId         String      @map("buyer_id")
  totalPrice      Decimal     @map("total_price") @db.Decimal(10, 2)
  status          OrderStatus @default(PENDENTE)
  shippingAddress Json        @map("shipping_address")
  stripePaymentId String?     @map("stripe_payment_id")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  buyer User        @relation(fields: [buyerId], references: [id])
  items OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String  @map("order_id")
  productId String  @map("product_id")
  quantity  Int
  unitPrice Decimal @map("unit_price") @db.Decimal(10, 2)

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}
```

Após criar o schema:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

**Commit:**
```bash
git add prisma/
git commit -m "feat: schema Prisma completo (User, Product, Cart, Order)"
```

---

## Tarefa 2.2 — Módulo de Autenticação

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/auth/`

### auth.dto.ts

```typescript
import { z } from 'zod';

export const RegisterDto = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
```

### auth.repository.ts

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { name: string; email: string; passwordHash: string }) =>
    prisma.user.create({ data }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),
};
```

### auth.service.ts

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import type { RegisterInput, LoginInput } from './auth.dto';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw new Error('EMAIL_ALREADY_EXISTS');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string };
    const user = await authRepository.findById(payload.sub);
    if (!user) throw new Error('USER_NOT_FOUND');

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { accessToken };
  },
};
```

### auth.middleware.ts

```typescript
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID' } });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }
  next();
}
```

### auth.controller.ts

```typescript
import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = RegisterDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }
    try {
      const user = await authService.register(parsed.data);
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      if (err.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS' } });
      }
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
    }
  },

  async login(req: Request, res: Response) {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR' } });
    }
    try {
      const result = await authService.login(parsed.data);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS' } });
      }
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
    }
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN' } });
    try {
      const result = await authService.refresh(token);
      res.json({ success: true, data: result });
    } catch {
      res.status(401).json({ success: false, error: { code: 'REFRESH_TOKEN_INVALID' } });
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken');
    res.json({ success: true, data: { message: 'Logout realizado' } });
  },
};
```

### auth.routes.ts

```typescript
import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({ windowMs: 60_000, max: 5 });

const router = Router();

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
```

Registrar no `server.ts`:

```typescript
import authRoutes from './modules/auth/auth.routes';
app.use('/api/auth', authRoutes);
```

**Commit:**
```bash
git add src/modules/auth/
git commit -m "feat: modulo de autenticacao (register, login, JWT, refresh token)"
```

---

## Tarefa 2.3 — Módulo de Produtos e Categorias

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/products/`

### Endpoints a implementar

| Método | Rota | Auth |
| --- | --- | --- |
| GET | /api/products | Não |
| GET | /api/products/:id | Não |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |
| GET | /api/categories | Não |
| POST | /api/categories | Admin |

### products.dto.ts

```typescript
import { z } from 'zod';

export const CreateProductDto = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  condition: z.enum(['NOVO', 'EXCELENTE', 'BOM', 'USADO']),
  categoryId: z.string().uuid(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
});

export const UpdateProductDto = CreateProductDto.partial();

export const ProductFiltersDto = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.enum(['NOVO', 'EXCELENTE', 'BOM', 'USADO']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### products.repository.ts

Implementar métodos: `findMany(filters)`, `findById(id)`, `create(data)`,
`update(id, data)`, `softDelete(id)`.

### products.service.ts

Implementar lógica de negócio: validação de categoria existente, cálculo de
paginação, formatação de resposta.

### products.controller.ts + products.routes.ts

Seguir o mesmo padrão do módulo auth.

**Commit:**
```bash
git add src/modules/products/
git commit -m "feat: modulo de produtos e categorias com CRUD completo"
```

---

## Tarefa 2.4 — Testes unitários

**Tempo:** 1 dia
**Arquivo:** `backend/src/modules/auth/auth.test.ts` e `products.test.ts`

Usar **Supertest** para testes de integração com banco de teste.

```typescript
// auth.test.ts — exemplo de estrutura
import request from 'supertest';
import app from '../../server';

describe('POST /api/auth/register', () => {
  it('cria usuario com dados validos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'senha123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@test.com');
  });

  it('retorna 409 para email duplicado', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Test', email: 'dup@test.com', password: 'senha123' });

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Test', email: 'dup@test.com', password: 'senha123' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});
```

Criar `backend/jest.config.js`:

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  setupFilesAfterFramework: ['<rootDir>/src/test-setup.ts'],
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 80, statements: 80 },
  },
};
```

**Commit:**
```bash
git add src/modules/auth/auth.test.ts src/modules/products/products.test.ts jest.config.js
git commit -m "test: testes de integracao para auth e produtos (cobertura >= 80%)"
```

---

## Checklist Final da Trilha 2

- [x] Schema Prisma criado e migration executada
- [x] Módulo auth funcionando (register, login, refresh, logout)
- [x] Módulo produtos funcionando (CRUD + categorias + filtros)
- [x] Testes passando com cobertura >= 80%
- [x] `npx tsc --noEmit` sem erros
- [x] Nenhum `.env` commitado
- [x] PR aberto para `develop`

**Título do PR:** `feat: backend auth e produtos (JWT, CRUD, testes)`
