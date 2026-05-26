# Ciclo 1: Arquitetura (Carrinho localStorage vs Backend)

**Objetivo:** Demonstrar iteração IA com refinamento baseado em feedback.

**Data de Execução:** 2026-05-15 a 2026-05-20

---

## 📌 Versão 1 (15/05 — Genérica)

### Prompt Enviado

```
Você é um arquiteto de software.

Estamos desenvolvendo um marketplace de eletrônicos.
Precisamos implementar um carrinho de compras.

Qual é a melhor abordagem: persistir no backend (banco de dados) 
ou apenas no frontend (localStorage)?
```

### Output Recebido (Resumido)

```
Ambas as abordagens têm mérito:

Abordagem 1: Backend (Banco de dados)
- Pros: Sincronização entre dispositivos, seguro, histórico
- Contras: Mais complexo, precisa gerenciar sessões

Abordagem 2: Frontend (localStorage)
- Pros: Rápido, sem servidor
- Contras: Não sincroniza, risco de perda

Recomendação: Depende dos requisitos. Para uma aplicação 
robusta, sugiro Backend.
```

### ❌ Problemas Identificados

- ⚠️ Muito genérico, sem contexto de MVP
- ⚠️ Não mencionou localStorage como viável para validação
- ⚠️ Recomendação não considerou timeline curta
- ⚠️ Não mencionou Zustand, Prisma ou stack específica
- ⚠️ Sugeriu "abordagem Backend" (complexa demais)

### 🔴 Feedback Recebido

```
❌ Não serve. É genérico. Precisa considerar:
- Timeline MVP: 1-2 semanas
- Objetivo: Validar UX de checkout, não escalar para 1M usuários
- Stack: Next.js 16.2, Express, Prisma, Neon
- Contexto: Auth é JWT 7d em localStorage, sem refresh token
- Checkout: PIX estático fake (manual)
- Admin: Prisma Studio (sem dashboard web)
```

---

## 📌 Versão 2 (17/05 — Com Contexto Parcial)

### Prompt Enviado (Melhorado)

```
Você é um arquiteto especializado em MVP Lean.

Contexto:
- Projeto: Mercadex (marketplace eletrônicos)
- Timeline: 2 semanas
- Stack: Next.js 16.2 (frontend), Express (backend), Prisma/Neon (DB)
- Auth: JWT 7d em localStorage
- Objetivo: Validar UX de checkout, NÃO escalar

Problema:
Precisamos de carrinho. Qual abordagem é recomendada?

1. Backend (Prisma): persistir Cart/CartItem no banco
2. Frontend (localStorage): Zustand + persistência local

Cenários:
- Usuário abre site → adiciona ao carrinho → fecha browser → reabre
- Usuário logado em 2 browsers
- Usuário faz logout

Pense passo a passo:
1. Qual é o trade-off principal?
2. Qual abordagem valida UX mais rápido?
3. Qual é mais segura?
4. Qual recomenda?
```

### Output Recebido (Resumido)

```
Analisando passo a passo:

1. Trade-off: Persistência × Velocidade de desenvolvimento
   - Backend: mais persistente, mais seguro, mas +2 dias dev
   - Frontend: rápido de implementar, +4 horas dev

2. Validação de UX: Frontend vence
   - localStorage preserva carrinho entre sessões
   - Zustand é fácil de integrar
   - Permite testar fluxo de checkout rapidamente

3. Segurança: Backend melhor (token no servidor)
   Mas para MVP: localStorage é aceitável com validação no checkout

4. Recomendação: localStorage (Zustand) para MVP
   - Justificativa: MVP não precisa sincronização entre dispositivos
   - Refatorar para backend em sprint futura
   - Riscos: perda de carrinho (mitigar com UX clara)
```

### ✅ Melhorias vs v1

- ✅ Considerou timeline MVP
- ✅ Mencionou Zustand (correto!)
- ✅ Explicou passo a passo
- ✅ Documentou riscos

### ⚠️ Feedback v2

```
Melhor, mas faltam:
- Detalhes de implementação (como Zustand + persist middleware?)
- Trade-off com checkout PIX (como frontend envia itens ao backend?)
- Decisão de "1 review por usuário/produto" — impacta carrinho?
- Como será refatoração futura?
```

---

## 📌 Versão 3 (20/05 — Refinada e Utilizada)

### Prompt Enviado (Completo — Com Contexto ADR)

```
[Colar docs/ADR.md completo aqui]
[Colar docs/CLAUDE.md completo aqui]

Você é um arquiteto de MVP Lean especializado em decisões de tradeoff.

Decisão: Carrinho no Mercadex — localStorage vs Backend DB?

Cenários de Uso:
1. Usuário abre site → navega → adiciona 3 produtos ao carrinho 
   → fecha browser → reabre amanhã
   → Esperado: carrinho preserva 3 itens

2. Usuário logado em 2 browsers
   → Esperado: podem ter carrinhos diferentes (OK para MVP)

3. Usuário faz logout
   → Esperado: carrinho é limpo (segurança)

4. Usuário clica "Finalizar Compra"
   → Frontend envia array de itens a POST /api/orders
   → Backend valida estoque e cria pedido

Pense passo a passo:
1. Para MVP validar UX, qual é o trade-off principal?
2. localStorage é viável? Quais riscos?
3. Backend DB teria qual overhead?
4. Como afeta refatoração futura?
5. Qual recomenda para ciclo atual?

Restrições MVP:
- Timeline: 1-2 semanas
- Critério: validar checkout, não sincronização
- Admin: Prisma Studio (sem dashboard web)
- Persistência de carrinho entre dispositivos: não é requisito MVP

Formato esperado:
{
  "recomendação": "...",
  "decisão_arquitetural": "Carrinho 100% localStorage (Zustand + persist middleware)",
  "reasoning_completo": "...",
  "alternativas_descartadas": ["Backend DB (overhead +2 dias)"],
  "riscos": ["..."],
  "mitigações": ["..."],
  "refatoração_futura": "Em sprint 2, adicionar sync com backend para múltiplos dispositivos"
}
```

### Output Recebido (Versão Final)

```json
{
  "recomendação": "localStorage (Zustand + Persist Middleware)",
  
  "reasoning_completo": "Para MVP Lean com timeline de 1-2 semanas, 
  o objetivo é validar UX de checkout, não escalar para múltiplos 
  dispositivos. localStorage é suficiente. Zustand é leve, React 
  community o usa, e o persist middleware integra com localStorage 
  automaticamente.",
  
  "alternativas_descartadas": [
    "Backend DB: +1-2 dias de desenvolvimento (controllers, services, 
    repositories, migrations, testes). Overkill para MVP."
  ],
  
  "riscos": [
    "Perda de carrinho se usuário limpar localStorage",
    "Sem sincronização entre browsers (não é requisito MVP)",
    "Segurança: itens no carrinho são visíveis no localStorage (mitigar: validar no backend)"
  ],
  
  "mitigações": [
    "UX: mostrar 'Seu carrinho foi preservado' ao reabrir",
    "Backend: validar produtos e estoque sempre no POST /api/orders",
    "Documentar em CLAUDE.md que Cart/CartItem no schema.prisma é comentado como @legacy"
  ],
  
  "refatoração_futura": "Em sprint 2, se requisito de sincronização 
  aparecer, implementar: (1) Cart/CartItem no Prisma, (2) Sync ao logar, 
  (3) Webhook de alteração. Código será refatorado com mínima dor."
}
```

### ✅ Qualidade Final

- ✅ Altamente contextualizado (ADR + CLAUDE)
- ✅ Explica reasoning passo a passo
- ✅ Documenta riscos e mitigações
- ✅ Caminho claro para refatoração
- ✅ Serve como decisão arquitetural (usada em ADR-007)

---

## 📊 Comparação de Versões

| Aspecto | v1 | v2 | v3 |
|---------|----|----|-----|
| **Contextualização** | 0% | 50% | 100% |
| **Qualidade** | 3/10 | 7/10 | 9/10 |
| **Refinamento necessário** | 80% | 40% | 10% |
| **Tempo validação** | 2h | 1h | 30min |
| **Resultado** | Descartado | Parcial | ✅ Utilizado |

---

## 🎓 Aprendizados

### O que Funcionou

1. **Contexto ADR + CLAUDE.md é crítico**
   - v1 (sem contexto) → sugestão ruim
   - v3 (com contexto) → sugestão correta

2. **Restrições explícitas reduzem hallucinations**
   - "Timeline 1-2 semanas" + "MVP não precisa escalar"
   - IA entendeu que simplicidade é prioridade

3. **Passo a passo obrigatório**
   - v2 (genérico) vs v3 (passo a passo)
   - Diferença: 40% menos refinamento necessário

4. **Formato estruturado de output**
   - JSON com fields (recomendação, reasoning, riscos, mitigações)
   - Mais fácil revisar e validar

### O que Não Funcionou

1. **Prompt genérico (v1)**
   - Problema: "Como implementar carrinho?" é muito aberto
   - Solução: Adicionar contexto, restrições, cenários

2. **Falta de decisões negativas**
   - v2: não explicitou por que Backend foi descartado
   - v3: "Backend é overhead +2 dias" foi explícito

### Trade-offs Observados

| Aspecto | Versão 1 | Versão 3 |
|---------|----------|----------|
| **Velocidade para gerar** | ⚡ 2 min | 🐢 5 min |
| **Qualidade** | 3/10 | 9/10 |
| **Reutilizabilidade** | 0% (descartado) | 100% (usou ADR-007) |
| **Valor líquido** | Negativo (trabalho perdido) | Altamente positivo |

---

## ✅ Conclusão

**Ciclo 1 demonstra:**
- 🎯 CoT (Chain-of-Thought) é 3x mais efetivo com contexto
- 🎯 Refinar prompts com feedback economiza tempo total
- 🎯 Documentar output serve como decisão arquitetural

**Output final usado em:** ADR-007 "Carrinho 100% localStorage"

