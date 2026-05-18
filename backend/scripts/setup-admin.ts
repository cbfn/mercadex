/**
 * Utilitário de setup para ambiente de desenvolvimento.
 * Cria um usuário ADMIN se não existir nenhum.
 * Uso: npx ts-node scripts/setup-admin.ts
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/shared/db/prisma';

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (existing) {
    console.log(`✓ Admin já existe: ${existing.email} (id: ${existing.id})`);
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mercadex.com',
      passwordHash,
      name: 'Admin Mercadex',
      role: 'ADMIN',
    },
  });

  console.log(`✓ Admin criado: ${admin.email} (id: ${admin.id})`);
  console.log('  Credenciais: admin@mercadex.com / Admin@123456');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao criar admin:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
