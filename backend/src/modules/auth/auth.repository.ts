import { prisma } from '../../shared/db/prisma';

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
    }),

  create: (data: { name: string; email: string; passwordHash: string }) =>
    prisma.user.create({
      data,
    }),

  findById: (id: number) =>
    prisma.user.findUnique({
      where: { id },
    }),
};
