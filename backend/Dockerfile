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
RUN npm ci

# Copia código-fonte, schema Prisma e configs
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Gera o Prisma Client
RUN npx prisma generate

# Compila TypeScript → dist/
RUN npm run build

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

# Copia artefatos do build
COPY --from=builder /app/dist ./dist

# Copia o Prisma Client gerado no stage de build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src/generated ./src/generated

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
