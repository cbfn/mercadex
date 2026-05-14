import { prisma } from './shared/db/prisma';

// Fecha a conexão Prisma após todos os testes para evitar handles abertos
afterAll(async () => {
  await prisma.$disconnect();
});
