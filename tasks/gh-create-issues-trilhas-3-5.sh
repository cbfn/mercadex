#!/usr/bin/env bash
set -euo pipefail

# Requisito: estar autenticado no GitHub CLI e dentro do repo correto.
# Execucao: bash tasks/gh-create-issues-trilhas-3-5.sh

# Labels (cria ou atualiza se ja existirem)
(gh label create frontend --color 007bff --description "Tarefas de frontend" 2>/dev/null) \
  || gh label edit frontend --color 007bff --description "Tarefas de frontend"

(gh label create backend --color 28a745 --description "Tarefas de backend" 2>/dev/null) \
  || gh label edit backend --color 28a745 --description "Tarefas de backend"

# ---------------------------
# Trilha 3 (Backend)
# ---------------------------

gh issue create \
  --title "[BACK] - Trilha 3.1: Modulo de Pedidos (PENDING_PIX)" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Implementar o modulo de pedidos recebendo itens do frontend (localStorage), validando estoque e criando pedido com status PENDING_PIX.

## Escopo
- Criar DTO, service, controller e routes em backend/src/modules/orders.
- Implementar POST /api/orders com itens + shippingAddress enviados pelo frontend.
- Validar produto ativo, estoque e calcular total antes de persistir.
- Implementar GET /api/orders e GET /api/orders/:id com ownership por usuario autenticado.

## Criterios de aceite
- Pedido criado com status PENDING_PIX quando payload e estoque forem validos.
- Erros de produto inexistente/inativo e estoque insuficiente retornam falha consistente.
- Listagem e detalhe de pedidos funcionam apenas para o usuario dono do pedido.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.1)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.2: Modulo de Reviews" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Implementar o modulo de reviews de produtos com listagem publica, criacao autenticada e remocao da propria review.

## Escopo
- Criar DTO, service, controller e routes em backend/src/modules/reviews.
- Implementar GET /api/products/:id/reviews sem autenticacao.
- Implementar POST /api/products/:id/reviews com autenticacao e regra de 1 review por usuario/produto.
- Implementar DELETE /api/reviews/:id para remover apenas review do proprio usuario.

## Criterios de aceite
- Listagem de reviews retorna dados do autor e ordenacao correta.
- Criacao de review bloqueia duplicidade por usuario/produto.
- Exclusao de review sem ownership retorna erro de permissao.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.2)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.3: AI Services (Resumo e Chat)" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Implementar servicos de IA para resumo de reviews e chat stateless por produto.

## Escopo
- Criar backend/src/modules/ai com service, dto, controller e routes.
- Implementar GET /api/products/:id/ai-summary com resumo baseado em reviews.
- Implementar POST /api/products/:id/chat com resposta baseada em specs + reviews.
- Configurar contrato de provider via LLM_PROVIDER_API_KEY e LLM_PROVIDER_MODEL.

## Criterios de aceite
- Endpoint de resumo retorna texto quando houver reviews e trata ausencia de base.
- Endpoint de chat responde para produto valido e trata produto inexistente.
- Implementacao permanece stateless (sem persistencia de historico).

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.3)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.4: Testes Unitarios (Orders/Reviews/AI)" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Cobrir os modulos de orders, reviews e ai com testes unitarios no backend seguindo padrao AAA.

## Escopo
- Criar/atualizar suites de testes dos modulos da Trilha 3.
- Cobrir cenarios de sucesso, validacao e erro para pedidos, reviews e IA.
- Garantir padrao AAA e nomes de testes em frases completas.

## Criterios de aceite
- Testes da Trilha 3 executando com sucesso no Jest.
- Casos criticos (estoque insuficiente, review duplicada, produto sem review para resumo, produto inexistente no chat) cobertos.
- Sem regressao nas suites existentes.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.4)
EOF

# ---------------------------
# Trilha 4 (Frontend)
# ---------------------------

gh issue create \
  --title "[FRONT] - Trilha 4.1: API Client com JWT em localStorage" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Criar cliente HTTP centralizado no frontend com JWT unico em localStorage e tratamento padrao de erros.

## Escopo
- Implementar shared/lib/api-client.ts.
- Armazenar token em localStorage (setToken/getToken).
- Enviar Authorization Bearer para rotas autenticadas.
- Atualizar shared/lib/api/auth.ts para login/register/logout sem refresh token.

## Criterios de aceite
- Requisicoes autenticadas enviam Authorization quando aplicavel.
- Nao existe fluxo de refresh token ou cookie de sessao.
- Erros retornam ApiError com status e payload.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.1)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.2: Contexto de Autenticacao" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Implementar contexto de autenticacao para sessao do usuario com login, logout, registro e restauracao de sessao.

## Escopo
- Criar features/auth/model/auth-context.tsx.
- Expor AuthProvider e hook useAuth.
- Restaurar sessao via localStorage em useEffect (SSR-safe).
- Integrar AuthProvider ao layout da aplicacao.

## Criterios de aceite
- Sessao inicial restaura token/usuario via localStorage.
- Acoes de login/logout/register atualizam estado de autenticacao.
- Rotas/componentes conseguem consumir estado do usuario com seguranca.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.2)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.3: Paginas de Login e Registro" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Criar telas de autenticacao (login e cadastro) com validacao de formularios e integracao com o contexto de auth.

## Escopo
- Implementar paginas/componentes de login e registro.
- Tratar estados de loading, erro e sucesso.
- Garantir navegacao e feedback de UX coerentes.

## Criterios de aceite
- Usuario consegue autenticar e registrar com fluxo completo.
- Validacoes de formulario exibem mensagens claras.
- Fluxo pos-login redireciona para area apropriada.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.3)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.4: Middleware de Roteamento Simplificado" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Implementar middleware simplificado para roteamento geral, mantendo protecao de autenticacao no AuthContext (client-side).

## Escopo
- Garantir middleware sem dependencia de localStorage/cookies de refresh.
- Manter matcher para excluir assets estaticos.
- Documentar que protecao de rotas autenticadas fica no cliente.

## Criterios de aceite
- Middleware executa sem loops e sem erros de autenticacao no servidor.
- Fluxo de autenticacao continua funcional via AuthProvider no cliente.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.4)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.5: Pagina de Checkout PIX" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Implementar pagina de checkout com endereco, exibicao de chave PIX estatica + QR code e confirmacao de pedido.

## Escopo
- Criar app/checkout/page.tsx e componentes de checkout.
- Exibir dados do carrinho local (Zustand) e total da compra.
- Implementar fluxo de confirmacao via POST /api/orders.
- Implementar copia de chave PIX e feedback visual.

## Criterios de aceite
- Fluxo endereco -> PIX -> confirmacao funciona sem Stripe.
- Pedido criado com sucesso limpa carrinho e redireciona para detalhe do pedido.
- Erros de criacao de pedido sao exibidos ao usuario.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.5)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.6: Review UI" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Implementar interface de reviews no detalhe do produto com formulario autenticado e listagem de avaliacoes.

## Escopo
- Criar review-form.tsx com titulo, corpo e rating (1-5).
- Bloquear envio para usuario nao autenticado.
- Criar review-list.tsx com media de nota e lista de reviews.

## Criterios de aceite
- Usuario autenticado consegue enviar review e ver feedback de erro/sucesso.
- Usuario sem login recebe orientacao para autenticar.
- Listagem exibe media e dados basicos das avaliacoes.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.6)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.7: AI Features UI (Resumo + Chat)" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Implementar interface de features de IA no detalhe do produto: botao de resumo e drawer de chat stateless.

## Escopo
- Criar ai-summary-button.tsx para GET /api/products/:id/ai-summary.
- Criar product-chat-drawer.tsx para POST /api/products/:id/chat.
- Manter historico de chat apenas em estado React (sem persistencia).
- Tratar estados de loading e erro nas duas experiencias.

## Criterios de aceite
- Resumo de IA e exibido quando a API responde com sucesso.
- Chat responde mensagens e exibe fallback em caso de erro.
- Fechar o drawer descarta historico local da conversa.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.7)
EOF

# ---------------------------
# Trilha 5 (Convergencia)
# ---------------------------

gh issue create \
  --title "[FRONT] - Trilha 5.1: Integracao Frontend-Backend (Produtos/Reviews/Chat)" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Substituir mocks do frontend por integracao real com API para produtos, reviews, chat IA e fluxo de pedidos.

## Escopo
- Implementar productsApi em shared/lib/api/products.ts.
- Implementar reviewsApi em shared/lib/api/reviews.ts.
- Implementar chatApi em shared/lib/api/chat.ts.
- Manter CartContext 100% localStorage (sem sync com backend).

## Criterios de aceite
- Catalogo e detalhe de produto usam dados reais da API de produtos.
- Fluxo de reviews e chat usa endpoints reais.
- Checkout segue criando pedido via POST /api/orders com itens do store local.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (Tarefa 5.1)
EOF

gh issue create \
  --title "[FULL] - Trilha 5.3: JSDoc em Todos os Arquivos" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Aplicar JSDoc em arquivos TypeScript/TSX prioritarios no frontend e backend.

## Escopo
- Documentar utilitarios em shared/lib.
- Documentar hooks/contexts em features/*/model.
- Documentar componentes em features/*/components e shared/ui.
- Documentar modulos backend (controllers/services/repositories).

## Criterios de aceite
- JSDoc adicionado nas areas prioritarias da trilha.
- Contratos de entrada/saida e parametros principais documentados.
- Sem regressao funcional apos documentacao.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (Tarefa 5.3)
EOF

gh issue create \
  --title "[FULL] - Trilha 5.4: Cobertura de Testes >= 80%" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Garantir cobertura de testes minima de 80% com suites para auth context, reviews, resumo IA e chat.

## Escopo
- Criar/atualizar testes em features/auth/model.
- Criar/atualizar testes em features/product-detail/components.
- Validar cobertura com npm run test:coverage no frontend.
- Garantir manutencao do threshold minimo no backend.

## Criterios de aceite
- Relatorio de cobertura >= 80% em lines/functions/branches/statements.
- Testes de cenarios principais e de erro para novas features passam.
- Sem regressao em suites existentes.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (Tarefa 5.4)
EOF

gh issue create \
  --title "[BACK] - Trilha 5.5: CI/CD Atualizado (Frontend + Backend)" \
  --label backend \
  --body-file - <<'EOF'
## Resumo
Atualizar pipeline CI para validar frontend e backend com type-check, testes, cobertura e build.

## Escopo
- Atualizar .github/workflows/ci.yml com job frontend completo.
- Garantir job backend com type-check, migrations e testes.
- Publicar artefato Playwright em caso de falha E2E.

## Criterios de aceite
- Pipeline executa para push/PR em main e develop.
- Jobs frontend e backend executam com sucesso em ambiente limpo.
- Falha em validacao bloqueia merge da PR.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (Tarefa 5.5)
EOF

gh issue create \
  --title "[FULL] - Trilha 5.6: Variaveis de Ambiente Documentadas" \
  --label frontend \
  --body-file - <<'EOF'
## Resumo
Documentar variaveis de ambiente necessarias para frontend e backend no .env.example.

## Escopo
- Incluir NEXT_PUBLIC_API_URL e NEXT_PUBLIC_PIX_KEY.
- Incluir DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, LLM_PROVIDER_API_KEY e LLM_PROVIDER_MODEL.
- Revisar docs para remover referencias a Stripe e refresh token.

## Criterios de aceite
- .env.example cobre todas as variaveis essenciais do MVP Lean.
- Documentacao coerente com ADR-007 a ADR-010.
- Nenhuma secret real commitada no repositorio.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (Tarefa 5.6)
EOF

echo "Concluido: comandos de criacao de issues executados com sucesso."
