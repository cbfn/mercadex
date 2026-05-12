# PRD - Módulo de Checkout

## Objetivo do Módulo

O checkout do Mercadex é o fluxo final de compra que converte itens no carrinho em pedidos confirmados. Deve ser rápido, seguro e inspirar confiança no usuário, reduzindo abandono de carrinho através de um processo direto em 3 etapas (entrega → pagamento → confirmação).

---

## Personas

### 1. **Comprador Casual (B2C)**
- **Contexto:** Usuário mobile-first, busca produtos eletrônicos (fones, adaptadores, cabos).
- **Objetivo:** Finalizar compra em menos de 2 minutos, sem fricção.
- **Pain points:** 
  - Preocupação com prazos de entrega
  - Não quer fornecer dados desnecessários
  - Suspeita de segurança em pagamentos online

### 2. **Comprador Profissional (PME)**
- **Contexto:** Pequeno varejista ou freelancer comprando componentes em volume.
- **Objetivo:** Completar pedidos de forma eficiente, com histórico rastreável.
- **Pain points:**
  - Precisa de recibos/comprovantes para reembolso
  - Múltiplas entregas (endereços diferentes) não são críticos no MVP
  - Deseja confirmar antes de pagar (revisão do pedido)

### 3. **Operador Mercadex (Admin)**
- **Contexto:** Time de suporte ou financeiro gerenciando disputas e reembolsos.
- **Objetivo:** Acessar dados de pagamento e histórico de transações para troubleshooting.
- **Pain points:**
  - Necessidade de rastreamento de transações para compliance
  - Tratamento de pagamentos falhados ou cancelados

---

## Regras Básicas de Pagamento (MVP)

### Métodos Aceitos
- **PIX** — Único método implementado no MVP. Transação imediata via QR code ou copia-e-cola.
- **Cartão de Crédito/Débito** (planejado pós-MVP) — Via gateway (ex: Stripe, Mercado Pago)
- **Boleto bancário** (planejado pós-MVP)

### Limites de Transação
- **Mínimo:** R$ 10,00
- **Máximo:** R$ 10.000,00 por transação
- Sem limite de quantidade de transações por usuário/dia (sujeito a análise de fraude futura)

### Fluxo de Pagamento

```
1. CARRINHO → CHECKOUT
   ├─ Usuário clica "Finalizar compra"
   └─ Redireciona para fluxo 3-etapas

2. ETAPA 1 - ENTREGA
   ├─ Coletar endereço de entrega (obrigatório)
   ├─ Exibir opções de frete (padrão: CEP único)
   └─ Confirmar prosseguimento

3. ETAPA 2 - PAGAMENTO
   ├─ Exibir resumo do pedido (itens + frete + total)
   ├─ Método de pagamento: PIX (único método disponível no MVP)
   ├─ Para PIX:
   │  ├─ Gerar QR code + cópia e cola
   │  ├─ Exibir timeout de 10 minutos
   │  └─ Verificar confirmação via webhook (não polling)
   └─ Confirmação de pagamento (sucesso/falha)

4. ETAPA 3 - CONFIRMAÇÃO
   ├─ Exibir número do pedido
   ├─ Resumo do pagamento
   ├─ Rastreamento será enviado por email
   └─ Link para "Voltar ao catálogo" ou "Ver meus pedidos"
```

### Tratamento de Erros

| Cenário | Comportamento |
|---------|---|
| **Pagamento falhado** | Exibir mensagem clara ("Falha ao processar PIX") + opção de tentar novamente |
| **Timeout PIX (10min)** | Exibir aviso e permitir gerar novo QR code |
| **Carrinho alterado** | Se item foi removido do estoque durante checkout, notificar e permitir revisão |
| **Sessão expirada** | Salvar carrinho localmente; ao voltar, restaurar estado de checkout |

### Validações Obrigatórias

- **Endereço:** CEP válido, rua, número, complemento (opcional), cidade, estado
- **Email:** Formato válido (para confirmação de pedido)
- **Telefone:** Formato brasileiro (11 dígitos com DDD)
- **Dados de pagamento:** Verificação via gateway (não armazenar dados sensíveis no frontend)

### Segurança Mínima (MVP)

- **HTTPS obrigatório** — Todas as comunicações criptografadas
- **PCI-DSS compliance:** Não armazenar dados de PIX no banco local; delegar ao gateway
- **Rate limiting:** Máx 5 tentativas de pagamento falhado por sessão
- **CSRF tokens:** Validar origem de requisições POST
- **Logs de auditoria:** Registrar tentativas de pagamento (não dados sensíveis)

---

## Dados do Pedido (Schema)

```javascript
{
  orderId: "ORD-2026-001234",
  userId: "user-uuid",
  status: "pending_payment" | "paid" | "failed" | "cancelled",
  items: [
    { productId, name, price, quantity, subtotal }
  ],
  shipping: {
    address: { street, number, complement, cep, city, state },
    method: "standard",
    cost: 15.00,
    estimatedDelivery: "2026-05-20"
  },
  payment: {
    method: "pix" | "credit_card" | "debit_card",
    transactionId: "gateway-ref-id",
    amount: 199.90,
    status: "pending" | "confirmed" | "failed",
    timestamp: "2026-05-11T14:30:00Z"
  },
  user: {
    email,
    phone,
    name
  },
  createdAt: "2026-05-11T14:30:00Z",
  updatedAt: "2026-05-11T14:30:00Z"
}
```

---

## Próximos Passos (Fora MVP)

- [ ] Débito/crédito via gateway
- [ ] Boleto bancário
- [ ] Múltiplos endereços de entrega
- [ ] Cupons de desconto
- [ ] Previsão de frete dinâmica (integração com transportadora)
- [ ] Dashboard de pedidos do usuário com rastreamento em tempo real

---

## Referências

- Ver `docs/ADR.md` para decisões arquiteturais de segurança e infraestrutura
- Frontend: `frontend/js/main.js` (estado e fluxo atual)
- Backend: `backend/src/modules/checkout/` (estrutura planejada)
