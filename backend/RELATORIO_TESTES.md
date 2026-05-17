# Relatório de Cobertura de Testes — Backend Mercadex

---
<!-- ci-auto-entry-start: backend -->
## Backend — 2026-05-17 15:52:52 UTC — [ver execução](https://github.com/cbfn/mercadex/actions/runs/25995522738)

- **Cobertura (lines):** 97.06%
- **Total de testes (statements):** 379
- **Status:** ✅ sucesso

| Métrica     | O que mede | Cobertura | Threshold |
|-------------|------------|-----------|-----------|
| Statements  | Cada instrução executável do código | 97.09% | 80% |
| Branches    | Caminhos de condicionais (if/else, switch, ternário) | 90.06% | 80% |
| Functions   | Funções e métodos chamados ao menos uma vez | 97.36% | 80% |
| Lines       | Linhas físicas com ao menos uma instrução executada | 97.06% | 80% |

> _Entrada gerada automaticamente pelo CI. Para análise detalhada, veja o artefato `coverage-report-backend`._
<!-- ci-auto-entry-end: backend -->

**Data:** 2026-05-16   
**Executor:** Claude Code (claude-sonnet-4-6)

---

## Cobertura Total Alcançada

| Métrica     | Antes   | Depois  | Threshold |
|-------------|---------|---------|-----------|
| Statements  | 93.95%  | 97.65%  | 80%       |
| **Branches**| **78.15%** | **89.60%** | **80%** |
| Functions   | 92.98%  | 96.66%  | 80%       |
| Lines       | 93.95%  | 97.65%  | 80%       |

> ✅ **Status: APROVADO** — todos os thresholds de 80% atingidos em todas as métricas.

---

## Testes Implementados Nesta Execução

**Total de testes adicionados: 22** (de 70 para 92 testes)

### Arquivo novo: `src/modules/auth/auth.middleware.test.ts` (7 testes)

| Teste | Comportamento coberto |
|---|---|
| `retorna 401 quando authorization header esta ausente` | `authenticate` sem header |
| `retorna 401 quando header nao comeca com Bearer` | `getAuthToken` formato inválido |
| `autentica usuario com token valido` | `authenticate` caminho feliz |
| `retorna 401 quando token e invalido ou expirado` | `authenticate` catch JWT |
| `retorna 403 quando usuario nao e admin` | `requireAdmin` role incorreta |
| `retorna 403 quando usuario nao esta autenticado` | `requireAdmin` sem user |
| `chama next para usuario admin` | `requireAdmin` caminho feliz |

### Arquivo novo: `src/server.test.ts` (1 teste)

| Teste | Comportamento coberto |
|---|---|
| `/health retorna status ok` | Handler da rota `/health` |

### Adições em `auth.service.test.ts` (2 testes)

| Teste | Comportamento coberto |
|---|---|
| `login rejeita senha incorreta` | Branch `if (!valid)` em `login` |
| `login rejeita ambiente sem JWT_SECRET` | Branch `if (!value)` em `assertEnv` |

### Adições em `auth.controller.test.ts` (3 testes)

| Teste | Comportamento coberto |
|---|---|
| `register retorna 500 para erro interno desconhecido` | Fallback 500 no catch de `register` |
| `login retorna 500 para erro interno desconhecido` | Fallback 500 no catch de `login` |
| `refresh retorna 401 quando servico lanca excecao` | Catch block do `refresh` |

### Adições em `products.service.test.ts` (5 testes)

| Teste | Comportamento coberto |
|---|---|
| `lista produtos com itens reais e converte preco numerico` | Callback interno do `Array.map` em `list` |
| `lista produtos com multiplas paginas` | `Math.ceil` em `totalPages` |
| `getById converte preco do tipo Decimal` | Branch `toNumber` com objeto Decimal |
| `lista produtos converte preco do tipo Decimal` | Branch `toNumber` em itens da lista |
| `create retorna null quando repositorio retorna null inesperadamente` | Branch `if (!product)` em `mapProduct` |

### Adições em `products.controller.test.ts` (2 testes)

| Teste | Comportamento coberto |
|---|---|
| `getById retorna produto com sucesso` | Caminho feliz do controller `getById` |
| `getById retorna 500 para Error desconhecido passando pela chain de if` | Fallback 500 na chain `getErrorResponse` |

### Adições em `products.repository.test.ts` (2 testes)

| Teste | Comportamento coberto |
|---|---|
| `findMany com apenas minPrice (sem maxPrice)` | Branch ternário `minPrice !== undefined` sem `maxPrice` |
| `findMany com apenas maxPrice (sem minPrice)` | Branch ternário `maxPrice !== undefined` sem `minPrice` |

---

## Cobertura por Arquivo (Estado Final)

```
File                     | % Stmts | % Branch | % Funcs | % Lines
-------------------------|---------|----------|---------|--------
All files                |   97.65 |    89.60 |   96.66 |   97.65
 src/server.ts           |   86.36 |    50.00 |   50.00 |   86.36
 auth/auth.controller.ts |  100.00 |    87.50 |  100.00 |  100.00
 auth/auth.dto.ts        |  100.00 |   100.00 |  100.00 |  100.00
 auth/auth.middleware.ts |  100.00 |   100.00 |  100.00 |  100.00
 auth/auth.repository.ts |  100.00 |   100.00 |  100.00 |  100.00
 auth/auth.routes.ts     |  100.00 |   100.00 |  100.00 |  100.00
 auth/auth.service.ts    |  100.00 |    85.71 |  100.00 |  100.00
 prod/products.ctrl.ts   |  100.00 |    95.00 |  100.00 |  100.00
 prod/products.dto.ts    |  100.00 |   100.00 |  100.00 |  100.00
 prod/products.repo.ts   |  100.00 |   100.00 |  100.00 |  100.00
 prod/products.routes.ts |  100.00 |   100.00 |  100.00 |  100.00
 prod/products.service.ts|   97.87 |    92.59 |  100.00 |   97.87
 shared/db/prisma.ts     |   92.85 |    62.50 |  100.00 |   92.85
 shared/swagger/swagger.ts|   60.00 |   100.00 |    0.00 |   60.00
```

> **Nota sobre arquivos com cobertura < 80% individualmente:**
> - `server.ts`: o branch `if (NODE_ENV !== "test")` nunca é executado em testes (por design).
> - `prisma.ts`: o branch de `DATABASE_URL` ausente requer reinicialização do módulo singleton, inviável em testes unitários.
> - `swagger.ts`: arquivo de configuração estática; os handlers são funções inline do `swagger-ui-express`.
> Esses arquivos representam infraestrutura de bootstrap e não impactam a lógica de negócio testável.

---

## Métodos com Cobertura de Testes (Novos)

- `authenticate` — token ausente, formato inválido, token válido, token expirado
- `requireAdmin` — usuário sem role ADMIN, sem usuário autenticado, usuário ADMIN
- `authService.login` — senha incorreta, JWT_SECRET ausente
- `authController.register` — erro interno desconhecido (500)
- `authController.login` — erro interno desconhecido (500)
- `authController.refresh` — exceção do serviço (401)
- `productsService.list` — itens reais com preço numérico, preço Decimal, paginação múltipla
- `productsService.getById` — preço Decimal (toNumber com objeto)
- `productsService.create` — retorno null do repositório (mapProduct null)
- `productsRepository.findMany` — filtro só com minPrice, filtro só com maxPrice
- `productsController.getById` — sucesso, Error desconhecido na chain de erros
- `/health` — handler de health check

---

## Comando para Reproduzir

```bash
cd backend
npm run test:coverage
```

### Saída esperada

```
Test Suites: 10 passed, 10 total
Tests:       92 passed, 92 total
All files  | 97.65% Stmts | 89.60% Branch | 96.66% Funcs | 97.65% Lines
```

---

## Status Final

✅ **80% de cobertura em branches atingida** (89.60%)  
✅ **80% de cobertura em statements atingida** (97.65%)  
✅ **80% de cobertura em functions atingida** (96.66%)  
✅ **80% de cobertura em lines atingida** (97.65%)  
✅ **92 testes passando sem falhas**


