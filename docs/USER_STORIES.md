# User Stories - Fluxo de Compra (Checkout)

## Visão Geral
As 5 User Stories abaixo cobrem os momentos críticos do fluxo de compra, priorizadas por impacto na taxa de conclusão de vendas. Cada uma resolve um pain point específico que causa abandono de carrinho.

## Status de Execucao (2026-05-20)

Este documento preserva o esperado original. Status real do ciclo:

| User Story | Status | Nota de execucao |
| --- | --- | --- |
| US-1 Carrinho | Implementado | Fluxo funcional no frontend com persistencia local |
| US-2 Endereco e CEP | Implementado | Consulta de CEP + fallback manual |
| US-3 Resumo do pedido | Implementado | Totalizacao e revisao antes do pagamento |
| US-4 PIX estatico | Implementado | Criacao de pedido com `PENDING_PIX` |
| US-5 Confirmacao | Parcial | Confirmacao implementada; rastreio avancado ficou para evolucao |
| US-6 Reviews | Implementado | Endpoints e interfaces de review ativos |
| US-7 AI Summary por produto | Planejado | Postergado por prazo no MVP Lean |
| US-8 Chat IA por produto | Planejado | Postergado por prazo no MVP Lean |

Escopo repensado por prazo: dashboard admin frontend, pagamento real com gateway e carrinho persistido no backend.

---

## 1. Revisar e Ajustar Carrinho Antes do Checkout

**Como** cliente, **quero** visualizar todos os itens no meu carrinho, alterar quantidades e remover produtos, **para que** eu tenha controle total sobre minha compra e confiança de que vou pagar apenas pelo que realmente desejo.

### Critérios de Aceitação
- [ ] Exibir lista de todos os produtos no carrinho com imagem, nome, preço unitário e quantidade
- [ ] Permitir aumentar/diminuir quantidade com botões (+/-) sem remover o item
- [ ] Permitir remover item do carrinho com um clique
- [ ] Atualizar total da compra em tempo real conforme quantidade muda
- [ ] Exibir mensagem "Carrinho vazio" se todos os itens forem removidos
- [ ] Manter carrinho mesmo se o usuário sair e voltar (localStorage ou sessão)

### Notas
- Maior causa de abandono: cliente quer revisar antes de pagar
- Impacto: Reduz abandono em ~15-20%

---

## 2. Informar Endereço de Entrega e Validar CEP

**Como** cliente, **quero** inserir meu endereço de entrega e ter a certeza de que está correto antes de seguir para o pagamento, **para que** meu pedido chegue no lugar certo sem erros ou atrasos causados por dados incompletos.

### Critérios de Aceitação
- [ ] Exibir formulário com campos: CEP, Rua, Número, Complemento (opcional), Cidade, Estado
- [ ] Validar CEP em tempo real (8 dígitos, apenas números)
- [ ] Buscar endereço automaticamente via API de CEP (ex: ViaCEP) e pré-preencher Rua, Cidade, Estado
- [ ] Exibir erro claro se CEP é inválido ("CEP não encontrado")
- [ ] Exibir aviso se frete não está disponível para este CEP
- [ ] Permitir editar todos os campos manualmente mesmo após busca de CEP
- [ ] Mostrar prazo estimado de entrega com base no CEP (ex: "Entrega em 3-5 dias úteis")

### Notas
- Segunda maior causa de abandono: dados incompletos ou inválidos
- Impacto: Reduz erros de entrega e suporte em ~25%

---

## 3. Revisar Resumo do Pedido e Calcular Total Final

**Como** cliente, **quero** ver um resumo completo da minha compra (itens, frete, descontos e total final) antes de efetuar o pagamento, **para que** eu tenha certeza de que está tudo correto e não há surpresas no valor final.

### Critérios de Aceitação
- [ ] Exibir seção "Resumo do Pedido" com:
  - Lista de itens (produto, quantidade, preço unitário, subtotal)
  - Subtotal de produtos
  - Valor do frete
  - Aplicar desconto/cupom (se houver input disponível)
  - **Total final em destaque**
- [ ] Atualizar resumo em tempo real se cliente voltar para ajustar carrinho
- [ ] Exibir método de entrega selecionado
- [ ] Permitir editar quantidade de itens diretamente do resumo (sem voltar ao carrinho)
- [ ] Exibir "Continuar para Pagamento" apenas se resumo está completo

### Notas
- Transparência de preço é crítica para confiança
- Impacto: Reduz taxa de "surpresa no preço final" em ~30%

---

## 4. Selecionar Método de Pagamento e Confirmar com PIX Estático

**Como** cliente, **quero** visualizar a chave PIX e o QR Code após revisar meu pedido, **para que** eu possa realizar o pagamento e ter meu pedido registrado imediatamente.

### Critérios de Aceitação
- [ ] Exibir chave PIX estática (Copia e Cola) com botão "Copiar"
- [ ] Exibir QR Code fixo na mesma tela
- [ ] Exibir instruções: "Escaneie com seu app bancário ou copie a chave"
- [ ] Botão "Confirmar Pedido" cria o pedido via `POST /api/orders` com status `PENDING_PIX`
- [ ] Após confirmação, redirecionar para página de confirmação com número do pedido
- [ ] Limpar carrinho do `localStorage` após criação do pedido

### Notas
- PIX estático (MVP Lean): sem webhook, sem timer de expiração, sem gateway de pagamento
- Status inicial do pedido: `PENDING_PIX`. Confirmação manual via Prisma Studio
- Integração Stripe preservada em `/legacy` para retomada em sprint futura
- Impacto: valida fluxo completo de checkout sem dependência de infraestrutura de pagamento

---

## 5. Receber Confirmação do Pedido e Acessar Informações de Rastreamento

**Como** cliente, **quero** receber uma confirmação imediata após finalizar o pedido com número do pedido, resumo da compra e próximos passos, **para que** eu tenha certeza de que meu pedido foi criado com sucesso e saiba quando e onde acompanhar meu produto.

### Critérios de Aceitação
- [ ] Exibir página de confirmação com:
  - Número do pedido (ex: "ORD-2026-001234")
  - Status do pedido ("Aguardando pagamento PIX")
  - Resumo da compra (itens, endereço de entrega, total)
  - Data estimada de entrega
- [ ] Exibir opções:
  - "Voltar ao Catálogo" (continuar comprando)
  - "Ver Meus Pedidos" (histórico de compras — futuro)
- [ ] Enviar email de confirmação com dados do pedido e contato de suporte
- [ ] Permitir compartilhar confirmação (copiar número)

### Notas
- Confirmação clara reduz emails de suporte ("Meu pedido foi criado?")
- Impacto: Reduz dúvidas pós-compra em ~40%

---

## 6. Avaliar Produto (Review)

**Como** cliente logado, **quero** publicar uma avaliação de um produto com nota, título e descrição, **para que** outros compradores tenham informações reais sobre o produto antes de comprar.

### Critérios de Aceitação
- [ ] Botão "Escrever Avaliação" visível apenas para usuários logados
- [ ] Formulário com: nota 1-5 (stars), título (obrigatório), descrição (obrigatória)
- [ ] Apenas um review por usuário por produto
- [ ] Review publicado aparece imediatamente na lista do produto
- [ ] Usuário pode deletar o próprio review
- [ ] Usuários não logados veem as reviews mas não podem postar

### Notas
- Reviews alimentam as features de IA (US-7 e US-8)
- Unicidade `(userId, productId)` garantida no banco

---

## 7. Ver Resumo de IA das Avaliações (Insight da IA)

**Como** visitante na página de um produto, **quero** ver um resumo conciso das avaliações gerado por IA, **para que** eu entenda rapidamente os pontos positivos e negativos sem precisar ler cada review individualmente.

### Critérios de Aceitação
- [ ] Botão "Ver Insight da IA" visível na página do produto (não requer login)
- [ ] Ao clicar, exibir estado de loading enquanto aguarda resposta
- [ ] Exibir resumo de 3 frases sobre pontos positivos e negativos
- [ ] Se não houver reviews: exibir "Ainda sem avaliações suficientes para gerar resumo"
- [ ] Se a API de IA falhar: exibir mensagem de erro amigável com opção de tentar novamente

### Notas
- Endpoint: `GET /api/products/:id/ai-summary`
- Backend busca reviews, envia para LLM, retorna resumo. JSDoc obrigatório no service.

---

## 8. Tirar Dúvida sobre Produto com IA (Chat de Produto)

**Como** visitante, **quero** fazer perguntas sobre as especificações de um produto e receber respostas baseadas nas informações reais do produto e das avaliações, **para que** eu tome uma decisão de compra mais informada.

### Critérios de Aceitação
- [ ] Botão "Tirar Dúvida" abre um chat na página do produto (não requer login)
- [ ] Campo de texto para digitar pergunta e botão "Enviar"
- [ ] Exibir estado de loading enquanto aguarda resposta da IA
- [ ] Resposta exibida no chat com base nas specs do produto e reviews existentes
- [ ] Histórico de conversa mantido apenas no estado React (sem persistência no banco)
- [ ] Ao fechar o chat, o histórico é descartado
- [ ] Se a API de IA falhar: exibir erro amigável

### Notas
- Endpoint: `POST /api/products/:id/chat` com `{ message: string }`
- Backend stateless: não persiste histórico de conversa
- JSDoc obrigatório no controller e no service de IA

---

## Mapa de Priorização (MoSCoW)

| User Story | Must Have | Should Have | Could Have | Won't Have (MVP) |
|-----------|-----------|-----------|-----------|------------------|
| 1. Revisar Carrinho | ✅ | | | |
| 2. Validar Endereço | ✅ | | | |
| 3. Resumo do Pedido | ✅ | | | |
| 4. Pagamento PIX Estático | ✅ | | PIX real/Stripe | |
| 5. Confirmação | ✅ | | | |
| 6. Review de Produto | ✅ | | | |
| 7. Resumo IA (Insight) | ✅ | | | |
| 8. Chat de Produto IA | ✅ | | | |
| Dashboard Admin | | | | ❌ Prisma Studio |

---

## Roadmap de Implementação

### Sprint 1 (MVP)
- User Story 1: Revisar Carrinho
- User Story 2: Validar Endereço
- User Story 3: Resumo do Pedido

### Sprint 2 (MVP Completo)
- User Story 4: Pagamento PIX Estático
- User Story 5: Confirmação
- User Story 6: Reviews
- User Story 7: Resumo IA
- User Story 8: Chat de Produto IA

### Futuro (Fase 2)
- Cupons de desconto (incrementar US #3)
- PIX real via gateway / Stripe (estender US #4 — código em `/legacy`)
- Dashboard de pedidos (estender US #5)
- Rastreamento em tempo real (estender US #5)
- Carrinho persistido no banco (código em `schema.prisma` comentado)

---

## Referências

- [PRD Checkout](docs/PRD_CHECKOUT.md) — Regras de negócio e limites
- [CLAUDE.md](CLAUDE.md) — Contexto de arquitetura e tech stack
- Frontend: `frontend/js/main.js` — Estado atual do carrinho
