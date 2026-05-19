# Relatório de Testes — Mercadex Frontend

---
<!-- ci-auto-entry-start: frontend -->
## Frontend — 2026-05-19 02:05:23 UTC — [ver execução](https://github.com/cbfn/mercadex/actions/runs/26071734159)

- **Cobertura (lines):** 96.28%
- **Total de testes (statements):** 731
- **Status:** ✅ sucesso

| Métrica     | O que mede | Cobertura | Threshold |
|-------------|------------|-----------|-----------|
| Statements  | Cada instrução executável do código | 96.03% | 80% |
| Branches    | Caminhos de condicionais (if/else, switch, ternário) | 85.61% | 80% |
| Functions   | Funções e métodos chamados ao menos uma vez | 95.87% | 80% |
| Lines       | Linhas físicas com ao menos uma instrução executada | 96.28% | 80% |

> _Entrada gerada automaticamente pelo CI. Para análise detalhada, veja o artefato `coverage-report-frontend`._
<!-- ci-auto-entry-end: frontend -->

 
**Data de execução:** 2026-05-16
**Projeto:** mercadex-frontend (Next.js 16.2 + React 19 + TypeScript)

---

## Resultado Final

| Métrica     | Antes  | Depois  | Threshold |
|-------------|--------|---------|-----------|
| Statements  | 63.39% | **99.10%** | 80% ✅ |
| Branches    | 64.96% | **95.62%** | 80% ✅ |
| Functions   | 58.04% | **98.60%** | 80% ✅ |
| Lines       | 62.37% | **99.25%** | 80% ✅ |

**Status: 80% de cobertura atingida com ampla margem.**

---

## Totais de Testes

| | Quantidade |
|---|---|
| Testes antes desta execução | 177 |
| Testes implementados nesta execução | **96** |
| **Total de testes** | **273** |
| Suites de teste | 31 |
| Aprovados | 273 |
| Falhas | 0 |

---

## Arquivos de Teste Criados

### 1. `src/shared/lib/api-client.test.ts` (14 testes)
Cobre `setAccessToken`, `getAccessToken`, `ApiError` e `apiRequest` incluindo:
- Armazenamento e limpeza de token em memória
- Construção correta de headers de autenticação
- Fluxo completo de refresh automático em 401
- Falha no refresh (sessão expirada)
- Rejeição por erro de rede no refresh

### 2. `src/shared/lib/api/auth.test.ts` (11 testes)
Cobre o módulo `authApi`:
- `login`: chama endpoint, define token, persiste usuário no cache localStorage
- `register`: chama endpoint correto com `skipAuth`
- `logout`: limpa token mesmo quando API lança erro (`try-finally`)
- `me`: restaura sessão via refresh, retorna null quando cookie expirado ou rede falha, limpa cache em falha

### 3. `src/shared/lib/api/products.test.ts` (14 testes)
Cobre o módulo `productsApi`:
- `list`: sem filtros, com filtros (parâmetros de query), omite campos `undefined`
- `get`, `create`, `update`, `delete`: endpoints corretos e métodos HTTP
- `listCategories` e `createCategory`: com e sem descrição opcional

### 4. `src/shared/lib/api/cart.test.ts` (8 testes)
Cobre o módulo `cartApi`:
- `get`, `addItem` (quantity padrão 1), `updateItem`, `removeItem`, `clear`
- Validação de body serializado em cada chamada

### 5. `src/features/auth/model/auth-context.test.tsx` (9 testes)
Cobre `AuthProvider` e `useAuth`:
- Estado de carregamento inicial enquanto `me()` está pendente
- Restauração de sessão quando `me()` retorna usuário
- Limpeza de estado quando `me()` retorna null ou lança erro
- `login`: atualiza estado do usuário
- `login` com erro: mantém usuário null
- `logout`: limpa estado
- `register`: chama API com parâmetros corretos
- `useAuth` fora de `AuthProvider`: lança exceção

### 6. `src/features/admin/model/use-products-admin.test.ts` (9 testes)
Cobre o hook `useProductsAdmin`:
- Estado inicial de carregamento
- Busca e listagem de produtos
- Tratamento de erro com mensagem localizada
- `refetch`: recarrega lista e limpa erro anterior
- `deleteProduct`: remove item da lista local
- `createProduct`: adiciona ao início da lista e retorna o produto criado
- `updateProduct`: substitui o item atualizado na lista

### 7. `src/features/cart/components/cart-drawer.extended.test.tsx` (11 testes)
Cobre as etapas avançadas do `CartDrawer`:
- Fluxo carrinho → entrega (submit do formulário via `fireEvent.submit`) → pagamento
- Etapa de pagamento: exibe chave PIX, QR code e botão de copiar
- Botão copiar: exibe feedback "Copiado!" após clique
- Botão confirmar pedido: habilitado somente após envio da entrega
- Etapa de confirmação: exibe número do pedido, itens e status
- Botão "Continuar comprando": limpa carrinho e fecha drawer
- Navegação retroativa (Voltar) entre etapas
- Botão de decremento de quantidade no carrinho

### 8. `src/features/cart/model/cart-context.sync.test.tsx` (18 testes)
Cobre `CartProvider` e ações ainda não testadas:
- `setTab`: alterna entre tabs de pagamento (`pix`/`credit`)
- `setItemsFromApi`: atualiza itens e recalcula derivados
- `CartProvider` sem usuário: não faz fetch do backend
- `CartProvider` com usuário: busca carrinho da API ao montar
- Mapeamento de itens do backend para modelo local (`mapApiItemToLocal`)
- `mapCondition`: todas as 4 condições (NOVO→Novo, EXCELENTE→Excelente, BOM→Bom, USADO→Usado)
- API retornando lista vazia: não altera estado
- Erro de API: ignora silenciosamente (fire-and-forget)
- Uso de índice como `id` numérico e fallback de imagem vazia

---

## Cobertura por Arquivo (Final)

| Arquivo | Statements | Branches | Funções | Linhas |
|---------|-----------|----------|---------|--------|
| `api-client.ts` | 100% | 100% | 100% | 100% |
| `api/auth.ts` | 96.77% | 100% | 100% | 96.66% |
| `api/cart.ts` | 100% | 100% | 100% | 100% |
| `api/products.ts` | 100% | 100% | 100% | 100% |
| `auth-context.tsx` | 100% | 100% | 100% | 100% |
| `use-products-admin.ts` | 100% | 50% | 100% | 100% |
| `cart-context.tsx` | 97.95% | 84.61% | 100% | 97.91% |
| `cart-drawer.tsx` | 97.29% | 100% | 94.11% | 100% |
| `storefront-page.tsx` | 96% | 66.66% | 85.71% | 96% |
| `use-catalog-filters.ts` | 100% | 100% | 100% | 100% |
| `product-modal.tsx` | 100% | 100% | 100% | 100% |
| `login-form.tsx` | 100% | 100% | 100% | 100% |
| `register-form.tsx` | 100% | 100% | 100% | 100% |
| `cart.ts` (lib) | 100% | 100% | 100% | 100% |
| `catalog.ts` (lib) | 100% | 100% | 100% | 100% |
| `cn.ts` | 100% | 100% | 100% | 100% |
| `currency.ts` | 100% | 100% | 100% | 100% |
| Componentes UI (8 arquivos) | 100% | 100% | 100% | 100% |

---

## Como Reproduzir os Testes

```bash
cd frontend

# Executar todos os testes uma vez
npm test

# Executar com relatório de cobertura
npm run test:coverage

# Executar em modo watch (desenvolvimento)
npm run test:watch
```

---

## Observações Técnicas

- Todos os testes seguem o padrão existente no projeto (Testing Library + userEvent v14)
- Chamadas HTTP mockadas com `jest.fn()` — sem dependência de servidor real
- `localStorage` limpo via `afterEach` configurado em `jest.setup.ts`
- Formulários com `required` validados via `fireEvent.submit` (contorna validação HTML5 do jsdom)
- CartProvider sync testado com variável de módulo que o mock de `useAuth` lê via closure












