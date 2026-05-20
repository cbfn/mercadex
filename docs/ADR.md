# Architecture Decision Record (ADR) - Marketplace Mercadex

## 1. Decisão: Arquitetura Monolítica Modular com Separação Frontend/Backend

**Status:** Aprovado  
**Data:** 2026-05-05  
**Decisor:** Time Arquitetura

### Contexto

Desenvolvemos um MVP de marketplace de eletrônicos usados com requisitos iniciais: cadastro de usuários, listagem de produtos, carrinho de compras e checkout. Precisamos equilibrar velocidade de desenvolvimento, escalabilidade futura e simplicidade operacional.

### Alternativas Consideradas

| Alternativa | Prós | Contras | Score |
|------------|------|---------|-------|
| **Monólito Modular** (ESCOLHIDA) | Rápido desenvolvimento, deploy simples, fácil debugging, escalável verticalmente | Pode ficar complexo se não bem organizado | ⭐⭐⭐⭐ |
| Microserviços | Escalabilidade horizontal, independência de deploy | Overhead operacional, complexidade distribuída | ⭐⭐ |
| Serverless (AWS Lambda) | Zero infraestrutura, pay-per-use | Cold starts, debugging difícil, vendor lock-in | ⭐⭐⭐ |
| Monólito Tradicional (MVC) | Simplicidade extrema | Pouca flexibilidade para crescimento | ⭐⭐ |

### Decisão

**Arquitetura Monolítica Modular** com **separação clara Backend/Frontend**

```
mercadex/
├── backend/                 # API REST (Node.js + Express)
│   ├── src/
│   │   ├── modules/        # Módulos de negócio
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── shared/         # Código compartilhado
│   │   │   ├── middleware/
│   │   │   ├── errors/
│   │   │   └── utils/
│   │   └── config/
│   └── tests/
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/       # HTTP client
│   │   ├── hooks/
│   │   └── context/        # State management
│   └── tests/
│
└── docs/                   # Documentação
```

### Consequências

**Positivas:**
- ✅ MVP pronto em 6-8 semanas
- ✅ Deploy simples (1 container backend + static frontend)
- ✅ Fácil integração e debugging
- ✅ Custos iniciais baixos
- ✅ Path claro para evolução (microserviços futuros)
- ✅ Todos desenvolvedores entendem a estrutura

**Negativas:**
- ⚠️ Escalabilidade vertical limitada (máximo alguns milhões de transações/dia)
- ⚠️ Se backend crescer demais, refatoração necessária
- ⚠️ Deploy requer reinicializar todo o serviço

**Mitigação:**
- Estrutura modular facilita quebra em microserviços depois
- Caching estratégico (Redis) preparado desde o início
- Message queue (Bull/RabbitMQ) para operações assíncronas

---

## 2. Decisão: Stack Tecnológica Completa

### Backend: Node.js + TypeScript + Express.js

**Por que Node.js?**
- Rápido desenvolvimento (JavaScript/TypeScript)
- Excelente para I/O (marketplace = muitas requisições simultâneas)
- Grande ecossistema (npm)
- Community ativa

**Por que TypeScript?**
- Type safety desde o início (previne bugs)
- Melhor documentação do código
- Refatorações seguras

**Por que Express.js?**
- Minimalista, maduro, consolidado
- Perfeito para MVP (sem overhead)
- Milhões de projetos em produção

```json
{
  "backend": {
    "runtime": "Node.js 20+",
    "language": "TypeScript",
    "framework": "Express.js",
    "auth": "JWT (jsonwebtoken)",
    "database": "PostgreSQL 15+",
    "orm": "Prisma 7.8.0",
    "validation": "Zod",
    "logging": "Winston/Pino",
    "testing": "Jest + Supertest",
    "async-jobs": "Bull (Redis queue)",
    "cache": "Redis 7+"
  }
}
```

### Frontend: React 19 + Next.js 16.2 (Migrado — Fase 2 concluída)

**Fase 1: Prototipação Rápida (Concluída)**
O frontend foi inicialmente desenvolvido como protótipo estático com HTML5, Vanilla JavaScript e CSS3. Permitiu validação rápida de UX e fluxos.

**Fase 2: Arquitetura Definitiva (Implementada em 2026-05-11)**
Migração concluída para Next.js 16.2 com App Router. O protótipo estático foi removido e substituído pela aplicação React em `frontend/src/`.

**Por que React? (Fase 2)**
- Melhor UX (reatividade)
- Maior comunidade frontend
- Fácil encontrar desenvolvedores

**Por que Next.js?**
- Server-side rendering (SEO importante para marketplace)
- API routes integradas
- Deploy simples (Vercel)
- File-based routing

```json
{
  "frontend": {
    "framework": "React 19",
    "meta-framework": "Next.js 16.2 (App Router)",
    "language": "TypeScript (strict)",
    "styling": "Tailwind CSS + tokens globais em src/app/globals.css",
    "ui-components": "Componentes em shared/ui/ no padrão shadcn-style",
    "state": "Zustand com persist middleware (localStorage)",
    "forms": "HTML nativo com validação required",
    "validation": "TypeScript types",
    "testing": "Jest 30 + React Testing Library",
    "coverage": "Jest coverage (threshold: 80% lines/functions/branches/statements)",
    "ci": "GitHub Actions (.github/workflows/ci.yml)",
    "e2e": "Playwright (configurado para fluxos criticos)"
  }
}
```

### Banco de Dados: PostgreSQL 15+

**Por que PostgreSQL?**
- ACID completo (importante para transações de marketplace)
- JSON nativo (flexibilidade)
- Escalável para millions de registros
- Open source, maduro
- Excelente performance para queries complexas

**Tabelas principais:**
```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2),
  condition ENUM('novo', 'excelente', 'bom', 'usado'),
  images JSONB,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  total_price DECIMAL(10,2),
  status ENUM('pending_pix', 'pago', 'enviado', 'entregue', 'cancelado') DEFAULT 'pending_pix',
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews (Fase 3 MVP Lean)
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  title VARCHAR(255),
  body TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- @legacy: cart_items movido para schema.prisma comentado. Retomar em sprint futura.
```

### Autenticação: JWT Único (7 dias)

**Decisão MVP Lean (ADR-004):** Em vez do par access token (15 min) + refresh token, o MVP usa um único JWT com expiração de 7 dias, armazenado em `localStorage`.

- Token único: 7 dias de validade
- Armazenado em `localStorage` no frontend
- Header `Authorization: Bearer <token>` em todas as requisições autenticadas
- Token inválido antes do prazo → usuário refaz login
- Sem endpoint `/api/auth/refresh`
- Risco aceito: tokens não podem ser revogados antes da expiração; mitigação futura via blacklist Redis

> **Nota:** A implementação com refresh token em cookie HTTP-only não foi movida para `backend/src/legacy/`; ela permanece no código atual de autenticação neste ciclo. Retomar a convergência com o escopo do JWT único em sprint futura, se a decisão arquitetural for mantida.

**Estado real do ciclo atual (2026-05-20):**
- Implementação entregue com access token + refresh token, incluindo refresh token via cookie HTTP-only.
- Motivo: redução de risco de regressão no fluxo de auth já estabilizado e melhor postura de segurança operacional.
- Implicação documental: o JWT único permanece como referência de escopo simplificado esperado no pivot, mas não como estado efetivo do código neste ciclo.

### Cache: Redis

- Sessões de usuário
- Cache de produtos populares
- Queue de jobs assíncronos (upload de imagens, envio de emails)

---

## 3. Decisão: Infraestrutura e Deployment

### Ambiente Local
- Docker Compose para PostgreSQL + Redis
- Nodemon para hot reload
- Environment variables com `.env.local`

### Staging
- Railway.app ou Heroku (simplicidade)
- PostgreSQL gerenciado
- CI/CD com GitHub Actions

### Produção (Fase 2)
- **Opção A (Recomendada):** Railway/Heroku inicialmente
- **Opção B:** Docker em VPS (Digital Ocean/Linode) com Docker Swarm
- **Opção C:** AWS ECS com ALB + RDS (mais complexo, mas escala melhor)

**Justificativa:** Railway/Heroku oferece melhor trade-off entre simplicidade e performance para MVP.

---

## 4. Decisão: Fluxo CI/CD

```yaml
Branch: main (produção)
        ↓
    (GitHub Actions)
        ↓
1. Lint (ESLint + Prettier)
2. Type check (TypeScript)
3. Tests unitários + integração
4. Build Docker image
5. Deploy automático
6. Smoke tests
```

---

## 5. Decisão: Padrões de Código e Qualidade

### Estrutura de Módulos (DDD light)

```typescript
// modules/products/
├── controllers/       # HTTP handlers
├── services/         # Lógica de negócio
├── repositories/     # Acesso a dados
├── entities/         # Modelos de domínio
├── dtos/            # Transfer objects
└── tests/
```

### Princípios
- **Clean Code:** Nomes descritivos, funções pequenas
- **SOLID:** Especialmente SRP e DIP
- **Type Safety:** Sem `any`, máximo strictness do TypeScript
- **Error Handling:** Custom exceptions, não throw strings

### Padrões de API

```typescript
// Sucesso
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-05-05T..." }
}

// Erro
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email inválido",
    "details": { ... }
  }
}
```

---

## 6. Decisão: Segurança

### Implementado desde o início

- ✅ HTTPS obrigatório
- ✅ CORS configurado (whitelist de domínios)
- ✅ Rate limiting por IP/usuário
- ✅ SQL injection prevention (Prisma com queries parametrizadas)
- ✅ XSS prevention (React escape automático)
- ✅ CSRF tokens
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod)
- ✅ secrets em environment variables
- ✅ Logging de ações sensíveis (auth, pagamento)

---

## 7. Timeline de Implementação

| Fase | Duração | Escopo |
|------|---------|--------|
| **Fase 1 (MVP)** | 6-8 semanas | Setup, Auth, Produtos, Carrinho, Checkout com PIX |
| **Fase 2** | 4-6 semanas | Pagamento via Cartão de Crédito/Débito e Boleto, Sistema de avaliação |
| **Fase 3** | 4-6 semanas | Chat vendedor/comprador, Notificações |
| **Fase 4** | Contínuo | Escalabilidade, Analytics, Recomendações |

---

## 8. Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| MVP fica monólito inviável | Média | Alto | Estrutura modular desde dia 1 |
| Database performance | Média | Alto | Índices, caching, query optimization |
| Segurança negligenciada | Baixa | Crítico | Security review no PR, OWASP checklist |
| Escalabilidade prematura | Alta | Baixo | YAGNI principle, refatore conforme crescer |

---

## 9. Justificativa de Escolhas

### Por que TypeScript em ambos?
Reduz bugs em produção, melhora developer experience, facilita onboarding de novos devs.

### Por que Next.js ao invés de criar SPA puro?
- SSR para SEO (crucial para marketplace)
- API routes integradas (menos boilerplate)
- Built-in image optimization

### Por que TypeORM ao invés de Sequelize?
Melhor suporte a TypeScript, decorators mais elegantes, melhor performance.

### Por que Zod ao invés de Joi?
TypeScript-first, schemas mais enxutos, melhor performance em runtime validation.

---

## 10. Próximos Passos

1. ✅ Validar arquitetura com time
2. ⬜ Setup inicial do projeto
3. ⬜ Implementar estrutura base (Express + TypeORM + Middlewares)
4. ⬜ Autenticação JWT completa
5. ⬜ CRUD de Produtos
6. ⬜ Sistema de Carrinho
7. ⬜ Checkout básico (sem pagamento)
8. ✅ Frontend React/Next.js (migrado em 2026-05-11)
9. ⬜ Integração completa
10. ⬜ Deploy em staging

---

---

## 7. Decisão: Carrinho 100% Client-Side (localStorage)

**Status:** Aprovado (Pivot MVP Lean — 2026-05-15)

### Contexto

A implementação original previa persistência do carrinho no banco de dados (`Cart` e `CartItem`). Para reduzir a complexidade da Fase 3, decidimos eliminar esse modelo.

### Decisão

O carrinho é gerenciado **exclusivamente via `localStorage`** no frontend (Zustand + persist middleware). O backend **não expõe endpoints de cart**. No momento do checkout, o frontend envia o array de itens diretamente para `POST /api/orders`.

### Consequências

**Positivas:**
- ✅ Elimina 5 endpoints REST de carrinho
- ✅ Remove dependência de sessão para adicionar itens
- ✅ Frontend já tem a infra pronta (Zustand + localStorage)

**Negativas:**
- ⚠️ Carrinho não persiste entre dispositivos
- ⚠️ Análise de abandono de carrinho fica indisponível

**Mitigação:** Models `Cart`/`CartItem` permanecem comentados no `schema.prisma` para retomada futura.

---

## 8. Decisão: PIX Estático Fake (sem gateway de pagamento)

**Status:** Aprovado (Pivot MVP Lean — 2026-05-15)

### Contexto

A integração com Stripe (SDK + webhook + PaymentIntent) adiciona complexidade operacional e de testes significativa ao MVP. O objetivo do MVP Lean é validar o fluxo de compra, não processar pagamentos reais.

### Decisão

O fluxo de pagamento exibe uma **chave PIX estática (Copia e Cola) e um QR Code fixo**. O pedido é criado imediatamente com status `PENDING_PIX`. Confirmação de pagamento é feita manualmente via Prisma Studio.

Stripe SDK movido para `backend/src/legacy/`.

### Consequências

**Positivas:**
- ✅ Elimina dependência de conta Stripe, webhook e TLS em desenvolvimento
- ✅ Fluxo de UX completo testável sem infraestrutura de pagamento
- ✅ Reduz escopo em ~1,5 dia de desenvolvimento

**Negativas:**
- ⚠️ Sem confirmação automática de pagamento
- ⚠️ Status `PENDING_PIX` requer atualização manual

**Mitigação:** Integração Stripe documentada e preservada em `/legacy` para retomada em sprint futura.

---

## 9. Decisão: Admin via Prisma Studio (sem frontend administrativo)

**Status:** Aprovado (Pivot MVP Lean — 2026-05-15)

### Contexto

Um dashboard administrativo frontend (listagem de pedidos, edição de produtos, atualização de status) representa 1+ dia de desenvolvimento sem impacto direto na experiência do comprador.

### Decisão

Toda gestão administrativa no MVP é realizada via **Prisma Studio** (`npx prisma studio`): visualização de pedidos, atualização de status, edição de produtos e categorias. Sem rotas `/admin` no frontend.

### Consequências

**Positivas:**
- ✅ Remove ~8 componentes React de admin
- ✅ Prisma Studio já está disponível sem desenvolvimento adicional

**Negativas:**
- ⚠️ Acesso admin requer acesso ao servidor/banco de dados
- ⚠️ Não escalável para equipe de operações sem acesso técnico

---

## 10. Decisão: Features de IA (Reviews, Resumo e Chat de Produto)

**Status:** Parcialmente implementado no ciclo atual (Pivot MVP Lean — 2026-05-15)

### Contexto

Para compensar a redução de escopo e adicionar diferencial competitivo, o MVP Lean inclui 3 features de IA baseadas em reviews de produtos.

### Decisão

Implementar os seguintes contratos de API (JSDoc obrigatório em todos):

| Endpoint | Descrição | Auth |
|---|---|---|
| `GET /api/products/:id/reviews` | Listar reviews de um produto | Não |
| `POST /api/products/:id/reviews` | Criar review (1 por usuário/produto) | Sim |
| `DELETE /api/reviews/:id` | Deletar próprio review | Sim |
| `GET /api/products/:id/ai-summary` | Resumo IA de 3 frases das reviews | Não |
| `POST /api/products/:id/chat` | Chat stateless com IA sobre o produto | Não |
| `GET /api/products/search` | Busca assistida por IA com filtros extraídos de linguagem natural | Não |

**AI Summary:** Backend busca reviews do produto, envia para LLM com prompt estruturado, retorna resumo de 3 frases sobre pontos positivos e negativos.

**Product Chat:** Endpoint stateless — recebe `{ message }`, carrega specs + reviews do produto, chama LLM, retorna resposta. **Histórico de chat reside apenas no estado React (sem persistência no banco).**

**LLM Provider:** A definir na implementação (OpenAI, Anthropic ou outro). Configurado via variável de ambiente `LLM_PROVIDER_API_KEY`.

**Estado real do ciclo atual (2026-05-20):**
- Reviews: implementado.
- Busca assistida por IA no catalogo (`/api/products/search`): implementado.
- Endpoints dedicados `ai-summary` e `chat` por produto: postergados por prazo para proxima janela.

### Consequências

**Positivas:**
- ✅ Diferencial competitivo real no MVP
- ✅ Social proof via reviews aumenta conversão
- ✅ Chat reduz dúvidas pré-compra

**Negativas:**
- ⚠️ Custo variável de API LLM por requisição
- ⚠️ Latência de resposta do LLM (mitigar com loading state no frontend)

---

## Conclusão

Esta arquitetura oferece:
- 🚀 **Velocidade:** MVP em 2 meses
- 📈 **Escalabilidade:** Caminho claro para crescimento
- 🔒 **Segurança:** Práticas sólidas desde o início
- 👥 **Manutenibilidade:** Código limpo e testável
- 💰 **Custo-benefício:** Infraestrutura barata inicialmente

**Pivot MVP Lean (2026-05-15):** Stripe, Cart DB e Admin Dashboard movidos para `/legacy`. Reviews + IA adicionados como diferenciais.
