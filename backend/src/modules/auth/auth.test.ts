jest.mock('./auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  },
}));

import { authController } from './auth.controller';
import { authService } from './auth.service';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

function createMockRes() {
  const res: Record<string, any> = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    setHeader(name: string, value: unknown) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
  };

  return res;
}

describe('Auth routes', () => {
  beforeEach(() => {
    mockedAuthService.register.mockReset();
    mockedAuthService.login.mockReset();
    mockedAuthService.refresh.mockReset();
  });

  it('cria usuario com dados validos', async () => {
    mockedAuthService.register.mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    });

    const req = {
      body: { name: 'Test', email: 'test@test.com', password: 'senha12345' },
    } as any;
    const res = createMockRes();

    await authController.register(req, res as any);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@test.com');
    expect(mockedAuthService.register).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@test.com',
      password: 'senha12345',
    });
  });

  it('retorna 409 para email duplicado', async () => {
    mockedAuthService.register.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

    const req = {
      body: { name: 'Test', email: 'dup@test.com', password: 'senha12345' },
    } as any;
    const res = createMockRes();

    await authController.register(req, res as any);

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('faz login e devolve access token com cookie de refresh', async () => {
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        role: 'CUSTOMER',
      },
    });

    const req = {
      body: { email: 'test@test.com', password: 'senha12345' },
    } as any;
    const res = createMockRes();

    await authController.login(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('access-token');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'senha12345',
    });
  });

  it('renova access token usando refresh token', async () => {
    mockedAuthService.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
    });

    const req = {
      headers: { cookie: 'refreshToken=refresh-token' },
      body: {},
    } as any;
    const res = createMockRes();

    await authController.refresh(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('new-access-token');
    expect(mockedAuthService.refresh).toHaveBeenCalledWith('refresh-token');
  });

  it('faz logout limpando o cookie', async () => {
    const req = {} as any;
    const res = createMockRes();

    await authController.logout(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
