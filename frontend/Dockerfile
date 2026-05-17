# ============================================================
# Mercadex Frontend — Dockerfile para deploy no Coolify
# ============================================================
# Next.js 16.2 com TypeScript e Tailwind CSS
# Multi-stage build para manter a imagem final leve
# ============================================================

# ── Stage 1: builder ───────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Copia manifesto e lockfile
COPY package.json package-lock.json ./

# Instala TODAS as dependências (inclusive devDependencies para build)
RUN npm ci

# Copia código-fonte e configs
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY src ./src

# Build do Next.js com a variável de ambiente padrão
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ── Stage 2: produção ──────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update -y && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variáveis de ambiente padrão (podem ser sobrescritas no Coolify)
ENV NODE_ENV=production
ENV PORT=3000

# Copia manifesto e lockfile
COPY package.json package-lock.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia artefatos do build do Next.js
COPY --from=builder /app/.next ./.next

# Copia configuração do Next.js (necessário para runtime)
COPY next.config.mjs ./

# Exposição da porta
EXPOSE ${PORT}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Comando de inicialização
CMD ["npm", "start"]
