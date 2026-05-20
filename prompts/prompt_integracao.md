# 1. Objetivo

Integrar catalogo da pagina principal com dados reais da API (`/api/products` e `/api/categories`) removendo dependencia de mocks.

## 2. Contexto

- Modulo/area impactada: frontend/catalog/storefront.
- Estado atual: pagina principal usa `PRODUCTS` e `CATEGORIES` mockados.
- Restricoes tecnicas: manter padrao de arquitetura frontend existente.

## 3. Escopo

- Incluido: consumo de endpoints reais e ajustes de estado para carregamento/erro.
- Excluido: mudancas de UX fora do necessario para integracao.

## 4. Entradas

- Arquivos de referencia:
	- `frontend/src/features/storefront/`
	- `frontend/src/shared/mocks/products.ts`
	- cliente HTTP em `frontend/src/shared/lib/api/`
- Requisitos obrigatorios:
	- Nao usar `PRODUCTS` mockados para listagem.
	- Nao usar `CATEGORIES` mockadas para filtros.

## 5. Saida Esperada

- Pagina principal consumindo `/api/products` e `/api/categories`.
- Tratamento minimo de loading e erro.
- Testes ajustados para novo fluxo de dados.

## 6. Criterios de Validacao

- Catalogo renderiza dados reais retornados pela API.
- Filtro por categoria funciona com categorias vindas da API.
- Nenhuma referencia ativa a mocks no fluxo principal.

## 7. Riscos e Cuidados

- Evitar quebra de testes que dependem de dados estaticos.
- Tratar indisponibilidade da API com fallback visual claro.

## 8. Prompt Final

Integre a pagina principal para consumir produtos reais de `/api/products` e categorias reais de `/api/categories`. Remova o uso de `PRODUCTS` e `CATEGORIES` mockados no fluxo principal.

Mantenha a arquitetura atual do frontend, adicione tratamento de loading/erro e ajuste os testes necessarios para refletir a nova fonte de dados.