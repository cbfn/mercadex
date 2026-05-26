# Padrão: Chain-of-Thought (CoT)

**Definição:** IA "pensa em voz alta", passo a passo, explicando raciocínio antes de conclusão.

**Quando usar:** Decisões complexas, arquitetura, trade-offs, refatoração.

**Efetividade:** 30-40% melhoria em qualidade vs prompts genéricos.

---

## 📋 Estrutura

```
[CONTEXTO DO PROJETO]

Você é um [ROLE — arquiteto, testador, refator].

Problema: [descrição clara]

Restrições técnicas:
- [restrição 1]
- [restrição 2]

Pense passo a passo:
1. Qual é o desafio principal?
2. Quais alternativas existem? (liste 3+)
3. Prós e contras de cada alternativa
4. Qual é melhor e por quê?

Formato: [JSON, markdown, etc]
```

---

## 🎯 Exemplo Real: Decisão Carrinho (ADR-007)

### ❌ Versão 1 (Fraca)

```
Você é um arquiteto.

Como implementar um carrinho em um e-commerce?
```

**Output:** Genérico, sugere Redis + banco de dados sem considerar MVP.

---

### ✅ Versão 2 (Melhorada)

```
[CONTEXTO PROJETO]
Arquivo: docs/CLAUDE.md + docs/ADR.md

Você é um arquiteto especializado em MVP Lean.

Problema:
Marketplace Mercadex precisa de carrinho. É MVP e precisa validar UX.

Restrições:
- Timeline: 2 semanas (sprint única)
- Stack: Next.js 16.2 (frontend), Express (backend), Prisma/Neon (DB)
- Critério MVP: carrinho funciona, não escalável para 1M usuários
- Auth: JWT único 7d em localStorage (sem refresh token)

Pense passo a passo:
1. Qual é o desafio principal do carrinho em MVP?
2. Onde persiste o carrinho? (Backend DB vs Frontend localStorage?)
3. Quais 3 alternativas? (Pro/contra cada uma)
4. Qual recomenda para este MVP?

Contexto importante:
- Checkout é PIX estático fake (sem gateway real)
- Pagamento é manual (admin verifica no Prisma Studio)
- Escalabilidade: será refatorada em sprint futura

Formato: Decisão em JSON com reasoning
```

**Output:** Sugere localStorage + Zustand (correto para MVP!), explica por quê, documenta trade-offs.

---

### ✅ Versão 3 (Refinada — Utilizada)

```
[CONTEXTO COMPLETO: ADR.md, CLAUDE.md, trilha-3.md]

Você é um arquiteto de MVP Lean especializado em decisões rápidas.

Cenário:
Carrinho de Mercadex (MVP validação UX, 2 semanas, sem escalabilidade).

Objetivo: Recomendar abordagem (Backend DB vs Frontend localStorage).

Restrições inquebráveis:
- MVP: valor máximo do carrinho ~ R$50k (não escala para 1M)
- Auth: JWT único em localStorage (sem refresh)
- Admin: Prisma Studio (sem dashboard web)
- Pix: Estático fake (não webhook)

Cenários:
1. Usuário abre site → navega → adiciona ao carrinho → fecha browser → reabre
   - Esperado: carrinho preserva itens
2. Usuário logado em 2 browsers
   - Esperado: pode divergir (não é sincronizado)
3. Usuário faz logout
   - Esperado: carrinho é limpo (segurança)

Pense passo a passo:
1. Para este MVP, qual é o trade-off principal? (Persistência vs Velocidade)
2. Qual abordagem valida UX mais rápido?
3. Qual abordagem é mais segura?
4. Qual é recomendado?

Justifique com: timing, risco, refatoração futura, implicações.

Formato: 
{
  "recomendação": "...",
  "reasoning": "...",
  "alternativas_descartadas": [...],
  "riscos": [...],
  "refatoração_futura": "..."
}
```

**Output:** Altamente contextualizado, explica decisão passo a passo, documenta trade-offs e risks.

**Resultado na ADR:**
```
Decisão: Carrinho 100% localStorage (Zustand + persist middleware)
Backend: Não expõe endpoints de carrinho
Justificativa: [reasoning completo da IA]
```

---

## 🔑 Elementos Críticos CoT

### 1. Contexto Estruturado
✅ Bom: "Colar ADR.md + CLAUDE.md como contexto"
❌ Ruim: "Você conhece nosso projeto?"

### 2. Restrições Explícitas
✅ Bom: "Timeline: 2 semanas, Stack: Node+Express, Critério: MVP"
❌ Ruim: "Faz de forma robusta"

### 3. Passo a Passo Obrigatório
✅ Bom: "1. Qual é o desafio? 2. Quais alternativas? 3. Pro/contra? 4. Recomendação?"
❌ Ruim: "Qual abordagem escolher?"

### 4. Formato Esperado
✅ Bom: "Formato: JSON com fields: recomendação, reasoning, riscos"
❌ Ruim: "Me diga a sua opinião"

---

## 📊 Impacto Medido

| Métrica | Versão 1 | Versão 2 | Versão 3 |
|---------|----------|----------|----------|
| Qualidade | 3/10 | 7/10 | 9/10 |
| Contexto | 0% | 50% | 100% |
| Refinamento necessário | 80% | 40% | 10% |
| Tempo para validação | 2h | 1h | 30min |

---

## ✅ Checklist para CoT

- [ ] Contexto (ADR + CLAUDE.md) incluído?
- [ ] Restrições listadas (timeline, stack, critério)?
- [ ] Rol claro (arquiteto, testador, etc)?
- [ ] 4+ passos definidos?
- [ ] Formato esperado especificado?
- [ ] Exemplos ou cenários inclusos?
- [ ] Trade-offs mencionados?

