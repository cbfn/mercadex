import request from 'supertest';

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

jest.mock('./auth.middleware', () => ({
  authenticate: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import app from '../../server';
import { authService } from './auth.service';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth routes', () => {
  beforeEach(() => {
    mockedAuthService.register.mockReset();
    mockedAuthService.login.mockReset();
    mockedAuthService.refresh.mockReset();
  });

  it('cria usuario com dados validos', async () => {
    mockedAuthService.register.mockResolvedValue({
      id: 'user-1',
      name: 'Test',
      email: 'test@test.com',
      role: 'CUSTOMER',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'senha12345' });

    expect(res.status).toBe(201);
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

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'dup@test.com', password: 'senha12345' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('faz login e devolve access token com cookie de refresh', async () => {
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'CUSTOMER',
      },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'senha12345' });

    expect(res.status).toBe(200);
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

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=refresh-token'])
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('new-access-token');
    expect(mockedAuthService.refresh).toHaveBeenCalledWith('refresh-token');
  });

  it('faz logout limpando o cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer access-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
