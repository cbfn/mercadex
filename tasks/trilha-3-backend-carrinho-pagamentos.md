# Trilha 3 — Backend: Pedidos, Reviews e IA

**Responsável:** Dev 3
**Branch:** `feature/backend-carrinho-pagamentos`
**Base:** `develop` (após merge da Trilha 1)
**Estimativa:** 4–5 dias
**Pré-requisito:** Trilha 1 concluída. Schema Prisma da Trilha 2 disponível em `develop`.

> Esta trilha pode rodar em paralelo com a Trilha 2 e Trilha 4.
> Regra de documentação: novos módulos, funções públicas, contratos de API e utilitários compartilhados devem ser documentados com JSDoc.

---

## Contexto (Pivot MVP Lean)

Esta trilha implementa:
1. **Módulo de Pedidos** — recebe array de itens do frontend (localStorage), valida estoque e cria pedido com status `PENDING_PIX`.
2. **Módulo de Reviews** — CRUD de avaliações de produtos.
3. **AI Services** — resumo de reviews via LLM e chat stateless sobre produto.

> **@legacy:** O módulo de Carrinho com persistência no banco e a integração Stripe foram movidos para `backend/src/legacy/`. Retomar em sprint futura.

---

## Tarefa 3.1 — Módulo de Pedidos

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/orders/`

### Endpoints

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| POST | /api/orders | Criar pedido a partir do carrinho frontend | Sim |
| GET | /api/orders | Listar pedidos do usuário logado | Sim |
| GET | /api/orders/:id | Detalhe do pedido | Sim |

### orders.dto.ts

```typescript
import { z } from 'zod';

export const CreateOrderDto = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'Carrinho não pode estar vazio'),
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
import type { z } from 'zod';
import type { CreateOrderDto } from './orders.dto';

const prisma = new PrismaClient();

export const ordersService = {
  /**
   * Cria um pedido a partir dos itens enviados pelo frontend (localStorage).
   * Valida estoque de cada produto e calcula o total antes de persistir.
   *
   * @param userId - ID do usuário autenticado
   * @param input - DTO com array de itens e endereço de entrega
   */
  async createOrder(userId: string, input: z.infer<typeof CreateOrderDto>) {
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      throw new Error('Um ou mais produtos não encontrados ou inativos');
    }

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para: ${product.title}`);
      }
    }

    const totalPrice = input.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalPrice,
          shippingAddress: input.shippingAddress,
          status: 'PENDING_PIX',
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: products.find((p) => p.id === item.productId)!.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  },

  /** Lista pedidos do usuário. @param userId - ID do usuário */
  async listOrders(userId: string) {
    return prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Retorna detalhe de um pedido verificando ownership. */
  async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  },
};
```

Criar `orders.controller.ts` e `orders.routes.ts` seguindo o padrão dos módulos anteriores. Todas as rotas requerem `authenticate`.

**Commit:**
```bash
git add src/modules/orders/
git commit -m "feat: modulo de pedidos com PENDING_PIX e validacao de estoque"
```

---

## Tarefa 3.2 — Módulo de Reviews

**Tempo:** 1 dia
**Diretório:** `backend/src/modules/reviews/`

### Endpoints

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| GET | /api/products/:id/reviews | Listar reviews de um produto | Não |
| POST | /api/products/:id/reviews | Criar review (1 por usuário/produto) | Sim |
| DELETE | /api/reviews/:id | Deletar próprio review | Sim |

### reviews.dto.ts

```typescript
import { z } from 'zod';

export const CreateReviewDto = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});
```

### reviews.service.ts

```typescript
import { PrismaClient } from '@prisma/client';
import type { z } from 'zod';
import type { CreateReviewDto } from './reviews.dto';

const prisma = new PrismaClient();

export const reviewsService = {
  /**
   * Lista todas as reviews de um produto com dados do autor.
   * @param productId - ID do produto
   */
  async listReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Cria uma review. Garante unicidade (1 review por usuário por produto).
   * @param userId - ID do usuário autenticado
   * @param productId - ID do produto avaliado
   * @param input - DTO com título, corpo e nota
   */
  async createReview(userId: string, productId: string, input: z.infer<typeof CreateReviewDto>) {
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new Error('Você já avaliou este produto');
    return prisma.review.create({ data: { userId, productId, ...input } });
  },

  /**
   * Deleta uma review. Verifica que pertence ao usuário.
   * @param reviewId - ID da review
   * @param userId - ID do usuário autenticado
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new Error('Review não encontrada ou sem permissão');
    return prisma.review.delete({ where: { id: reviewId } });
  },
};
```

Criar `reviews.controller.ts` e `reviews.routes.ts`. Registrar as rotas em `server.ts`.

**Commit:**
```bash
git add src/modules/reviews/
git commit -m "feat: modulo de reviews com unicidade por usuario/produto"
```

---

## Tarefa 3.3 — AI Services (Resumo e Chat)

**Tempo:** 1,5 dias
**Diretório:** `backend/src/modules/ai/`

> Provider LLM configurado via `LLM_PROVIDER_API_KEY` e `LLM_PROVIDER_MODEL` em `.env`. A escolha do provider (OpenAI, Anthropic, etc.) é feita na implementação da função `callLLM`.

### Endpoints

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| GET | /api/products/:id/ai-summary | Resumo IA das reviews do produto | Não |
| POST | /api/products/:id/chat | Chat stateless sobre o produto | Não |

### ai.service.ts

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retorna um resumo de 3 frases das reviews de um produto gerado por LLM.
 * @param productId - ID do produto
 */
export async function getAiSummary(productId: string): Promise<{ summary: string }> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { title: true, body: true, rating: true },
  });

  if (reviews.length === 0) {
    throw new Error('Sem avaliações suficientes para gerar resumo');
  }

  const reviewsText = reviews
    .map((r) => `Nota: ${r.rating}/5 — ${r.title}: ${r.body}`)
    .join('\n');

  const prompt = `Você é um assistente de e-commerce. Com base nas avaliações abaixo, escreva um resumo CONCISO de exatamente 3 frases destacando os principais pontos POSITIVOS e NEGATIVOS do produto. Seja objetivo e baseado apenas nas avaliações fornecidas.\n\nAvaliações:\n${reviewsText}`;

  const summary = await callLLM(prompt);
  return { summary };
}

/**
 * Responde uma pergunta sobre o produto com base nas specs e reviews.
 * Stateless — sem persistência de histórico no banco.
 *
 * @param productId - ID do produto
 * @param message - Pergunta do usuário
 */
export async function chatWithProduct(productId: string, message: string): Promise<{ reply: string }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { name: true } },
      reviews: { select: { title: true, body: true, rating: true }, take: 10 },
    },
  });

  if (!product) throw new Error('Produto não encontrado');

  const specs = `Produto: ${product.title}\nCategoria: ${product.category.name}\nPreço: R$ ${product.price}\nCondição: ${product.condition}\nDescrição: ${product.description ?? 'N/A'}`;
  const reviewsText = product.reviews.length > 0
    ? product.reviews.map((r) => `Nota ${r.rating}/5: ${r.title} — ${r.body}`).join('\n')
    : 'Sem avaliações disponíveis';

  const prompt = `Você é um assistente especialista em eletrônicos. Responda a pergunta do cliente com base APENAS nas especificações e avaliações do produto abaixo. Se não souber, diga que não tem informação suficiente.\n\nEspecificações:\n${specs}\n\nAvaliações:\n${reviewsText}\n\nPergunta: ${message}`;

  const reply = await callLLM(prompt);
  return { reply };
}

/** @internal Chama o LLM configurado via variável de ambiente. Implementar conforme provider escolhido. */
async function callLLM(prompt: string): Promise<string> {
  throw new Error('LLM provider não configurado. Implemente callLLM em ai.service.ts');
}
```

### ai.dto.ts

```typescript
import { z } from 'zod';

export const ChatDto = z.object({
  message: z.string().min(1).max(500),
});
```

Criar `ai.controller.ts` e `ai.routes.ts`. Registrar as rotas em `server.ts`.

**Commit:**
```bash
git add src/modules/ai/
git commit -m "feat: ai services — resumo de reviews e chat stateless de produto"
```

---

## Tarefa 3.4 — Testes Unitários

**Tempo:** 1 dia

Seguir padrão AAA (Arrange / Act / Assert) com descrições em frases completas.

**`orders.service.test.ts`:**
- `"creates order with PENDING_PIX status when items and address are valid"`
- `"throws when product has insufficient stock"`
- `"throws when product is not found or inactive"`
- `"throws when items array is empty"`

**`reviews.service.test.ts`:**
- `"creates review when user has not reviewed this product before"`
- `"throws conflict error when user already reviewed the product"`
- `"deletes review when it belongs to the authenticated user"`
- `"throws when review does not belong to the user"`

**`ai.service.test.ts`:**
- `"returns summary when product has reviews"`
- `"throws when product has no reviews"`
- `"returns reply when product exists"`
- `"throws when product is not found"`

**Commit:**
```bash
git add tests/
git commit -m "test: testes unitarios para orders, reviews e ai services"
```

---

## Checklist Final

- [ ] Cobertura ≥ 80% nos arquivos da trilha
- [ ] Sem erros TypeScript (`npx tsc --noEmit`)
- [ ] JSDoc em todos os services, controllers e dtos públicos
- [ ] `.env.example` atualizado com `LLM_PROVIDER_API_KEY` e `LLM_PROVIDER_MODEL`
- [ ] PR contra `develop` com descrição clara

**Título do PR:** `feat: backend pedidos, reviews e ai services (MVP Lean)`

---

## Referências

- `docs/ADR.md` — ADR-007 (Cart localStorage), ADR-008 (PIX fake), ADR-010 (IA)
- `backend/prisma/schema.prisma` — Models Order, Review (Cart/CartItem comentados como @legacy)
- `backend/src/legacy/` — Módulo Stripe e Cart (não deletar)

