# Trilha 1 — Limpeza, Reorganização e Setup de Infraestrutura

**Responsável:** Dev 1
**Branch:** `chore/limpeza-e-infra`
**Base:** `develop`
**Estimativa:** 1–2 dias
**Pré-requisito:** Nenhum — esta trilha é a primeira a ser executada

> ⚠️ Cada tarefa deve ser commitada separadamente para facilitar rollback.
> Abrir PR para `develop` ao concluir todas as tarefas desta trilha.

---

## Contexto

O repositório possui uma estrutura aninhada desnecessária: o projeto real vive em
`mercadex/mercadex/` quando deveria estar na raiz. Além disso, há arquivos de lixo,
duplicatas e dependências desatualizadas. Esta trilha resolve tudo isso e prepara
o backend para as trilhas 2 e 3.

---

## Tarefa 1.1 — Limpeza de arquivos de lixo

**Tempo:** 30 minutos
**Risco:** Baixo

```bash
# Remover arquivos de sistema macOS
find /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex -name ".DS_Store" -delete

# Remover package-lock.json órfão (sem package.json correspondente)
rm /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex/package-lock.json

# Remover arquivo temporário
rm /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex/prompt.txt

# Adicionar .DS_Store ao .gitignore
echo "" >> /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex/.gitignore
echo "# macOS" >> /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex/.gitignore
echo ".DS_Store" >> /media/henrique-ferraz/Hdd_500/projetos/mercadex/mercadex/.gitignore
```

**Commit:**
```bash
git add .gitignore
git commit -m "chore: remove arquivos de lixo (.DS_Store, package-lock orfao, prompt.txt)"
```

---

## Tarefa 1.2 — Arquivamento do protótipo HTML (Fase 1)

**Tempo:** 30 minutos
**Risco:** Baixo (movimentação, não remoção)

O protótipo HTML da Fase 1 deve ser preservado como histórico, não removido.

```bash
BASE=/media/henrique-ferraz/Hdd_500/projetos/mercadex

# Criar diretório de arquivo histórico
mkdir -p "$BASE/mercadex/docs/fase1-prototipo"

# Mover README do protótipo
mv "$BASE/README.md" "$BASE/mercadex/docs/fase1-prototipo/README.md"

# Mover arquivos do protótipo (index.html, css/, js/, assets/)
mv "$BASE/frontend/index.html" "$BASE/mercadex/docs/fase1-prototipo/"
mv "$BASE/frontend/css"        "$BASE/mercadex/docs/fase1-prototipo/"
mv "$BASE/frontend/js"         "$BASE/mercadex/docs/fase1-prototipo/"
mv "$BASE/frontend/assets"     "$BASE/mercadex/docs/fase1-prototipo/"

# Remover diretório vazio
rmdir "$BASE/frontend"
```

**Commit:**
```bash
git add -A
git commit -m "chore: arquiva prototipo HTML Fase 1 em docs/fase1-prototipo"
```

---

## Tarefa 1.3 — Remoção de duplicatas exatas

**Tempo:** 15 minutos
**Risco:** Baixo (conteúdo idêntico confirmado)

Os arquivos `docs/ADR.md` e `docs/DIAGRAMAS.md` na raiz são cópias exatas dos
arquivos em `mercadex/docs/`. O `backend/` na raiz está vazio.

```bash
BASE=/media/henrique-ferraz/Hdd_500/projetos/mercadex

# Remover docs/ duplicado da raiz
rm -rf "$BASE/docs"

# Remover backend/ vazio da raiz
rm -rf "$BASE/backend"
```

**Commit:**
```bash
git add -A
git commit -m "chore: remove duplicatas exatas (docs/ e backend/ da raiz)"
```

---

## Tarefa 1.4 — Reorganização da árvore de diretórios

**Tempo:** 1 hora
**Risco:** Médio — reorganização estrutural

Promove o conteúdo de `mercadex/mercadex/` para `mercadex/`, eliminando o nível
desnecessário. Após esta tarefa, o projeto estará na raiz do repositório.

```bash
BASE=/media/henrique-ferraz/Hdd_500/projetos/mercadex
SRC="$BASE/mercadex"

# Mover diretórios principais
mv "$SRC/frontend"  "$BASE/"
mv "$SRC/backend"   "$BASE/"
mv "$SRC/docs"      "$BASE/"
mv "$SRC/.github"   "$BASE/"

# Mover arquivos de configuração visíveis
mv "$SRC/README.md"       "$BASE/"
mv "$SRC/CLAUDE.md"       "$BASE/"

# Mover arquivos ocultos
mv "$SRC/.gitignore"      "$BASE/"
mv "$SRC/.gitmessage.txt" "$BASE/"

# Mover pasta tasks (este planejamento)
# tasks/ já está na raiz, não precisa mover

# Remover diretório mercadex/ agora vazio
rmdir "$SRC"
```

**Verificação após mover:**
```bash
# Confirmar estrutura
ls -la /media/henrique-ferraz/Hdd_500/projetos/mercadex/
# Deve mostrar: README.md, CLAUDE.md, .gitignore, frontend/, backend/, docs/, .github/
```

**Atenção:** O CI/CD em `.github/workflows/ci.yml` usa `working-directory: frontend`.
Após a reorganização, o caminho continua correto pois `frontend/` estará na raiz.

**Commit:**
```bash
git add -A
git commit -m "chore: promove mercadex/ para raiz, elimina nivel desnecessario"
```

---

## Tarefa 1.5 — Migração Vitest → Jest

**Tempo:** 2 horas
**Risco:** Médio

Os 164 testes existentes usam a API `describe/it/expect` que é compatível com Jest.
A migração não exige reescrita dos testes, apenas troca de configuração.

```bash
cd /media/henrique-ferraz/Hdd_500/projetos/mercadex/frontend

# Remover Vitest e dependências relacionadas
npm uninstall vitest @vitest/coverage-v8 jsdom

# Instalar Jest
npm install --save-dev \
  jest@^30.4.2 \
  jest-environment-jsdom@^30.4.1 \
  @types/jest@^30.0.0 \
  ts-jest@^29.4.9
```

Criar `frontend/jest.config.js`:

```js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**',
    '!src/shared/types/**',
    '!src/shared/mocks/**',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(config);
```

Criar `frontend/jest.setup.js`:

```js
import '@testing-library/jest-dom';
```

Atualizar scripts em `frontend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Remover arquivos do Vitest:

```bash
rm frontend/vitest.config.ts
rm frontend/vitest.setup.ts
```

**Verificação:**
```bash
cd frontend
npm run test          # todos os 164 testes devem passar
npm run test:coverage # cobertura >= 80%
```

**Commit:**
```bash
git add -A
git commit -m "chore: migra Vitest para Jest 30, mantem 164 testes passando"
```

---

## Tarefa 1.6 — Atualização de dependências do frontend

**Tempo:** 3 horas
**Risco:** Médio/Alto — múltiplos major bumps

Executar **na ordem abaixo** para minimizar conflitos.

### 1.6.1 — Types

```bash
cd frontend
npm install --save-dev @types/react@latest @types/react-dom@latest
npx tsc --noEmit
# Corrigir erros de tipo se houver
```

### 1.6.2 — React 19

```bash
npm install react@^19.2.6 react-dom@^19.2.6
npm run build
npm run test
```

### 1.6.3 — Next.js 16

```bash
npm install next@^16.2.6 eslint-config-next@^16.2.6
npx @next/codemod@latest upgrade latest
npm run build
npm run test
```

### 1.6.4 — ESLint

```bash
npm install --save-dev eslint@^10.3.0
npm run lint
# Corrigir warnings se houver
```

### 1.6.5 — Playwright

```bash
npm install --save-dev @playwright/test@^1.60.0
npx playwright install --with-deps chromium
```

**Rollback se algo quebrar:**
```bash
git checkout package.json package-lock.json
npm install
```

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "chore: atualiza dependencias frontend (Next 16, React 19, ESLint 10)"
```

---

## Tarefa 1.7 — Setup do backend (sem Docker)

**Tempo:** 2 horas
**Risco:** Baixo

Configura o backend com Node.js + TypeScript + Prisma. O banco de dados PostgreSQL
deve ser instalado localmente (sem Docker).

### Instalação local do PostgreSQL

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco
sudo -u postgres psql -c "CREATE USER mercadex WITH PASSWORD 'mercadex_dev';"
sudo -u postgres psql -c "CREATE DATABASE mercadex OWNER mercadex;"
sudo -u postgres psql -c "CREATE DATABASE mercadex_test OWNER mercadex;"
```

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s mercadex
createdb mercadex -U mercadex
createdb mercadex_test -U mercadex
```

### Inicializar o backend

```bash
cd /media/henrique-ferraz/Hdd_500/projetos/mercadex/backend
npm init -y
```

Criar `backend/package.json` completo:

```json
{
  "name": "mercadex-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

Instalar dependências:

```bash
npm install \
  express@^4.21.0 \
  @prisma/client@^6.0.0 \
  bcryptjs@^2.4.3 \
  jsonwebtoken@^9.0.2 \
  zod@^3.24.0 \
  cors@^2.8.5 \
  helmet@^8.0.0 \
  express-rate-limit@^7.5.0

npm install --save-dev \
  typescript@^5.5.4 \
  ts-node@^10.9.2 \
  nodemon@^3.1.0 \
  prisma@^6.0.0 \
  @types/express@^5.0.0 \
  @types/node@^20.14.15 \
  @types/bcryptjs@^2.4.6 \
  @types/jsonwebtoken@^9.0.7 \
  @types/cors@^2.8.17 \
  jest@^30.4.2 \
  @types/jest@^30.0.0 \
  ts-jest@^29.4.9 \
  supertest@^7.0.0 \
  @types/supertest@^6.0.2
```

Criar `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Criar `backend/.env.example`:

```bash
# Banco de dados (PostgreSQL local)
DATABASE_URL="postgresql://mercadex:mercadex_dev@localhost:5432/mercadex"

# JWT
JWT_SECRET="troque-por-uma-string-aleatoria-longa"
JWT_REFRESH_SECRET="troque-por-outra-string-aleatoria-longa"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Servidor
PORT=3001
NODE_ENV=development
```

Inicializar Prisma:

```bash
npx prisma init
```

Criar `backend/prisma/schema.prisma` com o schema completo
(ver Trilha 2, Tarefa 2.1 para o schema detalhado).

Criar `backend/src/server.ts` mínimo:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

export default app;
```

**Verificação:**
```bash
cd backend
npx tsc --noEmit   # zero erros
npm run dev        # servidor sobe em :3001
curl http://localhost:3001/health  # {"status":"ok",...}
```

**Commit:**
```bash
git add -A
git commit -m "chore: setup inicial do backend (Node.js + TypeScript + Prisma)"
```

---

## Checklist Final da Trilha 1

Antes de abrir o PR:

- [ ] Tarefa 1.1 concluída e commitada
- [ ] Tarefa 1.2 concluída e commitada
- [ ] Tarefa 1.3 concluída e commitada
- [ ] Tarefa 1.4 concluída e commitada
- [ ] Tarefa 1.5 concluída — `npm run test` passando (164 testes)
- [ ] Tarefa 1.6 concluída — `npm run build` passando
- [ ] Tarefa 1.7 concluída — backend sobe sem erros
- [ ] Nenhum `.env` ou secret commitado
- [ ] PR aberto para `develop` com descrição das mudanças

**Título do PR:** `chore: limpeza do repositorio, migracao Jest e setup do backend`
