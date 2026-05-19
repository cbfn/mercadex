"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { ReviewList } from "@/features/product-detail/components/review-list";
import { ReviewForm } from "@/features/product-detail/components/review-form";
import { useAuth } from "@/features/auth/model/auth-context";
import { useCart } from "@/features/cart/model/cart-context";
import { SiteHeader } from "@/shared/ui/site-header";
import { productsApi, type ApiProduct } from "@/shared/lib/api/products";
import { reviewsApi, type ApiReview } from "@/shared/lib/api/reviews";
import { ApiError } from "@/shared/lib/api-client";
import { formatBRL } from "@/shared/lib/currency";
import { discountPct } from "@/shared/lib/catalog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import type { Product, ProductCondition } from "@/shared/types/catalog";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProductDetailViewModel extends Product {
  images: string[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop";

function mapCondition(condition: ApiProduct["condition"]): ProductCondition {
  const map = {
    NOVO: "Novo",
    EXCELENTE: "Excelente",
    BOM: "Bom",
    USADO: "Usado",
  } as const;

  return map[condition];
}

/** Extrai a URL de uma entrada de imagem (string direta ou objeto `{ url }` do banco). */
function extractImageUrl(image: unknown): string | undefined {
  if (typeof image === "string" && image.trim().length > 0) return image;
  if (typeof image === "object" && image !== null && "url" in image) {
    const url = (image as { url?: string }).url;
    if (typeof url === "string" && url.trim().length > 0) return url;
  }
  return undefined;
}

function getFirstValidImage(images: unknown[]) {
  for (const image of images) {
    const url = extractImageUrl(image);
    if (url) return url;
  }
  return undefined;
}

function adaptApiProductToViewModel(product: ApiProduct): ProductDetailViewModel {
  const images = Array.isArray(product.images)
    ? product.images.map(extractImageUrl).filter((url): url is string => url !== undefined)
    : [];
  const image = getFirstValidImage(images) ?? FALLBACK_IMAGE;
  const safeOriginalPrice = Math.max(product.price + 1, Math.round(product.price * 1.15));

  return {
    id: product.id,
    backendProductId: product.id,
    title: product.title,
    category: product.category.name,
    price: product.price,
    originalPrice: safeOriginalPrice,
    condition: mapCondition(product.condition),
    seller: product.seller.name ?? product.seller.email,
    sellerRating: 4.7,
    sales: product.viewsCount,
    description: product.description ?? "Sem descricao informada.",
    specs: [],
    image,
    images,
    views: product.viewsCount,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { openCart, addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetailViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError("");
    setIsNotFound(false);

    try {
      const response = await productsApi.get(id);
      setProduct(adaptApiProductToViewModel(response.data));
    } catch (err) {
      setProduct(null);

      if (err instanceof ApiError && err.status === 404) {
        setIsNotFound(true);
      } else {
        setError("Nao foi possivel carregar os detalhes do produto. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await reviewsApi.list(id);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const handleReviewSuccess = useCallback(async () => {
    setShowReviewForm(false);
    await fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    let mounted = true;

    void params.then((resolvedParams) => {
      if (mounted) {
        setId(resolvedParams.id);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!id) {
      setIsLoading(true);
      return;
    }

    void loadProduct();
  }, [loadProduct, id]);

  useEffect(() => {
    setQty(1);
  }, [id]);

  useEffect(() => {
    if (id) {
      void fetchReviews();
      setShowReviewForm(false);
    }
  }, [id, fetchReviews]);

  if (isLoading) {
    return (
      <main className="container py-8" data-testid="product-loading" aria-busy="true" aria-live="polite">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border bg-white p-6">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Carregando produto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-16 text-center" data-testid="product-error">
        <p className="font-display text-2xl font-semibold">Falha ao carregar produto</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button type="button" className="mt-6" onClick={() => void loadProduct()}>
          Tentar novamente
        </Button>
      </main>
    );
  }

  if (isNotFound || !product) {
    return (
      <main className="container py-16 text-center" data-testid="product-not-found">
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
      <SiteHeader />

      <section className="container mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" data-testid="product-page-content">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <Image
              src={getFirstValidImage(product.images) ?? product.image ?? FALLBACK_IMAGE}
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

          {/* <div className="border-t border-border pt-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setReviewsOpen(true)}
              data-testid="open-reviews-button"
            >
              <MessageSquare size={16} />
              Ver avaliações
            </Button>
          </div> */}
        </div>
      </section>

      <section className="container mt-10" data-testid="product-reviews">
        <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Avaliações</h2>
        {reviewsLoading ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Carregando avaliações...
          </p>
        ) : (
          <ReviewList reviews={reviews} />
        )}
        <div className="mt-6 border-t border-border pt-4 space-y-3">
          {user ? (
            showReviewForm ? (
              <ReviewForm productId={String(product.id)} onSuccess={handleReviewSuccess} />
            ) : (
              <Button
                variant="secondary"
                className="w-auto"
                onClick={() => setShowReviewForm(true)}
                data-testid="show-review-form-button"
              >
                Escrever avaliação
              </Button>
            )
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Faça login para escrever uma avaliação.
              </p>
              <Button
                className="w-auto"
                onClick={() => {
                  const returnTo = encodeURIComponent(`/products/${String(product.id)}?reviews=open`);
                  router.push(`/login?redirect=${returnTo}`);
                }}
                data-testid="login-to-review-button"
              >
                Entrar e avaliar
              </Button>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
