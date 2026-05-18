"use client";

/**
 * Cabeçalho global do site.
 * Usado em todas as páginas principais (vitrine, produto, pedidos).
 * Não é usado no checkout (que tem seu próprio cabeçalho mínimo).
 *
 * Inclui: logo, slot de busca (children), botão do carrinho, e navegação do usuário.
 * Para usuários autenticados exibe um NavigationMenu com nome e links.
 * Para usuários não autenticados exibe o link "Entrar".
 */

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, LogOut, Package } from "lucide-react";
import { useAuth } from "@/features/auth/model/auth-context";
import { useCart } from "@/features/cart/model/cart-context";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/ui/navigation-menu";
import { Button } from "@/shared/ui/button";
import logoMercadex from "@/assets/logo-mercadex.png";

interface SiteHeaderProps {
  /** Slot central — normalmente a barra de busca (opcional). */
  children?: ReactNode;
}

/**
 * Cabeçalho principal do site com suporte a slot de busca.
 *
 * @example — Com barra de busca (StorefrontPage)
 * <SiteHeader>
 *   <SearchBar value={query} onChange={setQuery} />
 * </SiteHeader>
 *
 * @example — Sem busca (outras páginas)
 * <SiteHeader />
 */
export function SiteHeader({ children }: SiteHeaderProps) {
  const { user, logout, isLoading } = useAuth();
  const { quantity, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="Mercadex">
          <Image
            src={logoMercadex}
            alt="Mercadex"
            width={200}
            height={58}
            priority
            className="h-auto w-auto"
            sizes="200px"
          />
        </Link>

        {/* Slot de busca */}
        {children && <div className="hidden flex-1 md:block">{children}</div>}
        {!children && <div className="flex-1" />}

        {/* Navegação do usuário + carrinho */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!isLoading && (
            user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-semibold" data-testid="user-nav-trigger">
                      {user.name ?? user.email}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="min-w-[180px] p-2">
                        <li>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            data-testid="nav-orders-link"
                          >
                            <Package size={15} className="text-muted-foreground" />
                            Meus Pedidos
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => void logout()}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            data-testid="logout-button"
                          >
                            <LogOut size={15} className="text-muted-foreground" />
                            Sair
                          </button>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <Link
                href="/login"
                data-testid="login-button"
                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                Entrar
              </Link>
            )
          )}

          <Button
            onClick={openCart}
            data-testid="open-cart-button"
            variant="secondary"
            className="shrink-0"
          >
            <ShoppingBag size={18} />
            {quantity}
          </Button>
        </div>
      </div>
    </header>
  );
}
