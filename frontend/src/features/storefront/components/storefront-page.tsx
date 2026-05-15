"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, PRODUCTS } from "@/shared/mocks/products";
import { useCatalogFilters } from "@/features/catalog/model/use-catalog-filters";
import { useCart } from "@/features/cart/model/cart-context";
import { useAuth } from "@/features/auth/model/auth-context";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { formatBRL } from "@/shared/lib/currency";
import logoMercadex from "@/assets/logo-mercadex.png";
import { Search, ShoppingBag, Sparkles, ShieldCheck, Truck, User } from "lucide-react";

export function StorefrontPage() {
  const { category, searchQuery, sortBy, filteredProducts, setCategory, setSearchQuery, setSortBy, resetFilters } =
    useCatalogFilters(PRODUCTS);
  const { quantity, openCart } = useCart();
  const { user, logout, isLoading } = useAuth();

  return (
    <main className="pb-16">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center gap-4">
          <Link href="/" className="shrink-0" aria-label="Mercadex">
            <Image src={logoMercadex} alt="Mercadex" width={220} height={64} priority />
          </Link>

          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="search-input"
              aria-label="Buscar produtos"
              placeholder="Busque por iPhone, notebook gamer, câmera..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 text-sm font-semibold text-foreground sm:flex">
                    <User size={15} className="text-muted-foreground" />
                    {user.name ?? user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => void logout()} data-testid="logout-button">
                    Sair
                  </Button>
                </div>
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

            <Button onClick={openCart} data-testid="open-cart-button" variant="secondary" className="shrink-0">
              <ShoppingBag size={18} />
              {quantity}
            </Button>
          </div>
        </div>
      </header>

      <section className="container mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="mesh-bg animate-fade-up rounded-2xl border border-white/80 p-7 shadow-sm">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="size-3.5 text-primary" /> Curadoria semanal de eletrônicos usados
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Seu próximo eletrônico está aqui.
            <br />
            Revisado, com preço justo e entrega segura.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
            Compare ofertas reais de vendedores confiáveis e finalize sua compra em poucos passos com PIX.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
            <span className="rounded-full bg-white px-3 py-1">Pagamento via PIX</span>
            <span className="rounded-full bg-white px-3 py-1">Vendedor com reputação</span>
            <span className="rounded-full bg-white px-3 py-1">Frete calculado no checkout</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border bg-white p-4">
            <ShieldCheck className="mb-2 size-5 text-sky-600" />
            <h3 className="font-display text-lg font-semibold">Compra protegida</h3>
            <p className="text-sm text-muted-foreground">Checkout claro e confirmação imediata da transação.</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <Truck className="mb-2 size-5 text-emerald-600" />
            <h3 className="font-display text-lg font-semibold">Entrega transparente</h3>
            <p className="text-sm text-muted-foreground">Resumo completo de frete, total e prazo no fluxo de compra.</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <ShoppingBag className="mb-2 size-5 text-amber-600" />
            <h3 className="font-display text-lg font-semibold">Pronto para decidir</h3>
            <p className="text-sm text-muted-foreground">Detalhes técnicos, estado do item e condição destacados.</p>
          </div>
        </div>
      </section>

      <section className="container mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
            {CATEGORIES.map((item) => {
              const active = item.label === category;
              return (
                <button
                  key={item.label}
                  onClick={() => setCategory(item.label)}
                  aria-pressed={active}
                  data-testid={`category-${item.label}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <Select
            aria-label="Ordenacao"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            data-testid="sort-select"
            className="w-full max-w-[220px]"
          >
            <option value="relevancia">Mais relevantes</option>
            <option value="menor">Menor preco</option>
            <option value="maior">Maior preco</option>
            <option value="vendidos">Mais vendidos</option>
          </Select>
        </div>
      </section>

      <section className="container mt-4">
        {!filteredProducts.length ? (
          <div data-testid="empty-state" className="rounded-xl border bg-white p-10 text-center">
            <p className="font-display text-2xl font-semibold">Nenhum produto encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">Ajuste os filtros para encontrar novas oportunidades.</p>
            <Button data-testid="reset-filters" onClick={resetFilters} className="mt-5">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="products-grid">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-white/60 bg-white/95" data-testid="product-card">
                <Link
                  href={`/products/${product.id}`}
                  data-testid={`open-product-${product.id}`}
                  aria-label={`Abrir produto ${product.title}`}
                  className="block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700">
                      {product.condition}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category}</p>
                    <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight">{product.title}</h3>
                    <div className="flex items-end justify-between">
                      <strong className="text-xl text-slate-900">{formatBRL(product.price)}</strong>
                      <span className="text-xs text-muted-foreground">{product.sales} vendidos</span>
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition group-hover:border-primary group-hover:text-slate-900">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <footer className="container mt-14 rounded-2xl border bg-white p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h4 className="font-display text-lg font-semibold">Mercadex</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Marketplace de eletrônicos usados com foco em clareza, segurança e decisão rápida.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Por que comprar aqui?</h5>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Preços competitivos e estado do produto explícito</li>
              <li>Checkout simplificado em 4 etapas</li>
              <li>Confirmação de pedido com rastreabilidade</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Atendimento</h5>
            <p className="mt-2 text-sm text-muted-foreground">Segunda a sábado, das 9h às 20h</p>
            <p className="text-sm text-muted-foreground">suporte@mercadex.com.br</p>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </main>
  );
}
