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
  --title "[BACK] - Trilha 3.1: Modulo de Carrinho" \
  --label backend \
  --assignee cbfn \
  --body-file - <<'EOF'
## Resumo
Implementar o modulo de carrinho persistido no backend com operacoes de listar, adicionar, atualizar quantidade, remover item e limpar carrinho.

## Escopo
- Criar camada de DTO, repository, service, controller e routes em backend/src/modules/cart.
- Expor endpoints autenticados de carrinho.
- Garantir calculo de total no retorno do carrinho.

## Criterios de aceite
- Endpoints /api/cart e /api/cart/items funcionando com autenticacao.
- Persistencia em banco validada para operacoes CRUD do carrinho.
- Fluxo de limpeza do carrinho retornando estado vazio.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.1)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.2: Modulo de Pedidos" \
  --label backend \
  --assignee lpradopires \
  --body-file - <<'EOF'
## Resumo
Implementar o modulo de pedidos no backend, criando pedido a partir do carrinho com validacao de estoque e transacao.

## Escopo
- Criar DTO, repository, service, controller e routes em backend/src/modules/orders.
- Implementar criacao de pedido com decremento de estoque e limpeza do carrinho.
- Implementar listagem e detalhe de pedidos por usuario.

## Criterios de aceite
- POST /api/orders cria pedido com itens do carrinho e endereco de entrega.
- GET /api/orders e GET /api/orders/:id retornam dados consistentes.
- Falhas de carrinho vazio/estoque insuficiente tratadas corretamente.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.2)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.3: Integracao Stripe no Backend" \
  --label backend \
  --assignee henriqueferraz \
  --body-file - <<'EOF'
## Resumo
Integrar Stripe no backend para iniciar pagamento de pedidos e registrar status de transacao.

## Escopo
- Criar servico de pagamento Stripe para PaymentIntent.
- Expor endpoint para iniciar pagamento de pedido.
- Tratar webhook/eventos para atualizar status do pedido/pagamento.

## Criterios de aceite
- Fluxo de criacao de PaymentIntent funcional com chaves de teste.
- Atualizacao de status de pagamento refletida no pedido.
- Validacoes e erros de pagamento padronizados na API.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.3)
EOF

gh issue create \
  --title "[BACK] - Trilha 3.4: Testes Unitarios Backend (Carrinho/Pedidos/Stripe)" \
  --label backend \
  --assignee henriqueferraz \
  --body-file - <<'EOF'
## Resumo
Cobrir os modulos de carrinho, pedidos e integracao Stripe com testes unitarios/integracao no backend.

## Escopo
- Criar/atualizar suites de testes dos modulos da Trilha 3.
- Cobrir cenarios de sucesso, validacao e erro.
- Garantir padrao AAA e nomes descritivos de testes.

## Criterios de aceite
- Testes da Trilha 3 executando com sucesso no Jest.
- Casos criticos (carrinho vazio, estoque insuficiente, erro de pagamento) cobertos.
- Sem regressao nas suites existentes.

## Referencia
- tasks/trilha-3-backend-carrinho-pagamentos.md (Tarefa 3.4)
EOF

# ---------------------------
# Trilha 4 (Frontend)
# ---------------------------

gh issue create \
  --title "[FRONT] - Trilha 4.1: API Client com JWT e Refresh" \
  --label frontend \
  --assignee mateus-bernart \
  --body-file - <<'EOF'
## Resumo
Criar cliente HTTP centralizado no frontend com suporte a access token, refresh automatico e tratamento padrao de erros.

## Escopo
- Implementar shared/lib/api-client.ts.
- Gerenciar access token em memoria.
- Implementar retry apos refresh token via cookie HTTP-only.

## Criterios de aceite
- Requisicoes autenticadas enviam Authorization quando aplicavel.
- Fluxo 401 tenta refresh e repete requisicao automaticamente.
- Erros retornam ApiError com status e payload.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.1)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.2: Contexto de Autenticacao" \
  --label frontend \
  --assignee mateus-bernart \
  --body-file - <<'EOF'
## Resumo
Implementar contexto de autenticacao para sessao do usuario com login, logout, registro e restauracao de sessao.

## Escopo
- Criar features/auth/model/auth-context.tsx.
- Expor AuthProvider e hook useAuth.
- Integrar AuthProvider ao layout da aplicacao.

## Criterios de aceite
- Sessao inicial tenta recuperar usuario via endpoint me().
- Acoes de login/logout/register atualizam estado de autenticacao.
- Rotas/componentes conseguem consumir estado do usuario com seguranca.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.2)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.3: Paginas de Login e Registro" \
  --label frontend \
  --assignee mateus-bernart \
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
  --title "[FRONT] - Trilha 4.4: Middleware de Protecao de Rotas" \
  --label frontend \
  --assignee EndryoBittencourt \
  --body-file - <<'EOF'
## Resumo
Adicionar middleware/protecao de rotas no frontend para restringir acesso a paginas autenticadas e administrativas.

## Escopo
- Implementar regras de acesso por autenticacao e perfil.
- Redirecionar usuario nao autenticado para login.
- Redirecionar usuario sem permissao para pagina adequada.

## Criterios de aceite
- Rotas protegidas exigem sessao valida.
- Rotas admin bloqueiam usuarios sem role ADMIN.
- Fluxo de redirecionamento nao gera loop.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.4)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.5: Dashboard Administrativo" \
  --label frontend \
  --assignee EndryoBittencourt \
  --body-file - <<'EOF'
## Resumo
Implementar dashboard administrativo para gestao de produtos com listagem, filtros e acoes principais.

## Escopo
- Criar interface do dashboard admin.
- Integrar listagem e estados de carregamento/erro.
- Preparar acoes de criacao/edicao/remocao de itens.

## Criterios de aceite
- Dashboard renderiza lista de produtos com usabilidade adequada.
- Acoes administrativas basicas ficam acessiveis e funcionais.
- Experiencia responsiva e consistente com design system.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.5)
EOF

gh issue create \
  --title "[FRONT] - Trilha 4.6: Formulario de Produto (Criacao e Edicao)" \
  --label frontend \
  --assignee EndryoBittencourt \
  --body-file - <<'EOF'
## Resumo
Criar formulario de produto para fluxo administrativo de criacao e edicao com validacoes e experiencia consistente.

## Escopo
- Implementar formulario com campos essenciais de produto.
- Adicionar validacoes e mensagens de erro amigaveis.
- Integrar fluxo de submit com camada de dados definida na trilha.

## Criterios de aceite
- Cadastro e edicao de produto funcionam ponta a ponta no frontend.
- Validacoes impedem envio de dados invalidos.
- Estados de loading/sucesso/erro cobertos.

## Referencia
- tasks/trilha-4-frontend-auth-dashboard.md (Tarefa 4.6)
EOF

# ---------------------------
# Trilha 5 (Convergencia) - 1 issue por frente
# ---------------------------

gh issue create \
  --title "[BACK] - Trilha 5: Qualidade Back (JSDoc e Cobertura)" \
  --label backend \
  --assignee cbfn \
  --body-file - <<'EOF'
## Resumo
Consolidar qualidade do backend com documentacao JSDoc, cobertura de testes e robustez de contratos da API.

## Escopo
- Aplicar/validar JSDoc em modulos e utilitarios compartilhados.
- Revisar cobertura de testes do backend com meta minima de 80%.
- Garantir padronizacao de erros e respostas da API.

## Criterios de aceite
- Backend documentado nas areas criticas com JSDoc.
- Threshold de cobertura do backend atendido.
- Sem regressao em suites existentes.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (frente: Qualidade Back)
EOF

gh issue create \
  --title "[FRONT] - Trilha 5: Integracao Stripe FE" \
  --label frontend \
  --assignee lpradopires \
  --body-file - <<'EOF'
## Resumo
Integrar o fluxo de pagamento Stripe no frontend para concluir checkout com confirmacao de pagamento.

## Escopo
- Integrar @stripe/stripe-js e @stripe/react-stripe-js.
- Implementar formulario de pagamento com PaymentElement.
- Tratar sucesso/erro de confirmacao de pagamento.

## Criterios de aceite
- Checkout frontend consegue iniciar e confirmar pagamento com Stripe teste.
- Erros de pagamento sao exibidos com clareza ao usuario.
- Fluxo de sucesso encaminha para confirmacao do pedido.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (frente: Integracao Stripe FE)
EOF

gh issue create \
  --title "[BACK] - Trilha 5: Infra e CI/CD" \
  --label backend \
  --assignee henriqueferraz \
  --body-file - <<'EOF'
## Resumo
Fortalecer esteira de infraestrutura e CI/CD para validacao automatica de qualidade no repositorio.

## Escopo
- Revisar e atualizar workflow de CI para lint, type-check e testes.
- Garantir execucao previsivel para frontend e backend.
- Ajustar gates de qualidade e relatorios de cobertura.

## Criterios de aceite
- Pipeline executa com sucesso em PR para develop.
- Etapas criticas de validacao ficam obrigatorias.
- Falhas de qualidade bloqueiam merge automaticamente.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (frente: Infra/CI-CD)
EOF

gh issue create \
  --title "[FRONT] - Trilha 5: Integracao API (Frontend-Backend)" \
  --label frontend \
  --assignee mateus-bernart \
  --body-file - <<'EOF'
## Resumo
Substituir mocks no frontend por integracao real com API backend para produtos, carrinho e fluxos administrativos.

## Escopo
- Implementar clientes de API de produtos e carrinho.
- Atualizar hooks/admin para consumo de API real.
- Sincronizar estado do carrinho com backend quando autenticado.

## Criterios de aceite
- Catalogo e dashboard usam dados reais da API.
- Fluxos de carrinho funcionam com backend para usuario logado.
- Mocks removidos dos fluxos integrados da trilha.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (frente: Integracao API)
EOF

gh issue create \
  --title "[FRONT] - Trilha 5: Polimento UX e Fluxos Finais" \
  --label frontend \
  --assignee EndryoBittencourt \
  --body-file - <<'EOF'
## Resumo
Refinar experiencia de usuario nos fluxos finais de autenticacao, dashboard, carrinho e checkout apos integracao.

## Escopo
- Revisar microcopys, estados vazios, erros e carregamento.
- Ajustar acessibilidade e consistencia visual conforme design system.
- Validar responsividade e navegacao dos fluxos principais.

## Criterios de aceite
- Fluxos principais apresentam UX consistente e clara.
- Estados de erro/sucesso/carga cobertos visualmente.
- Ajustes respeitam docs/DESIGN_SYSTEM.md.

## Referencia
- tasks/trilha-5-integracao-qualidade.md (frente: Polimento UX)
EOF

echo "Concluido: comandos de criacao de issues executados com sucesso."
