# Diagramas Mercadex

## 1. Diagrama de Entidade-Relacionamento (ER)

Neste diagrama ER estão as entidades ativas do MVP Lean. O `Carrinho` é gerenciado 100% via `localStorage` no frontend e **não possui tabela no banco** (ver ADR-007). A entidade `REVIEW` é nova neste pivot e sustenta as features de IA (Resumo + Chat).


```mermaid
erDiagram
    USUARIO {
        uuid id PK
        string nome
        string email
        string senha_hash
        string role "CUSTOMER | ADMIN"
        datetime criado_em
    }
    
    PRODUTO {
        uuid id PK
        uuid categoria_id FK
        uuid vendedor_id FK
        string titulo
        string descricao
        decimal preco
        int estoque_atual
        boolean ativo
    }
    
    CATEGORIA {
        uuid id PK
        string nome
        string descricao
    }
    
    PEDIDO {
        uuid id PK
        uuid usuario_id FK
        datetime criado_em
        string status "PENDING_PIX | PAGO | ENVIADO | ENTREGUE | CANCELADO"
        decimal valor_total
        json endereco_entrega
    }
    
    ITEM_PEDIDO {
        uuid id PK
        uuid pedido_id FK
        uuid produto_id FK
        int quantidade
        decimal preco_unitario "Preço no momento da compra"
    }

    REVIEW {
        uuid id PK
        uuid usuario_id FK
        uuid produto_id FK
        string titulo
        string corpo
        int rating "1 a 5"
        datetime criado_em
    }

    %% Relacionamentos
    USUARIO ||--o{ PEDIDO : "realiza"
    USUARIO ||--o{ REVIEW : "escreve"
    CATEGORIA ||--|{ PRODUTO : "classifica"
    
    PEDIDO ||--|{ ITEM_PEDIDO : "composto_por"
    PRODUTO ||--o{ ITEM_PEDIDO : "listado_como"
    
    PRODUTO ||--o{ REVIEW : "recebe"
```

> **@legacy — Carrinho no banco:** Os models `Cart` e `CartItem` foram desativados (MVP Lean).
> O array de itens é enviado diretamente do frontend para `POST /api/orders`.
> Ver schema.prisma para os models comentados.

## 2. Diagrama de Fluxo de Navegação (Busca ao Carrinho)

Este fluxograma ilustra o caminho (User Journey) de um cliente desde o momento em que decide procurar um produto até finalizar a ação de colocá-lo no carrinho, prevendo caminhos alternativos e feedbacks visuais do sistema.

```mermaid
flowchart TD
    A([Início: Usuário acessa o sistema]) --> B{Decide buscar via...?}
    
    B -- Termo Específico --> C[Digita termo na Barra de Busca]
    B -- Navegação --> D[Clica em uma Categoria Específica]
    
    C --> E[Sistema processa a consulta]
    D --> E
    
    E --> F[Exibe Página de Resultados]
    
    F --> G{Encontrou o que procurava?}
    G -- Não --> H[Aplica Filtros ou refaz a busca]
    H --> E
    
    G -- Sim --> I[Clica sobre o Card do Produto]
    
    I --> J[Carrega Página de Detalhes do Produto]
    
    J --> K{Produto em estoque?}
    K -- Não --> L[Botão 'Avise-me quando chegar']
    L --> Z([Fim - Compra não realizada])
    
    K -- Sim --> M[Usuário seleciona variação/quantidade]
    M --> N[Clica no botão 'Adicionar ao Carrinho']
    
    N --> O[Zustand atualiza localStorage]
    O --> P[Atualiza ícone contador do cabeçalho]
    P --> Q[Abre Modal/Sidebar de 'Produto adicionado com sucesso']
    
    Q --> R([Fim - Escolhe ir para o Checkout ou Continuar Comprando])
```

## 3. Diagrama de Fluxo de Checkout (PIX Estático)

Fluxo simplificado do MVP Lean: carrinho do `localStorage` → endereço de entrega → PIX estático → pedido criado com `PENDING_PIX`.

```mermaid
flowchart TD
    A([Usuário clica em Finalizar Compra]) --> B[Etapa 1: Preencher Endereço]
    B --> C{Campos obrigatórios preenchidos?}
    C -- Não --> D[Exibir erros de validação]
    D --> B
    C -- Sim --> E[Etapa 2: Resumo + PIX]
    E --> F[Exibir itens do carrinho + total]
    F --> G[Exibir chave PIX estática e QR Code fixo]
    G --> H[Botão 'Copiar Chave PIX']
    H --> I[Usuário clica em 'Confirmar Pedido']
    I --> J[POST /api/orders com array de itens + endereço]
    J --> K{API retorna sucesso?}
    K -- Não --> L[Exibir erro e permitir nova tentativa]
    K -- Sim --> M[Etapa 3: Confirmação]
    M --> N[Exibir número do pedido e status PENDING_PIX]
    N --> O[Limpar carrinho do localStorage]
    O --> P([Fim - Voltar ao Catálogo])
```

## 4. Diagrama de Fluxo de Reviews e IA

Fluxo das features de inteligência: review de produto, resumo IA e chat stateless.

```mermaid
flowchart TD
    subgraph Review
        A([Usuário logado na página do produto]) --> B[Clica em Escrever Avaliação]
        B --> C[Preenche título, descrição e nota 1-5]
        C --> D[POST /api/products/:id/reviews]
        D --> E[Review salvo e exibido na lista]
    end

    subgraph Resumo_IA
        F([Qualquer visitante na página do produto]) --> G[Clica em Ver Insight da IA]
        G --> H[GET /api/products/:id/ai-summary]
        H --> I{Reviews existem?}
        I -- Não --> J[Exibir 'Ainda sem avaliações para resumir']
        I -- Sim --> K[Backend envia reviews para LLM]
        K --> L[LLM retorna resumo de 3 frases]
        L --> M[Exibir resumo na UI]
    end

    subgraph Chat_Produto
        N([Visitante clica em Tirar Dúvida]) --> O[Abre drawer de chat]
        O --> P[Usuário digita pergunta]
        P --> Q[POST /api/products/:id/chat com mensagem]
        Q --> R[Backend carrega specs + reviews + chama LLM]
        R --> S[LLM responde baseado no contexto do produto]
        S --> T[Exibir resposta no chat React-only]
        T --> U{Mais perguntas?}
        U -- Sim --> P
        U -- Não --> V([Fechar chat - histórico descartado])
    end
```
