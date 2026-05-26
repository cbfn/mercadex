# Padrões de Prompting — Mercadex

Documentação dos padrões de prompting utilizados no projeto Mercadex para uso de IA (Claude Sonnet) em diferentes etapas do desenvolvimento.

---

## 📚 Padrões Utilizados

### 1. Chain-of-Thought (CoT)

**Quando usar:** Decisões arquiteturais, refatoração complexa, análise de trade-offs.

**Por que funciona:** Força a IA a "pensar em voz alta", passo a passo, reduzindo erros e hallucinations.

**Estrutura:**

```
Contexto: [descrição do problema]
Restrições: [limites técnicos, temporais, orçamentários]
Tarefa: [o que precisa ser decidido]

Instrução: Pense passo a passo:
1. Qual é o desafio principal?
2. Quais alternativas existem?
3. Prós e contras de cada?
4. Qual recomenda e por quê?

Contexto obrigatório: [colar ADR.md, CLAUDE.md, ou similar]
```

**Vantagens:**
- ✅ Explica raciocínio (revisível)
- ✅ Reduz hallucinations
- ✅ Melhora qualidade 30-40%

**Desvantagens:**
- ⚠️ Mais lenta (2-3x)
- ⚠️ Output verboso

**Exemplo real:** [veja ciclo-1-arquitetura.md](ciclo-1-arquitetura.md)

---

### 2. Few-Shot Learning

**Quando usar:** Geração de código, testes, componentes React, buscando padrão específico do projeto.

**Por que funciona:** IA aprende pattern observando exemplos. Evita genéricos e volta à convenção do projeto.

**Estrutura:**

```
Instrução: Baseando-se nos exemplos abaixo, [gere/refatore/implemente] [tarefa]

Exemplo 1: [mostrar código bom do projeto]
---
[código exemplo]
---

Exemplo 2: [outro exemplo]
---
[código]
---

Tarefa: [agora faça para X]
```

**Vantagens:**
- ✅ Rápida (90% correto logo)
- ✅ Segue convenção do projeto
- ✅ Menos refinamento

**Desvantagens:**
- ⚠️ Requer exemplos de qualidade
- ⚠️ Falha com patterns novos

**Exemplo real:** [veja ciclo-2-testes.md](ciclo-2-testes.md)

---

### 3. Role-Based Prompting

**Quando usar:** Documentação, análise crítica, relatórios, quando se quer "persona" consistente.

**Por que funciona:** IA muda tom/perspectiva quando lhe damos papel (arquiteto, testador, auditor).

**Estrutura:**

```
Você é um [ROLE].

Sua tarefa: [o que fazer]
Contexto: [informações relevantes]
Formato esperado: [markdown, JSON, etc]

Restrições:
- [restrição 1]
- [restrição 2]
```

**Vantagens:**
- ✅ Tom consistente
- ✅ Foco certo
- ✅ Fácil de reproduzir

**Desvantagens:**
- ⚠️ Menos "criativo"

**Exemplo:** Para análise crítica, usamos "Você é um auditor de código"

---

## 🔄 Ciclos de Refinamento

O projeto segue 3 ciclos de refinamento documentados:

1. **Ciclo 1: Arquitetura** → [ciclo-1-arquitetura.md](ciclo-1-arquitetura.md)
   - v1: Genérica → v2: Com contexto ADR → v3: Final validada

2. **Ciclo 2: Testes** → [ciclo-2-testes.md](ciclo-2-testes.md)
   - v1: Testes básicos → v2: Com edge cases → v3: Final 80%+

3. **Ciclo 3: Refatoração** → [ciclo-3-refatoracao.md](ciclo-3-refatoracao.md)
   - v1: Sugestão IA → v2: Validação → v3: Implementado

---

## 📂 Exemplos Reais

Pasta `exemplos/` contém:
- Entrada de prompt real
- Output bruto da IA
- Análise + ajustes
- Output final

Ver [exemplos/](exemplos/) para detalhes.

---

## 📋 Checklist para Prompts Novos

Ao criar novo prompt no projeto, seguir:

- [ ] Defina o padrão (CoT / Few-Shot / Role-Based)
- [ ] Inclua contexto (ADR.md, CLAUDE.md, ou referência)
- [ ] Especifique formato esperado (JSON, markdown, etc)
- [ ] Liste restrições explícitas
- [ ] Documente output esperado (ou exemplo)
- [ ] Valide output antes de usar
- [ ] Se iteração, documente v1→v2→...

---

## 🎯 Comandos Referência

```bash
# Ver um padrão específico
cat docs/prompts/01-chain-of-thought.md

# Ver exemplos
ls docs/prompts/exemplos/

# Ver um ciclo
cat docs/prompts/ciclo-1-arquitetura.md

# Todos os prompts no projeto
find docs/prompts -name "*.md" | head -20
```

---

## 📚 Referências

- [CLAUDE.md](../../CLAUDE.md) — Contexto do projeto para IA
- [docs/ADR.md](../ADR.md) — Decisões arquiteturais
- [docs/IA_ANALISE_CRITICA.md](../IA_ANALISE_CRITICA.md) — Análise crítica de falhas e aprendizados

