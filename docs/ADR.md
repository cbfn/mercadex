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

-- Carrinho
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INT,
  total_price DECIMAL(10,2),
  status ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado'),
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Autenticação: JWT + Refresh Tokens

- Access token: curta duração (15 min)
- Refresh token: longa duração (7 dias)
- Armazenado em HTTP-only cookie
- CSRF protection habilitada

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

## Conclusão

Esta arquitetura oferece:
- 🚀 **Velocidade:** MVP em 2 meses
- 📈 **Escalabilidade:** Caminho claro para crescimento
- 🔒 **Segurança:** Práticas sólidas desde o início
- 👥 **Manutenibilidade:** Código limpo e testável
- 💰 **Custo-benefício:** Infraestrutura barata inicialmente

Estamos prontos para começar! 🚀
