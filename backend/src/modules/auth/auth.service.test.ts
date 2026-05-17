import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { authService } from './auth.service';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('./auth.repository', () => ({
  authRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedAuthRepository = authRepository as jest.Mocked<typeof authRepository>;

describe('authService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  it('register cria usuario quando o email nao existe', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
    mockedAuthRepository.create.mockResolvedValue({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    } as never);

    await expect(
      authService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'senha12345',
      }),
    ).resolves.toEqual({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    });
  });

  it('register rejeita email duplicado', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValue({ id: '1' } as never);

    await expect(
      authService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'senha12345',
      }),
    ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
  });

  it('login gera tokens para credenciais validas', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValue({
      id: '1',
      passwordHash: 'hashed-password',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    } as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedJwt.sign.mockReturnValueOnce('access-token' as never).mockReturnValueOnce('refresh-token' as never);

    await expect(
      authService.login({
        email: 'test@test.com',
        password: 'senha12345',
      }),
    ).resolves.toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('login rejeita credenciais invalidas', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'test@test.com',
        password: 'senha12345',
      }),
    ).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('refresh gera novo access token para refresh token valido', async () => {
    mockedJwt.verify.mockReturnValue({ sub: '1' } as never);
    mockedAuthRepository.findById.mockResolvedValue({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    } as never);
    mockedJwt.sign.mockReturnValue('new-access-token' as never);

    await expect(authService.refresh('refresh-token')).resolves.toEqual({
      accessToken: 'new-access-token',
    });
  });

  it('refresh rejeita usuario inexistente', async () => {
    mockedJwt.verify.mockReturnValue({ sub: '1' } as never);
    mockedAuthRepository.findById.mockResolvedValue(null);

    await expect(authService.refresh('refresh-token')).rejects.toThrow('USER_NOT_FOUND');
  });

  it('login rejeita senha incorreta', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValue({
      id: '1',
      passwordHash: 'hashed-password',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    } as never);
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(
      authService.login({
        email: 'test@test.com',
        password: 'senha-errada',
      }),
    ).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('login rejeita ambiente sem JWT_SECRET', async () => {
    delete process.env.JWT_SECRET;
    mockedAuthRepository.findByEmail.mockResolvedValue({
      id: '1',
      passwordHash: 'hashed-password',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    } as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    await expect(
      authService.login({
        email: 'test@test.com',
        password: 'senha12345',
      }),
    ).rejects.toThrow('MISSING_JWT_SECRET');
  });
});
