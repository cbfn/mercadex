import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin, type AuthRequest } from './auth.middleware';

jest.mock('jsonwebtoken');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

function createNext(): NextFunction {
  return jest.fn();
}

describe('authenticate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('retorna 401 quando authorization header esta ausente', () => {
    const req = { headers: {} } as AuthRequest;
    const res = createRes();
    const next = createNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando header nao comeca com Bearer', () => {
    const req = { headers: { authorization: 'Basic sometoken' } } as AuthRequest;
    const res = createRes();
    const next = createNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('autentica usuario com token valido', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } } as AuthRequest;
    const res = createRes();
    const next = createNext();
    mockedJwt.verify.mockReturnValue({ sub: 'user-1', role: 'CUSTOMER' } as never);

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: 'user-1', role: 'CUSTOMER' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retorna 401 quando token e invalido ou expirado', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } } as AuthRequest;
    const res = createRes();
    const next = createNext();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'TOKEN_INVALID' }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  it('retorna 403 quando usuario nao e admin', () => {
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } } as unknown as AuthRequest;
    const res = createRes();
    const next = createNext();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'FORBIDDEN' }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 403 quando usuario nao esta autenticado', () => {
    const req = {} as AuthRequest;
    const res = createRes();
    const next = createNext();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next para usuario admin', () => {
    const req = { user: { id: 'admin-1', role: 'ADMIN' } } as unknown as AuthRequest;
    const res = createRes();
    const next = createNext();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
