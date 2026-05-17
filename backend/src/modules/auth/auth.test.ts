import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

jest.mock('./auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  },
}));

const { authController } = require('./auth.controller') as typeof import('./auth.controller');
const { authService } = require('./auth.service') as typeof import('./auth.service');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
  };
}

describe('Auth controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('cria usuario com dados validos', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    });

    const req = {
      body: { name: 'Test', email: 'test@test.com', password: 'senha12345' },
    } as unknown as Request;
    const res = createRes();

    await authController.register(req, res);

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@test.com',
      password: 'senha12345',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ email: 'test@test.com' }),
      }),
    );
  });

  it('retorna 409 para email duplicado', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('EMAIL_ALREADY_EXISTS'));

    const req = {
      body: { name: 'Test', email: 'dup@test.com', password: 'senha12345' },
    } as unknown as Request;
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'EMAIL_ALREADY_EXISTS' }),
      }),
    );
  });

  it('faz login e devolve access token com cookie de refresh', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'CUSTOMER',
      },
    });

    const req = {
      body: { email: 'test@test.com', password: 'senha12345' },
    } as unknown as Request;
    const res = createRes();

    await authController.login(req, res);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'senha12345',
    });
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('refreshToken=refresh-token'),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ accessToken: 'access-token' }),
      }),
    );
  });

  it('renova access token usando refresh token', async () => {
    (authService.refresh as jest.Mock).mockResolvedValueOnce({
      accessToken: 'new-access-token',
    });

    const req = {
      headers: { cookie: 'refreshToken=refresh-token' },
      body: {},
    } as unknown as Request;
    const res = createRes();

    await authController.refresh(req, res);

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ accessToken: 'new-access-token' }),
      }),
    );
  });

  it('faz logout limpando o cookie', async () => {
    const req = {} as unknown as Request;
    const res = createRes();

    await authController.logout(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('refreshToken=;'),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ message: 'Logout realizado' }),
      }),
    );
  });
});
