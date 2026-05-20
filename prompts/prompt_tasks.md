# 1. Objetivo

Gerar comandos `gh issue create` para distribuir trilhas de trabalho com padrao consistente de naming, labels e atribuicao.

## 2. Contexto

- Modulo/area impactada: gestao de trabalho e backlog operacional.
- Estado atual: trilhas 3, 4 e 5 ja definidas, precisando converter em issues executaveis.
- Restricoes tecnicas: manter padrao de titulos e labels por contexto.

## 3. Escopo

- Incluido: comandos prontos em bash para criacao de issues.
- Excluido: execucao dos comandos e alteracao de codigo de produto.

## 4. Entradas

- Mapeamento de colaboradores:
	- Christian: `cbfn`
	- Leandro: `lpradopires`
	- Henrique: `henriqueferraz`
	- Matheus: `mateus-bernarte`
	- Endryo: `EndryoBittencourt`
- Regras obrigatorias:
	- Prefixo `[FRONT] - ` para frontend e `[BACK] - ` para backend.
	- Labels `frontend` (`#007bff`) e `backend` (`#28a745`).
	- Corpo da issue com resumo da tarefa.
	- Uso de `--assignee` conforme distribuicao.

## 5. Saida Esperada

- Lista de comandos bash prontos para execucao com `gh issue create`.
- Comandos agrupados por trilha e responsavel.

## 6. Criterios de Validacao

- Cada issue tem prefixo correto no titulo.
- Cada issue tem label correta.
- Cada issue possui descricao objetiva e assignee correto.

## 7. Riscos e Cuidados

- Evitar titulos genericos.
- Evitar distribuicao incorreta de tarefas por colaborador.

## 8. Prompt Final

Atue como especialista em DevOps e Agile.

Com base nas trilhas 3, 4 e 5, gere comandos `gh issue create` para criar issues no repositorio usando os mapeamentos:

- Christian: `cbfn`
- Leandro: `lpradopires`
- Henrique: `henriqueferraz`
- Matheus: `mateus-bernarte`
- Endryo: `EndryoBittencourt`

Regras:

- Titulos frontend com prefixo `[FRONT] - ` e backend com `[BACK] - `.
- Labels: `frontend` (cor `#007bff`) e `backend` (cor `#28a745`).
- Corpo da issue deve resumir claramente a tarefa da trilha.
- Atribuir com `--assignee` conforme distribuicao:
	- Trilha 3: Christian (3.1), Leandro (3.2), Henrique (3.3 e 3.4)
	- Trilha 4: Matheus (4.1 a 4.3), Endryo (4.4 a 4.6)
	- Trilha 5: Christian (Qualidade Back), Leandro (Integracao Stripe FE), Henrique (Infra/CI-CD), Matheus (Integracao API), Endryo (Polimento UX)

Retorne apenas os comandos bash prontos para execucao.