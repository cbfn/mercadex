# 1. Objetivo

Reestruturar plano e artefatos do MVP Lean para manter consistencia entre tarefas, documentacao e abertura de issues.

## 2. Contexto

- Modulo/area impactada: planejamento, docs, tarefas e automacao de issues.
- Estado atual: existe plano historico e trilhas com ajustes de escopo MVP.
- Restricoes tecnicas: manter aderencia ao ADR e evitar mudancas fora de escopo.

## 3. Escopo

- Incluido: revisao documental e script de criacao de issues.
- Excluido: implementacao de features no codigo de produto.

## 4. Entradas

- Arquivos de referencia:
	- `prompts/prompt__reestruturacao_planejamento.md`
	- `tasks/trilha-3-backend-carrinho-pagamentos.md`
	- `tasks/trilha-4-frontend-auth-dashboard.md`
	- `tasks/trilha-5-integracao-qualidade.md`
	- `tasks/gh-create-issues-trilhas-3-5.sh`
- Requisitos obrigatorios:
	- Atualizar docs e tarefas para mesma narrativa.
	- Nao fazer assign de issues no script.

## 5. Saida Esperada

- Atualizacao de documentos em `docs/`, `README.md` e `CLAUDE.md` de forma consistente.
- Script `gh-create-issues-trilhas-3-5.sh` refletindo o novo escopo.
- Orientacao clara sobre onde manter referencia de trabalho (task vs issue).

## 6. Criterios de Validacao

- Verificar consistencia textual entre docs principais.
- Verificar que script gera issues sem `--assignee`.
- Verificar que tarefas e issues tem criterio de aceite objetivo.

## 7. Riscos e Cuidados

- Risco de drift entre tasks e docs.
- Evitar instrucoes ambiguuas para o time.

## 8. Prompt Final

Leia `prompts/prompt__reestruturacao_planejamento.md` e planeje as mudancas necessarias.
Atualize os documentos em `docs/` (incluindo diagramas), `CLAUDE.md` e `README.md` para manter uma narrativa unica do MVP Lean.

Depois, atualize `tasks/gh-create-issues-trilhas-3-5.sh` com base nas trilhas 3, 4 e 5, sem atribuir responsaveis (`--assignee`).

Em seguida, responda de forma objetiva:
1. Se as referencias de execucao devem ficar em task, issue ou ambos.
2. Como garantir visibilidade para o time no repositorio e no fluxo de acompanhamento.