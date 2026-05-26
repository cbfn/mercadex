# 🎬 Checklist para Vídeo de Demonstração

**Tempo total:** ~10 minutos  
**Formato:** Gravação de tela (OBS Studio, Loom ou equivalente) + voz narrada  
**Entrega:** Link YouTube (desbloqueado ou com acesso público)  
**Referência:** `projeto_avaliativo.md` — Seção 5.5

---

## 📋 Checklist de Itens Obrigatórios

### Item 1: Sistema em Funcionamento ✅
**O que mostrar:** Mercadex rodando localmente (frontend + backend)

**Como preparar:**
```bash
# Terminal 1: Frontend
cd frontend
npm run dev           # http://localhost:3000

# Terminal 2: Backend
cd backend
npm run dev           # http://localhost:3001

# Terminal 3: Banco (opcional)
cd backend
npx prisma studio    # http://localhost:5555
```

**O que narrar:**
- "Mercadex é um marketplace de eletrônicos em MVP Lean"
- "Frontend roda em Next.js 16.2 com React 19 e TypeScript"
- "Backend é Node.js + Express + TypeScript"
- "Database: Neon Postgres com Prisma 7.8.0"

**Tempo:** 1 min

---

### Item 2: Repositório GitHub com Estrutura ✅
**O que mostrar:** Repo no GitHub, branches, estrutura de pastas

**Como preparar:**
- Abrir GitHub no navegador: https://github.com/cbfn/mercadex
- Mostrar branch `develop` (não `main` — ativa CI)
- Navegar em `frontend/`, `backend/`, `docs/`

**O que narrar:**
- "Repositório público no GitHub com organização monolítica modular"
- "Branch develop ativa CI/CD com GitHub Actions"
- "Frontend em frontend/, backend em backend/, documentação em docs/"
- "Feature-Sliced Design no frontend, modularização no backend"

**Tempo:** 1 min

---

### Item 3: GitHub Project Board ✅
**O que mostrar:** GitHub Project com rastreabilidade de issues

**Como preparar:**
- Navegar para GitHub Projects: https://github.com/cbfn/mercadex/projects
- Abrir o projeto "Mercadex MVP Lean" (se criado)
- Mostrar colunas: Backlog | A Fazer | Em Andamento | Bloqueado | Em Revisão | Concluído

**O que narrar:**
- "GitHub Project Board rastreia tarefas e progresso do MVP"
- "Issues ligadas a PRs e commits semânticos"
- "Todas as trilhas 3–5 têm issues no board"

**Tempo:** 1 min

---

### Item 4: Padrões de Prompting e Ciclos de Refinamento ✅
**O que mostrar:** Arquivos de documentação de IA em `docs/prompts/`

**Como preparar:**
- Abrir VSCode e navegar para `docs/prompts/`
- Mostrar arquivos: `README.md`, `01-chain-of-thought.md`, `02-few-shot.md`
- Abrir `ciclo-1-arquitetura.md` (v1 → v2 → v3)

**O que narrar:**
- "Mercadex utilizou Claude Sonnet para arquitetura, testes e refatoração"
- "Documentamos 3 padrões de prompting: CoT, Few-Shot, Role-Based"
- "Cada padrão tem exemplo real com ciclo v1 → v2 → v3"
- "v1: genérico (30% qualidade), v2: com contexto (70%), v3: validado (95%)"

**Tempo:** 2 min

---

### Item 5: Testes Automatizados com Cobertura ✅
**O que mostrar:** Testes rodando com cobertura 80%+

**Como preparar:**
```bash
# Frontend
cd frontend
npm run test:coverage    # Gera relatório HTML

# Backend
cd backend
npm run test:coverage    # Gera relatório HTML
```

**O que narrar:**
- "Frontend: 273 testes unitários com 99%+ cobertura (Jest + React Testing Library)"
- "Backend: Testes com padrão AAA (Arrange/Act/Assert)"
- "CI/CD no GitHub Actions valida cobertura ≥ 80%"
- "Testes foram gerados com Few-Shot pattern de IA"

**Tempo:** 1 min

---

### Item 6: Pipeline CI/CD com GitHub Actions ✅
**O que mostrar:** GitHub Actions workflows ativados

**Como preparar:**
- Navegar para https://github.com/cbfn/mercadex/actions
- Mostrar `ci-frontend.yml` (lint, type-check, testes)
- Mostrar `ci-backend.yml` (type-check, testes, cobertura)
- Clicar em uma build recente para ver logs

**O que narrar:**
- "CI/CD automatizado com GitHub Actions"
- "Ativado na branch develop para lint, type-check, testes"
- "Relatórios de cobertura comentados automaticamente em PRs"
- "Commits semânticos obrigatórios (feat:, fix:, test:, docs:)"

**Tempo:** 1 min

---

### Item 7: Funcionalidades do Mercadex Rodando ✅
**O que mostrar:** Fluxo de compra no frontend

**Como preparar:**
- Com frontend rodando em localhost:3000, navegar no marketplace
- Mostrar: Catálogo → Filtragem → Produto → Carrinho → Checkout

**O que narrar:**
- "Catálogo dinâmico com filtros por categoria, busca e ordenação"
- "Modal de detalhes do produto com especificações"
- "Carrinho interativo com persistência no localStorage (Zustand)"
- "Checkout PIX com 4 etapas: Entrega, Pagamento, Confirmação"

**Tempo:** 2 min

---

### Item 8: Análise Crítica de IA ✅
**O que mostrar:** Arquivo `docs/IA_ANALISE_CRITICA.md`

**Como preparar:**
- Abrir no editor: `docs/IA_ANALISE_CRITICA.md`
- Destacar seções: Falhas, Trade-offs, Limitações, Aprendizados

**O que narrar:**
- "Documentamos falhas de IA: hallucinations, framework mismatches, cobertura genérica"
- "Trade-offs: IA 24x mais rápida, 60% qualidade primeira vez, 95% após refinamento"
- "1000x ROI: <$0.05 custo vs $200 em horas humanas"
- "Lições: Contexto = 80% de sucesso, Few-Shot > CoT para código, sempre validar"

**Tempo:** 1 min

---

## 🎥 Timeline de Gravação (10 minutos)

```
00:00–01:00  — Item 1: Sistema em funcionamento (frontend + backend)
01:00–02:00  — Item 2: Repositório GitHub e estrutura
02:00–03:00  — Item 3: GitHub Project Board
03:00–05:00  — Item 4: Padrões de prompting e ciclos (maior tempo — mostrar exemplos)
05:00–06:00  — Item 5: Testes e cobertura
06:00–07:00  — Item 6: Pipeline CI/CD
07:00–09:00  — Item 7: Funcionalidades do Mercadex (fluxo de compra)
09:00–10:00  — Item 8: Análise crítica de IA
```

---

## 🎙️ Script de Narração (Estrutura)

```
[ABERTURA - 0:00]
"Olá! Sou o desenvolvedor do Mercadex, um MVP Lean de marketplace de eletrônicos.
Este vídeo mostra o sistema completo, arquitetura, uso de IA e qualidade de testes.
Vamos começar!"

[ITEM 1 - Sistema - 0:10]
"Aqui temos o Mercadex rodando localmente. Frontend em Next.js 16.2 com React 19,
backend em Node.js + Express, database Neon Postgres com Prisma 7.8.0. Arquitetura
monolítica modular, totalmente em TypeScript."

[ITEM 2 - Repositório - 1:10]
"O repositório está no GitHub, branch develop ativa CI/CD automático.
Temos frontend aqui, backend aqui, documentação em docs/. Feature-Sliced Design no
frontend, DDD-light no backend."

[ITEM 3 - Board - 2:10]
"GitHub Project Board rastreia todas as tarefas. Cada issue está ligada a PRs e
commits semânticos. Podemos ver o progresso em tempo real."

[ITEM 4 - Prompting - 3:10]
"Usamos Claude Sonnet para acelerar desenvolvimento. Documentamos 3 padrões:
Chain-of-Thought para arquitetura, Few-Shot para código/testes, Role-Based para
documentação. Cada padrão tem ciclos completos v1, v2, v3 mostrando evolução da
qualidade."

[ITEM 5 - Testes - 5:10]
"273 testes no frontend com 99%+ cobertura. Backend com padrão AAA. CI valida
cobertura ≥80%. Testes foram gerados com Few-Shot de IA e refinados para 95% qualidade."

[ITEM 6 - CI/CD - 6:10]
"GitHub Actions automatiza lint, type-check e testes. Comentários em PRs mostram
cobertura e mudanças sem testes. Commits devem ser semânticos."

[ITEM 7 - Funcionalidades - 7:10]
"Vamos fazer um fluxo de compra. Vejo o catálogo, filtro por categoria, clico em
um produto para ver detalhes, adiciono ao carrinho que persiste, vou ao checkout
com 4 etapas: entrega, pagamento PIX estático fake, confirmação."

[ITEM 8 - Análise Crítica - 9:10]
"Documentamos análise crítica de IA. Falhas encontradas: hallucinations, framework
mismatches. Trade-offs: IA 24x mais rápida mas 60% qualidade, precisa de refinamento.
1000x ROI em custos. Contexto estruturado (CLAUDE.md + ADR.md) = 80% de sucesso."

[FECHAMENTO - 10:00]
"Mercadex MVP Phase 3 com arquitetura sólida, CI/CD robusto, testes automatizados,
e uso estratégico de IA com ciclos de refinamento. Obrigado!"
```

---

## 📸 Screenshots para Capturar (Referência)

| Tempo | Item | Screenshot |
|-------|------|-----------|
| 0:00 | Frontend + Backend | Dois terminais rodando localhost:3000 e localhost:3001 |
| 1:00 | GitHub repo | Estrutura de pastas (frontend/, backend/, docs/) |
| 2:00 | Project board | Colunas do GitHub Project |
| 3:00 | Prompting patterns | VSCode com `docs/prompts/` aberto |
| 5:00 | Jest coverage | Relatório HTML com 99%+ statements |
| 6:00 | GitHub Actions | Build verde com logs de testes |
| 7:00 | Mercadex UI | Catálogo → Produto → Carrinho → Checkout |
| 9:00 | IA Analysis | `docs/IA_ANALISE_CRITICA.md` aberto |

---

## 🛠️ Ferramentas Recomendadas para Gravação

| Ferramenta | Plataforma | Custo | Obs |
|-----------|-----------|-------|-----|
| **OBS Studio** | Windows/Mac/Linux | Grátis | Melhor controle |
| **Loom** | Web | Freemium | Rápido e fácil |
| **ScreenFlow** | Mac | Pago | Qualidade alta |
| **Camtasia** | Windows/Mac | Pago | Muito bom |

**Recomendação:** OBS Studio (grátis, profissional)

---

## 📤 Entrega

1. **Editar** vídeo (adicionar transições, legendas, zoom se necessário)
2. **Fazer upload** no YouTube como "Não listado" ou "Público"
3. **Copiar link** do vídeo
4. **Adicionar ao** `docs/ENTREGA_FINAL.md` ou enviar como evidência

---

## ✅ Validação Pré-Gravação

Antes de gravar, confirme:

- [ ] Frontend rodando em localhost:3000
- [ ] Backend rodando em localhost:3001
- [ ] Banco de dados criado e populado (seed)
- [ ] GitHub Project Board criado com colunas
- [ ] Issues criadas no GitHub (trilhas 3–5)
- [ ] Todos os arquivos de IA criados (`docs/prompts/*`)
- [ ] Testes passando com cobertura ≥80%
- [ ] GitHub Actions workflow verde
- [ ] ADR-011 adicionado a docs/ADR.md
- [ ] README.md atualizado com seções de IA

---

## 🎬 Lembre-se

- ✅ Fale claro e na velocidade normal (não rápido demais)
- ✅ Pause 2–3 segundos antes de trocar de cenário
- ✅ Use zoom da tela para destacar código (125–150%)
- ✅ Teste áudio antes de gravar
- ✅ Grave em resolução ≥1080p
- ✅ Manter dentro de 10 minutos (usar timestamps se ultrapassar)

---

**Última atualização:** Maio 2026 | Referência: projeto_avaliativo.md Seção 5.5
