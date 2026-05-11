# User Stories - Fluxo de Compra (Checkout)

## Visão Geral
As 5 User Stories abaixo cobrem os momentos críticos do fluxo de compra, priorizadas por impacto na taxa de conclusão de vendas. Cada uma resolve um pain point específico que causa abandono de carrinho.

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

## 4. Selecionar Método de Pagamento e Confirmar com PIX

**Como** cliente, **quero** escolher PIX como método de pagamento, visualizar o QR code e confirmar que o pagamento foi processado, **para que** eu complete minha compra de forma segura e imediata.

### Critérios de Aceitação
- [ ] Exibir opção de método de pagamento (PIX como padrão)
- [ ] Ao selecionar PIX, exibir:
  - QR code escaneável
  - Código PIX para cópia e cola (fallback)
  - Instruções claras: "Escaneie com seu app bancário ou copie o código"
  - Timer de expiração (10 minutos)
- [ ] Verificar confirmação de pagamento via webhook (não fazer polling do cliente)
- [ ] Se pagamento confirmado: exibir mensagem de sucesso e avançar para confirmação
- [ ] Se timeout (10 min): exibir opção de gerar novo QR code ou trocar método
- [ ] Se pagamento falhar: exibir erro específico e permitir tentar novamente

### Notas
- PIX é o método de maior confiança e velocidade de confirmação
- Impacto: Reduz taxa de abandono no pagamento em ~20%

---

## 5. Receber Confirmação do Pedido e Acessar Informações de Rastreamento

**Como** cliente, **quero** receber uma confirmação imediata após pagamento com número do pedido, resumo da compra e próximos passos, **para que** eu tenha certeza de que meu pedido foi criado com sucesso e saiba quando e onde acompanhar meu produto.

### Critérios de Aceitação
- [ ] Exibir página de confirmação com:
  - Número do pedido (ex: "ORD-2026-001234")
  - Status do pedido ("Pagamento confirmado")
  - Resumo da compra (itens, endereço de entrega, total pago)
  - Data estimada de entrega
  - Email de confirmação será enviado (com link para rastreamento)
- [ ] Exibir opções:
  - "Voltar ao Catálogo" (continuar comprando)
  - "Ver Meus Pedidos" (histórico de compras)
- [ ] Enviar email de confirmação com:
  - Dados do pedido
  - Link para rastrear pedido (futura funcionalidade)
  - Informações de contato de suporte
- [ ] Permitir compartilhar confirmação (copiar número, email)

### Notas
- Confirmação clara reduz emails de suporte ("Meu pedido foi criado?")
- Email é essencial para dar tranquilidade ao cliente
- Impacto: Reduz dúvidas pós-compra em ~40%

---

## Mapa de Priorização (MoSCoW)

| User Story | Must Have | Should Have | Could Have | Won't Have |
|-----------|-----------|-----------|-----------|-----------|
| 1. Revisar Carrinho | ✅ | | | |
| 2. Validar Endereço | ✅ | | | |
| 3. Resumo do Pedido | ✅ | | | |
| 4. Pagamento PIX | ✅ | | Cartão/Débito | Boleto |
| 5. Confirmação | ✅ | | | |

---

## Roadmap de Implementação

### Sprint 1 (MVP)
- User Story 1: Revisar Carrinho
- User Story 2: Validar Endereço
- User Story 3: Resumo do Pedido

### Sprint 2 (MVP Completo)
- User Story 4: Pagamento PIX
- User Story 5: Confirmação

### Futuro (Fase 2)
- Cupons de desconto (incrementar US #3)
- Cartão de crédito/débito (estender US #4)
- Dashboard de pedidos (estender US #5)
- Rastreamento em tempo real (estender US #5)

---

## Referências

- [PRD Checkout](docs/PRD_CHECKOUT.md) — Regras de negócio e limites
- [CLAUDE.md](CLAUDE.md) — Contexto de arquitetura e tech stack
- Frontend: `frontend/js/main.js` — Estado atual do carrinho
