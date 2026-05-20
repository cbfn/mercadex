# PRD - Mercadex MVP Lean

## Objetivo do Produto

Mercadex e um marketplace de eletronicos com foco em validacao rapida de fluxo de compra, confianca no checkout e assistencia com IA para descoberta de produtos.

Este documento e o PRD principal do repositorio. Para requisitos detalhados do checkout, consulte `docs/PRD_CHECKOUT.md`.

## Escopo do MVP Lean

- Catalogo de produtos com filtro, busca e ordenacao.
- Carrinho client-side com persistencia local.
- Checkout em 3 etapas com PIX estatico.
- Pedidos com status inicial `PENDING_PIX`.
- Reviews de produto.
- Assistente de busca orientado por IA no catalogo.

## Status de Execucao do Ciclo (2026-05-20)

Taxonomia usada neste documento:
- Implementado: entregue e validado no codigo.
- Parcial: entregue em parte, com desdobramento pendente.
- Planejado: ainda nao iniciado neste ciclo.
- Repensado (pivot): esperado originalmente, mas despriorizado por prazo/escopo.

| Item | Esperado originalmente | Entregue no ciclo atual | Status |
| --- | --- | --- | --- |
| Autenticacao | JWT unico 7d | Access token + refresh token | Repensado (pivot) |
| Carrinho | Persistencia backend + endpoints dedicados | Carrinho client-side (localStorage) + envio para orders no checkout | Repensado (pivot) |
| Checkout | Fluxo funcional com PIX | Checkout PIX estatico com `PENDING_PIX` | Implementado |
| Pedidos | Criacao e consulta de pedidos | Modulo de orders implementado | Implementado |
| Reviews | CRUD de reviews por produto | Modulo de reviews implementado | Implementado |
| IA no produto | Summary + chat por produto | Busca assistida em `/api/products/search` | Parcial |
| Admin | Dashboard frontend | Operacao via Prisma Studio | Repensado (pivot) |

## Problema a Resolver

Usuarios precisam encontrar produtos de forma rapida e concluir compra com baixo atrito. O MVP prioriza:

- Menor tempo ate o primeiro pedido.
- Baixa complexidade operacional.
- Diferencial de descoberta com IA sem comprometer estabilidade.

## Personas

- Comprador casual mobile-first.
- Comprador profissional com foco em eficiencia.
- Operador interno para acompanhamento de pedidos.

## Requisitos Funcionais

1. Listar produtos com filtros por categoria, preco e condicao.
2. Permitir criar e manter carrinho no frontend.
3. Permitir checkout com endereco e confirmacao de pedido via PIX estatico.
4. Permitir criar e listar reviews por produto.
5. Permitir busca assistida no endpoint `/api/products/search`.
6. Permitir criar pedidos via `POST /api/orders` com status inicial `PENDING_PIX`.

Observacao de escopo repensado por prazo:
- Endpoints dedicados de IA por produto (`/api/products/:id/ai-summary` e `/api/products/:id/chat`) permanecem referenciados como evolucao planejada, nao como entrega concluida neste ciclo.

## Requisitos Nao Funcionais

- Cobertura minima de testes: 80% em frontend e backend.
- CI separado por contexto (`frontend` e `backend`).
- Respostas de API padronizadas com `success`, `data`, `error`.
- Documentacao consistente entre README, ADR e PRD.

## Fora de Escopo do MVP

- Pagamento real com gateway (Stripe/PSP).
- Dashboard administrativo completo no frontend.
- Historico persistente de chat IA por usuario.

## Esperado x Entregue (Resumo)

- Esperado nas trilhas 3 e 4: IA dedicada por produto (summary/chat), dashboard admin frontend, carrinho persistido no backend.
- Entregue no ciclo: busca assistida por IA no catalogo, operacao admin via Prisma Studio, carrinho 100% localStorage integrado ao fluxo de pedidos.
- Motivo do ajuste: reducao de escopo por prazo para garantir entrega de fluxo ponta a ponta com qualidade e cobertura de testes.

## Dependencias e Riscos

- Dependencia de provedor LLM para experiencia completa de IA.
- Custo e latencia variavel de chamadas de IA.
- Divergencia documental se PRD/ADR nao forem revisados em conjunto.

## Criterios de Sucesso

- Fluxo de compra funcional ponta a ponta com status `PENDING_PIX`.
- Cobertura de testes acima do threshold definido.
- Evidencias de prompts e PRs com template preenchido.
- Documentacao de viabilidade e arquitetura atualizadas.

## Referencias

- `docs/ADR.md`
- `docs/PRD_CHECKOUT.md`
- `docs/VIABILIDADE.md`
