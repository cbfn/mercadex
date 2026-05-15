import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Criar conta — Mercadex',
  description: 'Crie sua conta e comece a comprar eletrônicos usados com segurança.',
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Junte-se ao Mercadex e compre eletrônicos usados com segurança.
        </p>
      </div>
      <RegisterForm />
    </>
  );
}
