# Viabilidade Tecnica - Mercadex MVP Lean

## Objetivo

Formalizar viabilidade tecnica, operacional e de evolucao do MVP Lean, com foco em reduzir risco de entrega e manter capacidade de iteracao rapida.

## Escopo Avaliado

- Arquitetura monolitica modular com frontend e backend separados.
- Checkout com PIX estatico e confirmacao manual.
- Features de IA para busca e assistencia no produto.
- Processo de qualidade baseado em testes e CI.

## Esperado x Entregue (Ciclo Atual)

Visao consolidada para reduzir ambiguidade documental:

- Entregue:
  - Orders e reviews implementados com testes.
  - Checkout PIX estatico com status `PENDING_PIX`.
  - Busca assistida por IA no endpoint `/api/products/search`.
  - Governanca de PR e commits reforcada em CI.
- Parcial:
  - IA no produto entregue como busca assistida; summary/chat dedicados por produto ficaram para proxima janela.
- Repensado por prazo:
  - Carrinho persistido no backend.
  - Dashboard admin frontend.
  - Pagamento real com gateway.

## Alternativas Consideradas

1. Microservicos completos no MVP.
2. Gateway de pagamento real no MVP.
3. Ausencia de features de IA na primeira entrega.

Decisao adotada: manter monolito modular, pagamento simplificado e IA focada em descoberta de produtos.

## Justificativas Tecnicas

- Menor tempo de entrega e menor custo operacional no inicio.
- Menos pontos de falha do que arquitetura distribuida prematura.
- IA adiciona valor de negocio com baixo acoplamento ao fluxo de pagamento.

## Limitacoes Reais

- PIX estatico exige processo manual para confirmacao.
- Custos de IA variam por volume e modelo utilizado.
- Latencia de provedor LLM pode impactar experiencia do assistente.
- Governanca documental precisa enforcement para evitar divergencia.

## Trade-offs de Prazo Adotados

Para preservar entrega ponta a ponta no prazo do MVP Lean, o time priorizou funcionalidades com maior impacto no fluxo de compra e menor risco operacional:

- Troca de escopo de pagamento real por PIX estatico.
- Troca de admin frontend por operacao via Prisma Studio.
- Troca de carrinho backend por localStorage no frontend.
- Priorizacao de IA em busca assistida em vez de chat/summary dedicados por produto.

Esses trade-offs foram adotados por prazo, nao por inviabilidade tecnica definitiva.

## Riscos e Mitigacoes

- Risco: variacao de custo de IA.
  Mitigacao: fallback heuristico, limites de uso e observabilidade de chamadas.
- Risco: drift entre docs e implementacao.
  Mitigacao: checklist obrigatorio em PR e revisao mensal de consistencia.
- Risco: regressao de qualidade em mudancas rapidas.
  Mitigacao: threshold de cobertura e gates de CI por contexto.

## Viabilidade Operacional

- Equipe consegue manter o fluxo com processos atuais de branch + PR.
- CI existente suporta validacoes automatizadas por contexto.
- Documentacao centralizada facilita onboarding e auditoria tecnica.

## Proximos Passos

1. Automatizar validacao de qualidade de PR (campos criticos e padrao de commit).
2. Medir KPIs minimos de IA (latencia, taxa de erro, uso).
3. Evoluir checkout para integracao com PSP apos validacao do MVP.
4. Retomar escopo postergado: `ai-summary`, `chat` por produto e painel admin frontend.

## Fontes Canonicas

- `docs/ADR.md`
- `docs/PRD.md`
- `docs/PRD_CHECKOUT.md`
- `README.md`
