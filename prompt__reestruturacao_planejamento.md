# Instrução de Reestruturação Estratégica: Projeto Mercadex

## 🎯 Objetivo
Realizar um pivot técnico para uma versão **MVP Lean**. O foco é reduzir a complexidade de infraestrutura (Pagamentos e Banco de Dados) e adicionar diferenciais competitivos baseados em **IA (Social Proof e Atendimento)**.

---

## 🛠️ 1. Redução de Escopo (Cortes Estratégicos)
As funcionalidades das Trilhas [Trilha 3 — Backend: Carrinho e Pagamentos](tasks/trilha-3-backend-carrinho-pagamentos.md), [Trilha 4 — Frontend: Auth e Dashboard](tasks/trilha-4-frontend-auth-dashboard.md) e [Trilha 5 — Integração e Qualidade](tasks/trilha-5-integracao-qualidade.md) devem ser simplificadas conforme as diretrizes abaixo:

- **Pagamento (PIX Fake):** Remover toda a integração com Stripe SDK/Elements. O fluxo de pagamento será substituído por uma página de "Checkout de Sucesso" contendo uma chave PIX estática (Copia e Cola) e um QR Code fixo. O status do pedido no banco deve iniciar como `PENDING_PIX`.
- **Carrinho (Client-Side):** Descontinuar a persistência de itens do carrinho no banco de dados. A gestão do carrinho deve ser feita 100% via **LocalStorage** no Frontend. O backend deve apenas receber o array de produtos final no ato da criação do pedido (`POST /api/orders`).
- **Dashboard Admin:** Não desenvolver telas de administração no frontend. Toda a gestão de estoque, visualização de pedidos e alteração de status será realizada via **Prisma Studio**.
- **Autenticação Simplificada:** Substituir a lógica complexa de Refresh Tokens por um **JWT único com expiração de 7 dias**, simplificando o middleware e os interceptores de API.

---

## 🤖 2. Novas Funcionalidades (IA & Social Proof)
Implementar a base para as seguintes features de inteligência:

- **Sistema de Reviews:**
  - Criar tabela `Review` (Título, Descrição, Rating 1-5) vinculada a `User` e `Product`.
  - Apenas usuários logados podem postar.
- **Resumo de IA (Insight da IA):**
  - Service no backend para enviar reviews de um produto para uma LLM.
  - O retorno deve ser um resumo conciso de 3 frases sobre os pontos positivos e negativos baseados no feedback real dos usuários.
- **Chat de Produto (Stateless):**
  - Endpoint `POST /api/products/:id/chat`.
  - A IA deve responder dúvidas baseando-se nas especificações técnicas do produto e nas reviews existentes.
  - **Nota:** O histórico de mensagens deve residir apenas no estado do React (frontend), sem persistência no banco de dados para este MVP.

---

## 🏗️ 3. Arquitetura e Débito Técnico
- **Preservação:** Não delete o código ou interfaces já criadas para o Stripe ou persistência de carrinho. Mova-os para uma pasta `/legacy` ou arquivos `.old`, pois serão retomados em sprints futuras.
- **Modularidade:** Mantenha a separação rígida entre Services, Repositories e Controllers.
- **Documentação:** Manter a obrigatoriedade de **JSDoc** para todos os novos contratos de API e utilitários de IA.

---

## 🚀 4. Ordem de Trabalho (Apenas Reestruturação)
Neste momento, **não implemente o código**. Sua tarefa é apenas:
1. Reestruturar o plano de arquivos e o `schema.prisma` com as novas tabelas de Review.
2. Mapear os novos contratos de API (Endpoints) necessários para o fluxo Pix e Chat.
3. Confirmar o entendimento deste novo escopo simplificado.