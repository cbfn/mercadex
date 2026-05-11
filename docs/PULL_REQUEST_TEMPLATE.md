## 📝 Descrição da Mudança

<!-- 
  Descreva de forma clara e concisa o que foi alterado e por quê.
  Este é o espaço para explicar o contexto da mudança.
  
  EXEMPLOS:
  - "Implementa carregamento lazy de imagens para melhorar performance"
  - "Corrige bug onde carrinho não persiste em localStorage após refresh"
  - "Refatora gerenciamento de estado para usar Context API"
  - "Adiciona validação de CEP com integração com ViaCEP"
-->

[Descreva a mudança aqui]

---

## 🏷️ Tipo de Mudança

Marque apenas UMA opção com `[x]`:

- [ ] **feat** — Nova funcionalidade adicionada
- [ ] **fix** — Correção de bug existente
- [ ] **docs** — Atualização de documentação
- [ ] **style** — Mudanças de formatação/style (sem alterar lógica)
- [ ] **refactor** — Refatoração de código existente (sem novo comportamento)
- [ ] **perf** — Melhoria de performance
- [ ] **test** — Adição/atualização de testes
- [ ] **chore** — Atualizações de dependências, build, CI/CD
- [ ] **hotfix** — Correção crítica para produção

---

## 🌿 Branch de Origem

**Seu branch:** `________` 

**Base esperada:** `develop` (ou `main` se for hotfix)

### ✅ Convenção de Nomenclatura de Branches

Siga o padrão abaixo conforme o Git Flow:

```
feature/nome-descritivo-curto       # Para novas funcionalidades
bugfix/nome-descritivo-curto        # Para correção de bugs em develop
hotfix/nome-descritivo-curto        # Para correção crítica em main
refactor/nome-descritivo-curto      # Para refatoração
docs/nome-descritivo-curto          # Para documentação
```

**Exemplos válidos:**
- `feature/filtro-por-categoria`
- `bugfix/carrinho-nao-persiste`
- `hotfix/pagamento-pix-falha`
- `refactor/state-para-context-api`
- `docs/atualiza-readme-checkout`

**Exemplos inválidos:** ❌
- `feature/nova-feature` — Muito genérico
- `fix_bug` — Underscores ao invés de hífens
- `Feature/Nome` — Maiúsculas
- `feature-nome-muito-longo-que-ocupa-meio-do-monitor` — Excesso

---

## 📦 Commits Realizados

### ✅ Convenção de Commits (Conventional Commits)

Todos os commits DEVEM seguir o formato:

```
<tipo>(<escopo>): <descrição curta>

<corpo detalhado (opcional)>

<footer (opcional)>
```

### 📋 Tipos Válidos

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `feat` | Nova funcionalidade | `feat(carrinho): adiciona opção de cupom desconto` |
| `fix` | Correção de bug | `fix(checkout): resolve erro ao salvar CEP` |
| `docs` | Documentação | `docs(readme): atualiza instruções de setup` |
| `style` | Formatação de código | `style(css): alinha indentação do painel carrinho` |
| `refactor` | Refatoração sem novo comportamento | `refactor(state): extrai lógica de carrinho para módulo` |
| `perf` | Melhoria de performance | `perf(produtos): otimiza renderização com memoização` |
| `test` | Testes | `test(checkout): adiciona testes para fluxo de pagamento` |
| `chore` | Build, deps, CI/CD | `chore(deps): atualiza tailwind para v3.4` |

### 📝 Exemplos de Commits Válidos

```bash
# ✅ Simples e claro
git commit -m "feat(produtos): adiciona filtro por preço no catálogo"

# ✅ Com contexto (corpo)
git commit -m "fix(carrinho): resolve NaN em calcularTotal

Problema: Função não tratava itens sem quantidade definida.
Solução: Adicionado fallback padrão de 1 para quantidade.
Testes: Todos passando, incluindo edge case de qtd undefined."

# ✅ Com breaking change
git commit -m "refactor(api): renomeia endpoint /cart para /carrinho

BREAKING CHANGE: Clients precisam atualizar chamadas de /cart para /carrinho.
Migrate: Atualize qualquer código que referencia a old URL."
```

### ❌ Exemplos de Commits Inválidos

```bash
# ❌ Sem tipo
git commit -m "Adiciona nova feature"

# ❌ Tipo errado
git commit -m "UPDATE: altera cor do botão"

# ❌ Muito genérico
git commit -m "feat: ajustes"

# ❌ Mistura múltiplas mudanças
git commit -m "feat: adiciona cupom, corrige bug do carrinho, refatora css"
```

**Resumo de seus commits:**
<!-- Copie/adapte a lista de commits dessa PR -->
- `feat(categorias): adiciona filtro dinâmico`
- `fix(validacao): corrige erro de CEP inválido`
- [Adicione outros commits...]

---

## ✅ Checklist de Verificação

Antes de submeter a PR, certifique-se de:

### Código e Funcionalidade
- [ ] Código segue as diretrizes do `.cursorrules` e `CLAUDE.md`
- [ ] Funcionalidade foi testada localmente (no navegador ou ambiente local)
- [ ] Sem `console.log()` ou `debugger` em código de produção
- [ ] Sem hard-coded values (senhas, URLs, tokens)
- [ ] Nomes de variáveis/funções seguem padrão português

### Testes
- [ ] Todos os testes passando (`npm test` ou equivalente)
- [ ] Novos testes foram adicionados para nova funcionalidade
- [ ] Testes cobrem casos de sucesso E erro

### Documentação
- [ ] README.md atualizado se há mudanças no setup/uso
- [ ] Funções complexas possuem comentários explicativos em português
- [ ] Tipos TypeScript/JSDoc documentados quando necessário

### Git e PR
- [ ] Branch foi atualizado com `develop` (sem conflitos)
- [ ] Commits seguem Conventional Commits
- [ ] Título da PR é claro e descritivo
- [ ] Descrição explica O QUÊ e POR QUÊ (não apenas O QUÊ)

### Segurança e Performance
- [ ] Sem vulnerabilidades óbvias (SQL injection, XSS, etc)
- [ ] Operações assíncronas possuem try/catch apropriados
- [ ] Sem memory leaks óbvios (event listeners removidos, timers limpos)

### Compatibilidade
- [ ] Testado em navegadores alvo (Chrome, Firefox, Safari, Edge)
- [ ] Sem quebra de funcionalidades existentes (regressão)

---

## 🔗 Issues Relacionadas

<!-- Referencie issues que esta PR resolve ou se relaciona -->

**Resolve:** #
**Relacionada a:** #
**Dependência:** #

Exemplo:
```
Resolve: #42
Relacionada a: #38, #40
```

---

## ⚠️ Breaking Changes

<!-- Marque [x] se há mudança que quebra compatibilidade com versão anterior -->

- [ ] **Não há breaking changes**
- [ ] **Há breaking changes** (descreva abaixo)

Se aplicável, descreva:

```
BREAKING CHANGE: O endpoint GET /api/produtos agora retorna array de IDs ao invés de objetos completos.

Versão anterior:
{ "produtos": [{ "id": 1, "nome": "...", "preco": "..." }] }

Nova versão:
{ "produtoIds": [1, 2, 3] }

Migration: Clientes precisam fazer chamada adicional a GET /api/produtos/:id para detalhes.
```

---

## 📊 Informações Adicionais (Opcional)

### Screenshots / Demos
<!-- Se é mudança visual, adicione screenshots ou GIF -->

### Performance
<!-- Se afeta performance, mencione métricas -->

### Deploy Notes
<!-- Instruções especiais para deploy (migrations, env vars, etc) -->

---

## 📖 Guia de Referência Rápida

### Git Flow Esperado

```
main (produção) ← hotfix/x ← merge com tag de versão
  ↓
develop (integração) ← feature/*, bugfix/* ← seu trabalho aqui
```

### Fluxo Esperado de PR

1. **Criar branch:** `git checkout -b feature/meu-feature develop`
2. **Commitar mudanças:** Seguir Conventional Commits
3. **Push:** `git push origin feature/meu-feature`
4. **Abrir PR:** GitHub detectará branch, preencha este template
5. **Review:** Aguarde feedback de pelo menos 1 reviewer
6. **Merge:** Um MAINTAINER fará o merge em `develop`

### Comandos Úteis

```bash
# Atualizar branch com último de develop
git fetch origin
git rebase origin/develop

# Ver commits na sua branch
git log origin/develop..HEAD

# Resetar para develop (cuidado!)
git reset --hard origin/develop

# Limpar branch local após merge
git branch -d feature/meu-feature
```

---

## ❓ Dúvidas Frequentes

**P: Meu PR tem conflitos com develop?**
- A: Atualize seu branch: `git rebase origin/develop`

**P: Posso commitar em main?**
- A: Não. Sempre crie branch e abra PR para develop (ou main só se for hotfix).

**P: Quantos commits precisa ter uma PR?**
- A: Sem limite. Cada commit deve ser um unit of work pequeno. Melhor 10 commits bem descritos que 1 mega-commit.

**P: E se cometi erro em um commit?**
- A: Use `git commit --amend` (se não foi pushado) ou novo commit com `fix(escopo): ...`

**P: Posso fazer force-push?**
- A: Só em sua branch pessoal antes de abrir PR. Após aberta, evite `--force`.

---

## ✨ Boas Práticas

✅ **Faça:**
- Commits pequenos e lógicos
- Descrições claras em português
- Uma funcionalidade por branch
- Comunicação clara no PR (não assuma que revisor entende)
- Testar antes de submeter

❌ **Evite:**
- Commits "WIP" ou "temp fixes"
- Mergear sua própria PR sem review
- Branches com dias/semanas de atraso de develop
- Misturar múltiplas features em um PR
- "Arrumei coisas aleatórias" sem descrever

---

**Última atualização:** Maio 2026 | Mercadex MVP

Para dúvidas, consulte [CLAUDE.md](../CLAUDE.md) ou [.cursorrules](../.cursorrules)
