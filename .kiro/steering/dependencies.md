# Regra: Dependências sempre na última versão

## Prisma

O projeto usa **Prisma 7** (última versão estável). Sempre que instalar ou atualizar
dependências relacionadas ao Prisma, garantir que os três pacotes estejam na mesma
versão mais recente:

```bash
npm install prisma@latest @prisma/client@latest @prisma/adapter-neon@latest
```

Após atualizar, sempre regenerar o client:

```bash
npx prisma generate
```

## Configuração Prisma 7

- O schema usa `provider = "prisma-client-js"` (gera para `node_modules/@prisma/client`)
- A URL de conexão vai em `prisma.config.ts`, **não** no `schema.prisma`
- O adapter Neon é configurado em `prisma.config.ts` e em `src/shared/db/prisma.ts`

## Outras dependências

Ao instalar novas dependências, verificar se há versão mais recente disponível
antes de fixar a versão. Usar `npm view <pacote> version` para checar.
