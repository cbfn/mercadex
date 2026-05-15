'use client';

/**
 * Formulário de cadastro com validação client-side e integração com AuthContext.
 * Valida campos conforme as regras do backend (auth.dto.ts).
 */

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../model/auth-context';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ApiError } from '@/shared/lib/api-client';

/**
 * Formulário controlado de cadastro.
 * Valida nome (≥2 chars), email, senha (≥8 chars) e confirmação de senha.
 * Redireciona para /login após registro bem-sucedido.
 *
 * @example
 * <RegisterForm />
 */
export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.';
    if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres.';
    if (password !== confirmPassword) return 'As senhas não conferem.';
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email, password);
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setError('Não foi possível concluir o cadastro. Tente novamente em instantes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de cadastro" className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-semibold text-foreground">
          Nome completo
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          disabled={isLoading}
        />
      </div>

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
          placeholder="Mínimo 8 caracteres"
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
          Confirmar senha
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a senha"
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
