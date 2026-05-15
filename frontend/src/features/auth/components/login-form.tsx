'use client';

/**
 * Formulário de login com validação client-side e integração com AuthContext.
 */

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../model/auth-context';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ApiError } from '@/shared/lib/api-client';

/**
 * Formulário controlado de login.
 * Exibe estados de carregamento, erro de credenciais e redireciona após sucesso.
 *
 * @example
 * <LoginForm />
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('E-mail ou senha inválidos. Verifique e tente novamente.');
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente em instantes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de login" className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
