# Trilha 3 — Backend: Carrinho, Pedidos e Stripe

**Responsável:** Dev 3
**Branch:** `feature/backend-carrinho-pagamentos`
**Base:** `develop` (após merge da Trilha 1)
**Estimativa:** 4–5 dias
**Pré-requisito:** Trilha 1 concluída. Schema Prisma da Trilha 2 disponível em `develop`.

> Esta trilha pode rodar em paralelo com a Trilha 2 e Trilha 4.
> Depende apenas do schema Prisma (Tarefa 2.1 da Trilha 2).
> Se a Trilha 2 ainda não mergeou, copie o schema.prisma localmente.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

---

## Contexto

Esta trilha implementa o fluxo de compra completo no backend:
carrinho persistido no banco → criação de pedido → pagamento via Stripe.

O Stripe é integrado sem Docker. As chaves de teste estão disponíveis
gratuitamente em [dashboard.stripe.com](https://dashboard.stripe.com).

---

## Tarefa 3.1 — Módulo de Carrinho

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/cart/`

### Endpoints

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| GET | /api/cart | Ver carrinho do usuário | Sim |
| POST | /api/cart/items | Adicionar item | Sim |
| PUT | /api/cart/items/:itemId | Atualizar quantidade | Sim |
| DELETE | /api/cart/items/:itemId | Remover item | Sim |
| DELETE | /api/cart | Limpar carrinho | Sim |

### cart.dto.ts

```typescript
import { z } from 'zod';

export const AddCartItemDto = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().min(1).max(99),
});
```

### cart.repository.ts

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cartRepository = {
  findOrCreate: async (userId: string) => {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  },

  addItem: async (cartId: string, productId: string, quantity: number) => {
    return prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  updateItem: async (itemId: string, quantity: number) => {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  removeItem: async (itemId: string) => {
    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  clearCart: async (cartId: string) => {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
```

### cart.service.ts

```typescript
import { cartRepository } from './cart.repository';
import type { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import { z } from 'zod';

export const cartService = {
  async getCart(userId: string) {
    const cart = await cartRepository.findOrCreate(userId);
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    return { ...cart, total };
  },

  async addItem(userId: string, input: z.infer<typeof AddCartItemDto>) {
    const cart = await cartRepository.findOrCreate(userId);
    await cartRepository.addItem(cart.id, input.productId, input.quantity);
    return cartService.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, input: z.infer<typeof UpdateCartItemDto>) {
    await cartRepository.updateItem(itemId, input.quantity);
    return cartService.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    await cartRepository.removeItem(itemId);
    return cartService.getCart(userId);
  },

  async clearCart(userId: string) {
    const cart = await cartRepository.findOrCreate(userId);
    await cartRepository.clearCart(cart.id);
    return { items: [], total: 0 };
  },
};
```

### cart.controller.ts + cart.routes.ts

Seguir o padrão dos módulos anteriores. Todas as rotas requerem `authenticate`.

**Commit:**
```bash
git add src/modules/cart/
git commit -m "feat: modulo de carrinho com persistencia no banco"
```

---

## Tarefa 3.2 — Módulo de Pedidos

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/orders/`

### Endpoints

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| POST | /api/orders | Criar pedido a partir do carrinho | Sim |
| GET | /api/orders | Listar pedidos do usuário | Sim |
| GET | /api/orders/:id | Detalhe do pedido | Sim |
| PATCH | /api/orders/:id/status | Atualizar status (Admin) | Admin |

### orders.dto.ts

```typescript
import { z } from 'zod';

export const CreateOrderDto = z.object({
  shippingAddress: z.object({
    cep: z.string().length(8),
    street: z.string().min(3),
    number: z.string().min(1),
    complement: z.string().optional(),
    city: z.string().min(2),
    state: z.string().length(2),
  }),
});
```

### orders.service.ts — lógica principal

```typescript
import { PrismaClient } from '@prisma/client';
import type { CreateOrderDto } from './orders.dto';
import { z } from 'zod';

const prisma = new PrismaClient();

export const ordersService = {
  async createOrder(userId: string, input: z.infer<typeof CreateOrderDto>) {
    // 1. Buscar carrinho com itens
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('CART_EMPTY');
    }

    // 2. Verificar estoque de cada item
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${item.product.title}`);
      }
    }

    // 3. Calcular total
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // 4. Criar pedido em transação
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          totalPrice,
          shippingAddress: input.shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Decrementar estoque
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Limpar carrinho
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  },

  async listOrders(userId: string) {
    return prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('ORDER_NOT_FOUND');
    return order;
  },
};
```

**Commit:**
```bash
git add src/modules/orders/
git commit -m "feat: modulo de pedidos com criacao a partir do carrinho"
```

---

## Tarefa 3.3 — Integração Stripe

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/payments/`

### Instalação

```bash
cd backend
npm install stripe@^17.0.0
```

### Configuração de chaves

Obter chaves em [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys):

```bash
# backend/.env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### stripe.service.ts

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const stripeService = {
  /**
   * Cria um PaymentIntent para o valor do pedido.
   * O frontend usa o clientSecret para exibir o formulário de pagamento.
   */
  async createPaymentIntent(orderId: string, amountInCents: number) {
    return stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      metadata: { orderId },
      payment_method_types: ['card', 'pix'],
    });
  },

  /**
   * Valida a assinatura do webhook e retorna o evento Stripe.
   * NUNCA confiar no corpo sem validar a assinatura.
   */
  constructWebhookEvent(payload: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  },
};
```

### payments.routes.ts

```typescript
import { Router, raw } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripeService } from './stripe.service';
import { authenticate } from '../auth/auth.middleware';
import { ordersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/orders.dto';
import type { AuthRequest } from '../auth/auth.middleware';

const prisma = new PrismaClient();
const router = Router();

// Criar pedido + PaymentIntent
router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  const parsed = CreateOrderDto.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR' } });
  }

  try {
    const order = await ordersService.createOrder(req.user!.id, parsed.data);
    const amountInCents = Math.round(Number(order.totalPrice) * 100);
    const paymentIntent = await stripeService.createPaymentIntent(order.id, amountInCents);

    // Salvar stripePaymentId no pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        amount: amountInCents,
      },
    });
  } catch (err: any) {
    if (err.message === 'CART_EMPTY') {
      return res.status(400).json({ success: false, error: { code: 'CART_EMPTY' } });
    }
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// Webhook Stripe — usar raw body para validar assinatura
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripeService.constructWebhookEvent(req.body, sig);

      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as { id: string };
        await prisma.order.updateMany({
          where: { stripePaymentId: pi.id },
          data: { status: 'PAGO' },
        });
      }

      res.json({ received: true });
    } catch {
      res.status(400).json({ error: 'Webhook signature invalid' });
    }
  }
);

export default router;
```

Registrar no `server.ts`:

```typescript
import paymentsRoutes from './modules/payments/payments.routes';
app.use('/api/payments', paymentsRoutes);
```

**Testar webhook localmente:**

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:3001/api/payments/webhook
# Copiar o webhook secret exibido para .env.local
```

**Commit:**
```bash
git add src/modules/payments/
git commit -m "feat: integracao Stripe (PaymentIntent, webhook, PIX e cartao)"
```

---

## Tarefa 3.4 — Testes unitários

**Tempo:** 1 dia

```typescript
// cart.test.ts — estrutura
describe('GET /api/cart', () => {
  it('retorna carrinho vazio para usuario novo', async () => { ... });
  it('retorna 401 sem token', async () => { ... });
});

describe('POST /api/cart/items', () => {
  it('adiciona item ao carrinho', async () => { ... });
  it('incrementa quantidade se item ja existe', async () => { ... });
});

// orders.test.ts
describe('POST /api/orders', () => {
  it('cria pedido a partir do carrinho', async () => { ... });
  it('retorna 400 para carrinho vazio', async () => { ... });
  it('decrementa estoque apos criacao', async () => { ... });
});
```

**Commit:**
```bash
git add src/modules/cart/cart.test.ts src/modules/orders/orders.test.ts
git commit -m "test: testes de integracao para carrinho e pedidos"
```

---

## Checklist Final da Trilha 3

- [ ] Módulo carrinho funcionando (CRUD completo)
- [ ] Módulo pedidos funcionando (criação, listagem, detalhe)
- [ ] Stripe integrado (PaymentIntent + webhook)
- [ ] Webhook testado com Stripe CLI
- [ ] Testes passando com cobertura >= 80%
- [ ] `npx tsc --noEmit` sem erros
- [ ] Nenhuma chave Stripe commitada
- [ ] PR aberto para `develop`

**Título do PR:** `feat: backend carrinho, pedidos e integracao Stripe`
