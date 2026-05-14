# Bruno Collection - Mercadex Backend (v3.3.0)

Este guia descreve como importar e usar a colecao Bruno do backend Mercadex.

## Estrutura

Colecao em: `backend/bruno/`

Modulos incluidos:
- `auth`
- `products`
- `categories`
- `health`

Ambientes incluidos:
- `environments/local.bru`
- `environments/staging.bru`
- `environments/production.bru`

## Pre-requisitos

- Bruno 3.3.0
- Backend Mercadex rodando em `http://localhost:3001`
- Usuario admin para requests protegidas por `requireAdmin`

## Importacao no Bruno

1. Abra o Bruno.
2. Clique em `Open Collection`.
3. Selecione a pasta `backend/bruno`.
4. Selecione o ambiente `local`.

## Variaveis de ambiente

No ambiente `local`, preencha quando necessario:
- `accessToken`
- `refreshToken`
- `categoryId`
- `productId`

`baseUrl` ja vem definido como `http://localhost:3001`.

## Fluxo recomendado

1. Execute `health/Health Check`.
2. Execute `auth/Login` para obter token.
3. Use o token em requests autenticadas (`Authorization: Bearer {{accessToken}}`).
4. Execute requests de `products` e `categories`.
5. Quando receber `401`, execute `auth/Refresh` e tente novamente.
6. Execute `auth/Logout` ao finalizar.

## Observacoes

- Endpoints admin (`POST/PUT/DELETE` de products e `POST` de categories) exigem usuario com role admin.
- Esta colecao inclui somente endpoints implementados atualmente no backend.
- Recomendado revisar IDs de teste (`categoryId`, `productId`) antes de executar requests com path params.

## Alternativa: Swagger UI

O backend tambem expoe documentacao interativa via Swagger UI. Com o servidor rodando, acesse:

```
http://localhost:3001/api-docs
```

O Swagger UI permite explorar e testar todos os endpoints diretamente no navegador, incluindo autenticacao via Bearer token.