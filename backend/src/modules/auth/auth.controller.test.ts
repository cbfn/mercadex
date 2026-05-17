import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';

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
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
  };
}

describe('authController', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('register rejeita payload invalido', async () => {
    const req = { body: {} } as Request;
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('register mapeia email duplicado', async () => {
    const req = {
      body: { name: 'Test', email: 'test@test.com', password: 'senha12345' },
    } as Request;
    const res = createRes();
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('EMAIL_ALREADY_EXISTS'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'EMAIL_ALREADY_EXISTS' }),
      }),
    );
  });

  it('login rejeita payload invalido', async () => {
    const req = { body: {} } as Request;
    const res = createRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('login mapeia credenciais invalidas', async () => {
    const req = { body: { email: 'test@test.com', password: 'senha12345' } } as Request;
    const res = createRes();
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error('INVALID_CREDENTIALS'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INVALID_CREDENTIALS' }),
      }),
    );
  });

  it('login define cookie e devolve access token', async () => {
    const req = { body: { email: 'test@test.com', password: 'senha12345' } } as Request;
    const res = createRes();
    (authService.login as jest.Mock).mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', name: 'Test', email: 'test@test.com', role: 'CUSTOMER' },
    });

    await authController.login(req, res);

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

  it('refresh rejeita ausencia de token', async () => {
    const req = { headers: {}, body: {} } as Request;
    const res = createRes();

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NO_REFRESH_TOKEN' }),
      }),
    );
  });

  it('refresh aceita body fallback', async () => {
    const req = { headers: {}, body: { refreshToken: 'refresh-token' } } as Request;
    const res = createRes();
    (authService.refresh as jest.Mock).mockResolvedValueOnce({ accessToken: 'new-token' });

    await authController.refresh(req, res);

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accessToken: 'new-token' },
    });
  });

  it('register retorna 500 para erro interno desconhecido', async () => {
    const req = {
      body: { name: 'Test', email: 'test@test.com', password: 'senha12345' },
    } as Request;
    const res = createRes();
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('UNKNOWN_ERROR'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
  });

  it('login retorna 500 para erro interno desconhecido', async () => {
    const req = { body: { email: 'test@test.com', password: 'senha12345' } } as Request;
    const res = createRes();
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error('UNKNOWN_ERROR'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
  });

  it('refresh retorna 401 quando servico lanca excecao', async () => {
    const req = { headers: {}, body: { refreshToken: 'bad-token' } } as Request;
    const res = createRes();
    (authService.refresh as jest.Mock).mockRejectedValueOnce(new Error('jwt expired'));

    await authController.refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'REFRESH_TOKEN_INVALID' }),
      }),
    );
  });

  it('logout limpa cookie', async () => {
    const req = {} as Request;
    const res = createRes();

    await authController.logout(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('refreshToken=;'),
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { message: 'Logout realizado' },
    });
  });
});
