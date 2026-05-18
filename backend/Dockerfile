# ============================================================
# Mercadex Backend — Dockerfile para deploy no Coolify
# ============================================================
# Prisma 7.8 exige Node.js ≥22.12. Usamos node:22-slim (22.16 LTS).
# Multi-stage build para manter a imagem final leve.
# ============================================================

# ── Stage 1: build ──────────────────────────────────────────
FROM node:22-slim AS builder

# OpenSSL é necessário para o Prisma Client engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia manifesto e lockfile para aproveitar cache de camadas
COPY package.json package-lock.json ./

# Instala TODAS as dependências (inclusive devDependencies para tsc)
# --ignore-scripts: o postinstall tenta "prisma generate" mas o schema
# ainda não foi copiado; geramos explicitamente depois (linha do npx prisma generate)
RUN npm ci --ignore-scripts

# Copia código-fonte, schema Prisma e configs
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Gera o Prisma Client (usa URL dummy apenas para satisfazer o prisma.config.ts no build)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Compila TypeScript → dist/
RUN npm run build

# Verificação: garante que os artefatos existem
RUN echo "=== Verificando artefatos ===" \
    && ls dist/generated/prisma/client.js \
    && echo "=== Artefatos OK ==="

# ── Stage 2: produção ──────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variáveis de ambiente padrão (podem ser sobrescritas no Coolify)
ENV NODE_ENV=production
ENV PORT=3001

# Copia manifesto e lockfile
COPY package.json package-lock.json ./

# Instala apenas dependências de produção
# --ignore-scripts evita que o postinstall tente rodar "prisma generate"
# (o CLI prisma é devDependency e não estará disponível aqui)
RUN npm ci --omit=dev --ignore-scripts

# Copia artefatos do build (inclui dist/generated/prisma/ compilado pelo tsc)
COPY --from=builder /app/dist ./dist

# Copia os arquivos gerados pelo Prisma (.js, .wasm) para o diretório dist
# (o tsc compila .ts mas ignora os .js gerados pelo Prisma no src/generated)
COPY --from=builder /app/src/generated/prisma ./dist/generated/prisma

# Copia schema do Prisma (necessário para migrations em runtime)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Exposição da porta
EXPOSE ${PORT}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Comando de inicialização
CMD ["node", "-r", "dotenv/config", "dist/server.js"]
