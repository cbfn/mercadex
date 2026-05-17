"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { ReviewsDrawer } from "@/features/product-detail/components/reviews-drawer";
import { useCart } from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";
import { formatBRL } from "@/shared/lib/currency";
import { discountPct } from "@/shared/lib/catalog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { quantity, openCart, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [reviewsOpen, setReviewsOpen] = useState(searchParams.get('reviews') === 'open');

  const product = useMemo(() => {
    const productId = Number(id);
    if (Number.isNaN(productId)) return null;
    return PRODUCTS.find((item) => item.id === productId) ?? null;
  }, [id]);

  if (!product) {
    return (
      <main className="container py-16 text-center">
        <p className="font-display text-2xl font-semibold">Produto nao encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">Pode ter sido removido ou ja vendido por outro comprador.</p>
        <Link href="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Voltar ao catalogo
        </Link>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft className="size-4" /> Voltar ao catalogo
          </Link>
          <Button onClick={openCart} data-testid="open-cart-button" variant="secondary">
            <ShoppingBag size={18} />
            {quantity}
          </Button>
        </div>
      </header>

      <section className="container mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" data-testid="product-page-content">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <Image
              src={product.image}
              alt={product.title}
              width={900}
              height={700}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-3 text-sm">
              <ShieldCheck className="mb-2 size-4 text-emerald-600" />
              Produto com condicao verificada
            </div>
            <div className="rounded-xl border bg-white p-3 text-sm">
              <Truck className="mb-2 size-4 text-sky-600" />
              Envio rastreavel apos confirmacao
            </div>
            <div className="rounded-xl border bg-white p-3 text-sm">
              <Star className="mb-2 size-4 text-amber-500" />
              Avaliacao do vendedor: {product.sellerRating}
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{product.condition}</Badge>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{product.category}</span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-slate-900">{product.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <small className="text-sm text-muted-foreground line-through">{formatBRL(product.originalPrice)}</small>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <strong className="text-3xl text-slate-900">{formatBRL(product.price)}</strong>
              <Badge variant="warning">-{discountPct(product.originalPrice, product.price)}%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Oferta sujeita a disponibilidade de estoque</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Quantidade</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setQty((value) => Math.max(1, value - 1))} size="icon">
                -
              </Button>
              <span data-testid="product-qty" className="inline-flex min-w-10 justify-center rounded-md border px-3 py-2 font-semibold">
                {qty}
              </span>
              <Button variant="ghost" onClick={() => setQty((value) => value + 1)} size="icon">
                +
              </Button>
            </div>
          </div>

          <Button
            data-testid="modal-add-to-cart"
            className="w-full"
            onClick={() => {
              addToCart(product, qty);
              openCart();
            }}
          >
            Adicionar ao carrinho
          </Button>

          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-slate-700">Vendido por {product.seller}</p>
            <p className="mt-1">{product.sales} vendas concluidas com pagamento via PIX no fluxo do checkout.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {product.specs.slice(0, 4).map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border pt-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setReviewsOpen(true)}
              data-testid="open-reviews-button"
            >
              <MessageSquare size={16} />
              Ver avaliações
            </Button>
          </div>
        </div>
      </section>

      <ReviewsDrawer
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        productId={String(product.id)}
        productTitle={product.title}
      />

      <CartDrawer />
    </main>
  );
}
