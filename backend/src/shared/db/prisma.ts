import { PrismaClient } from '../../generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import "dotenv/config"
import ws from 'ws';

// Em ambiente Node.js, o driver Neon serverless precisa de WebSocket.
// Em produção edge (Vercel Edge, Cloudflare Workers), remover esta linha.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida nas variáveis de ambiente');
  }
  
  // Remove aspas caso a variável de ambiente tenha sido injetada com elas (ex: via Docker/Coolify)
  if (connectionString.startsWith('"') && connectionString.endsWith('"')) {
    connectionString = connectionString.slice(1, -1);
  }

  // PrismaNeon v7 recebe PoolConfig diretamente (não um Pool instanciado)
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
