# Mercadex — Marketplace de Eletrônicos

O **Mercadex** é um protótipo de *e-commerce* voltado para a venda de eletrônicos. O projeto apresenta uma interface interativa e amigável construída com tecnologias web modernas (HTML, CSS e JavaScript puros, utilizando o suporte visual do Tailwind CSS).

## 🚀 Funcionalidades

- **Catálogo de Produtos:** Listagem de eletrônicos variados com opções de listagem e filtragem por categoria.
- **Detalhes do Produto:** Informações detalhadas apresentadas em um modal interativo (especificações, preços, avaliações).
- **Carrinho de Compras:** Adicionar, alterar quantidades e remover produtos do carrinho atualizações de valores (subtotal e total) em tempo real.
- **Fluxo de Checkout:** Um fluxo dinâmico divido em etapas completas, englobando dados de entrega, simulação de pagamento (Pix, Cartão, Boleto) e painel de Pedido Confirmado!
- **Responsividade:** O design é todo flexível, ajustando-se tanto a telas de dispositivos móveis quanto ao desktop.

## 🛠 Tecnologias Utilizadas

- **HTML5:** Estruturação semântica em blocos (separando categorias, grid de produtos e modais).
- **CSS3 (`fronted/css/style.css`):** Animações customizadas (`keyframes`), comportamento do painel lateral e barras de scroll padronizadas.
- **JavaScript Vanilla (`frontend/js/main.js`):** Gerenciamento de estado (`state`) do carrinho, navegação multi-etapas para finalização de compra e renderizações dinâmicas na interface.
- **Tailwind CSS:** Para estilização utilitária aplicada via CDN e organização do layout fluido.

## 💻 Como Rodar o Projeto Localmente

Sendo uma aplicação estática na sua camada frontend, o método mais rápido e indicado de rodar é subindo um servidor HTTP local simples com a ajuda do **Python 3**.

**Passo a passo:**

1. Abra seu Terminal e verifique se o Python está devidamente instalado em sua máquina:
   ```bash
   python3 --version
   ```

2. Pelo terminal (na pasta raiz do projeto Mercadex), inicie o módulo HTTP Server nativo do Python:
   ```bash
   python3 -m http.server 8000
   ```
   *(Caso não funcione, seu sistema pode suportar apenas `python -m http.server 8000` ou até `python -m SimpleHTTPServer 8000` em versões antigas).*

3. Em seguida, acesse através de seu navegador (Browser):
   👉 **[http://localhost:8000/frontend/](http://localhost:8000/frontend/)**

> **Importante:** Sempre rode o comando estando do raiz do repositório, garantindo que o seu servidor consiga alcançar devidamente o arquivo da logomarca na raiz (`logo-mercadex.png`), preservando a referência relativa dos assets.

## 🤝 Contribuindo

### Configurar o template de commit

Este repositório inclui um template de mensagem de commit em `.gitmessage.txt` que segue o padrão [Conventional Commits](https://www.conventionalcommits.org/). Para ativá-lo localmente, execute na raiz do projeto:

```bash
git config commit.template .gitmessage.txt
```

A partir daí, cada `git commit` (sem `-m`) abrirá o editor com o template preenchido como guia.

Para referência completa de convenções de branch e commits, consulte [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
