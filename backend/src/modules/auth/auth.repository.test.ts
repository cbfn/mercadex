var mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('../../shared/db/prisma', () => ({
  prisma: mockPrisma,
}));

const { authRepository } = require('./auth.repository') as typeof import('./auth.repository');

describe('authRepository', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
  });

  it('findByEmail consulta o usuario pelo email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

    await authRepository.findByEmail('test@test.com');

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@test.com' },
    });
  });

  it('create persiste um novo usuario', async () => {
    mockPrisma.user.create.mockResolvedValue({ id: 1 });

    await authRepository.create({
      name: 'Test',
      email: 'test@test.com',
      passwordHash: 'hash',
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test',
        email: 'test@test.com',
        passwordHash: 'hash',
      },
    });
  });

  it('findById consulta o usuario pelo id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

    await authRepository.findById('user-1');

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });
});
