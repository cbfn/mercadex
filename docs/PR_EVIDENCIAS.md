# Evidencias de Pull Requests

Este documento define o padrao minimo de evidencia para PRs no Mercadex.

## Checklist Obrigatorio

- Objetivo da mudanca em linguagem clara.
- Escopo da mudanca (incluido e excluido).
- Evidencia de validacao (testes, type-check, lint, cobertura).
- Riscos e plano de rollback ou mitigacao.
- Alinhamento com `docs/ADR.md`.
- Evidencia de prompt quando a tarefa usar fluxo de IA assistida.

## Padrao de Qualidade da Descricao

1. Contexto e problema.
2. Solucao aplicada.
3. Impacto esperado.
4. Como validar.

## Exemplo de Estrutura de Evidencia

- PR: `<link da PR>`
- Branch: `feature/<nome>`
- Commits: semantic commits relevantes
- Validacao executada: `npm run test`, `npm run lint`, `npx tsc --noEmit`
- Riscos identificados: `<lista>`
- Evidencia de prompt: `<arquivo em prompts/>`

## Registro de PRs Relevantes

PRs reais para auditoria (base publica do repositorio):

- `https://github.com/cbfn/mercadex/pull/120` - `fix(testes): corrige act() warning e monta CartDrawer no layout raiz`
	- Branch: `hotfix/testes`
	- Merge: em `main`
	- Evidencias de validacao na PR:
		- 24/24 testes unitarios do cart
		- 4/4 testes E2E (critical-flow.spec.ts)
		- Cobertura frontend acima de 80%

- `https://github.com/cbfn/mercadex/pull/119` - `feat(product-detail): reviews inline na pagina de detalhe`
	- Branch: `develop`
	- Merge: em `main`
	- Evidencias de validacao na PR:
		- 9/9 testes unitarios
		- TypeScript sem erros
		- Atualizacao automatica de cobertura no fluxo de CI

- `https://github.com/cbfn/mercadex/pull/118` - `chore(release): merge develop into main`
	- Branch: `develop`
	- Merge: em `main`
	- Evidencias de validacao na PR:
		- CI checks de release em verde
		- Commit de atualizacao de relatorio de cobertura

- `https://github.com/cbfn/mercadex/pull/121` - `chore(governance): strengthen PR evidence and CI validation gates`
	- Branch: `feature/ajusta-docs`
	- Merge: em `develop`
	- Evidencias de validacao na PR:
		- Template de PR completo (Summary, Scope, Validation, Risks)
		- Script de governanca em CI para template + semantic commits
		- Checks frontend/backend/e2e em verde

- `https://github.com/cbfn/mercadex/pull/122` - `chore(release): merge develop into main`
	- Branch: `develop`
	- Merge: em `main`
	- Evidencias de validacao na PR:
		- Promocao de release com checks em verde
		- Corpo estruturado com riscos e validacao

## Fechamento de Ciclo (Trilhas 1-5)

Resumo de rastreabilidade entre expectativa original e entrega real:

- Entregue no ciclo:
	- Reforco de governanca de PR/CI e padronizacao documental.
	- Modulos de orders e reviews ativos no backend.
	- Checkout PIX estatico funcional e busca assistida por IA no catalogo.

- Parcial no ciclo:
	- IA por produto: busca assistida entregue, mas `ai-summary`/`chat` dedicados ficaram para evolucao.

- Repensado por prazo (pivot MVP Lean):
	- Carrinho persistido no backend.
	- Pagamento real com gateway (Stripe/PSP).
	- Dashboard administrativo frontend.

Essa separacao deve permanecer explicita em README, PRD, VIABILIDADE, BACKLOG e USER_STORIES para evitar divergencia de narrativa.

## Observacoes de Maturidade

- As PRs acima tem evidencia tecnica de validacao, mas ainda ha oportunidade de melhorar a qualidade de review humano (em varios casos sem reviewers formais).
- Recomendacao: exigir ao menos 1 aprovacao em PRs nao triviais e manter checklist de risco preenchido.
