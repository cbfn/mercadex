import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { LoginInput, RegisterInput } from './auth.dto';
import { authRepository } from './auth.repository';

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`MISSING_${name}`);
  }
  return value;
}

function getJwtSecret() {
  return assertEnv(process.env.JWT_SECRET, 'JWT_SECRET');
}

function getJwtRefreshSecret() {
  return assertEnv(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
}

function getJwtExpiresIn() {
  return (process.env.JWT_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];
}

function getJwtRefreshExpiresIn() {
  return (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
}

function publicUser(user: {
  id: number;
  name: string | null;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return publicUser(user);
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const accessToken = jwt.sign(
      { sub: String(user.id), role: user.role },
      getJwtSecret() as jwt.Secret,
      { expiresIn: getJwtExpiresIn() },
    );

    const refreshToken = jwt.sign(
      { sub: String(user.id) },
      getJwtRefreshSecret() as jwt.Secret,
      { expiresIn: getJwtRefreshExpiresIn() },
    );

    return {
      accessToken,
      refreshToken,
      user: publicUser(user),
    };
  },

  async refresh(refreshToken: string) {
    const payload = jwt.verify(
      refreshToken,
      getJwtRefreshSecret() as jwt.Secret,
    ) as { sub: string };

    const user = await authRepository.findById(Number(payload.sub));
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      getJwtSecret() as jwt.Secret,
      { expiresIn: getJwtExpiresIn() },
    );

    return { accessToken };
  },
};
