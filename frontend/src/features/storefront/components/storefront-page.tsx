"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCatalogFilters } from "@/features/catalog/model/use-catalog-filters";
import { productsApi, type ApiCategory, type ApiProduct } from "@/shared/lib/api/products";
import type { Category, Product, ProductCondition } from "@/shared/types/catalog";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { SiteHeader } from "@/shared/ui/site-header";
import { formatBRL } from "@/shared/lib/currency";
import { Search, ShoppingBag, Sparkles, ShieldCheck, Truck } from "lucide-react";

const CATEGORY_ALL: Category = { label: "Todos", icon: "🏠" };

interface StorefrontProduct extends Product {
  images: string[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop";

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

function mapCondition(condition: ApiProduct["condition"]): ProductCondition {
  const map = {
    NOVO: "Novo",
    EXCELENTE: "Excelente",
    BOM: "Bom",
    USADO: "Usado",
  } as const;

  return map[condition];
}

function adaptApiProductToCatalogProduct(product: ApiProduct): StorefrontProduct {
  const normalizedImages = Array.isArray(product.images)
    ? (product.images.map(extractImageUrl).filter((url): url is string => url !== undefined))
    : [];
  const image = getFirstValidImage(normalizedImages) ?? FALLBACK_IMAGE;
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
    images: normalizedImages,
    views: product.viewsCount,
  };
}

function adaptApiCategories(categories: ApiCategory[]): Category[] {
  return [
    CATEGORY_ALL,
    ...categories.map((category) => ({
      label: category.name,
      icon: "🏷️",
    })),
  ];
}

function categoriesFromProducts(products: StorefrontProduct[]): Category[] {
  const unique = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
  return [
    CATEGORY_ALL,
    ...unique.map((label) => ({
      label,
      icon: "🏷️",
    })),
  ];
}

export function StorefrontPage() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([CATEGORY_ALL]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const { category, searchQuery, sortBy, filteredProducts, setCategory, setSearchQuery, setSortBy, resetFilters } =
    useCatalogFilters(products);

  const loadCatalog = useCallback(async () => {
    setIsCatalogLoading(true);
    setCatalogError("");

    try {
      const productsResponse = await productsApi.list({ limit: 100, sort: "newest" });
      const mappedProducts = productsResponse.data.items.map(adaptApiProductToCatalogProduct);

      setProducts(mappedProducts);

      try {
        const categoriesResponse = await productsApi.listCategories();
        setCategories(adaptApiCategories(categoriesResponse.data));
      } catch {
        // Se categorias falhar, ainda exibimos a vitrine baseada nas categorias encontradas nos produtos.
        setCategories(categoriesFromProducts(mappedProducts));
      }
    } catch {
      setCatalogError("Nao foi possivel carregar os produtos no momento. Tente novamente.");
      setProducts([]);
      setCategories([CATEGORY_ALL]);
    } finally {
      setIsCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const catalogCategories = useMemo(() => {
    if (!categories.some((item) => item.label === "Todos")) {
      return [CATEGORY_ALL, ...categories];
    }
    return categories;
  }, [categories]);

  return (
    <main className="pb-16">
      <SiteHeader>
        <div className="relative">
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
      </SiteHeader>

      {/* Filtros de categoria e ordenação — sticky logo abaixo do header */}
      <div className="sticky top-20 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <section className="container py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
              {catalogCategories.map((item) => {
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
      </div>

      

      

      <section className="container mt-4">
        {isCatalogLoading ? (
          <div className="space-y-4" data-testid="catalog-loading" aria-busy="true" aria-live="polite">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="overflow-hidden border-white/60 bg-white/95">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex items-end justify-between gap-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : catalogError ? (
          <div className="rounded-xl border bg-white p-10 text-center" data-testid="catalog-error">
            <p className="font-display text-2xl font-semibold">Falha ao carregar vitrine</p>
            <p className="mt-2 text-sm text-muted-foreground">{catalogError}</p>
            <Button type="button" className="mt-5" onClick={() => void loadCatalog()}>
              Tentar novamente
            </Button>
          </div>
        ) : !filteredProducts.length ? (
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

      <section className="container my-14 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
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

      <footer className="container rounded-2xl border bg-white p-6">
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

    </main>
  );
}
