# Viabilidade Tecnica - Mercadex MVP Lean

## Objetivo

Formalizar viabilidade tecnica, operacional e de evolucao do MVP Lean, com foco em reduzir risco de entrega e manter capacidade de iteracao rapida.

## Escopo Avaliado

- Arquitetura monolitica modular com frontend e backend separados.
- Checkout com PIX estatico e confirmacao manual.
- Features de IA para busca e assistencia no produto.
- Processo de qualidade baseado em testes e CI.

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

## Fontes Canonicas

- `docs/ADR.md`
- `docs/PRD.md`
- `docs/PRD_CHECKOUT.md`
- `README.md`
