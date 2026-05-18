# Testes E2E — Mercadex (Playwright)

## Visão Geral

Os testes End-to-End do Mercadex usam **Playwright** para simular um usuário real interagindo com o frontend no browser. Eles complementam os testes unitários Jest validando que as peças do sistema funcionam corretamente em conjunto — navegação, formulários, carrinho e fluxo de checkout.

| Item | Valor |
|------|-------|
| Framework | [Playwright](https://playwright.dev) |
| Browser | Chromium (Desktop Chrome) |
| Diretório de specs | `frontend/tests/e2e/` |
| Configuração | `frontend/playwright.config.ts` |
| Execução no CI | Job `e2e-frontend` em `.github/workflows/ci-frontend.yml` |

---

## Como Executar Localmente

```bash
cd frontend

# Instalar os browsers na primeira vez
npx playwright install chromium

# Executar todos os testes E2E (inicia o servidor automaticamente)
npm run test:e2e

# Executar com UI interativa (recomendado para desenvolvimento)
npm run test:e2e:ui

# Executar um arquivo específico
npx playwright test tests/e2e/critical-flow.spec.ts

# Ver o relatório HTML da última execução
npx playwright show-report
```

> O Playwright inicia o servidor Next.js automaticamente via `webServer` no `playwright.config.ts`. Se o servidor já estiver rodando em `http://127.0.0.1:3000`, ele reutiliza a instância existente (`reuseExistingServer: true`).

---

## Configuração (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',       // todos os .spec.ts neste diretório
  fullyParallel: true,          // specs rodam em paralelo
  reporter: 'html',             // relatório gerado em playwright-report/
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',    // captura trace em caso de falha
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',     // servidor de dev do Next.js
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
  },
});
```

**Por que só Chromium:** MVP Lean — cobertura ampla de browsers é planejada para fases futuras. Chromium cobre o caso de uso principal com build rápido em CI.

---

## Teste Atual

### `critical-flow.spec.ts` — Fluxos Críticos

**Localização:** `frontend/tests/e2e/critical-flow.spec.ts`

Este spec cobre os **fluxos críticos** do frontend com API mockada via `page.route()` — nenhuma instância de backend é necessária.

> **UUID nos testids:** os produtos têm IDs no formato UUID. O testid de abertura de produto segue o padrão `open-product-<uuid>`, ex.: `open-product-11111111-1111-4111-8111-111111111111`. As asserções de URL também usam o UUID completo.

#### Cenários cobertos

| Describe | Teste | Fluxo |
|---|---|---|
| `happy-path flows` | Catalog displays products | Catálogo carrega via API mockada |
| `happy-path flows` | Product detail page loads | Navega para `/products/<uuid>` e exibe info |
| `happy-path flows` | Guest checkout redirect | Usuário não autenticado é redirecionado para login |
| `error states` | Products API returns 500 | Catálogo exibe estado de erro |

#### Fluxo do guest checkout (fluxo principal)

```
Página inicial
    │  (API mockada: GET /api/products → retorna produtos com UUIDs)
    │
    ▼ clica em [data-testid="open-product-11111111-1111-4111-8111-111111111111"]
Página de produto (/products/11111111-1111-4111-8111-111111111111)
    │  (API mockada: GET /api/products/:uuid → retorna produto)
    │ verifica [data-testid="product-page-content"] visível
    ▼ clica em [data-testid="modal-add-to-cart"]
Carrinho — Etapa 1: Resumo
    │ verifica [data-testid="cart-step"] visível
    ▼ clica em [data-testid="go-to-checkout"]
Redirecionamento para login (/login?redirect=/checkout) ✅
```

#### Data-testids utilizados

| `data-testid` | Elemento | Etapa |
|---------------|----------|-------|
| `open-product-<uuid>` | Botão de abrir produto na listagem (ex: `open-product-11111111-1111-4111-8111-111111111111`) | Catálogo |
| `product-page-content` | Conteúdo da página de produto | Produto |
| `modal-add-to-cart` | Botão "Adicionar ao carrinho" | Produto |
| `cart-step` | Container da etapa 1 do carrinho | Carrinho |
| `go-to-checkout` | Botão de avançar para checkout / login | Carrinho (etapa 1) |
| `go-to-delivery` | Botão de avançar para entrega (usuário logado) | Carrinho (etapa 1) |
| `delivery-step` | Container da etapa 2 (entrega) | Carrinho |
| `payment-step` | Container da etapa 3 (pagamento PIX) | Carrinho |
| `confirm-order-button` | Botão de confirmar pedido | Carrinho (etapa 3) |
| `confirm-step` | Container da etapa 4 (confirmação) | Carrinho |
| `finish-order-button` | Botão de finalizar e fechar o carrinho | Carrinho (etapa 4) |
| `open-cart-button` | Botão de abrir o carrinho no header | Header |

#### Dados de formulário utilizados

| Campo | Valor no teste |
|-------|----------------|
| Nome completo | `Joao da Silva` |
| CPF | `00000000000` |
| Telefone | `11999999999` |
| CEP | `01001000` |
| Endereço | `Rua A, 123` |
| Cidade | `Sao Paulo` |
| UF | `SP` |

> Os dados são fictícios e adequados para o ambiente de desenvolvimento com mock data. Em ambientes com validação real de CPF/CEP, estes valores precisarão ser atualizados.

---

## Integração com CI

O Playwright roda no job `e2e-frontend` do workflow `.github/workflows/ci-frontend.yml`, que:

- **Depende de** `ci-frontend` (Jest + TypeScript) — só executa se os testes unitários passarem
- **Executa apenas em:** PRs e pushs para `main`
- **Não é** um status check obrigatório para merge (apenas `ci-frontend` e `ci-backend` são obrigatórios)
- Em caso de falha, faz upload do artefato `playwright-report-frontend` com screenshots e traces (retido por 7 dias)

```yaml
# Trecho de ci-frontend.yml
e2e-frontend:
  needs: ci-frontend
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
  steps:
    - npm run build          # build de produção Next.js
    - playwright install     # instala Chromium
    - npm run test:e2e       # executa os specs
    - upload playwright-report-frontend  # apenas em falha
```

> O E2E roda sobre o **build de produção** (`npm run build` + `next start`) em CI, não sobre o dev server. Isso garante que o teste valida o comportamento real do app buildado.

---

## Como Adicionar Novos Testes

1. Crie um arquivo `frontend/tests/e2e/<nome-do-fluxo>.spec.ts`
2. Use `data-testid` nos componentes para selecionar elementos — evite seletores por texto ou CSS (frágeis a mudanças de UI)
3. Siga o padrão AAA: **Arrange** (navegue para a página) → **Act** (interaja) → **Assert** (verifique o resultado)

**Exemplo mínimo:**
```typescript
import { test, expect } from '@playwright/test';

test('usuário vê listagem de produtos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-card')).toBeVisible();
});
```

### Boas práticas

- Prefira `getByTestId` → `getByLabel` → `getByRole` (nessa ordem de prioridade)
- Use `getByLabel` para campos de formulário — reflete como o usuário realmente identifica os campos
- Evite `page.waitForTimeout()` — use `expect(...).toBeVisible()` ou `waitFor` com condição
- Trace (`on-first-retry`) já está habilitado — em caso de falha no CI, o artefato contém screenshots passo a passo

---

## Troubleshooting

**Servidor não inicia ao rodar `npm run test:e2e`**
→ Verifique se a porta 3000 está livre. O Playwright aguarda o servidor na URL configurada. Rode `lsof -i :3000` para identificar processos em conflito.

**Teste falha localmente mas passa no CI (ou vice-versa)**
→ Diferença entre dev server (local) e build de produção (CI). Para reproduzir o CI localmente:
```bash
cd frontend
npm run build
npm run start &  # inicia em background
npx playwright test
```

**`data-testid` não encontrado**
→ O componente pode ter sido refatorado. Use `npm run test:e2e:ui` para inspecionar o DOM ao vivo com o Playwright Inspector e atualizar o seletor.

**Falha no step "Install Playwright browsers" no CI**
→ O Playwright mantém versões de browser vinculadas à versão do pacote. Se o `package.json` foi atualizado, a versão do Chromium pode ter mudado. O step `npx playwright install --with-deps chromium` sempre instala a versão compatível com o pacote instalado — normalmente se resolve sozinho.
