import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logoMercadex from '@/assets/logo-mercadex.png';

/**
 * Layout compartilhado das páginas de autenticação.
 * Exibe header com logo e um card centralizado com o formulário.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link href="/" aria-label="Mercadex — página inicial">
            <Image
              src={logoMercadex}
              alt="Mercadex"
              width={160}
              height={46}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Mercadex. Marketplace de eletrônicos usados.
      </footer>
    </div>
  );
}
