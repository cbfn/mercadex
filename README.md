# Mercadex — Marketplace de Eletrônicos

[![Status](https://img.shields.io/badge/status-MVP%20Phase%201-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Frontend CI](https://github.com/cbfn/mercadex/actions/workflows/ci.yml/badge.svg)](https://github.com/cbfn/mercadex/actions/workflows/ci.yml)

## 📋 Sobre o Projeto

**Mercadex** é um marketplace de eletrônicos em desenvolvimento, construído como MVP (Produto Mínimo Viável) com arquitetura monolítica modular. O projeto separa claramente frontend e backend, permitindo evolução independente de cada camada.

**Objetivo:** Validar fluxos de compra e UX antes de escalar para produção. A Fase 1 (atual) foca na prototipagem do frontend com interface interativa; a Fase 2 implementará o backend robusto com persistência de dados.

---

## 🚀 Funcionalidades

### Fase 1 (Atual - Protótipo Frontend)
- ✅ **Catálogo Dinâmico:** Listagem de eletrônicos com filtragem por categoria
- ✅ **Modal de Detalhes:** Visualização completa de especificações, preços e avaliações
- ✅ **Carrinho Interativo:** Adicionar, alterar quantidades, remover itens com atualização em tempo real
- ✅ **Checkout Multi-Etapa:** Entrega → Pagamento (Pix/Cartão/Boleto) → Confirmação
- ✅ **Design Responsivo:** Layout fluido para mobile, tablet e desktop
- ✅ **Estado em Memória:** Gerenciamento de carrinho e checkout sem backend

### Fase 2 (Planejado)
- 🔄 Backend com API REST em Node.js + TypeScript
- 🔄 Autenticação com JWT e refresh tokens
- 🔄 Persistência em PostgreSQL
- 🔄 Integração com gateways de pagamento (Stripe/Pix)
- 🔄 Sistema de pedidos e tracking
- 🔄 Dashboard administrativo
- 🔄 Frontend migrado para React + Next.js

---

## 🛠 Tech Stack

### Frontend (Fase 1 - Atual)
| Tecnologia | Uso | Motivo |
|-----------|-----|--------|
| **HTML5** | Estrutura semântica | Padrão web, SEO nativo |
| **CSS3** | Animações e estilos customizados | Controle fino de UX |
| **JavaScript Vanilla** | Lógica de estado e interatividade | Sem dependências externas (MVP rápido) |
| **Tailwind CSS** | Utilidades de layout (via CDN) | Desenvolvimento ágil |

### Backend (Fase 2 - Planejado)
```
Node.js 20+ (runtime)
├── TypeScript (type safety)
├── Express.js (API REST)
├── PostgreSQL 15+ (persistência)
├── TypeORM/Prisma (ORM)
├── JWT (autenticação)
└── Redis (cache/async jobs)
```

---

## 📁 Estrutura do Projeto

```
mercadex/
├── README.md                  # Este arquivo
├── .gitignore                 # Configuração de versionamento
├── CLAUDE.md                  # Documentação para Claude Code
├── logo-mercadex.png         # Asset - logomarca
│
├── frontend/                  # Frontend Phase 1 (estático)
│   ├── index.html            # HTML semântico
│   ├── css/
│   │   └── style.css         # Animações, componentes customizados
│   ├── js/
│   │   └── main.js           # Gerenciamento de estado + interatividade
│   └── assets/
│       └── (imagens, ícones)
│
├── backend/                   # Backend Phase 2 (estrutura preparada)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── users/        # Gestão de usuários
│   │   │   ├── products/     # Catálogo
│   │   │   ├── cart/         # Carrinho
│   │   │   └── orders/       # Pedidos
│   │   ├── shared/           # Código compartilhado
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   ├── errors/
│   │   │   └── types/
│   │   └── app.ts            # Entry point
│   ├── tests/                # Testes unitários e integração
│   └── package.json          # Dependências (Fase 2)
│
└── docs/                      # Documentação técnica
    ├── ADR.md                # Decisões arquiteturais
    ├── DIAGRAMAS.md          # Diagramas de fluxo
    ├── BACKLOG.md            # Roadmap do projeto
    ├── USER_STORIES.md       # Histórias de usuário
    └── PRD_CHECKOUT.md       # Product Requirements (checkout)
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Python 3.7+** (para servir frontend estático)
- **Git** (para versionamento)
- [Opcional] **Node.js 20+** e **npm** (para Phase 2)

### Startup Rápido (Frontend Phase 1)

```bash
# 1. Clone e navegue até o diretório raiz
git clone https://github.com/cbfn/mercadex.git
cd mercadex

# 2. Inicie servidor HTTP (Python 3)
python3 -m http.server 8000

# 3. Acesse no navegador
# http://localhost:8000/frontend/
```

**⚠️ Importante:** Execute sempre da **raiz do projeto** para que assets relativos (logo) funcionem corretamente.

### Alternativas para Servir Frontend

```bash
# Usando Node.js (se instalado)
npx http-server frontend -p 8000

# Usando PHP
php -S localhost:8000

# Usando Ruby
ruby -run -ehttpd . -p8000
```

---

## 📖 Como Usar o Mercadex

### Fluxo do Cliente

1. **Navegação:** Browse produtos por categoria
2. **Detalhes:** Clique em um produto para modal com especificações
3. **Carrinho:** Adicione itens, ajuste quantidades
4. **Checkout:** Preencha entrega, escolha pagamento, veja confirmação
5. **Estado:** Carrinho persiste em `localStorage` durante sessão

### Exemplo de Interação (JSON do Estado)

```javascript
// State armazenado em memória (frontend/js/main.js)
state = {
  cart: [
    { id: 1, name: "Smartphone X", price: 999.99, qty: 1 },
    { id: 5, name: "Fone Bluetooth", price: 199.99, qty: 2 }
  ],
  checkout: {
    currentStep: "payment",  // "delivery" | "payment" | "confirmation"
    delivery: { address: "...", zip: "..." },
    payment: { method: "pix" }
  }
}
```

---

## 🔧 Desenvolvimento

### Estrutura Frontend (Fase 1)

**HTML Semântico:**
```html
<main id="products-section">
  <section class="category"></section>
  <article class="product-card" data-product-id="1"></article>
</main>
```

**JavaScript - Padrão State:**
```javascript
// Object global gerenciando todo state
const state = {
  cart: [],
  checkout: { currentStep: "delivery", ... },
  ...
};

// Funções puras atualizando state
function addToCart(productId) { state.cart.push(...); render(); }
```

**Tailwind CSS via CDN:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Debug e Desenvolvimento

```javascript
// No console do navegador (DevTools)
console.log(state);        // Inspecione estado atual
state.cart = [];           // Reset carrinho
localStorage.clear();      // Limpe cache
```

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

- **Commits:** Use `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Branches:** `feature/`, `bugfix/`, `docs/`
- **Code style:** Prettier + ESLint (configurar em Fase 2)

---

## 📚 Documentação

- **[CLAUDE.md](./CLAUDE.md)** - Instruções para Claude Code e arquitetura geral
- **[docs/ADR.md](./docs/ADR.md)** - Decisões arquiteturais e trade-offs
- **[docs/DIAGRAMAS.md](./docs/DIAGRAMAS.md)** - Fluxogramas de negócio
- **[docs/USER_STORIES.md](./docs/USER_STORIES.md)** - Histórias de usuário
- **[docs/BACKLOG.md](./docs/BACKLOG.md)** - Roadmap e prioridades

---

## ❓ FAQ / Troubleshooting

**P: O servidor não consegue acessar a logo?**
- R: Execute `python3 -m http.server 8000` **da raiz** do repositório, não da pasta `frontend/`

**P: Posso rodar o backend agora?**
- R: Não. A Fase 1 é frontend-only. Backend será implementado em Fase 2 com Node.js + TypeScript

**P: Como limpo o carrinho?**
- R: Console do navegador: `state.cart = []` ou `localStorage.clear()`

**P: Qual é o plano pós-MVP?**
- R: Ver [docs/BACKLOG.md](./docs/BACKLOG.md) para roadmap completo (React, API, DB, etc.)

---

## 📊 Roadmap

| Fase | Status | Foco | ETA |
|------|--------|------|-----|
| **1** | 🔄 Em Progresso | Frontend interativo, UX validation | Maio 2026 |
| **2** | 📋 Planejado | Backend API, PostgreSQL, Auth | Jun-Jul 2026 |
| **3** | 📋 Planejado | Frontend React, Integração pagamento | Ago 2026 |

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

**Última atualização:** Maio 2026 | Mercadex MVP Phase 1
