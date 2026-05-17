import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Entrar — Mercadex',
  description: 'Acesse sua conta no Mercadex.',
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-sm text-muted-foreground">Acesse sua conta para continuar comprando.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
