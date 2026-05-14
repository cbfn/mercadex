import type { Request, Response } from 'express';
import { LoginDto, RegisterDto } from './auth.dto';
import { authService } from './auth.service';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function parseCookieHeader(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, chunk) => {
    const [rawKey, ...rest] = chunk.split('=');
    const key = rawKey.trim();
    const value = rest.join('=').trim();

    if (key) {
      acc[key] = decodeURIComponent(value);
    }

    return acc;
  }, {});
}

function setRefreshTokenCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader(
    'Set-Cookie',
    `refreshToken=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure}SameSite=Strict; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
  );
}

function clearRefreshTokenCookie(res: Response) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader(
    'Set-Cookie',
    `refreshToken=; Path=/; HttpOnly; ${secure}SameSite=Strict; Max-Age=0`,
  );
}

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = RegisterDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para cadastro',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const user = await authService.register(parsed.data);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: 'E-mail já cadastrado' },
        });
      }

      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno' },
      });
    }
  },

  async login(req: Request, res: Response) {
    const parsed = LoginDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Credenciais inválidas',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const result = await authService.login(parsed.data);
      setRefreshTokenCookie(res, result.refreshToken);

      return res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'E-mail ou senha inválidos',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno' },
      });
    }
  },

  async refresh(req: Request, res: Response) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const refreshToken = cookies.refreshToken ?? req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token ausente' },
      });
    }

    try {
      const result = await authService.refresh(refreshToken);

      return res.json({
        success: true,
        data: result,
      });
    } catch {
      return res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_INVALID',
          message: 'Refresh token inválido ou expirado',
        },
      });
    }
  },

  async logout(_req: Request, res: Response) {
    clearRefreshTokenCookie(res);

    return res.json({
      success: true,
      data: { message: 'Logout realizado' },
    });
  },
};
