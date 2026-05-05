# Diagramas Mercadex

## 1. Diagrama de Entidade-Relacionamento (ER)

Neste diagrama ER, além das entidades `Usuário`, `Produto` e `Pedido`, estão as entidades de suporte fundamentais para um e-commerce: `Categoria` (para organizar os produtos), `ItemPedido` (para quebrar o relacionamento N:M entre Pedidos e Produtos, guardando o valor histórico na hora da compra), `Carrinho` e `ItemCarrinho`.

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nome
        string email
        string senha_hash
        string cpf
        datetime criado_em
    }
    
    PRODUTO {
        int id PK
        int categoria_id FK
        string nome
        string descricao
        decimal preco
        int estoque_atual
        boolean ativo
    }
    
    CATEGORIA {
        int id PK
        string nome
        string descricao
    }
    
    PEDIDO {
        int id PK
        int usuario_id FK
        datetime data_pedido
        string status "Pendente, Pago, Enviado, Cancelado"
        decimal valor_total
    }
    
    ITEM_PEDIDO {
        int id PK
        int pedido_id FK
        int produto_id FK
        int quantidade
        decimal preco_unitario "Preço no momento da compra"
    }

    CARRINHO {
        int id PK
        int usuario_id FK "Pode ser null para usuários não logados"
        string sessao_id "Para vincular navegação anônima"
        datetime atualizado_em
    }

    ITEM_CARRINHO {
        int id PK
        int carrinho_id FK
        int produto_id FK
        int quantidade
    }

    %% Relacionamentos
    USUARIO ||--o{ PEDIDO : "realiza"
    USUARIO ||--|| CARRINHO : "possui"
    CATEGORIA ||--|{ PRODUTO : "classifica"
    
    PEDIDO ||--|{ ITEM_PEDIDO : "composto_por"
    PRODUTO ||--o{ ITEM_PEDIDO : "listado_como"
    
    CARRINHO ||--o{ ITEM_CARRINHO : "contém"
    PRODUTO ||--o{ ITEM_CARRINHO : "adicionado_como"
```

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
    
    N --> O[Sistema valida estoque atual e sessão]
    O --> P{Validação com sucesso?}
    
    P -- Não --> Q[Exibe mensagem de erro e opções de ajuste]
    Q --> M
    
    P -- Sim --> R[Registra item na entidade ITEM_CARRINHO]
    R --> S[Atualiza ícone contador do cabeçalho]
    S --> T[Abre Modal/Sidebar de 'Produto adicionado com sucesso']
    
    T --> U([Fim - Escolhe ir para o Checkout ou Continuar Comprando])
```
