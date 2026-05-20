# Backlog com Critérios de Aceitação (BDD)

## Status Consolidado do Ciclo (2026-05-20)

Este backlog preserva o esperado original das trilhas. Para evitar ambiguidade, o status real de execucao neste ciclo e:

| Historia | Status no ciclo | Observacao |
| --- | --- | --- |
| 1. Revisar/Ajustar carrinho | Implementado | Carrinho 100% localStorage, com ajustes de quantidade/remocao e persistencia no mesmo navegador |
| 2. Endereco + CEP | Implementado | Consulta de CEP e fallback para preenchimento manual |
| 3. Resumo do pedido | Implementado | Resumo e total final no fluxo de checkout |
| 4. Pagamento PIX estatico | Implementado | Pedido criado com `PENDING_PIX` |
| 5. Confirmacao do pedido | Parcial | Confirmacao implementada; historico completo e rastreio avancado permanecem evolucao |
| 6. Reviews | Implementado | CRUD de reviews com regras de ownership/unicidade |
| 7. Resumo IA por produto | Planejado | Escopo mantido para proxima janela |
| 8. Chat IA por produto | Planejado | Escopo mantido para proxima janela |

Itens repensados por prazo (pivot MVP Lean): pagamento real via gateway, dashboard admin frontend e persistencia de carrinho no backend.

## História 1: Revisar e Ajustar Carrinho Antes do Checkout

**Descrição:** Como cliente, quero visualizar todos os itens no meu carrinho, alterar quantidades e remover produtos, para que eu tenha controle total sobre minha compra e confiança de que vou pagar apenas pelo que realmente desejo.

### Critérios de Aceitação

**Cenário 1: Visualizar carrinho com múltiplos produtos**
- Dado que o cliente adicionou 3 produtos diferentes ao carrinho
- Quando o cliente acessa a seção de carrinho
- Então deve ver uma lista com todos os 3 produtos, cada um mostrando: imagem em miniatura, nome, preço unitário, quantidade atual e subtotal

**Cenário 2: Aumentar quantidade de um produto**
- Dado que o cliente tem um produto no carrinho com quantidade 1
- Quando o cliente clica no botão "+" ao lado da quantidade
- Então a quantidade aumenta para 2 e o total da compra é atualizado automaticamente em tempo real

**Cenário 3: Diminuir quantidade de um produto**
- Dado que o cliente tem um produto no carrinho com quantidade 3
- Quando o cliente clica no botão "-" ao lado da quantidade
- Então a quantidade diminui para 2 e o total da compra é atualizado automaticamente

**Cenário 4: Remover produto do carrinho**
- Dado que o cliente tem 2 produtos no carrinho
- Quando o cliente clica no botão "Remover" ou ícone de lixeira para um produto
- Então esse produto é imediatamente removido da lista e o total da compra é recalculado

**Cenário 5: Carrinho persistente após sair e voltar**
- Dado que o cliente adicionou produtos ao carrinho e saiu do site
- Quando o cliente volta ao site depois de 1 hora
- Então o carrinho ainda contém todos os produtos que foram adicionados anteriormente

**Cenário 6: Carrinho vazio**
- Dado que o cliente removeu o último produto do seu carrinho
- Quando o carrinho fica vazio
- Então a página exibe a mensagem "Seu carrinho está vazio" e mostra um botão "Voltar ao Catálogo"

---

## História 2: Informar Endereço de Entrega e Validar CEP

**Descrição:** Como cliente, quero inserir meu endereço de entrega e ter a certeza de que está correto antes de seguir para o pagamento, para que meu pedido chegue no lugar certo sem erros ou atrasos causados por dados incompletos.

### Critérios de Aceitação

**Cenário 1: CEP válido com busca automática de endereço**
- Dado que o cliente está na etapa de entrega do checkout
- Quando o cliente insere um CEP válido (8 dígitos) no campo "CEP" e sai do campo
- Então os campos "Rua", "Cidade" e "Estado" são preenchidos automaticamente com dados corretos

**Cenário 2: CEP inválido com mensagem de erro**
- Dado que o cliente está na etapa de entrega
- Quando o cliente insere um CEP inválido (menos de 8 dígitos ou CEP inexistente) e sai do campo
- Então exibe mensagem de erro clara: "CEP não encontrado. Verifique o número informado." e os campos de endereço não são preenchidos

**Cenário 3: Frete indisponível para a região**
- Dado que o cliente preencheu um CEP válido que está fora da área de cobertura
- Quando o sistema verifica disponibilidade de frete para esse CEP
- Então exibe aviso: "Infelizmente não entregamos nesta região ainda. Tente outro CEP." com opção de voltar

**Cenário 4: Editar campos manualmente após busca de CEP**
- Dado que o sistema preencheu automaticamente os campos de endereço após busca de CEP
- Quando o cliente edita manualmente os campos "Número", "Complemento" ou qualquer outro campo
- Então os dados inseridos manualmente são preservados e o cliente pode continuar

**Cenário 5: Exibir prazo estimado de entrega**
- Dado que o cliente preencheu um CEP válido com frete disponível
- Quando a busca de CEP é concluída com sucesso
- Então exibe o prazo estimado: "Entrega em 3-5 dias úteis" ou similar, baseado no CEP

**Cenário 6: Formulário de entrega incompleto**
- Dado que o cliente tenta avançar para a próxima etapa (pagamento)
- Quando há campos obrigatórios vazios (CEP, Rua, Número, Cidade, Estado)
- Então um aviso aparece indicando quais campos precisam ser preenchidos e o avanço é bloqueado

---

## História 3: Revisar Resumo do Pedido e Calcular Total Final

**Descrição:** Como cliente, quero ver um resumo completo da minha compra (itens, frete, descontos e total final) antes de efetuar o pagamento, para que eu tenha certeza de que está tudo correto e não há surpresas no valor final.

### Critérios de Aceitação

**Cenário 1: Exibir resumo completo do pedido**
- Dado que o cliente está na etapa de pagamento
- Quando carrega a página de resumo
- Então visualiza uma seção "Resumo do Pedido" contendo: lista de produtos (nome, qtd, preço unitário, subtotal), subtotal de produtos, valor do frete, total final em destaque, e método de entrega selecionado

**Cenário 2: Cálculo correto do total**
- Dado que o cliente tem no carrinho: Produto A (R$ 100 x 2 = R$ 200) e Produto B (R$ 50 x 1 = R$ 50)
- Quando o sistema calcula o total com frete de R$ 15
- Então exibe: Subtotal R$ 250 + Frete R$ 15 = Total Final R$ 265

**Cenário 3: Atualizar resumo ao voltar para carrinho**
- Dado que o cliente estava na página de pagamento e voltou para ajustar a quantidade de um produto
- Quando o cliente retorna à página de resumo do pedido
- Então o resumo exibe a quantidade atualizada e o novo total é recalculado corretamente

**Cenário 4: Editar quantidade diretamente do resumo**
- Dado que o cliente está visualizando o resumo do pedido
- Quando o cliente clica no botão "-" ao lado da quantidade de um produto no resumo
- Então a quantidade diminui, o subtotal desse produto é recalculado e o total final é atualizado

**Cenário 5: Botão "Continuar para Pagamento" bloqueado se dados incompletos**
- Dado que o cliente ainda não preencheu completamente os dados de entrega
- Quando tenta clicar em "Continuar para Pagamento"
- Então o botão está desabilitado/cinza e exibe um aviso: "Complete os dados de entrega antes de prosseguir"

**Cenário 6: Aplicar desconto/cupom (escopo futuro)**
- Dado que o cliente tem um cupom de desconto válido
- Quando insere o código do cupom no resumo e clica "Aplicar"
- Então o desconto é deduzido do subtotal e o total final é recalculado corretamente

---

## História 4: Selecionar Método de Pagamento e Confirmar com PIX Estático

**Descrição:** Como cliente, quero visualizar a chave PIX e o QR Code após revisar meu pedido, para que eu possa realizar o pagamento e ter meu pedido registrado imediatamente.

> **MVP Lean:** PIX estático fake. Sem gateway de pagamento, sem webhook, sem timer de expiração. O pedido é criado com status `PENDING_PIX` no momento em que o usuário clica em "Confirmar Pedido".

### Critérios de Aceitação

**Cenário 1: Exibir PIX como único método de pagamento disponível**
- Dado que o cliente está na etapa de pagamento
- Quando carrega a página de pagamento
- Então PIX é exibido como único método disponível, com instruções claras de uso

**Cenário 2: Exibir chave PIX estática e QR Code fixo**
- Dado que o cliente está na etapa de pagamento
- Quando a página é carregada
- Então exibe: chave PIX estática (Copia e Cola), QR Code fixo e instruções: "Escaneie com seu app bancário ou copie a chave abaixo"

**Cenário 3: Copiar chave PIX para área de transferência**
- Dado que a chave PIX estática está visível na página
- Quando o cliente clica em "Copiar Chave"
- Então a chave é copiada para a área de transferência e exibe mensagem rápida: "Chave copiada!"

**Cenário 4: Criar pedido ao confirmar**
- Dado que o cliente revisou o resumo e decidiu comprar
- Quando o cliente clica em "Confirmar Pedido"
- Então o sistema envia `POST /api/orders` com o array de itens do localStorage e o endereço de entrega
- E o pedido é criado com status `PENDING_PIX`
- E o cliente é redirecionado para a página de confirmação com o número do pedido

**Cenário 5: Carrinho limpo após confirmação**
- Dado que o pedido foi criado com sucesso
- Quando o cliente é redirecionado para a página de confirmação
- Então o carrinho do `localStorage` é esvaziado e o contador do header exibe "0"

**Cenário 6: Erro na criação do pedido**
- Dado que a API retorna erro ao tentar criar o pedido (ex: produto fora de estoque)
- Quando o cliente clica em "Confirmar Pedido"
- Então exibe mensagem de erro específica e permite nova tentativa sem perder os dados do formulário

---

## História 5: Receber Confirmação do Pedido e Acessar Informações de Rastreamento

**Descrição:** Como cliente, quero receber uma confirmação imediata após pagamento com número do pedido, resumo da compra e próximos passos, para que eu tenha certeza de que meu pedido foi criado com sucesso e saiba quando e onde acompanhar meu produto.

### Critérios de Aceitação

**Cenário 1: Exibir página de confirmação completa**
- Dado que o pagamento foi confirmado
- Quando o cliente é redirecionado para a página de confirmação
- Então visualiza: número do pedido (ex: "ORD-2026-001234"), status "Pagamento Confirmado", resumo da compra (itens, endereço, total pago), data estimada de entrega, e mensagem "Email de confirmação será enviado em breve"

**Cenário 2: Número do pedido visível e destacado**
- Dado que o cliente está na página de confirmação
- Quando carrega a página
- Então o número do pedido é exibido em destaque com opção de "Copiar Número" para área de transferência

**Cenário 3: Email de confirmação recebido**
- Dado que o pagamento foi confirmado
- Quando o cliente aguarda alguns minutos
- Então recebe um email no endereço cadastrado contendo: número do pedido, resumo da compra, data estimada de entrega e link para rastreamento (futuro)

**Cenário 4: Email contém informações de contato de suporte**
- Dado que o cliente recebeu o email de confirmação
- Quando abre e lê o conteúdo
- Então visualiza: telefone, email de suporte e instruções de como contatar em caso de dúvidas

**Cenário 5: Botão "Voltar ao Catálogo" para continuar comprando**
- Dado que o cliente está na página de confirmação
- Quando clica em "Voltar ao Catálogo"
- Então é redirecionado para a página de produtos e o carrinho é esvaziado

**Cenário 6: Botão "Ver Meus Pedidos" (futuro)**
- Dado que o cliente está na página de confirmação
- Quando clica em "Ver Meus Pedidos"
- Então é redirecionado para um histórico de suas compras (funcionalidade planejada para Fase 2)

**Cenário 7: Compartilhar confirmação**
- Dado que o cliente está na página de confirmação
- Quando clica em "Compartilhar" ou "Enviar por Email"
- Então aparece opção de copiar link da confirmação ou enviar para outro email

**Cenário 8: Confirmação persiste sem recarga**
- Dado que o cliente está na página de confirmação
- Quando fecha a página acidentalmente e retorna à URL de confirmação
- Então os dados da confirmação ainda são exibidos corretamente

---

## História 6: Avaliar Produto (Review)

**Descrição:** Como cliente logado, quero publicar uma avaliação de um produto com nota, título e descrição, para que outros compradores tenham informações reais sobre o produto.

### Critérios de Aceitação

**Cenário 1: Criar review com sucesso**
- Dado que o cliente está logado e na página de um produto que ainda não avaliou
- Quando preenche título, descrição, seleciona nota 5 e clica em "Publicar"
- Então o review aparece imediatamente na lista do produto e a nota média é atualizada

**Cenário 2: Tentativa de review sem login**
- Dado que o visitante não está logado
- Quando tenta clicar em "Escrever Avaliação"
- Então é redirecionado para o login com mensagem: "Faça login para avaliar este produto"

**Cenário 3: Tentativa de segundo review no mesmo produto**
- Dado que o cliente já publicou um review para o produto X
- Quando tenta criar outro review para o mesmo produto X
- Então a API retorna erro de conflito e a UI exibe: "Você já avaliou este produto"

**Cenário 4: Deletar próprio review**
- Dado que o cliente está logado e tem um review publicado
- Quando clica em "Excluir" no próprio review
- Então o review é removido da lista e o cliente pode criar um novo

**Cenário 5: Review com nota inválida**
- Dado que o cliente tenta enviar o formulário sem selecionar uma nota
- Quando clica em "Publicar"
- Então exibe validação: "Selecione uma nota de 1 a 5"

---

## História 7: Ver Resumo de IA das Avaliações

**Descrição:** Como visitante na página de um produto, quero ver um resumo conciso das avaliações gerado por IA, para entender rapidamente os pontos positivos e negativos.

### Critérios de Aceitação

**Cenário 1: Resumo gerado com sucesso**
- Dado que um produto tem pelo menos 2 reviews
- Quando o visitante clica em "Ver Insight da IA"
- Então exibe estado de loading e, após a resposta da API, exibe resumo de 3 frases sobre pontos positivos e negativos

**Cenário 2: Produto sem reviews suficientes**
- Dado que um produto não tem reviews
- Quando o visitante clica em "Ver Insight da IA"
- Então exibe: "Ainda sem avaliações suficientes para gerar resumo"

**Cenário 3: Falha na API de IA**
- Dado que o serviço de IA está indisponível
- Quando o visitante solicita o resumo
- Então exibe mensagem amigável: "Não foi possível gerar o resumo agora. Tente novamente." com botão de retry

---

## História 8: Chat com IA sobre o Produto

**Descrição:** Como visitante, quero fazer perguntas sobre as especificações de um produto e receber respostas baseadas nas informações reais do produto e avaliações.

### Critérios de Aceitação

**Cenário 1: Resposta gerada com sucesso**
- Dado que o visitante está com o chat aberto na página do produto
- Quando digita "Este produto é compatível com Windows 11?" e clica em "Enviar"
- Então exibe estado de loading e, após resposta, exibe a resposta da IA contextualizada com as specs do produto

**Cenário 2: Histórico mantido durante a conversa**
- Dado que o visitante fez 3 perguntas na mesma sessão do chat
- Quando visualiza o chat
- Então todas as 3 perguntas e respostas estão visíveis no histórico React

**Cenário 3: Histórico descartado ao fechar**
- Dado que o visitante tinha um histórico de conversa ativo no chat
- Quando fecha o chat e reabre
- Então o chat está vazio (sem persistência no banco)

**Cenário 4: Falha na API de IA**
- Dado que o serviço de IA está indisponível
- Quando o visitante envia uma pergunta
- Então exibe mensagem de erro amigável na conversa: "Não foi possível responder agora. Tente novamente."

---

## Mapa de Cobertura de Testes

| História | Cenários | Casos Felizes | Exceções | Total |
|----------|----------|---------------|----------|-------|
| 1. Revisar Carrinho | 6 | 3 | 3 | 6 ✅ |
| 2. Validar Endereço | 6 | 2 | 4 | 6 ✅ |
| 3. Resumo do Pedido | 6 | 3 | 3 | 6 ✅ |
| 4. Pagamento PIX Estático | 6 | 3 | 3 | 6 ✅ |
| 5. Confirmação | 8 | 5 | 3 | 8 ✅ |
| 6. Reviews | 5 | 2 | 3 | 5 ✅ |
| 7. Resumo IA | 3 | 1 | 2 | 3 ✅ |
| 8. Chat de Produto IA | 4 | 2 | 2 | 4 ✅ |
| **TOTAL** | **44 Cenários** | **21** | **23** | **44 ✅** |

---

## Notas Importantes para QA e Devs

1. **Independência:** Cada cenário pode ser executado isoladamente—não dependem uns dos outros
2. **Testabilidade:** Todos os "Então" descrevem estados observáveis na UI, não implementações técnicas
3. **Linguagem:** Mantém consistência (ex: sempre "exibe", "visualiza", "mensagem" para clareza)
4. **Cobertura de Exceções:** ~50% dos cenários cobrem fluxos de erro, garantindo robustez
5. **Automação:** Todos os cenários podem ser automatizados com ferramentas como Cypress, Playwright ou Selenium

---

## Relacionados

- [USER_STORIES.md](docs/USER_STORIES.md) — Histórias de usuário originais
- [PRD_CHECKOUT.md](docs/PRD_CHECKOUT.md) — Requisitos de negócio e limites
