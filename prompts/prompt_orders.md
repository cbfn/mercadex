# 1. Objetivo

Planejar implementacao de `orders.controller.ts` e `orders.routes.ts` com autenticacao obrigatoria e cobertura de testes aderente ao padrao do projeto.

## 2. Contexto

- Modulo/area impactada: backend/orders.
- Estado atual: modulo precisa de controller/rotas alinhados aos demais modulos.
- Restricoes tecnicas: manter arquitetura modular e padrao AAA nos testes.

## 3. Escopo

- Incluido: plano de implementacao de controller, routes e testes.
- Excluido: alteracoes de arquitetura fora do modulo de orders.

## 4. Entradas

- Arquivos de referencia:
	- diretorio `backend/src/modules/orders/`
	- modulos existentes em `backend/src/modules/*`
- Requisitos obrigatorios:
	- Todas as rotas protegidas com `authenticate`.
	- Testes seguindo diretrizes do repositorio.

## 5. Saida Esperada

- Plano detalhado de implementacao para `orders.controller.ts` e `orders.routes.ts`.
- Lista de casos de teste (sucesso, erros e edge cases).
- Mapeamento de dependencias do modulo.

## 6. Criterios de Validacao

- Controller com validacao de input e tratamento de erro padronizado.
- Rotas com middleware correto e contratos consistentes.
- Testes com estrutura AAA e descricoes comportamentais.

## 7. Riscos e Cuidados

- Evitar acoplamento com modulos nao relacionados.
- Evitar bypass de autenticacao em rotas sensiveis.

## 8. Prompt Final

Analise o diretorio `backend/src/modules/orders/` e proponha um plano para implementar `orders.controller.ts` e `orders.routes.ts` seguindo o mesmo padrao dos modulos existentes. Todas as rotas devem requerer `authenticate`.

Inclua tambem plano de testes automatizados seguindo as diretrizes do repositorio (AAA, casos de sucesso, erro e edge cases), com foco em manter consistencia de arquitetura e qualidade.