import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

function getAuthToken(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getAuthToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token ausente ou inválido' },
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Token inválido ou expirado' },
    });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Acesso restrito a administradores' },
    });
  }

  next();
}
